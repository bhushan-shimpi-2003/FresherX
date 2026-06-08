require('dotenv').config();
const { Client } = require('pg');

async function testTrigger() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    
    // We will generate a UUID and try to insert it into auth.users. 
    // This will fire the trigger and we can see the exact error.
    const res = await client.query(`
      INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      VALUES (
        gen_random_uuid(), 
        '00000000-0000-0000-0000-000000000000', 
        'authenticated', 
        'authenticated', 
        'test_trigger_${Date.now()}@test.com', 
        'dummy_hash', 
        now(), 
        '{"provider":"email","providers":["email"]}', 
        '{"role":"recruiter","full_name":"Test Recruiter"}',
        now(), 
        now()
      ) RETURNING id;
    `);
    
    console.log('✅ Trigger succeeded, user inserted:', res.rows[0].id);
    
    // Cleanup
    await client.query('DELETE FROM auth.users WHERE id = $1', [res.rows[0].id]);
    
  } catch (err) {
    console.error('❌ Trigger failed with error:', err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

testTrigger();
