import type { UserProfile, UserRole } from '../types';
import { getSupabase } from './supabase';

const ADMIN_EMAIL = 'pedro.claude001@gmail.com';

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
 * Busca o perfil do usuário logado.
 * REGRA ESTRITA: Apenas pedro.claude001@gmail.com é admin. Todos os demais são clients.
 */
export async function getProfile(userId: string): Promise<UserProfile> {
  const sb = getSupabase();

  // 1. Tenta buscar via RPC segura no Supabase
  try {
    const { data: rpcProfile, error: rpcError } = await sb.rpc('get_my_profile');
    if (rpcProfile && !rpcError) {
      return rpcProfile as UserProfile;
    }
  } catch {}

  // 2. Tenta consultar a tabela user_profiles
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

  // 3. Fallback seguro: identifica o e-mail do usuário autenticado
  let name = 'Usuário';
  let email = '';
  try {
    const { data: authData } = await sb.auth.getUser();
    name = authData?.user?.user_metadata?.name || authData?.user?.email?.split('@')[0] || 'Usuário';
    email = (authData?.user?.email || '').toLowerCase().trim();
  } catch {}

  // REGRA ESTRITA: Apenas pedro.claude001@gmail.com é admin
  const role: UserRole = email === ADMIN_EMAIL ? 'admin' : 'client';

  const profile: UserProfile = {
    id: userId,
    name,
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Tenta persistir no banco para sincronização
  try {
    await sb.from('user_profiles').upsert(profile);
  } catch {}

  return profile;
}

export async function updateProfile(userId: string, patch: Partial<Omit<UserProfile, 'id' | 'role' | 'created_at' | 'updated_at'>>) {
  const sb = getSupabase();
  const { error } = await sb
    .from('user_profiles')
    .update(patch)
    .eq('id', userId);
  if (error) throw error;
}
