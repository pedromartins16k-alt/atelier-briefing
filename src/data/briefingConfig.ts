import type { BriefingData, StepDefinition } from '../types';

export const INITIAL_BRIEFING: BriefingData = {
  companyName: '',
  responsibleName: '',
  contactEmail: '',
  contactWhatsapp: '',
  businessSegment: '',
  businessDescription: '',
  productsAndServices: '',
  businessDifferentiator: '',
  businessAge: '',
  serviceLocation: '',
  importantBusinessNotes: '',

  mainGoals: [],
  customGoal: '',
  singlePrimaryAction: '',

  targetAudience: '',
  audienceType: '',
  ageRange: '',
  audienceLocation: '',
  purchasingPower: '',
  audienceTraits: '',
  excludedAudience: '',

  selectedPages: ['Página inicial', 'Sobre a empresa', 'Serviços', 'Contato'],
  customPages: [],
  indispensablePageOrSection: '',

  selectedFeatures: ['Entrar em contato', 'Chamar no WhatsApp'],
  featureConditionals: {
    ecommerceProductsCount: '',
    ecommerceHasPaymentGateway: '',
    ecommercePaymentGatewayDetails: '',
    ecommerceNeedsCart: '',
    ecommerceNeedsAccount: '',
    ecommerceCurrentlySellsOnline: '',
    ecommerceCurrentPlatform: '',
    bookingServiceType: '',
    bookingProfessionalsCount: '',
    bookingShowAvailableSlots: '',
    bookingConfirmationMethod: [],
    bookingCurrentTool: '',
    contactPreferredChannel: ['WhatsApp'],
    loginPurpose: ''
  },
  customFeature: '',

  brandPerceptions: ['Elegante', 'Moderna'],
  brandColors: '',
  colorsToAvoid: '',
  identityStatus: 'complete',

  references: [],

  existingMaterials: ['Logo', 'Identidade visual'],
  missingContentOwner: 'client',

  integrations: ['WhatsApp', 'Instagram', 'Google Analytics'],
  integrationDetails: '',

  competitors: [],

  unwantedElements: [],
  dislikedStylesOrSites: '',

  targetLaunchDate: '',
  investmentRange: '',

  finalObservations: ''
};

export const STEPS: StepDefinition[] = [
  { id: 'business', stepNumber: 1, label: 'Negócio', title: 'Sobre o seu negócio', subtitle: 'Conte-nos o contexto, a história e o que torna a sua empresa única.' },
  { id: 'goals', stepNumber: 2, label: 'Objetivos', title: 'Objetivos do site', subtitle: 'O que o site precisa conquistar para o seu negócio ser bem-sucedido?' },
  { id: 'audience', stepNumber: 3, label: 'Público', title: 'Público-alvo', subtitle: 'Quem você quer encantar e atrair através deste projeto digital?' },
  { id: 'structure', stepNumber: 4, label: 'Estrutura', title: 'Estrutura e Conteúdo', subtitle: 'Quais páginas e seções dão forma à sua experiência?' },
  { id: 'features', stepNumber: 5, label: 'Funcionalidades', title: 'O que o visitante poderá fazer?', subtitle: 'Recursos e interações que facilitam a vida de quem acessa.' },
  { id: 'identity', stepNumber: 6, label: 'Visual', title: 'Identidade e Percepção', subtitle: 'Como a sua marca deve ser sentida e percebida pelos visitantes?' },
  { id: 'references', stepNumber: 7, label: 'Referências', title: 'Inspirações e Benchmarks', subtitle: 'Sites e referências que você admira e o porquê de cada um.' },
  { id: 'materials', stepNumber: 8, label: 'Materiais', title: 'Conteúdo e Ativos', subtitle: 'O que você já tem pronto e o que precisará ser produzido.' },
  { id: 'integrations', stepNumber: 9, label: 'Integrações', title: 'Ferramentas e Conexões', subtitle: 'Sistemas que o site precisa se conectar no dia a dia.' },
  { id: 'competitors', stepNumber: 10, label: 'Concorrentes', title: 'Cenário e Concorrência', subtitle: 'O que outros players fazem bem e o que devemos fazer melhor.' },
  { id: 'restrictions', stepNumber: 11, label: 'O que NÃO quer', title: 'Restrições e Linhas Vermelhas', subtitle: 'O que definitivamente devemos evitar no seu projeto.' },
  { id: 'timeline', stepNumber: 12, label: 'Prazo & Investimento', title: 'Tempo e Planejamento', subtitle: 'Expectativa de lançamento e faixa de investimento planejada.' },
  { id: 'notes', stepNumber: 13, label: 'Observações', title: 'Visão Livre e Detalhes', subtitle: 'Alguma coisa que você imaginou e que ainda não perguntamos?' },
  { id: 'review', stepNumber: 14, label: 'Revisão', title: 'Revise seu briefing', subtitle: 'Confira as informações organizadas antes de finalizar o envio.' }
];

