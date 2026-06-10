require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1);
  console.log("Profiles:", profiles, "Error:", pError);
  
  const { data: users, error: uError } = await supabase.from('users').select('id').limit(1);
  console.log("Users:", users, "Error:", uError);
}

test();
