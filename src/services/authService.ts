import type { UserProfile, UserRole } from '../types';
import { getSupabase } from './supabase';

export async function signIn(email: string, password: string) {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(name: string, email: string, password: string) {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const sb = getSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const sb = getSupabase();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });
  if (error) throw error;
}

/**
 * Busca o perfil do usuário de forma ultra-resiliente.
 * Se a linha ainda não existir em user_profiles ou a tabela estiver em migração,
 * cria/sintetiza o perfil para NUNCA travar a navegação do usuário.
 */
export async function getProfile(userId: string): Promise<UserProfile> {
  const sb = getSupabase();

  try {
    const { data, error } = await sb
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && !error) {
      return data as UserProfile;
    }
  } catch (err) {
    console.warn('Erro ao consultar user_profiles:', err);
  }

  // Se não encontrou ou deu erro, vamos determinar o papel do usuário
  let role: UserRole = 'client';
  try {
    const { count } = await sb
      .from('user_profiles')
      .select('id', { count: 'exact', head: true });
    
    // Se não há nenhum perfil no sistema, este é o primeiro usuário -> admin
    if (count === 0 || count === null) {
      role = 'admin';
    }
  } catch {
    // Se a tabela ainda não foi criada, assume admin para o primeiro acesso
    role = 'admin';
  }

  // Tenta obter os metadados do auth
  let name = 'Usuário';
  try {
    const { data: authData } = await sb.auth.getUser();
    name = authData?.user?.user_metadata?.name || authData?.user?.email?.split('@')[0] || 'Usuário';
  } catch {}

  const fallbackProfile: UserProfile = {
    id: userId,
    name,
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Tenta salvar o perfil no banco para próximas requisições
  try {
    const { data: created } = await sb
      .from('user_profiles')
      .upsert(fallbackProfile)
      .select()
      .maybeSingle();

    if (created) return created as UserProfile;
  } catch (err) {
    console.warn('Não foi possível gravar fallback em user_profiles:', err);
  }

  return fallbackProfile;
}

export async function updateProfile(userId: string, patch: Partial<Omit<UserProfile, 'id' | 'role' | 'created_at' | 'updated_at'>>) {
  const sb = getSupabase();
  const { error } = await sb
    .from('user_profiles')
    .update(patch)
    .eq('id', userId);
  if (error) throw error;
}
