require('dotenv').config();
const { Client } = require('pg');

async function getColumns() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_profiles' AND table_schema = 'public';
    `);
    console.log('Columns in student_profiles:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
getColumns();
