import React, { useMemo, useEffect, useState } from 'react';
import type { BriefingData } from '../../types';
import type { FormConfig } from '../../types';
import { FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { getFormConfig, getFormConfigSync } from '../../services/formConfigService';

interface CostNotepadProps {
  data: BriefingData;
}

interface CostItem {
  id: string;
  name: string;
  category: string;
  value: number;
  priceLabel?: string;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(val);
}

function calculateItems(data: BriefingData, config: FormConfig): CostItem[] {
  const list: CostItem[] = [];
  const bp = config.basePrices;

  // 1. Projeto Base
  list.push({
    id: 'base',
    name: 'Projeto Base & Arquitetura',
    category: 'Estrutura',
    value: bp.base
  });

  // 2. Páginas adicionais (acima de 2 padrão)
  const pagesIncluded = config.pageOptions.filter(p => p.price === 0).length;
  const includedFree = Math.max(pagesIncluded, 2);
  const extraPages = Math.max(0, (data.selectedPages?.length || 0) - includedFree);
  if (extraPages > 0) {
    list.push({
      id: 'pages',
      name: `${extraPages} página${extraPages > 1 ? 's' : ''} adicional${extraPages > 1 ? 'is' : ''}`,
      category: 'Páginas',
      value: extraPages * bp.extraPagePrice
    });
  }

  // 3. Funcionalidades com preço configurado
  const selectedFeatures = data.selectedFeatures || [];
  for (const opt of config.featureOptions) {
    if (!opt.enabled) continue;
    if (!selectedFeatures.includes(opt.id)) continue;
    if (!opt.price || opt.price === 0) continue;
    list.push({
      id: `feature-${opt.id}`,
      name: opt.label,
      category: opt.category || 'Funcionalidades',
      value: opt.price,
      priceLabel: opt.priceLabel
    });
  }

  // 4. Identidade Visual
  if (data.identityStatus === 'none') {
    list.push({
      id: 'identity_full',
      name: 'Desenvolvimento de Identidade Visual',
      category: 'Branding',
      value: 1400
    });
  } else if (data.identityStatus === 'logo_only') {
    list.push({
      id: 'identity_expand',
      name: 'Expansão de Identidade Visual',
      category: 'Branding',
      value: 700
    });
  }

  // 5. Redação e Conteúdo
  if (data.missingContentOwner === 'agency') {
    list.push({
      id: 'copywriting',
      name: 'Curadoria e Redação de Conteúdo',
      category: 'Conteúdo',
      value: bp.copywritingPrice
    });
  }

  // 6. Integrações externas
  const integrationsCount = (data.integrations || []).filter(
    i => !i.toLowerCase().includes('whatsapp')
  ).length;
  if (integrationsCount > 0) {
    list.push({
      id: 'integrations',
      name: `${integrationsCount} integração${integrationsCount > 1 ? 'ões' : ''} de software`,
      category: 'Conexões',
      value: integrationsCount * bp.integrationPriceEach
    });
  }

  return list;
}

export default function CostNotepad({ data }: CostNotepadProps) {
  const [config, setConfig] = useState<FormConfig>(getFormConfigSync());

  // Carregar config do Supabase/localStorage de forma assíncrona
  useEffect(() => {
    getFormConfig().then(setConfig).catch(() => {});
  }, []);

  const { items, total } = useMemo(() => {
    const list = calculateItems(data, config);
    const sum = list.reduce((acc, curr) => acc + curr.value, 0);
    return { items: list, total: sum };
  }, [data, config]);

  const categoryColors: Record<string, string> = {
    'Estrutura': '#6B5E4E',
    'Páginas': '#4A6741',
    'Funcionalidades': '#1B4F8A',
    'Branding': '#C2637A',
    'Conteúdo': '#9B6E3A',
    'Conexões': '#5A3E8A',
  };

  return (
    <div className="cost-notepad-card">
      <div className="notepad-header">
        <div className="notepad-title-group">
          <FileText size={15} className="notepad-icon" />
          <span className="notepad-title">Estimativa de Investimento</span>
        </div>
        <span className="notepad-items-badge">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className="notepad-paper">
        <ul className="notepad-items-list">
          {items.map(item => (
            <li key={item.id} className="notepad-item-row">
              <div className="notepad-item-info">
                <CheckCircle2 size={13} className="notepad-check-bullet" style={{ color: categoryColors[item.category] || '#6B5E4E' }} />
                <div className="notepad-item-text">
                  <span className="notepad-item-name">{item.name}</span>
                  <span className="notepad-item-cat" style={{ color: categoryColors[item.category] || '#999' }}>
                    {item.category}
                  </span>
                </div>
              </div>
              <span className="notepad-item-price">{formatCurrency(item.value)}</span>
            </li>
          ))}
        </ul>

        {items.length === 0 && (
          <div className="notepad-empty">
            <RefreshCw size={16} />
            <span>Preencha o formulário para ver a estimativa</span>
          </div>
        )}

        <div className="notepad-divider" />

        <div className="notepad-total-row">
          <div className="notepad-total-label">
            <span>Total estimado</span>
            <small>atualizado com suas escolhas</small>
          </div>
          <strong className="notepad-total-amount">{formatCurrency(total)}</strong>
        </div>

        <p className="notepad-disclaimer">
          * Estimativa preliminar. O valor final será definido após análise do briefing completo.
        </p>
      </div>
    </div>
  );
}
