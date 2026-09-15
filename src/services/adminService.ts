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
  return (data || []) as UserProfile[];
}

export async function getClientById(id: string): Promise<UserProfile> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as UserProfile;
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
        client_company: p.user_profiles?.company
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
    client_company: profilesMap[p.client_id]?.company
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

export async function getProjectById(id: string): Promise<Project & { client_name?: string; client_company?: string; client_email?: string }> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('projects')
    .select('*, user_profiles(name, company, id, phone, segment, location, website, instagram)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return {
    ...data,
    client_name: (data as any).user_profiles?.name,
    client_company: (data as any).user_profiles?.company
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
