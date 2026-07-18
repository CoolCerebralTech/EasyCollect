import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surface this clearly in the console before the app refuses to load data.
  // The throwing behaviour is intentional: every service in db.service.ts
  // depends on this client existing; a null guard at every call site is worse
  // than a single loud failure the deployer has to fix.
  console.error(
    '[The Ledger] Missing Supabase environment variables. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment ' +
    '(locally: .env, on Vercel: Project Settings → Environment Variables). ' +
    'See .env.example for the expected keys.'
  );
  throw new Error(
    'The Ledger is missing its database connection. ' +
    'Ask the organizer to set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
