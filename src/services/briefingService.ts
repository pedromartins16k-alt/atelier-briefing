import type { BriefingData, Project, ProjectBriefing } from '../types';
import { getSupabase } from './supabase';
import { generateDiagnosis, generateExecutiveSummary, generateSitemap } from '../utils/briefingIntelligence';

const DRAFT_KEY = 'atelier_briefing_draft';
const DRAFT_PROJECT_KEY = 'atelier_briefing_project_id';

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

/** Salva o projectId no localStorage para restaurar ao reabrir o briefing */
export function saveDraftProjectId(projectId: string) {
  localStorage.setItem(DRAFT_PROJECT_KEY, projectId);
}

/** Lê o projectId salvo no rascunho local */
export function loadDraftProjectId(): string | null {
  return localStorage.getItem(DRAFT_PROJECT_KEY);
}

/** Limpa rascunho local após envio */
export function clearDraftLocally() {
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(DRAFT_PROJECT_KEY);
  localStorage.removeItem('atelier_briefing_data');
}

/**
 * Cria SEMPRE um novo projeto para o cliente.
 * Nunca reutiliza o projeto mais recente — cada briefing novo gera um projeto separado.
 * Se um projectId existente for fornecido (restaurado do draft), valida se ele realmente
 * pertence ao cliente antes de reutilizá-lo.
 */
export async function ensureProject(clientId: string, existingProjectId?: string | null, projectName?: string): Promise<string> {
  const sb = getSupabase();

  // Se há um projectId salvo, verificar se ainda existe e pertence ao cliente
  if (existingProjectId) {
    const { data: existing } = await sb
      .from('projects')
      .select('id')
      .eq('id', existingProjectId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (existing) {
      // Projeto válido — atualiza nome se necessário e retorna
      if (projectName && projectName.trim() && projectName !== 'Novo Projeto') {
        await sb
          .from('projects')
          .update({ name: projectName.trim() })
          .eq('id', existing.id);
      }
      return existing.id;
    }
  }

  // Criar projeto novo (não reutiliza o mais recente)
  const { data, error } = await sb
    .from('projects')
    .insert({
      client_id: clientId,
      name: projectName?.trim() || 'Novo Projeto',
      status: 'briefing_received'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao criar projeto:', error);
    throw error;
  }

  saveDraftProjectId(data.id);
  return data.id;
}

/** Salva ou atualiza rascunho de briefing no Supabase */
export async function saveBriefingDraft(projectId: string, responses: BriefingData): Promise<void> {
  const sb = getSupabase();
  const { data: existing } = await sb
    .from('project_briefings')
    .select('id')
    .eq('project_id', projectId)
    .maybeSingle();

  if (existing) {
    await sb
      .from('project_briefings')
      .update({ responses })
      .eq('project_id', projectId);
  } else {
    await sb
      .from('project_briefings')
      .insert({ project_id: projectId, responses });
  }

  // Atualizar nome do projeto se empresa informada
  if (responses.companyName?.trim()) {
    await sb
      .from('projects')
      .update({ name: responses.companyName.trim() })
      .eq('id', projectId);
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
    .maybeSingle();

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

  // Registrar histórico via RPC (se disponível no banco)
  try {
    await sb.rpc('add_project_history', {
      p_project_id: projectId,
      p_event_type: 'briefing_submitted',
      p_description: 'Briefing enviado pelo cliente.'
    });
  } catch {}

  // Atualizar nome e status do projeto
  const companyName = data.companyName?.trim();
  await sb
    .from('projects')
    .update({
      status: 'briefing_received',
      ...(companyName ? { name: companyName } : {})
    })
    .eq('id', projectId);

  // -----------------------------------------------------------------------
  // CORREÇÃO DO PROBLEMA 1:
  // Sincronizar dados do cliente de volta para user_profiles.
  // O trigger handle_new_user cria o perfil apenas com name/role.
  // Os campos company, segment, location e phone ficam null até este ponto.
  // -----------------------------------------------------------------------
  try {
    const { data: projectRow } = await sb
      .from('projects')
      .select('client_id')
      .eq('id', projectId)
      .single();

    if (projectRow?.client_id) {
      const profileUpdate: Record<string, string> = {};
      if (data.companyName?.trim()) profileUpdate.company = data.companyName.trim();
      if (data.businessSegment?.trim()) profileUpdate.segment = data.businessSegment.trim();
      if (data.serviceLocation?.trim()) profileUpdate.location = data.serviceLocation.trim();
      if (data.contactWhatsapp?.trim()) profileUpdate.phone = data.contactWhatsapp.trim();
      if (data.responsibleName?.trim()) profileUpdate.name = data.responsibleName.trim();

      if (Object.keys(profileUpdate).length > 0) {
        await sb
          .from('user_profiles')
          .update(profileUpdate)
          .eq('id', projectRow.client_id);
      }
    }
  } catch (e) {
    console.warn('Não foi possível sincronizar perfil do cliente:', e);
  }
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
    .maybeSingle();

  if (!project) return null;

  const { data: briefing } = await sb
    .from('project_briefings')
    .select('*')
    .eq('project_id', project.id)
    .maybeSingle();

  return { project: project as Project, briefing: briefing as ProjectBriefing | null };
}
