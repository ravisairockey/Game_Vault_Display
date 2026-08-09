import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient;

if (!url || !anon) {
  console.warn('Supabase env vars missing; creating no-op client.');
  const mock = createClient('http://localhost', 'mock-key');
  supabase = mock as SupabaseClient;
} else {
  supabase = createClient(url, anon);
}

export default supabase;
