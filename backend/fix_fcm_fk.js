const { Client } = require('pg');
require('dotenv').config();

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    // We don't know the exact name of the constraint. 
    // It is usually user_fcm_tokens_user_id_fkey.
    await client.query(`
      ALTER TABLE user_fcm_tokens DROP CONSTRAINT IF EXISTS user_fcm_tokens_user_id_fkey;
      ALTER TABLE user_fcm_tokens ADD CONSTRAINT user_fcm_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    `);
    console.log("Fixed foreign key constraint!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

fix();
