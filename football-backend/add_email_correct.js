require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function addEmailColumn() {
  try {
    await client.connect();
    console.log("Connected to the correct database.");
    
    // Add email column
    await client.query('ALTER TABLE "Player" ADD COLUMN "email" TEXT;');
    console.log("Successfully added email column!");
    
    // Make it unique
    await client.query('CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");');
    console.log("Successfully added unique constraint on email!");

  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await client.end();
  }
}

addEmailColumn();
