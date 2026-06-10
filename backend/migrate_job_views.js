require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('Creating job_views table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_views (
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (job_id, user_id)
      );
    `);

    console.log('Creating trigger function increment_job_views()...');
    await client.query(`
      CREATE OR REPLACE FUNCTION increment_job_views()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE jobs SET views = COALESCE(views, 0) + 1 WHERE id = NEW.job_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    console.log('Creating trigger on job_views...');
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_increment_job_views ON job_views;
      CREATE TRIGGER trigger_increment_job_views
      AFTER INSERT ON job_views
      FOR EACH ROW
      EXECUTE FUNCTION increment_job_views();
    `);

    console.log('Database updates applied successfully!');
  } catch (err) {
    console.error('Error applying DB updates:', err);
  } finally {
    await client.end();
  }
}

run();
