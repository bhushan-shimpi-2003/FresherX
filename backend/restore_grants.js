require('dotenv').config();
const { Client } = require('pg');

async function restoreGrants() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    
    console.log('Restoring Supabase default grants...');
    await client.query(`
      GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_admin, supabase_auth_admin;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_admin, supabase_auth_admin;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_admin, supabase_auth_admin;
      GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_admin, supabase_auth_admin;
      
      -- Set default privileges for future tables
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role, supabase_admin, supabase_auth_admin;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role, supabase_admin, supabase_auth_admin;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role, supabase_admin, supabase_auth_admin;
    `);
    
    console.log('✅ Grants restored successfully!');
  } catch (err) {
    console.error('❌ Error restoring grants:', err);
  } finally {
    await client.end();
  }
}

restoreGrants();
