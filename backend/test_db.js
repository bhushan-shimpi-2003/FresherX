require('dotenv').config();
const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log(res.rows);
  
  const res2 = await client.query("SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public'");
  console.log('RPCs:', res2.rows);

  await client.end();
}
run();
