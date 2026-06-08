require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      email: 'test@example.com',
      password_hash: 'hashedpassword',
      full_name: 'Test User',
      role: 'student'
    })
    .select('*')
    .single();

  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Inserted Profile:', data);
  }
}

testInsert();
