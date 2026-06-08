require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabaseAdmin.from('jobs').select('*, company:companies(*)').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
