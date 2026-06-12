require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: all } = await supabaseAdmin.from('jobs').select('id');
  if(!all || all.length === 0) return console.log('no jobs');
  
  const idToExclude = all[0].id;
  const { data: excluded, error } = await supabaseAdmin.from('jobs').select('id').not('id', 'in', `(${idToExclude})`);
  console.log('Error:', error?.message);
  console.log('All count:', all.length, 'Excluded count:', excluded?.length);
}
run();
