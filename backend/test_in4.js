require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, recruiter:recruiter_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(1);

  console.log('Error 1:', error);
}

run().catch(console.error);
