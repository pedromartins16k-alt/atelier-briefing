import type { DynamicFeature } from '../types';

export const FEATURE_ALIASES = {
  ecommerce: ['Comprar produtos', 'Loja & E-commerce', 'E-commerce', 'Loja virtual'],
  booking: ['Agendar horário', 'Sistema de Agendamentos', 'Agendamento'],
  login: ['Fazer login', 'Área Restrita / Login', 'Área do cliente'],
  whatsapp: ['Chamar no WhatsApp', 'Botão WhatsApp Flutuante', 'WhatsApp'],
  portfolio: ['Ver portfólio', 'Galeria de Portfólio', 'Portfólio'],
  testimonials: ['Ver depoimentos', 'Seção de Depoimentos', 'Depoimentos'],
  contact: ['Entrar em contato', 'Formulário de Contato', 'Solicitar orçamento'],
} as const;

/**
 * Checks whether a conceptual feature is active in `selectedFeatures`,
 * supporting legacy IDs, CMS labels, and CMS `conditionalRuleId`.
 */
export function hasSelectedFeature(
  selectedFeatures: string[] | undefined,
  aliases: readonly string[],
  ruleId?: string,
  configFeatures?: DynamicFeature[]
): boolean {
  const list = selectedFeatures || [];
  if (list.length === 0) return false;

  const lowerList = list.map(s => s.toLowerCase().trim());

  if (aliases.some(alias => lowerList.includes(alias.toLowerCase()))) {
    return true;
  }

  if (ruleId && configFeatures && configFeatures.length > 0) {
    return configFeatures.some(f => {
      if (!f.enabled || f.conditionalRuleId !== ruleId) return false;
      return (
        lowerList.includes(f.id.toLowerCase().trim()) ||
        (f.label && lowerList.includes(f.label.toLowerCase().trim())) ||
        (f.name && lowerList.includes(f.name.toLowerCase().trim()))
      );
    });
  }

  return false;
}

/** Checks if a page option (by id or label) is selected case-insensitively. */
export function isPageOptionSelected(
  selectedPages: string[] | undefined,
  pageId: string,
  pageLabel?: string
): boolean {
  const list = selectedPages || [];
  const lowerId = pageId.toLowerCase().trim();
  const lowerLabel = (pageLabel || pageId).toLowerCase().trim();
  return list.some(item => {
    const lowerItem = item.toLowerCase().trim();
    return lowerItem === lowerId || lowerItem === lowerLabel;
  });
}

/** Toggles a page option cleanly without leaving duplicate case/label entries. */
export function togglePageOption(
  selectedPages: string[] | undefined,
  pageId: string,
  pageLabel?: string
): string[] {
  const list = selectedPages || [];
  const lowerId = pageId.toLowerCase().trim();
  const lowerLabel = (pageLabel || pageId).toLowerCase().trim();
  const exists = isPageOptionSelected(list, pageId, pageLabel);

  if (exists) {
    return list.filter(item => {
      const lowerItem = item.toLowerCase().trim();
      return lowerItem !== lowerId && lowerItem !== lowerLabel;
    });
  }

  return [...list, pageLabel || pageId];
}
