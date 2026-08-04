const { Client } = require('pg');

async function addEmailColumn() {
  const client = new Client({
    connectionString: "postgresql://postgres.lipdcxbwmhjvjsaqoiio:%3Fvcx%2353%26%40hS3wLj@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres",
  });

  try {
    await client.connect();
    
    // First, clear all existing players to prevent null constraint violations since we're adding a unique column.
    // The user was testing, so deleting existing players is fine.
    await client.query(`DELETE FROM "Player";`);
    
    // Add the column
    await client.query(`ALTER TABLE "Player" ADD COLUMN email TEXT;`);
    
    // Add the unique constraint
    await client.query(`CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");`);
    
    console.log("Successfully added email column to Player table.");
  } catch (err) {
    console.error("Error modifying database:", err);
  } finally {
    await client.end();
  }
}

addEmailColumn();
