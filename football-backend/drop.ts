import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query('ALTER TABLE "Player" DROP COLUMN IF EXISTS "categoryId" CASCADE;');
  console.log('Column dropped successfully');
}

main().then(() => process.exit(0)).catch(console.error);