export const GOALS_OPTIONS = [
  'Apresentar minha empresa',
  'Conseguir novos clientes',
  'Receber contatos',
  'Solicitar orçamentos',
  'Vender produtos',
  'Receber agendamentos',
  'Mostrar meu portfólio',
  'Divulgar meus serviços',
  'Fortalecer minha marca'
];

export const STRUCTURE_PAGES_OPTIONS = [
  'Página inicial',
  'Sobre a empresa',
  'Serviços',
  'Produtos',
  'Portfólio',
  'Projetos',
  'Cases',
  'Depoimentos',
  'Blog',
  'FAQ',
  'Contato',
  'Localização',
  'Equipe'
];

export const FEATURES_OPTIONS = [
  'Entrar em contato',
  'Chamar no WhatsApp',
  'Solicitar orçamento',
  'Agendar horário',
  'Comprar produtos',
  'Fazer login',
  'Criar uma conta',
  'Enviar arquivos',
  'Baixar materiais',
  'Preencher formulários',
  'Ver localização',
  'Consultar informações'
];

export const BRAND_PERCEPTIONS = [
  { id: 'Minimalista', desc: 'Clareza, respiro e essencialismo' },
  { id: 'Sofisticada', desc: 'Acabamento primoroso e autoridade' },
  { id: 'Moderna', desc: 'Design atual, limpo e dinâmico' },
  { id: 'Criativa', desc: 'Ousadia, originalidade e inovação' },
  { id: 'Elegante', desc: 'Harmonia, refinamento e sutileza' },
  { id: 'Corporativa', desc: 'Estrutura, segurança e solidez' },
  { id: 'Artesanal', desc: 'Calor humano, cuidado e exclusividade' },
  { id: 'Natural', desc: 'Orgânico, bem-estar e sustentabilidade' },
  { id: 'Tecnológica', desc: 'Precisão, futuro e alta performance' },
  { id: 'Luxuosa', desc: 'Alto padrão, exclusividade e prestígio' },
  { id: 'Jovem', desc: 'Energia, frescor e conexão' },
  { id: 'Descontraída', desc: 'Acessível, leve e amigável' }
];

export const REFERENCE_REASONS = [
  'Cores e paleta',
  'Organização das informações',
  'Animações e efeitos suaves',
  'Apresentação de produtos/serviços',
  'Fotografias e imagens',
  'Navegação fluida e simples',
  'Tipografia e textos',
  'Sensação geral de confiança'
];

export const MATERIALS_OPTIONS = [
  'Logo em vetor/alta resolução',
  'Manual de identidade visual',
  'Fotografias profissionais',
  'Vídeos institucionais ou de produto',
  'Textos e redação prontos',
  'Catálogo de produtos ou serviços',
  'Depoimentos de clientes',
  'Cases de sucesso com métricas',
  'Ilustrações personalizadas',
  'Banco de imagens próprio'
];

export const INTEGRATIONS_OPTIONS = [
  'WhatsApp (botão flutuante / chat)',
  'Instagram Feed',
  'Google Maps',
  'Google Analytics / GA4',
  'Meta Pixel (Facebook/Instagram Ads)',
  'CRM (HubSpot, RD Station, Pipedrive, etc.)',
  'E-mail Marketing (Mailchimp, ActiveCampaign, etc.)',
  'Sistema de Agendamento (Calendly, etc.)',
  'Gateway de Pagamentos (Stripe, Mercado Pago, etc.)',
  'ERP / Sistema interno'
];

export const UNWANTED_OPTIONS = [
  'Muitas animações ou elementos se movendo',
  'Cores muito fortes ou contrastes pesados',
  'Visual excessivamente corporativo ou frio',
  'Excesso de texto ou blocos densos',
  'Pop-ups invasivos e banners insistentes',
  'Vídeos que iniciam automaticamente com som',
  'Aparência genérica de template pronto',
  'Navegação confusa ou escondida',
  'Linguagem muito formal ou distante'
];

export const INVESTMENT_RANGES = [
  'Até R$ 3.000',
  'De R$ 3.000 a R$ 6.000',
  'De R$ 6.000 a R$ 12.000',
  'De R$ 12.000 a R$ 25.000',
  'Acima de R$ 25.000',
  'Ainda estou definindo o orçamento'
];
