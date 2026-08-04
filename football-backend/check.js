require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  await client.connect();
  const res = await client.query('SELECT status FROM "Player"');
  res.rows.forEach(r => console.log(r.status));
  await client.end();
}
check();
