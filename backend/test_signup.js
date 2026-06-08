require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSignup() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const testEmail = `bhush_test_${Date.now()}@gmail.com`;
  console.log('Testing sign up for:', testEmail);

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123',
    options: {
      data: {
        full_name: 'API Test User',
        role: 'student'
      }
    }
  });

  if (error) {
    console.error('❌ Sign up failed:', error);
  } else {
    console.log('✅ Sign up successful:', data.user.id);
  }
}

testSignup();
