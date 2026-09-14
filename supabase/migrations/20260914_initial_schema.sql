-- Run this migration in Supabase SQL Editor or with the Supabase CLI. No service_role key is used by the app.
create extension if not exists pgcrypto;

create type public.briefing_status as enum ('new','reviewing','contacted','proposal_sent','approved','rejected','in_progress','completed');

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120), company text not null default '',
  email text not null check (char_length(email) <= 254), whatsapp text not null default '', role text not null default '',
  city text not null default '', country text not null default '', current_website text, instagram text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index clients_email_idx on public.clients (lower(email));

create table public.briefings (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete restrict,
  submission_id uuid not null unique, business_segment text not null default '', business_description text not null default '',
  target_audience text not null default '', business_differential text not null default '', objectives jsonb not null default '[]'::jsonb,
  website_type text not null, pages text not null, design_preferences text not null default '', color_preferences jsonb not null default '{}'::jsonb,
  theme text not null default '', animation_level text not null default '', visual_references jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb, seo_level text not null default '', performance_level text not null default '',
  integrations jsonb not null default '[]'::jsonb, content_provider text not null default '', domain_status text not null default '',
  hosting_status text not null default '', deadline text not null default '', package text not null default '',
  status public.briefing_status not null default 'new', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index briefings_client_id_idx on public.briefings(client_id); create index briefings_status_idx on public.briefings(status);

create table public.quotes (
  id uuid primary key default gen_random_uuid(), briefing_id uuid not null unique references public.briefings(id) on delete cascade,
  base_price numeric(12,2) not null default 0, pages_price numeric(12,2) not null default 0, features_price numeric(12,2) not null default 0,
  design_price numeric(12,2) not null default 0, seo_price numeric(12,2) not null default 0, performance_price numeric(12,2) not null default 0,
  integrations_price numeric(12,2) not null default 0, content_price numeric(12,2) not null default 0, hosting_price numeric(12,2) not null default 0,
  urgency_price numeric(12,2) not null default 0, discount numeric(12,2) not null default 0, subtotal numeric(12,2) not null,
  total numeric(12,2) not null check (total >= 0), currency text not null default 'BRL', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quote_items (
 id uuid primary key default gen_random_uuid(), quote_id uuid not null references public.quotes(id) on delete cascade,
 name text not null, description text not null default '', category text not null, quantity integer not null default 1 check(quantity > 0),
 unit_price numeric(12,2) not null, total_price numeric(12,2) not null, created_at timestamptz not null default now()
);
create index quote_items_quote_id_idx on public.quote_items(quote_id);
create table public.briefing_features (briefing_id uuid not null references public.briefings(id) on delete cascade, feature_id text not null, primary key (briefing_id,feature_id));

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger briefings_updated_at before update on public.briefings for each row execute function public.set_updated_at();
create trigger quotes_updated_at before update on public.quotes for each row execute function public.set_updated_at();

alter table public.clients enable row level security; alter table public.briefings enable row level security; alter table public.quotes enable row level security; alter table public.quote_items enable row level security; alter table public.briefing_features enable row level security;
-- Intentionally no public table policies: visitors cannot list/read/change any submitted data.

create or replace function public.submit_public_briefing(p_submission_id uuid, p_client jsonb, p_briefing jsonb, p_quote jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_client_id uuid; v_briefing_id uuid; v_quote_id uuid; v_existing jsonb; v_item jsonb; v_total numeric;
begin
  select jsonb_build_object('briefingId', b.id, 'quoteId', q.id) into v_existing from briefings b join quotes q on q.briefing_id=b.id where b.submission_id=p_submission_id;
  if v_existing is not null then return v_existing; end if;
  if coalesce(trim(p_client->>'name'),'') = '' or coalesce(trim(p_client->>'email'),'') = '' then raise exception 'Nome e e-mail são obrigatórios.' using errcode='P0001'; end if;
  if coalesce(p_briefing->>'website_type','') = '' then raise exception 'Tipo de site é obrigatório.' using errcode='P0001'; end if;
  insert into clients(name,company,email,whatsapp,role,city) values (left(trim(p_client->>'name'),120),coalesce(p_client->>'company',''),left(trim(p_client->>'email'),254),coalesce(p_client->>'whatsapp',''),coalesce(p_client->>'role',''),coalesce(p_client->>'city','')) returning id into v_client_id;
  insert into briefings(client_id,submission_id,business_segment,business_description,target_audience,business_differential,objectives,website_type,pages,design_preferences,theme,features,seo_level,performance_level,integrations,content_provider,hosting_status,deadline,package)
  values(v_client_id,p_submission_id,coalesce(p_briefing->>'business_segment',''),coalesce(p_briefing->>'business_description',''),coalesce(p_briefing->>'target_audience',''),coalesce(p_briefing->>'business_differential',''),coalesce(p_briefing->'objectives','[]'::jsonb),p_briefing->>'website_type',coalesce(p_briefing->>'pages',''),coalesce(p_briefing->>'design_preferences',''),coalesce(p_briefing->>'theme',''),coalesce(p_briefing->'features','[]'::jsonb),coalesce(p_briefing->>'seo_level',''),coalesce(p_briefing->>'performance_level',''),coalesce(p_briefing->'integrations','[]'::jsonb),coalesce(p_briefing->>'content_provider',''),coalesce(p_briefing->>'hosting_status',''),coalesce(p_briefing->>'deadline',''),coalesce(p_briefing->>'package','')) returning id into v_briefing_id;
  insert into briefing_features(briefing_id,feature_id) select v_briefing_id, value from jsonb_array_elements_text(coalesce(p_briefing->'features','[]'::jsonb));
  v_total := greatest(0, coalesce((p_quote->>'total')::numeric,0));
  insert into quotes(briefing_id,base_price,pages_price,features_price,design_price,seo_price,performance_price,integrations_price,urgency_price,subtotal,total)
  values(v_briefing_id,coalesce((p_quote->'breakdown'->>'Projeto base')::numeric,0),coalesce((p_quote->'breakdown'->>'Estrutura e páginas')::numeric,0),coalesce((p_quote->'breakdown'->>'Funcionalidades')::numeric,0),coalesce((p_quote->'breakdown'->>'Direção de design')::numeric,0),coalesce((p_quote->'breakdown'->>'SEO')::numeric,0),coalesce((p_quote->'breakdown'->>'Performance')::numeric,0),coalesce((p_quote->'breakdown'->>'Integrações')::numeric,0),coalesce((p_quote->'breakdown'->>'Prioridade de lançamento')::numeric,0),v_total,v_total) returning id into v_quote_id;
  for v_item in select value from jsonb_array_elements(coalesce(p_quote->'items','[]'::jsonb)) loop
    insert into quote_items(quote_id,name,category,quantity,unit_price,total_price) values(v_quote_id,left(coalesce(v_item->>'name','Item'),160),left(coalesce(v_item->>'category','other'),80),greatest(1,coalesce((v_item->>'quantity')::integer,1)),coalesce((v_item->>'unit_price')::numeric,0),coalesce((v_item->>'total_price')::numeric,0));
  end loop;
  return jsonb_build_object('briefingId',v_briefing_id,'quoteId',v_quote_id);
end; $$;
revoke all on function public.submit_public_briefing(uuid,jsonb,jsonb,jsonb) from public; grant execute on function public.submit_public_briefing(uuid,jsonb,jsonb,jsonb) to anon;
