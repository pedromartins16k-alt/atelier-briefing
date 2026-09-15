-- ============================================================
-- Atelier Briefing — Migration 2: Plataforma de Auth e Projetos
-- Execute no Supabase SQL Editor ANTES de usar a aplicação.
-- ============================================================

-- Função auxiliar: verifica se o usuário logado é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.user_profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ============================================================
-- TABELA: user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  role        text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  phone       text,
  company     text,
  segment     text,
  location    text,
  website     text,
  instagram   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON public.user_profiles (role);

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Usuário sempre pode ler e atualizar seu próprio perfil diretamente sem recursão
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_profiles_select_admin" ON public.user_profiles;
CREATE POLICY "user_profiles_select_admin" ON public.user_profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- TABELA: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT 'Novo Projeto',
  type        text,
  status      text NOT NULL DEFAULT 'briefing_received'
    CHECK (status IN (
      'briefing_received','in_analysis','waiting_client',
      'approved','in_development','in_review','completed'
    )),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_client_id_idx ON public.projects (client_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects (status);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "projects_insert_client" ON public.projects;
CREATE POLICY "projects_insert_client" ON public.projects
  FOR INSERT WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "projects_update_admin" ON public.projects;
CREATE POLICY "projects_update_admin" ON public.projects
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- TABELA: project_briefings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_briefings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  responses         jsonb NOT NULL DEFAULT '{}'::jsonb,
  executive_summary text,
  diagnosis         jsonb,
  sitemap           jsonb,
  primary_cta       text,
  submitted_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_briefings_project_id_idx ON public.project_briefings (project_id);

CREATE TRIGGER project_briefings_updated_at
  BEFORE UPDATE ON public.project_briefings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.project_briefings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "briefings_select" ON public.project_briefings;
CREATE POLICY "briefings_select" ON public.project_briefings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "briefings_insert" ON public.project_briefings;
CREATE POLICY "briefings_insert" ON public.project_briefings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
  );

DROP POLICY IF EXISTS "briefings_update" ON public.project_briefings;
CREATE POLICY "briefings_update" ON public.project_briefings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
    OR public.is_admin()
  );

-- ============================================================
-- TABELA: internal_notes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  admin_id    uuid NOT NULL REFERENCES public.user_profiles(id),
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS internal_notes_project_id_idx ON public.internal_notes (project_id);

CREATE TRIGGER internal_notes_updated_at
  BEFORE UPDATE ON public.internal_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes_admin_only" ON public.internal_notes;
CREATE POLICY "notes_admin_only" ON public.internal_notes
  FOR ALL USING (public.is_admin());

-- ============================================================
-- TABELA: project_history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  description text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_history_project_id_idx ON public.project_history (project_id);

ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "history_select" ON public.project_history;
CREATE POLICY "history_select" ON public.project_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "history_insert_admin" ON public.project_history;
CREATE POLICY "history_insert_admin" ON public.project_history
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- TRIGGER: Criar perfil ao registrar usuário
-- Primeiro usuário = admin; demais = client
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_role text;
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.user_profiles;

  IF v_count = 0 THEN
    v_role := 'admin';
  ELSE
    v_role := 'client';
  END IF;

  INSERT INTO public.user_profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RPC: Inserir evento de histórico (acessível a authenticated)
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_project_history(
  p_project_id  uuid,
  p_event_type  text,
  p_description text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF NOT (
    EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id AND client_id = auth.uid())
    OR public.is_admin()
  ) THEN
    RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.project_history (project_id, event_type, description)
  VALUES (p_project_id, p_event_type, p_description);
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_project_history(uuid, text, text) TO authenticated;
