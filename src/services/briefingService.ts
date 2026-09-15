import type { BriefingData, Project, ProjectBriefing } from '../types';
import { getSupabase } from './supabase';
import { generateDiagnosis, generateExecutiveSummary, generateSitemap } from '../utils/briefingIntelligence';

const DRAFT_KEY = 'atelier_briefing_draft';

/** Salva rascunho somente no localStorage (chamado a cada alteração) */
export function saveDraftLocally(data: BriefingData) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

/** Lê rascunho local */
export function loadDraftLocally(): BriefingData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Limpa rascunho local após envio */
export function clearDraftLocally() {
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem('atelier_briefing_data');
}

/** Cria projeto para o cliente (se não existir) e retorna o ID */
export async function ensureProject(clientId: string, projectName?: string): Promise<string> {
  const sb = getSupabase();
  // Verificar se já existe projeto em andamento
  const { data: existing } = await sb
    .from('projects')
    .select('id')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing.id;

  const { data, error } = await sb
    .from('projects')
    .insert({
      client_id: clientId,
      name: projectName || 'Novo Projeto',
      status: 'briefing_received'
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/** Salva ou atualiza rascunho de briefing no Supabase */
export async function saveBriefingDraft(projectId: string, responses: BriefingData): Promise<void> {
  const sb = getSupabase();
  const { data: existing } = await sb
    .from('project_briefings')
    .select('id')
    .eq('project_id', projectId)
    .single();

  if (existing) {
    const { error } = await sb
      .from('project_briefings')
      .update({ responses })
      .eq('project_id', projectId);
    if (error) throw error;
  } else {
    const { error } = await sb
      .from('project_briefings')
      .insert({ project_id: projectId, responses });
    if (error) throw error;
  }
}

/** Envia o briefing definitivamente */
export async function submitBriefingToSupabase(projectId: string, data: BriefingData): Promise<void> {
  const sb = getSupabase();

  const diagnosis = generateDiagnosis(data);
  const executiveSummary = generateExecutiveSummary(data);
  const sitemap = generateSitemap(data);
  const primaryCta = data.singlePrimaryAction || '';

  const { data: existing } = await sb
    .from('project_briefings')
    .select('id')
    .eq('project_id', projectId)
    .single();

  const payload = {
    responses: data,
    executive_summary: executiveSummary,
    diagnosis: diagnosis,
    sitemap: sitemap,
    primary_cta: primaryCta,
    submitted_at: new Date().toISOString()
  };

  if (existing) {
    const { error } = await sb
      .from('project_briefings')
      .update(payload)
      .eq('project_id', projectId);
    if (error) throw error;
  } else {
    const { error } = await sb
      .from('project_briefings')
      .insert({ project_id: projectId, ...payload });
    if (error) throw error;
  }

  // Registrar histórico via RPC
  await sb.rpc('add_project_history', {
    p_project_id: projectId,
    p_event_type: 'briefing_submitted',
    p_description: 'Briefing enviado pelo cliente.'
  });

  // Atualizar status do projeto
  await sb
    .from('projects')
    .update({ status: 'briefing_received' })
    .eq('id', projectId);
}

/** Busca o briefing do projeto do cliente logado */
export async function getClientBriefing(clientId: string): Promise<{ project: Project; briefing: ProjectBriefing | null } | null> {
  const sb = getSupabase();
  const { data: project } = await sb
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!project) return null;

  const { data: briefing } = await sb
    .from('project_briefings')
    .select('*')
    .eq('project_id', project.id)
    .single();

  return { project: project as Project, briefing: briefing as ProjectBriefing | null };
}
