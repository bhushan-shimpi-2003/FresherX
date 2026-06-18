require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data } = await supabase.from('jobs').select('id').limit(1);
  if (!data || data.length === 0) return console.log('No jobs found');
  const id = data[0].id;
  
  // Test with parenthesis syntax
  const res1 = await supabase.from('jobs').select('id').not('id', 'in', `(${id})`);
  console.log('String parenthesis error:', res1.error?.message);

  // Test with array syntax
  const res2 = await supabase.from('jobs').select('id').not('id', 'in', [id]);
  console.log('Array syntax error:', res2.error?.message);
}

run().catch(console.error);
