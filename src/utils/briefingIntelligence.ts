import type { BriefingData, AttentionPoint } from '../types';

export function analyzeBriefing(data: BriefingData): {
  executiveSummary: string;
  suggestedSitemap: string[];
  keyActions: string[];
  attentionPoints: AttentionPoint[];
} {
  const attentionPoints: AttentionPoint[] = [];

  const wantsHighEnd = data.brandPerceptions.some(p => ['Sofisticada', 'Luxuosa', 'Elegante'].includes(p));
  if (wantsHighEnd && (data.identityStatus === 'none' || data.identityStatus === 'logo_only')) {
    attentionPoints.push({
      type: 'risk',
      title: 'Identidade Visual & Posicionamento Refinado',
      description: 'O cliente busca uma percepção de marca sofisticada ou luxuosa, porém ainda não possui identidade visual completa ou possui apenas um logo isolado. Risco de desalinhamento visual sem branding prévio.'
    });
  }

  const wantsEcommerce = data.selectedFeatures.includes('Comprar produtos') || data.mainGoals.includes('Vender produtos');
  if (wantsEcommerce) {
    if (!data.featureConditionals.ecommerceHasPaymentGateway || data.featureConditionals.ecommerceHasPaymentGateway === 'Não') {
      attentionPoints.push({
        type: 'risk',
        title: 'Pagamentos Online Não Definidos',
        description: 'O projeto contempla venda de produtos, mas não possui gateway ou credenciamento de pagamentos estabelecido. Dependência crítica para o checkout.'
      });
    }
    if (data.featureConditionals.ecommerceCurrentlySellsOnline === 'Não') {
      attentionPoints.push({
        type: 'clarification',
        title: 'Primeira Operação de Vendas Online',
        description: 'A empresa nunca vendeu pela internet antes. Será necessário alinhar frete, cálculo de envio, estoque e fluxo operacional de expedição.'
      });
    }
  }

  const wantsBooking = data.selectedFeatures.includes('Agendar horário') || data.mainGoals.includes('Receber agendamentos');
  if (wantsBooking) {
    if (!data.featureConditionals.bookingCurrentTool) {
      attentionPoints.push({
        type: 'clarification',
        title: 'Definição de Ferramenta de Agendamento',
        description: 'Foi solicitado sistema de agendamento, mas sem especificação de ferramenta atual (ex: Calendly, Google Calendar ou sistema proprietário).'
      });
    }
  }

  const hasContentPages = data.selectedPages.some(p => ['Blog', 'Cases', 'Projetos', 'Depoimentos'].includes(p));
  const missingMaterials = !data.existingMaterials.some(m => m.includes('Textos') || m.includes('Cases'));
  if (hasContentPages && missingMaterials) {
    if (data.missingContentOwner === 'client') {
      attentionPoints.push({
        type: 'dependency',
        title: 'Gargalo Crítico de Conteúdo (Cliente)',
        description: 'O site terá seções ricas em conteúdo (Cases/Blog/Depoimentos), porém o material ainda não existe e a responsabilidade foi atribuída ao cliente. Histórico comum de atrasos em projetos web.'
      });
    } else if (data.missingContentOwner === 'undecided') {
      attentionPoints.push({
        type: 'risk',
        title: 'Responsabilidade de Redação em Aberto',
        description: 'Seções vitais de texto e cases não possuem responsável definido para produção ou contratação de copywriting.'
      });
    }
  }

  const lacksPhotos = !data.existingMaterials.some(m => m.includes('Fotografias'));
  if (lacksPhotos) {
    attentionPoints.push({
      type: 'dependency',
      title: 'Necessidade de Produção Fotográfica',
      description: 'O cliente não dispõe de fotografias profissionais da empresa/produtos. Recomenda-se prever ensaio fotográfico ou curadoria de acervo premium.'
    });
  }

  const wantsLeads = data.mainGoals.includes('Gerar leads') || data.mainGoals.includes('Conseguir novos clientes');
  const hasCrm = data.integrations.some(i => i.toLowerCase().includes('crm'));
  if (wantsLeads && !hasCrm) {
    attentionPoints.push({
      type: 'opportunity',
      title: 'Oportunidade de Integração com CRM',
      description: 'O principal objetivo é captação de clientes, mas não há ferramenta de CRM selecionada para gestão e acompanhamento comercial dos leads.'
    });
  }

  const keyActions: string[] = [];
  if (data.singlePrimaryAction.trim()) {
    keyActions.push('Ação principal (CTA primordial): "' + data.singlePrimaryAction.trim() + '"');
  } else if (data.selectedFeatures.includes('Chamar no WhatsApp')) {
    keyActions.push('Ação principal inferida: Início imediato de conversa via WhatsApp');
  } else if (data.selectedFeatures.includes('Solicitar orçamento')) {
    keyActions.push('Ação principal inferida: Envio de formulário qualificado de orçamento');
  }

  const suggestedSitemap = Array.from(new Set([
    ...data.selectedPages,
    ...data.customPages
  ])).filter(Boolean);

  if (!suggestedSitemap.includes('Página inicial')) {
    suggestedSitemap.unshift('Página inicial');
  }

  const company = data.companyName.trim() || 'Empresa';
  const segment = data.businessSegment ? 'do segmento de ' + data.businessSegment : '';
  const goalsStr = data.mainGoals.length > 0 ? data.mainGoals.join(', ').toLowerCase() : 'apresentar seus serviços com solidez';
  const perceptionsStr = data.brandPerceptions.length > 0 ? data.brandPerceptions.join(', ').toLowerCase() : 'moderna e profissional';
  const actionStr = data.singlePrimaryAction || 'contato direto com a empresa';
  const integrationsStr = data.integrations.length > 0 ? data.integrations.join(', ') : 'contato essencial';

  const executiveSummary = 'O projeto da ' + company + ' ' + segment + ' tem como foco primordial ' + goalsStr + '. A experiência digital será construída com uma atmosfera ' + perceptionsStr + ', priorizando clareza na proposta de valor e conversão orientada para "' + actionStr + '". A estrutura inicial prevê ' + suggestedSitemap.length + ' páginas principais, com atenção especial às integrações de ' + integrationsStr + '.';

  return {
    executiveSummary,
    suggestedSitemap,
    keyActions,
    attentionPoints
  };
}
