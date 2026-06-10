require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
  const res = await client.query(`SELECT relrowsecurity FROM pg_class WHERE relname='notifications'`);
  console.log('RLS Enabled:', res.rows[0]?.relrowsecurity);
  const pol = await client.query(`SELECT * FROM pg_policies WHERE tablename='notifications'`);
  console.log('Policies:', pol.rows);
}).finally(() => client.end());
