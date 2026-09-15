import React, { useMemo } from 'react';
import type { BriefingData } from '../../types';
import { FileText, CheckCircle2 } from 'lucide-react';

interface CostNotepadProps {
  data: BriefingData;
}

interface CostItem {
  id: string;
  name: string;
  category: string;
  value: number;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(val);
}

export default function CostNotepad({ data }: CostNotepadProps) {
  const { items, total } = useMemo(() => {
    const list: CostItem[] = [];

    // 1. Projeto Base (Fundação, arquitetura e consultoria inicial)
    list.push({
      id: 'base',
      name: 'Projeto Base & Arquitetura',
      category: 'Estrutura',
      value: 1500
    });

    // 2. Páginas adicionais (além das 2 padrão)
    const extraPages = Math.max(0, (data.selectedPages?.length || 0) - 2);
    if (extraPages > 0) {
      list.push({
        id: 'pages',
        name: `${extraPages} página${extraPages > 1 ? 's' : ''} adicional${extraPages > 1 ? 'is' : ''}`,
        category: 'Páginas',
        value: extraPages * 250
      });
    }

    // 3. E-commerce / Loja
    if (data.selectedFeatures?.includes('Comprar produtos')) {
      list.push({
        id: 'ecommerce',
        name: 'Módulo de Loja & Checkout',
        category: 'Funcionalidades',
        value: 1800
      });
    }

    // 4. Sistema de Agendamento
    if (data.selectedFeatures?.includes('Agendar horário')) {
      list.push({
        id: 'booking',
        name: 'Sistema de Agendamentos',
        category: 'Funcionalidades',
        value: 850
      });
    }

    // 5. Área de Membros / Login
    if (data.selectedFeatures?.includes('Fazer login')) {
      list.push({
        id: 'auth_area',
        name: 'Área Restrita / Login',
        category: 'Funcionalidades',
        value: 1200
      });
    }

    // 6. Identidade Visual
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

    // 7. Redação e Conteúdo
    if (data.missingContentOwner === 'agency') {
      list.push({
        id: 'copywriting',
        name: 'Curadoria e Redação de Conteúdo',
        category: 'Conteúdo',
        value: 950
      });
    }

    // 8. Integrações externas especializadas
    const integrationsCount = (data.integrations || []).filter(i => !i.toLowerCase().includes('whatsapp')).length;
    if (integrationsCount > 0) {
      list.push({
        id: 'integrations',
        name: `${integrationsCount} integração${integrationsCount > 1 ? 'ões' : ''} de software`,
        category: 'Conexões',
        value: integrationsCount * 350
      });
    }

    const sum = list.reduce((acc, curr) => acc + curr.value, 0);

    return { items: list, total: sum };
  }, [data]);

  return (
    <div className="cost-notepad-card">
      <div className="notepad-header">
        <div className="notepad-title-group">
          <FileText size={15} className="notepad-icon" />
          <span className="notepad-title">Custos até o momento</span>
        </div>
        <span className="notepad-items-badge">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
      </div>

      <div className="notepad-paper">
        <ul className="notepad-items-list">
          {items.map(item => (
            <li key={item.id} className="notepad-item-row">
              <div className="notepad-item-info">
                <CheckCircle2 size={13} className="notepad-check-bullet" />
                <span className="notepad-item-name">{item.name}</span>
              </div>
              <span className="notepad-item-price">{formatCurrency(item.value)}</span>
            </li>
          ))}
        </ul>

        <div className="notepad-divider" />

        <div className="notepad-total-row">
          <div className="notepad-total-label">
            <span>Total estimado</span>
            <small>atualizado com suas escolhas</small>
          </div>
          <strong className="notepad-total-amount">{formatCurrency(total)}</strong>
        </div>
      </div>
    </div>
  );
}
