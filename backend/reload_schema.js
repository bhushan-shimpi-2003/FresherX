const { Client } = require('pg');
require('dotenv').config();

async function reload() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("PostgREST schema cache reloaded!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

reload();
