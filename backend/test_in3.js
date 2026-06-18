require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      recruiter:profiles!jobs_recruiter_id_fkey(id, full_name, poster_type)
    `)
    .eq('status', 'published');

  query = query.order('created_at', { ascending: false });
  query = query.range(0, 1);

  const { data, error } = await query;
  console.log('Error:', error);
  console.log('Data length:', data ? data.length : 0);
  if (data && data.length > 0) console.log(data[0].recruiter);
}

run().catch(console.error);
