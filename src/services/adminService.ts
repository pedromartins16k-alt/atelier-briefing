import type { UserProfile, Project, ProjectBriefing, InternalNote, ProjectHistoryEvent } from '../types';
import { getSupabase } from './supabase';

// ---- Clientes ----

export async function getAllClients(): Promise<UserProfile[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('user_profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const clients = (data || []) as UserProfile[];
  if (clients.length === 0) return [];

  // Complementar dados de clientes caso empresa/segmento/localização não estejam em user_profiles
  const clientIdsWithMissingData = clients
    .filter(c => !c.company || !c.segment || !c.location)
    .map(c => c.id);

  if (clientIdsWithMissingData.length > 0) {
    try {
      const { data: projects } = await sb
        .from('projects')
        .select('id, client_id, name')
        .in('client_id', clientIdsWithMissingData)
        .order('created_at', { ascending: false });

      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id);
        const { data: briefings } = await sb
          .from('project_briefings')
          .select('project_id, responses')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false });

        if (briefings && briefings.length > 0) {
          const projectToClient = Object.fromEntries(projects.map(p => [p.id, p.client_id]));
          const clientBriefingMap: Record<string, any> = {};

          for (const b of briefings) {
            const cid = projectToClient[b.project_id];
            if (cid && !clientBriefingMap[cid] && b.responses) {
              clientBriefingMap[cid] = b.responses;
            }
          }

          return clients.map(c => {
            const resp = clientBriefingMap[c.id];
            if (!resp) return c;

            return {
              ...c,
              company: c.company || resp.companyName || c.company,
              segment: c.segment || resp.businessSegment || c.segment,
              location: c.location || resp.serviceLocation || c.location,
              phone: c.phone || resp.contactWhatsapp || c.phone,
              name: c.name || resp.responsibleName || c.name
            };
          });
        }
      }
    } catch (e) {
      console.warn('Erro ao enriquecer clientes com dados de briefing:', e);
    }
  }

  return clients;
}

export async function getClientById(id: string): Promise<UserProfile> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;

  const client = data as UserProfile;

  // Se faltar algum campo essencial, buscar do briefing mais recente
  if (!client.company || !client.segment || !client.location) {
    try {
      const { data: project } = await sb
        .from('projects')
        .select('id')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (project) {
        const { data: briefing } = await sb
          .from('project_briefings')
          .select('responses')
          .eq('project_id', project.id)
          .maybeSingle();

        const resp = briefing?.responses as any;
        if (resp) {
          return {
            ...client,
            company: client.company || resp.companyName || client.company,
            segment: client.segment || resp.businessSegment || client.segment,
            location: client.location || resp.serviceLocation || client.location,
            phone: client.phone || resp.contactWhatsapp || client.phone,
            name: client.name || resp.responsibleName || client.name
          };
        }
      }
    } catch {}
  }

  return client;
}

// ---- Projetos ----

export async function getAllProjects(): Promise<(Project & { client_name?: string; client_company?: string })[]> {
  const sb = getSupabase();
  try {
    const { data, error } = await sb
      .from('projects')
      .select('*, user_profiles(name, company)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((p: any) => ({
        ...p,
        client_name: p.user_profiles?.name,
        client_company: p.user_profiles?.company || (p.name !== 'Novo Projeto' ? p.name : undefined)
      }));
    }
  } catch {}

  // Fallback se o join automático com user_profiles falhar
  const { data: projects, error } = await sb
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar projetos:', error);
    return [];
  }

  const clientIds = Array.from(new Set((projects || []).map(p => p.client_id)));
  let profilesMap: Record<string, { name: string; company?: string }> = {};
  if (clientIds.length > 0) {
    const { data: profiles } = await sb
      .from('user_profiles')
      .select('id, name, company')
      .in('id', clientIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map(pr => [pr.id, pr]));
    }
  }

  return (projects || []).map(p => ({
    ...p,
    client_name: profilesMap[p.client_id]?.name,
    client_company: profilesMap[p.client_id]?.company || (p.name !== 'Novo Projeto' ? p.name : undefined)
  }));
}

export async function getProjectsByClient(clientId: string): Promise<Project[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Project[];
}

export async function getProjectById(id: string): Promise<(Project & { client_name?: string; client_company?: string; client_email?: string; user_profiles?: any }) | null> {
  const sb = getSupabase();
  if (!id) return null;

  try {
    const { data, error } = await sb
      .from('projects')
      .select('*, user_profiles(name, company, id, phone, segment, location, website, instagram)')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return {
        ...data,
        client_name: (data as any).user_profiles?.name,
        client_company: (data as any).user_profiles?.company
      } as any;
    }
  } catch {}

  // Fallback se o join automático com user_profiles falhar
  const { data: project, error } = await sb
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar projeto:', error);
    throw error;
  }

  if (!project) return null;

  let clientProfile: any = null;
  if (project.client_id) {
    try {
      const { data: profile } = await sb
        .from('user_profiles')
        .select('name, company, id, phone, segment, location, website, instagram')
        .eq('id', project.client_id)
        .maybeSingle();
      clientProfile = profile;
    } catch {}
  }

  return {
    ...project,
    client_name: clientProfile?.name,
    client_company: clientProfile?.company,
    user_profiles: clientProfile
  } as any;
}

export async function updateProjectStatus(projectId: string, status: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('projects')
    .update({ status })
    .eq('id', projectId);
  if (error) throw error;
}

export async function deleteProject(projectId: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('projects')
    .delete()
    .eq('id', projectId);
  if (error) throw error;
}

// ---- Briefings ----

export async function getBriefingByProject(projectId: string): Promise<ProjectBriefing | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('project_briefings')
    .select('*')
    .eq('project_id', projectId)
    .single();
  if (error) return null;
  return data as ProjectBriefing;
}

// ---- Notas internas ----

export async function getNotesByProject(projectId: string): Promise<InternalNote[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('internal_notes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as InternalNote[];
}

export async function addNote(projectId: string, adminId: string, content: string): Promise<InternalNote> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('internal_notes')
    .insert({ project_id: projectId, admin_id: adminId, content })
    .select()
    .single();
  if (error) throw error;
  return data as InternalNote;
}

export async function updateNote(noteId: string, content: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('internal_notes')
    .update({ content })
    .eq('id', noteId);
  if (error) throw error;
}

export async function deleteNote(noteId: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('internal_notes')
    .delete()
    .eq('id', noteId);
  if (error) throw error;
}

// ---- Histórico ----

export async function getHistoryByProject(projectId: string): Promise<ProjectHistoryEvent[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('project_history')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ProjectHistoryEvent[];
}

export async function addHistoryEvent(projectId: string, eventType: string, description: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('project_history')
    .insert({ project_id: projectId, event_type: eventType, description });
  if (error) throw error;
}

// ---- Dashboard ----

export async function getDashboardStats() {
  const sb = getSupabase();
  const [clients, projects] = await Promise.all([
    sb.from('user_profiles').select('id', { count: 'exact' }).eq('role', 'client'),
    sb.from('projects').select('id, status', { count: 'exact' })
  ]);

  const all = (projects.data || []) as { status: string }[];
  return {
    totalClients: clients.count || 0,
    totalProjects: projects.count || 0,
    briefingsReceived: all.filter(p => p.status === 'briefing_received').length,
    inAnalysis: all.filter(p => p.status === 'in_analysis').length,
    inDevelopment: all.filter(p => p.status === 'in_development').length,
    completed: all.filter(p => p.status === 'completed').length
  };
}
