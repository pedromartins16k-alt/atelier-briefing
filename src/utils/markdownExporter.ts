import type { BriefingData } from '../types';
import { analyzeBriefing } from './briefingIntelligence';

export function generateBriefingMarkdown(data: BriefingData): string {

  const analysis = analyzeBriefing(data);
  const now = new Date().toLocaleDateString('pt-BR');

  let md = '# Briefing de Projeto — ' + (data.companyName || 'Empresa') + '\n';
  md += '*Gerado pelo Atelier Briefing em ' + now + '*\n\n';

  md += '## 1. Resumo Executivo\n';
  md += analysis.executiveSummary + '\n\n';

  if (analysis.attentionPoints.length > 0) {
    md += '## 2. ⚠️ Pontos de Atenção e Diagnóstico Técnico\n';
    analysis.attentionPoints.forEach(pt => {
      const icon = pt.type === 'risk' ? '🛑 [RISCO]' : pt.type === 'dependency' ? '⏳ [DEPENDÊNCIA]' : pt.type === 'opportunity' ? '💡 [OPORTUNIDADE]' : 'ℹ️ [ALINHAMENTO]';
      md += '- **' + icon + ' ' + pt.title + ':** ' + pt.description + '\n';
    });
    md += '\n';
  }

  md += '## 3. Sobre o Negócio\n';
  md += '- **Empresa:** ' + (data.companyName || 'Não informado') + '\n';
  md += '- **Responsável:** ' + (data.responsibleName || 'Não informado') + '\n';
  md += '- **E-mail:** ' + (data.contactEmail || 'Não informado') + '\n';
  md += '- **WhatsApp:** ' + (data.contactWhatsapp || 'Não informado') + '\n';
  md += '- **Segmento:** ' + (data.businessSegment || 'Não informado') + '\n';
  md += '- **O que a empresa faz:** ' + (data.businessDescription || 'Não informado') + '\n';
  md += '- **Produtos e Serviços:** ' + (data.productsAndServices || 'Não informado') + '\n';
  md += '- **Principal Diferencial:** ' + (data.businessDifferentiator || 'Não informado') + '\n';
  md += '- **Tempo de Mercado:** ' + (data.businessAge || 'Não informado') + '\n';
  md += '- **Onde Atende:** ' + (data.serviceLocation || 'Não informado') + '\n';
  if (data.importantBusinessNotes) {
    md += '- **Notas Importantes do Negócio:** ' + data.importantBusinessNotes + '\n';
  }
  md += '\n';

  md += '## 4. Objetivos & Ação Principal (CTA)\n';
  md += '- **Objetivos Primordiais:** ' + (data.mainGoals.length > 0 ? data.mainGoals.join(', ') : 'Não informado') + '\n';
  if (data.customGoal) md += '- **Objetivo Adicional:** ' + data.customGoal + '\n';
  md += '- **Ação Principal Esperada (CTA Principal):** ' + (data.singlePrimaryAction || 'Não definido com precisão') + '\n\n';

  md += '## 5. Público-Alvo\n';
  md += '- **Público Principal:** ' + (data.targetAudience || 'Não informado') + '\n';
  md += '- **Tipo de Cliente:** ' + (data.audienceType === 'b2b' ? 'B2B (Empresas)' : data.audienceType === 'b2c' ? 'B2C (Consumidor Final)' : data.audienceType === 'both' ? 'B2B e B2C' : 'Não informado') + '\n';
  md += '- **Faixa Etária:** ' + (data.ageRange || 'Não informado') + '\n';
  md += '- **Localização do Público:** ' + (data.audienceLocation || 'Não informado') + '\n';
  md += '- **Poder Aquisitivo:** ' + (data.purchasingPower || 'Não informado') + '\n';
  if (data.audienceTraits) md += '- **Características Relevantes:** ' + data.audienceTraits + '\n';
  if (data.excludedAudience) md += '- **Público que NÃO deseja atrair:** ' + data.excludedAudience + '\n';
  md += '\n';

  md += '## 6. Estrutura e Sitemap Sugerido\n';
  md += '- **Páginas Selecionadas:** ' + data.selectedPages.join(', ') + '\n';
  if (data.customPages.length > 0) md += '- **Páginas Adicionais:** ' + data.customPages.join(', ') + '\n';
  if (data.indispensablePageOrSection) md += '- **Seção/Página Indispensável:** ' + data.indispensablePageOrSection + '\n';
  md += '\n**Sitemap Inicial Recomendado:**\n';
  analysis.suggestedSitemap.forEach((page, idx) => {
    md += (idx + 1) + '. ' + page + '\n';
  });
  md += '\n';

  md += '## 7. Funcionalidades & Requisitos Específicos\n';
  md += '- **Interações Escolhidas:** ' + data.selectedFeatures.join(', ') + '\n';
  if (data.customFeature) md += '- **Funcionalidade Customizada:** ' + data.customFeature + '\n';

  const cond = data.featureConditionals;
  if (data.selectedFeatures.includes('Comprar produtos')) {
    md += '\n### Detalhes de Venda / E-commerce:\n';
    md += '- Quantidade aproximada de produtos: ' + (cond.ecommerceProductsCount || 'Não informado') + '\n';
    md += '- Já possui gateway de pagamento: ' + (cond.ecommerceHasPaymentGateway || 'Não') + '\n';
    if (cond.ecommercePaymentGatewayDetails) md += '- Gateway/plataforma atual: ' + cond.ecommercePaymentGatewayDetails + '\n';
    md += '- Necessita de carrinho de compras: ' + (cond.ecommerceNeedsCart || 'Sim') + '\n';
    md += '- Necessita de cadastro de clientes: ' + (cond.ecommerceNeedsAccount || 'Sim') + '\n';
    md += '- Já vende online atualmente: ' + (cond.ecommerceCurrentlySellsOnline || 'Não') + '\n';
  }

  if (data.selectedFeatures.includes('Agendar horário')) {
    md += '\n### Detalhes de Agendamento:\n';
    md += '- Tipo de serviço a ser agendado: ' + (cond.bookingServiceType || 'Não informado') + '\n';
    md += '- Profissionais envolvidos: ' + (cond.bookingProfessionalsCount || 'Não informado') + '\n';
    md += '- Mostrar horários disponíveis em tempo real: ' + (cond.bookingShowAvailableSlots || 'Não informado') + '\n';
    md += '- Confirmação de agendamento via: ' + ((cond.bookingConfirmationMethod || []).join(', ') || 'WhatsApp / E-mail') + '\n';
    if (cond.bookingCurrentTool) md += '- Ferramenta em uso: ' + cond.bookingCurrentTool + '\n';
  }

  if (data.selectedFeatures.includes('Fazer login')) {
    md += '\n### Detalhes da Área de Membros/Login:\n';
    md += '- Finalidade do acesso restrito: ' + (cond.loginPurpose || 'Não informado') + '\n';
  }
  md += '\n';

  md += '## 8. Identidade Visual e Estilo\n';
  md += '- **Percepção Desejada:** ' + (data.brandPerceptions.join(', ') || 'Não definido') + '\n';
  md += '- **Cores da Marca:** ' + (data.brandColors || 'A definir / Sem preferência estrita') + '\n';
  if (data.colorsToAvoid) md += '- **Cores a Evitar:** ' + data.colorsToAvoid + '\n';
  md += '- **Status da Identidade Visual:** ' + (data.identityStatus === 'complete' ? 'Sim, completa (manual + vetor)' : data.identityStatus === 'logo_only' ? 'Apenas logo' : data.identityStatus === 'some_materials' ? 'Alguns materiais pontuais' : 'Ainda não possui identidade visual') + '\n\n';

  if (data.references.length > 0) {
    md += '## 9. Referências e Inspirações\n';
    data.references.forEach((ref, i) => {
      md += '### Referência ' + (i + 1) + ': ' + ref.url + '\n';
      md += '- **O que gostou:** ' + ref.reasons.join(', ') + '\n';
      if (ref.notes) md += '- **Observações adicionais:** ' + ref.notes + '\n';
    });
    md += '\n';
  }

  md += '## 10. Conteúdo e Materiais Existentes\n';
  md += '- **Materiais Disponíveis:** ' + (data.existingMaterials.length > 0 ? data.existingMaterials.join(', ') : 'Nenhum material pronto ainda') + '\n';
  md += '- **Responsável pela Produção de Conteúdo Faltante:** ' + (data.missingContentOwner === 'client' ? 'O próprio cliente' : data.missingContentOwner === 'agency' ? 'Desenvolvedor / Estúdio' : data.missingContentOwner === 'contractor' ? 'Profissional terceirizado contratado' : 'Ainda não definido') + '\n\n';

  md += '## 11. Conexões e Integrações\n';
  md += '- **Ferramentas:** ' + (data.integrations.length > 0 ? data.integrations.join(', ') : 'Nenhuma integração externa prevista') + '\n';
  if (data.integrationDetails) md += '- **Detalhes das Integrações:** ' + data.integrationDetails + '\n';
  md += '\n';

  if (data.competitors.length > 0) {
    md += '## 12. Concorrentes e Mercado\n';
    data.competitors.forEach((c, i) => {
      md += '### Concorrente ' + (i + 1) + ': ' + c.nameOrUrl + '\n';
      if (c.likes) md += '- **O que gosta no site dele:** ' + c.likes + '\n';
      if (c.dislikes) md += '- **O que NÃO gosta / quer fazer melhor:** ' + c.dislikes + '\n';
    });
    md += '\n';
  }

  md += '## 13. O que NÃO Quer (Restrições)\n';
  md += '- **Elementos a Evitar:** ' + (data.unwantedElements.length > 0 ? data.unwantedElements.join(', ') : 'Nenhuma restrição específica assinalada') + '\n';
  if (data.dislikedStylesOrSites) md += '- **Estilos ou Sites Rejeitados:** ' + data.dislikedStylesOrSites + '\n';
  md += '\n';

  md += '## 14. Prazos e Faixa de Investimento\n';
  md += '- **Data Desejada de Lançamento:** ' + (data.targetLaunchDate || 'Sem data limite rigorosa') + '\n';
  md += '- **Faixa de Investimento Planejada:** ' + (data.investmentRange || 'A definir na proposta') + '\n\n';

  if (data.finalObservations) {
    md += '## 15. Observações Finais do Cliente\n';
    md += data.finalObservations + '\n\n';
  }

  return md;
}

/** Alias conveniente para geração de markdown */
export const generateMarkdown = generateBriefingMarkdown;

