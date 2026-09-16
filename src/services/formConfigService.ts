/**
 * formConfigService.ts
 * Centraliza o CMS do Briefing: categorias, funcionalidades, opções, etapas,
 * perguntas, preços base, textos de UI e paletas de cores.
 * Persistido no Supabase (tabela form_configurations) e em localStorage.
 */

import { supabase } from './supabase';
import type {
  FormConfig,
  ColorPalette,
  FormOptionConfig,
  DynamicCategory,
  DynamicFeature,
  DynamicStep,
  QuestionOption,
  UISettings
} from '../types';

const LOCAL_KEY = 'atelier_form_config';
const SUPABASE_CONFIG_KEY = 'global';

// ============================================================
// 1. Paletas padrão
// ============================================================
export const DEFAULT_PALETTES: ColorPalette[] = [
  {
    id: 'atelier',
    name: 'Atelier',
    emoji: '🫙',
    enabled: true,
    order: 1,
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
    order: 2,
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
    order: 3,
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
    order: 4,
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
    order: 5,
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
    order: 6,
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
// 2. Categorias padrão
// ============================================================
export const DEFAULT_CATEGORIES: DynamicCategory[] = [
  { id: 'comunicacao', name: 'Comunicação', description: 'Canais de contato e diálogo direto', icon: '💬', order: 1, enabled: true },
  { id: 'vendas', name: 'Vendas', description: 'Transações comerciais e catálogo de produtos', icon: '🛍️', order: 2, enabled: true },
  { id: 'servicos', name: 'Serviços', description: 'Agendamentos e prestação de serviços', icon: '📅', order: 3, enabled: true },
  { id: 'acesso', name: 'Acesso', description: 'Área restrita e portais de clientes', icon: '🔒', order: 4, enabled: true },
  { id: 'conteudo', name: 'Conteúdo', description: 'Artigos, portfólio e depoimentos', icon: '📝', order: 5, enabled: true },
  { id: 'interacao', name: 'Interação', description: 'Simuladores, formulários e calculadoras', icon: '⚡', order: 6, enabled: true },
  { id: 'marketing', name: 'Marketing', description: 'Captação de leads e campanhas de conversão', icon: '📈', order: 7, enabled: true }
];

// ============================================================
// 3. Funcionalidades padrão (CRUD Completo)
// ============================================================
export const DEFAULT_FEATURES: DynamicFeature[] = [
  {
    id: 'Entrar em contato',
    name: 'Formulário de Contato',
    label: 'Formulário de Contato',
    description: 'Captação direta de mensagens e orçamentos',
    categoryId: 'comunicacao',
    price: 0,
    priceLabel: 'Incluso',
    icon: '✉️',
    order: 1,
    enabled: true
  },
  {
    id: 'Chamar no WhatsApp',
    name: 'Botão WhatsApp Flutuante',
    label: 'Botão WhatsApp Flutuante',
    description: 'Botão de clique rápido para conversa instantânea',
    categoryId: 'comunicacao',
    price: 0,
    priceLabel: 'Incluso',
    icon: '💬',
    order: 2,
    enabled: true
  },
  {
    id: 'Comprar produtos',
    name: 'Loja & E-commerce',
    label: 'Loja & E-commerce',
    description: 'Catálogo de produtos com checkout e pagamento',
    categoryId: 'vendas',
    price: 1800,
    priceLabel: '+ R$ 1.800',
    icon: '🛍️',
    order: 3,
    enabled: true,
    conditionalRuleId: 'ecommerce'
  },
  {
    id: 'Agendar horário',
    name: 'Sistema de Agendamentos',
    label: 'Sistema de Agendamentos',
    description: 'Agenda online com seleção de horários e serviços',
    categoryId: 'servicos',
    price: 850,
    priceLabel: '+ R$ 850',
    icon: '📅',
    order: 4,
    enabled: true,
    conditionalRuleId: 'booking'
  },
  {
    id: 'Fazer login',
    name: 'Área Restrita / Login',
    label: 'Área Restrita / Login',
    description: 'Ambiente exclusivo com controle de acesso e senha',
    categoryId: 'acesso',
    price: 1200,
    priceLabel: '+ R$ 1.200',
    icon: '🔒',
    order: 5,
    enabled: true,
    conditionalRuleId: 'login'
  },
  {
    id: 'Ver portfólio',
    name: 'Galeria de Portfólio',
    label: 'Galeria de Portfólio',
    description: 'Apresentação visual dinâmica de projetos e trabalhos',
    categoryId: 'conteudo',
    price: 0,
    priceLabel: 'Incluso',
    icon: '🖼️',
    order: 6,
    enabled: true
  },
  {
    id: 'Ver blog',
    name: 'Blog / Artigos',
    label: 'Blog / Artigos',
    description: 'Publicação de artigos com categorias e indexação SEO',
    categoryId: 'conteudo',
    price: 450,
    priceLabel: '+ R$ 450',
    icon: '📰',
    order: 7,
    enabled: true
  },
  {
    id: 'Ver depoimentos',
    name: 'Seção de Depoimentos',
    label: 'Seção de Depoimentos',
    description: 'Avaliações e depoimentos de clientes com estrelas',
    categoryId: 'conteudo',
    price: 0,
    priceLabel: 'Incluso',
    icon: '⭐',
    order: 8,
    enabled: true
  },
  {
    id: 'Calcular orçamento',
    name: 'Simulador de Orçamento',
    label: 'Simulador de Orçamento',
    description: 'Calculadora de estimativas interativa em tempo real',
    categoryId: 'interacao',
    price: 650,
    priceLabel: '+ R$ 650',
    icon: '🧮',
    order: 9,
    enabled: true
  },
  {
    id: 'Assinar newsletter',
    name: 'Captura de E-mails / Newsletter',
    label: 'Captura de E-mails / Newsletter',
    description: 'Inscrição para envio de comunicados e novidades',
    categoryId: 'marketing',
    price: 250,
    priceLabel: '+ R$ 250',
    icon: '📬',
    order: 10,
    enabled: true
  }
];

// Alias para retrocompatibilidade
export const DEFAULT_FEATURE_OPTIONS: FormOptionConfig[] = DEFAULT_FEATURES.map(f => ({
  id: f.id,
  label: f.label,
  category: f.categoryId,
  price: f.price,
  priceLabel: f.priceLabel,
  enabled: f.enabled,
  order: f.order
}));

// ============================================================
// 4. Páginas padrão
// ============================================================
export const DEFAULT_PAGE_OPTIONS: QuestionOption[] = [
  { id: 'Página inicial', label: 'Página Inicial', description: 'Visão principal e boas-vindas', price: 0, priceLabel: 'Incluso', icon: '🏠', order: 1, enabled: true },
  { id: 'Sobre a empresa', label: 'Sobre a Empresa', description: 'História, propósito e credenciais', price: 0, priceLabel: 'Incluso', icon: '🏛️', order: 2, enabled: true },
  { id: 'Serviços', label: 'Serviços', description: 'Detalhamento do catálogo de soluções', price: 250, priceLabel: '+ R$ 250', icon: '💼', order: 3, enabled: true },
  { id: 'Contato', label: 'Contato', description: 'Formulário, canais e localização', price: 0, priceLabel: 'Incluso', icon: '📍', order: 4, enabled: true },
  { id: 'Portfólio', label: 'Portfólio / Projetos', description: 'Galeria visual de cases e entregas', price: 250, priceLabel: '+ R$ 250', icon: '🎨', order: 5, enabled: true },
  { id: 'Blog', label: 'Blog / Artigos', description: 'Artigos educativos e estratégicos', price: 350, priceLabel: '+ R$ 350', icon: '✍️', order: 6, enabled: true },
  { id: 'FAQ', label: 'Perguntas Frequentes', description: 'Respostas para dúvidas comuns', price: 150, priceLabel: '+ R$ 150', icon: '❓', order: 7, enabled: true },
  { id: 'Equipe', label: 'Equipe / Quem Somos', description: 'Apresentação dos sócios e time', price: 200, priceLabel: '+ R$ 200', icon: '👥', order: 8, enabled: true },
  { id: 'Depoimentos', label: 'Depoimentos', description: 'Prova social e recomendações', price: 0, priceLabel: 'Incluso', icon: '🌟', order: 9, enabled: true },
  { id: 'Parceiros', label: 'Parceiros / Clientes', description: 'Logos e marcas que confiam', price: 150, priceLabel: '+ R$ 150', icon: '🤝', order: 10, enabled: true }
];

// ============================================================
// 5. Etapas e Perguntas do Briefing (CMS Completo)
// ============================================================
export const DEFAULT_STEPS: DynamicStep[] = [
  {
    id: 'business',
    stepNumber: 1,
    label: 'Negócio',
    title: 'Sobre o seu negócio',
    subtitle: 'Conte-nos o contexto, a história e o que torna a sua empresa única.',
    eyebrow: '01 / CONTEXTO DA EMPRESA',
    order: 1,
    enabled: true,
    questions: [
      { id: 'companyName', fieldKey: 'companyName', label: 'Nome da empresa ou marca', placeholder: 'Ex: Atelier Criativo', fieldType: 'text', required: true, order: 1, enabled: true },
      { id: 'responsibleName', fieldKey: 'responsibleName', label: 'Seu nome completo', placeholder: 'Ex: Pedro Martins', fieldType: 'text', required: true, order: 2, enabled: true },
      { id: 'contactEmail', fieldKey: 'contactEmail', label: 'E-mail de contato', placeholder: 'seuemail@empresa.com', fieldType: 'text', required: true, order: 3, enabled: true },
      { id: 'contactWhatsapp', fieldKey: 'contactWhatsapp', label: 'WhatsApp ou telefone', placeholder: '(11) 99999-9999', fieldType: 'text', required: false, order: 4, enabled: true },
      { id: 'businessSegment', fieldKey: 'businessSegment', label: 'Segmento ou ramo de atuação', placeholder: 'Ex: Arquitetura, Advocacia, Gastronomia...', fieldType: 'text', required: false, order: 5, enabled: true },
      { id: 'serviceLocation', fieldKey: 'serviceLocation', label: 'Onde a empresa atende?', placeholder: 'Ex: São Paulo e região / Todo o Brasil / Internacional', fieldType: 'text', required: false, order: 6, enabled: true },
      { id: 'businessDescription', fieldKey: 'businessDescription', label: 'O que a empresa faz? (Em poucas palavras)', placeholder: 'Conte o que sua empresa faz e por que ela existe...', fieldType: 'textarea', required: false, order: 7, enabled: true },
      { id: 'productsAndServices', fieldKey: 'productsAndServices', label: 'Quais são os principais produtos ou serviços oferecidos?', placeholder: 'Liste ou descreva as soluções que você oferece...', fieldType: 'textarea', required: false, order: 8, enabled: true },
      { id: 'businessDifferentiator', fieldKey: 'businessDifferentiator', label: 'Qual é o principal diferencial da sua empresa?', placeholder: 'O que faz um cliente escolher você e não o concorrente?', fieldType: 'text', required: false, order: 9, enabled: true },
      { id: 'businessAge', fieldKey: 'businessAge', label: 'Há quanto tempo a empresa existe?', placeholder: 'Ex: Em fase de lançamento / 3 anos / Mais de 10 anos', fieldType: 'text', required: false, order: 10, enabled: true },
      { id: 'importantBusinessNotes', fieldKey: 'importantBusinessNotes', label: 'Existe alguma informação importante que devemos conhecer?', placeholder: 'Algum detalhe relevante sobre seu momento atual...', fieldType: 'textarea', required: false, order: 11, enabled: true }
    ]
  },
  {
    id: 'goals',
    stepNumber: 2,
    label: 'Objetivos',
    title: 'Objetivos do site',
    subtitle: 'O que o site precisa conquistar para o seu negócio ser bem-sucedido?',
    eyebrow: '02 / PROPÓSITO',
    order: 2,
    enabled: true,
    questions: [
      {
        id: 'mainGoals',
        fieldKey: 'mainGoals',
        label: 'Principais objetivos do site',
        subtitle: 'Selecione os principais objetivos que o novo site deve cumprir:',
        fieldType: 'checkbox_cards',
        required: true,
        order: 1,
        enabled: true,
        options: [
          { id: 'Apresentar minha empresa', label: 'Apresentar minha empresa', order: 1, enabled: true },
          { id: 'Conseguir novos clientes', label: 'Conseguir novos clientes', order: 2, enabled: true },
          { id: 'Receber contatos', label: 'Receber contatos', order: 3, enabled: true },
          { id: 'Solicitar orçamentos', label: 'Solicitar orçamentos', order: 4, enabled: true },
          { id: 'Vender produtos', label: 'Vender produtos', order: 5, enabled: true },
          { id: 'Receber agendamentos', label: 'Receber agendamentos', order: 6, enabled: true },
          { id: 'Mostrar meu portfólio', label: 'Mostrar meu portfólio', order: 7, enabled: true },
          { id: 'Divulgar meus serviços', label: 'Divulgar meus serviços', order: 8, enabled: true },
          { id: 'Fortalecer minha marca', label: 'Fortalecer minha marca', order: 9, enabled: true }
        ]
      },
      {
        id: 'singlePrimaryAction',
        fieldKey: 'singlePrimaryAction',
        label: 'Pergunta-chave para a conversão (CTA Principal)',
        subtitle: 'Se uma pessoa visitar o site e fizer apenas uma coisa, o que você gostaria que ela fizesse?',
        placeholder: 'Ex: Clicar no WhatsApp para pedir orçamento / Agendar uma reunião',
        fieldType: 'text',
        required: false,
        order: 2,
        enabled: true
      }
    ]
  },
  {
    id: 'audience',
    stepNumber: 3,
    label: 'Público',
    title: 'Público-alvo',
    subtitle: 'Quem você quer encantar e atrair através deste projeto digital?',
    eyebrow: '03 / AUDIÊNCIA',
    order: 3,
    enabled: true,
    questions: [
      { id: 'targetAudience', fieldKey: 'targetAudience', label: 'Descrição do público principal', placeholder: 'Ex: Empreendedores, famílias em busca de imóvel, médicos...', fieldType: 'text', required: false, order: 1, enabled: true },
      {
        id: 'audienceType',
        fieldKey: 'audienceType',
        label: 'Perfil de atendimento',
        fieldType: 'select',
        required: false,
        order: 2,
        enabled: true,
        options: [
          { id: 'b2c', label: 'B2C — Consumidor final (Pessoa Física)', order: 1, enabled: true },
          { id: 'b2b', label: 'B2B — Empresas (Pessoa Jurídica)', order: 2, enabled: true },
          { id: 'both', label: 'Ambos (Pessoas Físicas e Empresas)', order: 3, enabled: true }
        ]
      },
      { id: 'ageRange', fieldKey: 'ageRange', label: 'Faixa etária aproximada', placeholder: 'Ex: 25 a 45 anos / Todas as idades', fieldType: 'text', required: false, order: 3, enabled: true },
      { id: 'purchasingPower', fieldKey: 'purchasingPower', label: 'Nível de poder aquisitivo', placeholder: 'Ex: Médio / Alto padrão / Acessível', fieldType: 'text', required: false, order: 4, enabled: true },
      { id: 'audienceTraits', fieldKey: 'audienceTraits', label: 'Características e hábitos importantes desse público', placeholder: 'Ex: Acessam pelo celular, valorizam agilidade...', fieldType: 'textarea', required: false, order: 5, enabled: true },
      { id: 'excludedAudience', fieldKey: 'excludedAudience', label: 'Existe algum público que você NÃO quer atrair?', placeholder: 'Ex: Pessoas fora do perfil de ticket...', fieldType: 'text', required: false, order: 6, enabled: true }
    ]
  },
  {
    id: 'structure',
    stepNumber: 4,
    label: 'Estrutura',
    title: 'Estrutura e Conteúdo',
    subtitle: 'Quais páginas e seções dão forma à sua experiência?',
    eyebrow: '04 / ARQUITETURA',
    order: 4,
    enabled: true,
    questions: [
      {
        id: 'selectedPages',
        fieldKey: 'selectedPages',
        label: 'Páginas e seções desejadas',
        subtitle: 'Selecione as páginas que farão parte do site:',
        fieldType: 'pills_multi',
        required: true,
        order: 1,
        enabled: true,
        options: DEFAULT_PAGE_OPTIONS
      },
      {
        id: 'indispensablePageOrSection',
        fieldKey: 'indispensablePageOrSection',
        label: 'Existe alguma página ou seção indispensável?',
        placeholder: 'Ex: Uma seção destacando os depoimentos de clientes e certificações...',
        fieldType: 'textarea',
        required: false,
        order: 2,
        enabled: true
      }
    ]
  },
  {
    id: 'features',
    stepNumber: 5,
    label: 'Funcionalidades',
    title: 'O que o visitante poderá fazer?',
    subtitle: 'Recursos e interações que facilitam a vida de quem acessa.',
    eyebrow: '05 / RECURSOS & INTERAÇÕES',
    order: 5,
    enabled: true,
    questions: [
      {
        id: 'selectedFeatures',
        fieldKey: 'selectedFeatures',
        label: 'Funcionalidades & Módulos',
        subtitle: 'Selecione tudo o que você gostaria que o visitante pudesse fazer no site:',
        fieldType: 'checkbox_cards',
        required: false,
        order: 1,
        enabled: true
      }
    ]
  },
  {
    id: 'identity',
    stepNumber: 6,
    label: 'Visual',
    title: 'Identidade e Percepção',
    subtitle: 'Como a sua marca deve ser sentida e percebida pelos visitantes?',
    eyebrow: '06 / ATMOSFERA VISUAL',
    order: 6,
    enabled: true,
    questions: [
      {
        id: 'brandPerceptions',
        fieldKey: 'brandPerceptions',
        label: 'Percepções e Sensações da Marca',
        subtitle: 'Escolha os adjetivos visuais que mais se aproximam da sua essência:',
        fieldType: 'checkbox_cards',
        required: false,
        order: 1,
        enabled: true,
        options: [
          { id: 'Minimalista', label: 'Minimalista', description: 'Clareza, respiro e essencialismo', order: 1, enabled: true },
          { id: 'Sofisticada', label: 'Sofisticada', description: 'Acabamento primoroso e autoridade', order: 2, enabled: true },
          { id: 'Moderna', label: 'Moderna', description: 'Design atual, limpo e dinâmico', order: 3, enabled: true },
          { id: 'Criativa', label: 'Criativa', description: 'Ousadia, originalidade e inovação', order: 4, enabled: true },
          { id: 'Elegante', label: 'Elegante', description: 'Harmonia, refinamento e sutileza', order: 5, enabled: true },
          { id: 'Corporativa', label: 'Corporativa', description: 'Estrutura, segurança e solidez', order: 6, enabled: true },
          { id: 'Artesanal', label: 'Artesanal', description: 'Calor humano, cuidado e exclusividade', order: 7, enabled: true },
          { id: 'Natural', label: 'Natural', description: 'Orgânico, bem-estar e sustentabilidade', order: 8, enabled: true },
          { id: 'Tecnológica', label: 'Tecnológica', description: 'Precisão, futuro e alta performance', order: 9, enabled: true },
          { id: 'Luxuosa', label: 'Luxuosa', description: 'Alto padrão, exclusividade e prestígio', order: 10, enabled: true },
          { id: 'Jovem', label: 'Jovem', description: 'Energia, frescor e conexão', order: 11, enabled: true },
          { id: 'Descontraída', label: 'Descontraída', description: 'Acessível, leve e amigável', order: 12, enabled: true }
        ]
      },
      { id: 'brandColors', fieldKey: 'brandColors', label: 'Existe alguma cor que representa sua marca?', placeholder: 'Ex: Tons de oliva, dourado e off-white...', fieldType: 'text', required: false, order: 2, enabled: true },
      { id: 'colorsToAvoid', fieldKey: 'colorsToAvoid', label: 'Existe alguma cor que você NÃO quer utilizar?', placeholder: 'Ex: Vermelho, amarelo berrante...', fieldType: 'text', required: false, order: 3, enabled: true }
    ]
  },
  {
    id: 'references',
    stepNumber: 7,
    label: 'Referências',
    title: 'Inspirações e Benchmarks',
    subtitle: 'Sites e referências que você admira e o porquê de cada um.',
    eyebrow: '07 / BENCHMARK',
    order: 7,
    enabled: true,
    questions: [
      {
        id: 'references',
        fieldKey: 'references',
        label: 'Sites de Referência',
        subtitle: 'Adicione links de sites que você admira:',
        fieldType: 'references_manager',
        required: false,
        order: 1,
        enabled: true,
        options: [
          { id: 'Cores e paleta', label: 'Cores e paleta', order: 1, enabled: true },
          { id: 'Organização das informações', label: 'Organização das informações', order: 2, enabled: true },
          { id: 'Animações e efeitos suaves', label: 'Animações e efeitos suaves', order: 3, enabled: true },
          { id: 'Apresentação de produtos/serviços', label: 'Apresentação de produtos/serviços', order: 4, enabled: true },
          { id: 'Fotografias e imagens', label: 'Fotografias e imagens', order: 5, enabled: true },
          { id: 'Navegação fluida e simples', label: 'Navegação fluida e simples', order: 6, enabled: true },
          { id: 'Tipografia e textos', label: 'Tipografia e textos', order: 7, enabled: true },
          { id: 'Sensação geral de confiança', label: 'Sensação geral de confiança', order: 8, enabled: true }
        ]
      }
    ]
  },
  {
    id: 'materials',
    stepNumber: 8,
    label: 'Materiais',
    title: 'Conteúdo e Ativos',
    subtitle: 'O que você já tem pronto e o que precisará ser produzido.',
    eyebrow: '08 / MATERIAIS & ATIVOS',
    order: 8,
    enabled: true,
    questions: [
      {
        id: 'existingMaterials',
        fieldKey: 'existingMaterials',
        label: 'Materiais disponíveis',
        subtitle: 'Quais materiais a sua empresa já possui prontos para o projeto?',
        fieldType: 'checkbox_cards',
        required: false,
        order: 1,
        enabled: true,
        options: [
          { id: 'Logo em vetor/alta resolução', label: 'Logo em vetor/alta resolução', order: 1, enabled: true },
          { id: 'Manual de identidade visual', label: 'Manual de identidade visual', order: 2, enabled: true },
          { id: 'Fotografias profissionais', label: 'Fotografias profissionais', order: 3, enabled: true },
          { id: 'Vídeos institucionais ou de produto', label: 'Vídeos institucionais ou de produto', order: 4, enabled: true },
          { id: 'Textos e redação prontos', label: 'Textos e redação prontos', order: 5, enabled: true },
          { id: 'Catálogo de produtos ou serviços', label: 'Catálogo de produtos ou serviços', order: 6, enabled: true },
          { id: 'Depoimentos de clientes', label: 'Depoimentos de clientes', order: 7, enabled: true },
          { id: 'Cases de sucesso com métricas', label: 'Cases de sucesso com métricas', order: 8, enabled: true },
          { id: 'Ilustrações personalizadas', label: 'Ilustrações personalizadas', order: 9, enabled: true },
          { id: 'Banco de imagens próprio', label: 'Banco de imagens próprio', order: 10, enabled: true }
        ]
      }
    ]
  },
  {
    id: 'integrations',
    stepNumber: 9,
    label: 'Integrações',
    title: 'Ferramentas e Conexões',
    subtitle: 'Sistemas que o site precisa se conectar no dia a dia.',
    eyebrow: '09 / CONEXÕES',
    order: 9,
    enabled: true,
    questions: [
      {
        id: 'integrations',
        fieldKey: 'integrations',
        label: 'Sistemas e ferramentas integradas',
        subtitle: 'O site precisa se comunicar com alguma ferramenta que sua operação já utiliza?',
        fieldType: 'checkbox_cards',
        required: false,
        order: 1,
        enabled: true,
        options: [
          { id: 'WhatsApp (botão flutuante / chat)', label: 'WhatsApp (botão flutuante / chat)', order: 1, enabled: true },
          { id: 'Instagram Feed', label: 'Instagram Feed', order: 2, enabled: true },
          { id: 'Google Maps', label: 'Google Maps', order: 3, enabled: true },
          { id: 'Google Analytics / GA4', label: 'Google Analytics / GA4', order: 4, enabled: true },
          { id: 'Meta Pixel (Facebook/Instagram Ads)', label: 'Meta Pixel (Facebook/Instagram Ads)', order: 5, enabled: true },
          { id: 'CRM (HubSpot, RD Station, Pipedrive, etc.)', label: 'CRM (HubSpot, RD Station, Pipedrive)', order: 6, enabled: true },
          { id: 'E-mail Marketing (Mailchimp, ActiveCampaign)', label: 'E-mail Marketing (Mailchimp, ActiveCampaign)', order: 7, enabled: true },
          { id: 'Sistema de Agendamento (Calendly, etc.)', label: 'Sistema de Agendamento (Calendly, etc.)', order: 8, enabled: true },
          { id: 'Gateway de Pagamentos (Stripe, Mercado Pago)', label: 'Gateway de Pagamentos (Stripe, Mercado Pago)', order: 9, enabled: true },
          { id: 'ERP / Sistema interno', label: 'ERP / Sistema interno', order: 10, enabled: true }
        ]
      },
      {
        id: 'integrationDetails',
        fieldKey: 'integrationDetails',
        label: 'Deseja especificar nomes de softwares ou detalhes de integrações?',
        placeholder: 'Ex: Usamos o RD Station para marketing e o Pipedrive como CRM...',
        fieldType: 'textarea',
        required: false,
        order: 2,
        enabled: true
      }
    ]
  },
  {
    id: 'competitors',
    stepNumber: 10,
    label: 'Concorrentes',
    title: 'Cenário e Concorrência',
    subtitle: 'O que outros players fazem bem e o que devemos fazer melhor.',
    eyebrow: '10 / BENCHMARKING',
    order: 10,
    enabled: true,
    questions: [
      {
        id: 'competitors',
        fieldKey: 'competitors',
        label: 'Concorrentes e Referências de Mercado',
        fieldType: 'competitors_manager',
        required: false,
        order: 1,
        enabled: true
      }
    ]
  },
  {
    id: 'restrictions',
    stepNumber: 11,
    label: 'O que NÃO quer',
    title: 'Restrições e Linhas Vermelhas',
    subtitle: 'O que definitivamente devemos evitar no seu projeto.',
    eyebrow: '11 / LINHAS VERMELHAS',
    order: 11,
    enabled: true,
    questions: [
      {
        id: 'unwantedElements',
        fieldKey: 'unwantedElements',
        label: 'O que evitar a todo custo',
        subtitle: 'Selecione o que definitivamente NÃO gostaria de ver:',
        fieldType: 'checkbox_cards',
        required: false,
        order: 1,
        enabled: true,
        options: [
          { id: 'Muitas animações ou elementos se movendo', label: 'Muitas animações ou elementos se movendo', order: 1, enabled: true },
          { id: 'Cores muito fortes ou contrastes pesados', label: 'Cores muito fortes ou contrastes pesados', order: 2, enabled: true },
          { id: 'Visual excessivamente corporativo ou frio', label: 'Visual excessivamente corporativo ou frio', order: 3, enabled: true },
          { id: 'Excesso de texto ou blocos densos', label: 'Excesso de texto ou blocos densos', order: 4, enabled: true },
          { id: 'Pop-ups invasivos e banners insistentes', label: 'Pop-ups invasivos e banners insistentes', order: 5, enabled: true },
          { id: 'Vídeos que iniciam automaticamente com som', label: 'Vídeos que iniciam automaticamente com som', order: 6, enabled: true },
          { id: 'Aparência genérica de template pronto', label: 'Aparência genérica de template pronto', order: 7, enabled: true },
          { id: 'Navegação confusa ou escondida', label: 'Navegação confusa ou escondida', order: 8, enabled: true },
          { id: 'Linguagem muito formal ou distante', label: 'Linguagem muito formal ou distante', order: 9, enabled: true }
        ]
      },
      {
        id: 'dislikedStylesOrSites',
        fieldKey: 'dislikedStylesOrSites',
        label: 'Existe algum estilo visual ou exemplo de site que você rejeita?',
        placeholder: 'Ex: Sites muito escuros, botões piscantes...',
        fieldType: 'textarea',
        required: false,
        order: 2,
        enabled: true
      }
    ]
  },
  {
    id: 'timeline',
    stepNumber: 12,
    label: 'Prazo & Investimento',
    title: 'Tempo e Planejamento',
    subtitle: 'Expectativa de lançamento e faixa de investimento planejada.',
    eyebrow: '12 / PLANEJAMENTO',
    order: 12,
    enabled: true,
    questions: [
      { id: 'targetLaunchDate', fieldKey: 'targetLaunchDate', label: 'Existe alguma data importante para o lançamento?', placeholder: 'Ex: Até o final do mês que vem / Sem data limite', fieldType: 'text', required: false, order: 1, enabled: true },
      {
        id: 'investmentRange',
        fieldKey: 'investmentRange',
        label: 'Faixa de investimento estimada para o projeto',
        fieldType: 'select',
        required: false,
        order: 2,
        enabled: true,
        options: [
          { id: 'Até R$ 3.000', label: 'Até R$ 3.000', order: 1, enabled: true },
          { id: 'De R$ 3.000 a R$ 6.000', label: 'De R$ 3.000 a R$ 6.000', order: 2, enabled: true },
          { id: 'De R$ 6.000 a R$ 12.000', label: 'De R$ 6.000 a R$ 12.000', order: 3, enabled: true },
          { id: 'De R$ 12.000 a R$ 25.000', label: 'De R$ 12.000 a R$ 25.000', order: 4, enabled: true },
          { id: 'Acima de R$ 25.000', label: 'Acima de R$ 25.000', order: 5, enabled: true },
          { id: 'Ainda estou definindo o orçamento', label: 'Ainda estou definindo o orçamento', order: 6, enabled: true }
        ]
      }
    ]
  },
  {
    id: 'notes',
    stepNumber: 13,
    label: 'Observações',
    title: 'Visão Livre e Detalhes',
    subtitle: 'Alguma coisa que você imaginou e que ainda não perguntamos?',
    eyebrow: '13 / VISÃO ABERTA',
    order: 13,
    enabled: true,
    questions: [
      {
        id: 'finalObservations',
        fieldKey: 'finalObservations',
        label: 'Observações Finais',
        placeholder: 'Fique à vontade para escrever sobre qualquer detalhe, ideia ou prioridade...',
        fieldType: 'textarea',
        required: false,
        order: 1,
        enabled: true
      }
    ]
  },
  {
    id: 'review',
    stepNumber: 14,
    label: 'Revisão',
    title: 'Revise seu briefing',
    subtitle: 'Confira as informações organizadas antes de finalizar o envio.',
    eyebrow: '14 / REVISÃO',
    order: 14,
    enabled: true,
    questions: []
  }
];

// ============================================================
// 6. Configurações de Textos de Interface (UI Settings)
// ============================================================
export const DEFAULT_UI_SETTINGS: UISettings = {
  briefingTitle: 'Briefing Estratégico Atelier',
  briefingSubtitle: 'Compartilhe suas ideias e preferências para construirmos a experiência perfeita.',
  nextButtonLabel: 'Continuar',
  prevButtonLabel: 'Voltar',
  finishButtonLabel: 'Concluir e Enviar Briefing',
  autoSaveText: 'Auto-salvamento ativo',
  currencySymbol: 'R$',
  disclaimerText: '* Estimativa preliminar. O valor final será definido após análise do briefing completo.',
  successTitle: 'Briefing Estruturado & Requisitos',
  successSubtitle: 'Documento pronto para a equipe de design e desenvolvimento iniciar o projeto com clareza total.'
};

// ============================================================
// 7. Configuração Global Padrão
// ============================================================
export const DEFAULT_FORM_CONFIG: FormConfig = {
  palettes: DEFAULT_PALETTES,
  categories: DEFAULT_CATEGORIES,
  features: DEFAULT_FEATURES,
  steps: DEFAULT_STEPS,
  pageOptions: DEFAULT_PAGE_OPTIONS,
  basePrices: {
    base: 1500,
    extraPagePrice: 250,
    copywritingPrice: 950,
    integrationPriceEach: 350,
    identityFullPrice: 1400,
    identityExpandPrice: 700
  },
  uiSettings: DEFAULT_UI_SETTINGS,
  featureOptions: DEFAULT_FEATURE_OPTIONS,
  goalOptions: []
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

/**
 * Migra e mescla configurações salvas com valores padrão de forma segura.
 * Trata compatibilidade quando o banco ou localStorage possui versões legadas.
 */
function mergeWithDefault(saved: Partial<FormConfig>): FormConfig {
  // Migração de features antigas (featureOptions) caso features ainda não exista
  let migratedFeatures = saved.features;
  if (!migratedFeatures?.length && saved.featureOptions?.length) {
    migratedFeatures = saved.featureOptions.map((fo, idx) => ({
      id: fo.id,
      name: fo.label,
      label: fo.label,
      description: '',
      categoryId: (fo.category || 'comunicacao').toLowerCase().replace(/\s+/g, '-'),
      price: fo.price ?? 0,
      priceLabel: fo.priceLabel || (fo.price ? `+ R$ ${fo.price}` : 'Incluso'),
      order: fo.order ?? (idx + 1),
      enabled: fo.enabled ?? true
    }));
  }

  // Migração de pageOptions antigas
  let migratedPages: QuestionOption[] = DEFAULT_FORM_CONFIG.pageOptions;
  if (saved.pageOptions?.length) {
    migratedPages = saved.pageOptions.map((po: any, idx: number) => ({
      id: po.id,
      label: po.label,
      description: po.description || '',
      price: po.price ?? 0,
      priceLabel: po.priceLabel || 'Incluso',
      icon: po.icon || '📄',
      order: po.order ?? (idx + 1),
      enabled: po.enabled ?? true
    }));
  }

  return {
    palettes: saved.palettes?.length ? saved.palettes : DEFAULT_FORM_CONFIG.palettes,
    categories: saved.categories?.length ? saved.categories : DEFAULT_FORM_CONFIG.categories,
    features: migratedFeatures?.length ? migratedFeatures : DEFAULT_FORM_CONFIG.features,
    steps: saved.steps?.length ? saved.steps : DEFAULT_FORM_CONFIG.steps,
    pageOptions: migratedPages,
    basePrices: {
      ...DEFAULT_FORM_CONFIG.basePrices,
      ...(saved.basePrices || {})
    },
    uiSettings: {
      ...DEFAULT_FORM_CONFIG.uiSettings,
      ...(saved.uiSettings || {})
    },
    featureOptions: saved.featureOptions?.length ? saved.featureOptions : DEFAULT_FORM_CONFIG.featureOptions,
    goalOptions: saved.goalOptions?.length ? saved.goalOptions : DEFAULT_FORM_CONFIG.goalOptions,
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
