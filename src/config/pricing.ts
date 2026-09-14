import { features, integrations, levels, pageOptions, plans, siteTypes } from '../data/config';
import type { Brief } from '../types';
const lookup = (list: {id:string;price?:number}[], id: string) => list.find(x => x.id === id)?.price || 0;
const pagePrices: Record<string, number> = { one: 0, small: 700, medium: 2100, large: 4800, unknown: 1400 };
const urgency: Record<string, number> = { asap: 2800, '2-4': 1200, '1-2': 0, '2-3': 0, flexible: 0 };
export const money = (value: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value);
export function calculatePrice(b: Brief) {
 const items = [
  ['Projeto base', lookup(siteTypes,b.websiteType)], ['Estrutura e páginas',pagePrices[b.pages] || 0], ['Direção de design', b.design === 'Premium' || b.design === 'Futurista' ? 900 : 0],
  ['Funcionalidades', b.features.reduce((t,id)=>t+lookup(features,id),0)], ['SEO',lookup(levels.seo,b.seo)], ['Performance',lookup(levels.performance,b.performance)], ['Integrações',b.integrations.reduce((t,id)=>t+lookup(integrations,id),0)], ['Pacote de parceria',lookup(plans,b.plan)], ['Prioridade de lançamento',urgency[b.deadline] || 0]
 ] as [string,number][];
 return { items: items.filter(([,v])=>v>0), total: items.reduce((t,[,v])=>t+v,0) };
}
