/**
 * formConfigService.ts
 * Centraliza opções do formulário, preços e paletas de cores.
 * A configuração é salva no Supabase (tabela form_configurations) e
 * cacheada em localStorage. Componentes nunca têm preços hardcoded.
 */

import { supabase } from './supabase';
import type { FormConfig, ColorPalette, FormOptionConfig } from '../types';

const LOCAL_KEY = 'atelier_form_config';
const SUPABASE_CONFIG_KEY = 'global';

// ============================================================
// Paletas padrão
// ============================================================
export const DEFAULT_PALETTES: ColorPalette[] = [
  {
    id: 'atelier',
    name: 'Atelier',
    emoji: '🫙',
    enabled: true,
    colors: {
      primary: '#6B5E4E',
      secondary: '#9B8E7E',
      accent: '#C9A96E',
      background: '#FAFAF8',
      surface: '#F4F0EB',
      text: '#2C2520'
    }
  },
  {
    id: 'onyx',
    name: 'Onyx',
    emoji: '🖤',
    enabled: true,
    colors: {
      primary: '#1A1A1A',
      secondary: '#444444',
      accent: '#C9A96E',
      background: '#111111',
      surface: '#1E1E1E',
      text: '#F5F5F5'
    }
  },
  {
    id: 'sage',
    name: 'Sage',
    emoji: '🌿',
    enabled: true,
    colors: {
      primary: '#4A6741',
      secondary: '#7A9E72',
      accent: '#C1A85A',
      background: '#F6F9F4',
      surface: '#EDF3EA',
      text: '#2A3728'
    }
  },
  {
    id: 'cobalt',
    name: 'Cobalt',
    emoji: '🔷',
    enabled: true,
    colors: {
      primary: '#1B4F8A',
      secondary: '#3A72B5',
      accent: '#E8A826',
      background: '#F5F8FE',
      surface: '#EAF0FA',
      text: '#0F2647'
    }
  },
  {
    id: 'blush',
    name: 'Blush',
    emoji: '🌸',
    enabled: true,
    colors: {
      primary: '#C2637A',
      secondary: '#E8A0B0',
      accent: '#8B4C5E',
      background: '#FEF7F8',
      surface: '#FCEEF0',
      text: '#3D1B24'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '⬜',
    enabled: true,
    colors: {
      primary: '#222222',
      secondary: '#666666',
      accent: '#222222',
      background: '#FFFFFF',
      surface: '#F7F7F7',
      text: '#111111'
    }
  }
];

// ============================================================
// Opções padrão com preços
// ============================================================
export const DEFAULT_FEATURE_OPTIONS: FormOptionConfig[] = [
  { id: 'Entrar em contato', label: 'Formulário de Contato', category: 'Comunicação', price: 0, priceLabel: 'Incluso', enabled: true },
  { id: 'Chamar no WhatsApp', label: 'Botão WhatsApp Flutuante', category: 'Comunicação', price: 0, priceLabel: 'Incluso', enabled: true },
  { id: 'Comprar produtos', label: 'Loja & E-commerce', category: 'Vendas', price: 1800, priceLabel: '+ R$ 1.800', enabled: true },
  { id: 'Agendar horário', label: 'Sistema de Agendamentos', category: 'Serviços', price: 850, priceLabel: '+ R$ 850', enabled: true },
  { id: 'Fazer login', label: 'Área Restrita / Login', category: 'Acesso', price: 1200, priceLabel: '+ R$ 1.200', enabled: true },
  { id: 'Ver portfólio', label: 'Galeria de Portfólio', category: 'Conteúdo', price: 0, priceLabel: 'Incluso', enabled: true },
  { id: 'Ver blog', label: 'Blog / Artigos', category: 'Conteúdo', price: 450, priceLabel: '+ R$ 450', enabled: true },
  { id: 'Ver depoimentos', label: 'Seção de Depoimentos', category: 'Conteúdo', price: 0, priceLabel: 'Incluso', enabled: true },
  { id: 'Calcular orçamento', label: 'Simulador de Orçamento', category: 'Interação', price: 650, priceLabel: '+ R$ 650', enabled: true },
  { id: 'Assinar newsletter', label: 'Captura de E-mails / Newsletter', category: 'Marketing', price: 250, priceLabel: '+ R$ 250', enabled: true }
];

export const DEFAULT_PAGE_OPTIONS: FormOptionConfig[] = [
  { id: 'Página inicial', label: 'Página Inicial', category: 'Essencial', price: 0, priceLabel: 'Incluso', enabled: true },
  { id: 'Sobre a empresa', label: 'Sobre a Empresa', category: 'Essencial', price: 0, priceLabel: 'Incluso', enabled: true },
  { id: 'Serviços', label: 'Serviços', category: 'Essencial', price: 250, priceLabel: '+ R$ 250', enabled: true },
  { id: 'Contato', label: 'Contato', category: 'Essencial', price: 0, priceLabel: 'Incluso', enabled: true },
  { id: 'Portfólio', label: 'Portfólio', category: 'Complementar', price: 250, priceLabel: '+ R$ 250', enabled: true },
  { id: 'Blog', label: 'Blog / Artigos', category: 'Complementar', price: 350, priceLabel: '+ R$ 350', enabled: true },
  { id: 'FAQ', label: 'Perguntas Frequentes', category: 'Complementar', price: 150, priceLabel: '+ R$ 150', enabled: true },
  { id: 'Equipe', label: 'Equipe / Times', category: 'Complementar', price: 200, priceLabel: '+ R$ 200', enabled: true },
  { id: 'Depoimentos', label: 'Depoimentos', category: 'Complementar', price: 0, priceLabel: 'Incluso', enabled: true },
  { id: 'Parceiros', label: 'Parceiros / Clientes', category: 'Complementar', price: 150, priceLabel: '+ R$ 150', enabled: true }
];

export const DEFAULT_FORM_CONFIG: FormConfig = {
  palettes: DEFAULT_PALETTES,
  featureOptions: DEFAULT_FEATURE_OPTIONS,
  pageOptions: DEFAULT_PAGE_OPTIONS,
  goalOptions: [],
  basePrices: {
    base: 1500,
    extraPagePrice: 250,
    copywritingPrice: 950,
    integrationPriceEach: 350
  }
};

let _memoryCache: FormConfig | null = null;

async function fetchFromSupabase(): Promise<FormConfig | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('form_configurations')
      .select('config')
      .eq('key', SUPABASE_CONFIG_KEY)
      .maybeSingle();
    if (error || !data) return null;
    return data.config as FormConfig;
  } catch {
    return null;
  }
}

