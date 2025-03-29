import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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