require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function resetAndMigrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    
    console.log('Dropping existing public schema...');
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    
    console.log('Applying fresh migrations from 001_schema.sql...');
    const schemaPath = path.resolve(__dirname, '../supabase/migrations/001_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schemaSql);
    
    console.log('Reloading PostgREST schema cache...');
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    
    console.log('✅ Database successfully reset and migrated!');
  } catch (err) {
    console.error('❌ Error during reset/migration:', err);
  } finally {
    await client.end();
  }
}

resetAndMigrate();
