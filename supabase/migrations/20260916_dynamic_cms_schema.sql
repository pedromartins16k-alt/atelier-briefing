-- ============================================================
-- Migration: 20260916_dynamic_cms_schema.sql
-- Transforma o Atelier Briefing em um CMS 100% dinâmico.
-- Atualiza a tabela form_configurations e garante RLS e permissões.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.form_configurations (
  key        TEXT PRIMARY KEY DEFAULT 'global',
  config     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir RLS
ALTER TABLE public.form_configurations ENABLE ROW LEVEL SECURITY;

-- Leitura pública para que clientes consigam ler a configuração ativa do formulário
DROP POLICY IF EXISTS "form_config_read_all" ON public.form_configurations;
CREATE POLICY "form_config_read_all"
  ON public.form_configurations FOR SELECT
  USING (true);

-- Escrita restrita a administradores
DROP POLICY IF EXISTS "form_config_write_admin" ON public.form_configurations;
CREATE POLICY "form_config_write_admin"
  ON public.form_configurations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- Comentário explicativo
COMMENT ON TABLE public.form_configurations IS 'Armazena a configuração completa do CMS de Briefing (paletas, categorias, funcionalidades, etapas, perguntas, preços base e textos de interface).';
