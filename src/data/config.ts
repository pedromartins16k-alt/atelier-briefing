import type { Choice, Step } from '../types';

export const steps: Step[] = [
  { id: 'business', label: 'Negócio', title: 'Vamos conhecer sua visão.', description: 'Os detalhes certos transformam uma ideia em uma presença digital memorável.' },
  { id: 'objective', label: 'Objetivo', title: 'O que seu site precisa conquistar?', description: 'Defina as prioridades que vão orientar cada decisão do projeto.' },
  { id: 'structure', label: 'Estrutura', title: 'Desenhe a experiência.', description: 'Selecione o formato e a dimensão ideais para sua operação.' },
  { id: 'design', label: 'Design', title: 'Defina a sua assinatura visual.', description: 'Escolha a linguagem que vai fazer sua marca ser lembrada.' },
  { id: 'features', label: 'Recursos', title: 'Dê vida às interações.', description: 'Inclua as ferramentas que tornam o site útil para o seu negócio.' },
  { id: 'strategy', label: 'Estratégia', title: 'Amplifique os resultados.', description: 'SEO, performance e integrações para um lançamento consistente.' },
  { id: 'investment', label: 'Investimento', title: 'Escolha seu nível de parceria.', description: 'Uma composição transparente, pensada para o momento da sua marca.' },
  { id: 'review', label: 'Revisão', title: 'Seu projeto está pronto para revisão.', description: 'Confira a visão completa antes de solicitar sua proposta.' }
];
export const siteTypes: Choice[] = [
  { id: 'landing', title: 'Landing Page', desc: 'Uma página focada em conversão', price: 4200, tag: 'Essencial' },
  { id: 'institutional', title: 'Site institucional', desc: 'Sua marca com profundidade e clareza', price: 7800, tag: 'Recomendado' },
  { id: 'professional', title: 'Site profissional', desc: 'Autoridade para especialistas', price: 6400 },
  { id: 'portfolio', title: 'Portfólio', desc: 'Cases que contam sua trajetória', price: 5900 },
  { id: 'ecommerce', title: 'E-commerce', desc: 'Uma operação pronta para vender', price: 14500, tag: 'Avançado' },
  { id: 'custom', title: 'Projeto personalizado', desc: 'Uma experiência fora da caixa', price: 12000 }
];
export const goals: Choice[] = ['Gerar leads','Apresentar a empresa','Vender produtos','Vender serviços','Receber agendamentos','Criar autoridade','Portfólio','Blog e conteúdo'].map(id => ({ id, title: id }));
export const segments = ['Tecnologia','Saúde','Educação','Restaurante','E-commerce','Serviços','Imobiliário','Advocacia','Finanças','Marketing','Indústria','Profissional autônomo'];
export const pageOptions: Choice[] = [
  {id:'one',title:'1 página',desc:'Mensagem direta e objetiva'}, {id:'small',title:'2–5 páginas',desc:'Uma presença essencial'}, {id:'medium',title:'6–10 páginas',desc:'Estrutura completa'}, {id:'large',title:'11–20 páginas',desc:'Ecossistema de conteúdo'}, {id:'unknown',title:'Ainda não sei',desc:'Nós recomendamos uma estrutura'}
];
export const designs: Choice[] = ['Minimalista','Premium','Corporativo','Moderno','Futurista','Editorial','Criativo','Tecnológico'].map((id,i)=>({id,title:id,desc:['Clareza e respiro','Detalhes com presença','Confiança e estrutura','Leve e atual','Ousado e inovador','Narrativo e refinado','Expressivo e original','Preciso e digital'][i]}));
export const templates: Choice[] = [
 {id:'editorial',title:'Editorial',desc:'Narrativa, respiro e autoridade',tag:'Recomendado'}, {id:'minimal',title:'Minimal',desc:'Clareza absoluta e foco'}, {id:'corporate',title:'Corporate',desc:'Estrutura e confiança'}, {id:'creative',title:'Creative',desc:'Ritmo visual expressivo'}, {id:'luxury',title:'Luxury',desc:'Presença refinada'}, {id:'tech',title:'Tech',desc:'Precisão digital'}
];
export const projectPages = ['Home','Sobre','Serviços','Produtos','Portfólio','Cases','Blog','Contato','FAQ','Depoimentos','Equipe','Área do cliente'];
export const features: Choice[] = [
  {id:'form',title:'Formulário inteligente',desc:'Captação de contatos',price:0},{id:'whatsapp',title:'WhatsApp',desc:'Conversas instantâneas',price:350},{id:'blog',title:'Blog',desc:'Conteúdo estratégico',price:1400},{id:'booking',title:'Agendamento',desc:'Agenda integrada',price:1800},{id:'payment',title:'Pagamento online',desc:'Checkout seguro',price:2200},{id:'login',title:'Área do cliente',desc:'Acesso personalizado',price:3200},{id:'search',title:'Busca e filtros',desc:'Navegação avançada',price:1100},{id:'multilang',title:'Multi-idioma',desc:'Alcance global',price:1800},{id:'gallery',title:'Galeria & portfólio',desc:'Conteúdo visual',price:700},{id:'crm',title:'Integração CRM',desc:'Leads organizados',price:1500}
];
export const integrations: Choice[] = [{id:'analytics',title:'Google Analytics',price:350},{id:'pixel',title:'Meta Pixel',price:300},{id:'hubspot',title:'HubSpot',price:1200},{id:'mailchimp',title:'Mailchimp',price:700},{id:'stripe',title:'Stripe',price:1000},{id:'social',title:'Redes sociais',price:250}];
export const levels = { seo: [{id:'basic',title:'Básico',desc:'Fundação técnica e indexação',price:0},{id:'pro',title:'Profissional',desc:'Estratégia, schema e palavras-chave',price:1800},{id:'advanced',title:'Avançado',desc:'Arquitetura e planejamento editorial',price:3900}], performance: [{id:'standard',title:'Padrão',desc:'Experiência consistente',price:0},{id:'high',title:'Alta performance',desc:'Otimização avançada',price:1200},{id:'premium',title:'Performance premium',desc:'Core Web Vitals em foco',price:2500}] };
export const plans: Choice[] = [{id:'start',title:'Start',desc:'Para começar com clareza',price:0},{id:'pro',title:'Pro',desc:'A escolha equilibrada',price:2600,tag:'Mais escolhido'},{id:'premium',title:'Premium',desc:'Para experiências ambiciosas',price:6200}];
