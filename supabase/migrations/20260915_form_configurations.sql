-- ============================================================
-- Migration: form_configurations
-- Tabela para armazenar configuração do formulário (paletas,
-- opções, preços) gerenciada pelo painel admin.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.form_configurations (
  key        TEXT PRIMARY KEY DEFAULT 'global',
  config     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apenas uma linha com key = 'global' (configuração global)
-- Insert da configuração padrão vazia para inicializar
INSERT INTO public.form_configurations (key, config)
VALUES ('global', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.form_configurations ENABLE ROW LEVEL SECURITY;

-- Leitura pública (clientes precisam ler as opções no formulário)
CREATE POLICY "form_config_read_all"
  ON public.form_configurations FOR SELECT
  USING (true);

-- Escrita apenas para admins (baseado em user_profiles.role)
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
