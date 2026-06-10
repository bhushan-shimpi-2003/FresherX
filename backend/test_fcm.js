require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: profiles, error: userError } = await supabase.from('profiles').select('id').limit(1);
  if (userError || !profiles || !profiles.length) {
    console.log("Error getting users:", userError);
    return;
  }
  
  const userId = profiles[0].id;
  console.log("Using user ID:", userId);

  const { data, error } = await supabase
    .from('user_fcm_tokens')
    .upsert({
      user_id: userId,
      token: 'test-token',
      device_type: 'android',
    }, { onConflict: 'token' });
    
  console.log("Upsert Error:", error);
}

test();
