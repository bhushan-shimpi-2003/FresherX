require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data } = await supabase.from('jobs').select('id').limit(2);
  if (!data || data.length < 2) return console.log('Not enough jobs');
  const id1 = data[0].id;
  const id2 = data[1].id;
  
  // Test with parenthesis syntax and multiple IDs
  const res1 = await supabase.from('jobs').select('id').not('id', 'in', `(${id1},${id2})`);
  console.log('Multiple IDs error:', res1.error?.message);
}

run().catch(console.error);
