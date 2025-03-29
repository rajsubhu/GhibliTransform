import { createClient } from '@supabase/supabase-js';

// Access Supabase credentials from environment variables
// In Vite, we use import.meta.env instead of process.env
const supabaseUrl = import.meta.env.SUPABASE_URL || "https://iziebtlsowihkkhsughv.supabase.co";
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWVidGxzb3dpaGtraHN1Z2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5OTg4NTgsImV4cCI6MjAzMjU3NDg1OH0.XB-Tg_WdE8Hp9dUwwU0j3gKhNI9aOwVL2KLMB7G4Nww";

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
  reason: 'initial' | 'instagram_follow' | 'admin' | 'generation' | 'purchase';
  created_at: string;
}