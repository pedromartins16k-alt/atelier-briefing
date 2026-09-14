export type Choice = { id: string; title: string; desc?: string; price?: number; tag?: string };
export type Brief = {
  client: { name: string; company: string; email: string; whatsapp: string; role: string; location: string };
  business: { description: string; segment: string; audience: string; difference: string };
  goals: string[]; websiteType: string; pages: string; pageList: string[];
  design: string; theme: string; features: string[]; seo: string; performance: string;
  integrations: string[]; content: string; hosting: string; deadline: string; plan: string;
  template: string; references: string; identity: string; typography: string;
};
export type Step = { id: string; label: string; title: string; description: string };