function mergeWithDefault(saved: Partial<FormConfig>): FormConfig {
  return {
    palettes: saved.palettes?.length ? saved.palettes : DEFAULT_FORM_CONFIG.palettes,
    featureOptions: saved.featureOptions?.length ? saved.featureOptions : DEFAULT_FORM_CONFIG.featureOptions,
    pageOptions: saved.pageOptions?.length ? saved.pageOptions : DEFAULT_FORM_CONFIG.pageOptions,
    goalOptions: saved.goalOptions?.length ? saved.goalOptions : DEFAULT_FORM_CONFIG.goalOptions,
    basePrices: { ...DEFAULT_FORM_CONFIG.basePrices, ...(saved.basePrices || {}) },
    updatedAt: saved.updatedAt
  };
}

export async function getFormConfig(): Promise<FormConfig> {
  if (_memoryCache) return _memoryCache;

  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FormConfig;
      _memoryCache = mergeWithDefault(parsed);
      fetchFromSupabase().then(remote => {
        if (remote) {
          _memoryCache = mergeWithDefault(remote);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(_memoryCache));
        }
      }).catch(() => {});
      return _memoryCache;
    }
  } catch { /* ignore */ }

  try {
    const remote = await fetchFromSupabase();
    if (remote) {
      _memoryCache = mergeWithDefault(remote);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(_memoryCache));
      return _memoryCache;
    }
  } catch { /* offline */ }

  _memoryCache = { ...DEFAULT_FORM_CONFIG };
  return _memoryCache;
}

export function getFormConfigSync(): FormConfig {
  return _memoryCache ?? DEFAULT_FORM_CONFIG;
}

export async function saveFormConfig(config: FormConfig): Promise<void> {
  const toSave = { ...config, updatedAt: new Date().toISOString() };
  _memoryCache = toSave;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(toSave));
  if (!supabase) return;
  try {
    await supabase
      .from('form_configurations')
      .upsert(
        { key: SUPABASE_CONFIG_KEY, config: toSave, updated_at: toSave.updatedAt },
        { onConflict: 'key' }
      );
  } catch { /* offline */ }
}

export function invalidateFormConfigCache(): void {
  _memoryCache = null;
}
