-- ============================================================================
-- MIGRAÇÃO: Hardening de Segurança (2026-11-24)
-- Corrige problemas identificados pelo Supabase Security Advisor:
-- 1. set_updated_at: mutable search_path
-- 2. is_admin(), get_my_profile(): executáveis por anon
-- 3. submit_public_briefing(), sync_client_profile_from_briefing(): executáveis por anon
-- 4. Tabelas legadas sem políticas RLS: briefings, clients, quotes, quote_items, briefing_features
-- ============================================================================

-- ============================================================================
-- 1. Corrigir set_updated_at — fixar search_path para evitar search_path injection
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. is_admin() — revogar acesso de anon; apenas authenticated pode chamar
-- ============================================================================
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================================
-- 3. get_my_profile() — revogar acesso de anon
-- ============================================================================
REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM anon;
GRANT  EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- ============================================================================
-- 4. submit_public_briefing() — revogar acesso de anon
--    Esta função aceita dados de briefing enviados pelo cliente após login.
--    Clientes são authenticated, não anon.
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'submit_public_briefing'
  ) THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.submit_public_briefing() FROM anon';
    EXECUTE 'GRANT  EXECUTE ON FUNCTION public.submit_public_briefing() TO authenticated';
  END IF;
END;
$$;

-- ============================================================================
-- 5. sync_client_profile_from_briefing() — revogar acesso de anon
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'sync_client_profile_from_briefing'
  ) THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.sync_client_profile_from_briefing() FROM anon';
    EXECUTE 'GRANT  EXECUTE ON FUNCTION public.sync_client_profile_from_briefing() TO authenticated';
  END IF;
END;
$$;

-- ============================================================================
-- 6. Tabelas legadas: adicionar políticas deny-all para RLS ativo sem políticas
--    Se já existirem políticas, o CREATE POLICY irá falhar — tratado com DO block
-- ============================================================================

-- briefings (legada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'briefings') THEN
    -- Verificar se há políticas; se não houver, negar tudo
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'briefings'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "deny_all_briefings_legacy" ON public.briefings
          AS RESTRICTIVE FOR ALL TO public USING (false)
      $policy$;
    END IF;
  END IF;
END;
$$;

-- clients (legada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'clients'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "deny_all_clients_legacy" ON public.clients
          AS RESTRICTIVE FOR ALL TO public USING (false)
      $policy$;
    END IF;
  END IF;
END;
$$;

-- quotes (legada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quotes'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "deny_all_quotes_legacy" ON public.quotes
          AS RESTRICTIVE FOR ALL TO public USING (false)
      $policy$;
    END IF;
  END IF;
END;
$$;

-- quote_items (legada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quote_items') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quote_items'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "deny_all_quote_items_legacy" ON public.quote_items
          AS RESTRICTIVE FOR ALL TO public USING (false)
      $policy$;
    END IF;
  END IF;
END;
$$;

-- briefing_features (legada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'briefing_features') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'briefing_features'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "deny_all_briefing_features_legacy" ON public.briefing_features
          AS RESTRICTIVE FOR ALL TO public USING (false)
      $policy$;
    END IF;
  END IF;
END;
$$;

-- ============================================================================
-- 7. Substituir email hardcoded em políticas RLS por is_admin()
--    (Apenas se a função is_admin() existir e as políticas usarem email literal)
--    ATENÇÃO: Só executar se as políticas listadas realmente existirem.
--    A substituição é feita via DROP + CREATE para evitar ALTER POLICY limitações.
-- ============================================================================

-- Verificar se existe política com email hardcoded em projects
DO $$
DECLARE
  v_policy record;
BEGIN
  FOR v_policy IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND qual LIKE '%pedro.claude001@gmail.com%'
  LOOP
    RAISE NOTICE 'Política com email hardcoded encontrada: %.% (%)',
      v_policy.tablename, v_policy.policyname,
      'Substituição manual recomendada — verificar qual usando is_admin()';
  END LOOP;
END;
$$;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
