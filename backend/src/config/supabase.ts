import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for backend.');
}

// Service role key allows bypassing RLS since we are acting as the trusted backend.
// We will apply logic to ensure users only access their own data.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
