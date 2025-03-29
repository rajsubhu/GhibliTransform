import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type User = {
  id: string;
  email: string;
  credits: number;
  instagram_username?: string;
  created_at: string;
}

export type CreditsTransaction = {
  id: string;
  user_id: string;
  amount: number;
  reason: 'initial' | 'instagram_follow' | 'admin' | 'generation';
  created_at: string;
}