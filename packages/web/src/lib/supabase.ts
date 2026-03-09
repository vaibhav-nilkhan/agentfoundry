/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only initialize if keys are present to prevent build-time crashes
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper functions with null-safety
export const auth = {
  signInWithEmail: async (email: string, password: string) => {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signUpWithEmail: async (email: string, password: string) => {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };
    return await supabase.auth.signUp({ email, password });
  },

  signInWithGoogle: async () => {
    if (!supabase) return;
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
  },

  signOut: async () => {
    if (!supabase) return;
    return await supabase.auth.signOut();
  },

  getSession: async () => {
    if (!supabase) return { data: { session: null }, error: null };
    return await supabase.auth.getSession();
  },

  getUser: async () => {
    if (!supabase) return { data: { user: null }, error: null };
    return await supabase.auth.getUser();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  },
};
