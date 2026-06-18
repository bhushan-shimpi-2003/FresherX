require('dotenv').config();
const { Client } = require('pg');

async function fixFk() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();

    console.log('Dropping existing constraint for job_views...');
    await client.query(`
      ALTER TABLE public.job_views
      DROP CONSTRAINT IF EXISTS job_views_user_id_fkey;
    `);

    console.log('Adding new constraint referencing profiles for job_views...');
    await client.query(`
      ALTER TABLE public.job_views
      ADD CONSTRAINT job_views_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    `);

    console.log('✅ Fix completed successfully.');
  } catch (err) {
    console.error('❌ Fix failed:', err);
  } finally {
    await client.end();
  }
}
fixFk();
