import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS auto_verified BOOLEAN DEFAULT false;`);
    console.log("Migration successful!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

migrate();
