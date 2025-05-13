
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Initialize the Supabase client
const supabaseUrl = 'REPLACE_WITH_YOUR_SUPABASE_URL';
const supabaseKey = 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
