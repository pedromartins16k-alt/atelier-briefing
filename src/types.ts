// ============================================================
// Tipos da Plataforma (Auth, Projetos, Briefings)
// ============================================================

export type UserRole = 'admin' | 'client';

export type UserProfile = {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  company?: string;
  segment?: string;
  location?: string;
  website?: string;
  instagram?: string;
  created_at: string;
  updated_at: string;
};

export type ProjectStatus =
  | 'briefing_received'
  | 'in_analysis'
  | 'waiting_client'
  | 'approved'
  | 'in_development'
  | 'in_review'
  | 'completed';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  briefing_received: 'Briefing recebido',
  in_analysis: 'Em análise',
  waiting_client: 'Aguardando cliente',
  approved: 'Aprovado',
  in_development: 'Em desenvolvimento',
  in_review: 'Em revisão',
  completed: 'Concluído'
};

export type Project = {
  id: string;
  client_id: string;
  name: string;
  type?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type ProjectBriefing = {
  id: string;
  project_id: string;
  responses: BriefingData;
  executive_summary?: string;
  diagnosis?: AttentionPoint[];
  sitemap?: string[];
  primary_cta?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
};

export type InternalNote = {
  id: string;
  project_id: string;
  admin_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ProjectHistoryEvent = {
  id: string;
  project_id: string;
  event_type: string;
  description: string;
  created_at: string;
};

export type Screen =
  | 'home'
  | 'login'
  | 'register'
  | 'forgot'
  | 'client-home'
  | 'flow'
  | 'success'
  | 'admin-dashboard'
  | 'admin-clients'
  | 'admin-client'
  | 'admin-projects'
  | 'admin-project';

// ============================================================
// Tipos do Briefing
// ============================================================

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
