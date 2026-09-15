export type ReferenceItem = {
  id: string;
  url: string;
  reasons: string[];
  notes: string;
};

export type CompetitorItem = {
  id: string;
  nameOrUrl: string;
  likes: string;
  dislikes: string;
};

export type FeatureConditionals = {
  // E-commerce
  ecommerceProductsCount?: string;
  ecommerceHasPaymentGateway?: string;
  ecommercePaymentGatewayDetails?: string;
  ecommerceNeedsCart?: string;
  ecommerceNeedsAccount?: string;
  ecommerceCurrentlySellsOnline?: string;
  ecommerceCurrentPlatform?: string;

  // Agendamento
  bookingServiceType?: string;
  bookingProfessionalsCount?: string;
  bookingShowAvailableSlots?: string;
  bookingConfirmationMethod?: string[];
  bookingCurrentTool?: string;

  // Orçamento / Contato
  contactPreferredChannel?: string[];

  // Área do cliente / Login
  loginPurpose?: string;
};

export type BriefingData = {
  // 1. Sobre o negócio
  companyName: string;
  responsibleName: string;
  contactEmail: string;
  contactWhatsapp: string;
  businessSegment: string;
  businessDescription: string;
  productsAndServices: string;
  businessDifferentiator: string;
  businessAge: string;
  serviceLocation: string;
  importantBusinessNotes: string;

  // 2. Objetivo do site
  mainGoals: string[];
  customGoal?: string;
  singlePrimaryAction: string; // "Se o visitante fizer apenas uma coisa..."

  // 3. Público
  targetAudience: string;
  audienceType: 'b2b' | 'b2c' | 'both' | '';
  ageRange: string;
  audienceLocation: string;
  purchasingPower: string;
  audienceTraits: string;
  excludedAudience: string;

  // 4. Estrutura do site
  selectedPages: string[];
  customPages: string[];
  indispensablePageOrSection: string;

  // 5. Funcionalidades
  selectedFeatures: string[];
  featureConditionals: FeatureConditionals;
  customFeature?: string;

  // 6. Identidade Visual
  brandPerceptions: string[];
  brandColors: string;
  colorsToAvoid: string;
  identityStatus: 'complete' | 'logo_only' | 'some_materials' | 'none' | '';

  // 7. Referências
  references: ReferenceItem[];

  // 8. Conteúdo e Materiais
  existingMaterials: string[];
  missingContentOwner: 'client' | 'agency' | 'contractor' | 'undecided' | '';

  // 9. Integrações
  integrations: string[];
  integrationDetails: string;

  // 10. Concorrentes
  competitors: CompetitorItem[];

  // 11. O que NÃO quer
  unwantedElements: string[];
  dislikedStylesOrSites: string;

  // 12. Prazo e Investimento
  targetLaunchDate: string;
  investmentRange: string;

  // 13. Observações Finais
  finalObservations: string;
};

export type StepDefinition = {
  id: string;
  stepNumber: number;
  label: string;
  title: string;
  subtitle: string;
  tag?: string;
};

export type AttentionPoint = {
  type: 'risk' | 'dependency' | 'clarification' | 'opportunity';
  title: string;
  description: string;
};
// Legacy types compatibility
export type Choice = { id: string; title: string; desc?: string; price?: number; tag?: string };
export type Step = { id: string; label: string; title: string; description: string };
export type Brief = {
  client: { name: string; company: string; email: string; whatsapp: string; role: string; location: string };
  business: { description: string; segment: string; audience: string; difference: string };
  goals: string[]; websiteType: string; pages: string; pageList: string[];
  design: string; theme: string; features: string[]; seo: string; performance: string;
  integrations: string[]; content: string; hosting: string; deadline: string; plan: string;
  template: string; references: string; identity: string; typography: string;
};
