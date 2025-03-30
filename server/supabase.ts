import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to hardcoded values for development
const supabaseUrl = process.env.SUPABASE_URL || "https://iziebtlsowihkkhsughv.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWVidGxzb3dpaGtraHN1Z2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNDE0MjIsImV4cCI6MjA1ODgxNzQyMn0.jvRXE2VcRzJw1rV_1wf6f5IHRMUfbu8LwgzNlcdBO6I";

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
