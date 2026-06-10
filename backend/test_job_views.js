require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // 1. Get a test job and test user
    const jobsRes = await client.query('SELECT id, views FROM jobs LIMIT 1');
    const usersRes = await client.query('SELECT id FROM auth.users LIMIT 1');
    
    if (jobsRes.rows.length === 0 || usersRes.rows.length === 0) {
      console.log('No jobs or users found to test');
      return;
    }

    const jobId = jobsRes.rows[0].id;
    const userId = usersRes.rows[0].id;
    const initialViews = jobsRes.rows[0].views || 0;
    console.log(`Testing with Job ID: ${jobId}, User ID: ${userId}, Initial Views: ${initialViews}`);

    // 2. Insert into job_views
    try {
      await client.query('INSERT INTO job_views (job_id, user_id) VALUES ($1, $2)', [jobId, userId]);
      console.log('Insert 1 succeeded');
    } catch (e) {
      console.log('Insert 1 failed:', e.message);
    }

    // 3. Try to insert again
    try {
      await client.query('INSERT INTO job_views (job_id, user_id) VALUES ($1, $2)', [jobId, userId]);
      console.log('Insert 2 succeeded (Should not happen!)');
    } catch (e) {
      console.log('Insert 2 failed as expected:', e.message);
    }

    // 4. Check the views count
    const finalJob = await client.query('SELECT views FROM jobs WHERE id = $1', [jobId]);
    const finalViews = finalJob.rows[0].views;
    console.log(`Final Views: ${finalViews}`);
    
    // Clean up
    await client.query('DELETE FROM job_views WHERE job_id = $1 AND user_id = $2', [jobId, userId]);
    // Also revert the view count
    await client.query('UPDATE jobs SET views = $1 WHERE id = $2', [initialViews, jobId]);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
