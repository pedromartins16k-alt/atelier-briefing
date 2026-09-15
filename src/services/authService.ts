import type { UserProfile } from '../types';
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

export async function getProfile(userId: string): Promise<UserProfile> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export async function updateProfile(userId: string, patch: Partial<Omit<UserProfile, 'id' | 'role' | 'created_at' | 'updated_at'>>) {
  const sb = getSupabase();
  const { error } = await sb
    .from('user_profiles')
    .update(patch)
    .eq('id', userId);
  if (error) throw error;
}
