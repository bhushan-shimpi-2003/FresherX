const { Client } = require('pg');
require('dotenv').config();

async function optimizeDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    // 1. Create RPC for incrementing job applications atomically
    await client.query(`
      CREATE OR REPLACE FUNCTION increment_job_applications(p_job_id UUID)
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      BEGIN
        UPDATE jobs 
        SET applications = applications + 1 
        WHERE id = p_job_id;
      END;
      $$;
    `);
    console.log('Created increment_job_applications RPC');

    // 2. Add Full-Text Search column and index to jobs table
    // First, check if the column exists
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='jobs' and column_name='fts';
    `);
    
    if (res.rows.length === 0) {
      // Add the column
      await client.query(`
        ALTER TABLE jobs 
        ADD COLUMN fts tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(company_name, '') || ' ' || coalesce(location, ''))) STORED;
      `);
      console.log('Added fts column to jobs table');

      // Create GIN index
      await client.query(`
        CREATE INDEX IF NOT EXISTS jobs_fts_idx ON jobs USING GIN (fts);
      `);
      console.log('Created GIN index for fts');
    } else {
      console.log('FTS column already exists, skipping.');
    }

    console.log('Database optimization completed successfully!');
  } catch (err) {
    console.error('Error optimizing DB:', err);
  } finally {
    await client.end();
  }
}

optimizeDb();
