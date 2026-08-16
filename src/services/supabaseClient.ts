import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  || 'https://yplnkcixoccsklueqfjd.supabase.co';

// Support both new publishable key format and old anon key naming
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY
  || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
