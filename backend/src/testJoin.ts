import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function testJoin() {
  const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, status, created_at, last_seen, recruiter_profiles(auto_verified)')
      .limit(2);
  console.log(data, error);
}

testJoin();
