import type { Brief } from '../types';
import { calculatePrice } from '../config/pricing';
import { supabase } from './supabase';

export type SubmissionResult = { briefingId: string; quoteId: string };

export async function submitBriefing(brief: Brief, submissionId: string): Promise<SubmissionResult> {
  if (!supabase) throw new Error('Supabase ainda não foi configurado.');
  const quote = calculatePrice(brief);
  const breakdown = Object.fromEntries(quote.items);
  const { data, error } = await supabase.rpc('submit_public_briefing', {
    p_submission_id: submissionId,
    p_client: {
      name: brief.client.name.trim(), company: brief.client.company.trim(), email: brief.client.email.trim(),
      whatsapp: brief.client.whatsapp.trim(), role: brief.client.role.trim(), city: brief.client.location.trim()
    },
    p_briefing: {
      business_segment: brief.business.segment, business_description: brief.business.description.trim(),
      target_audience: brief.business.audience.trim(), business_differential: brief.business.difference.trim(),
      objectives: brief.goals, website_type: brief.websiteType, pages: brief.pages,
      design_preferences: brief.design, theme: brief.theme, features: brief.features, seo_level: brief.seo,
      performance_level: brief.performance, integrations: brief.integrations, content_provider: brief.content,
      hosting_status: brief.hosting, deadline: brief.deadline, package: brief.plan
    },
    p_quote: { total: quote.total, breakdown, items: quote.items.map(([name, totalPrice]) => ({ name, category: name, quantity: 1, unit_price: totalPrice, total_price: totalPrice })) }
  });
  if (error) throw error;
  return data as SubmissionResult;
}
