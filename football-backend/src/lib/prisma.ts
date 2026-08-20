import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const originalUrl = `${process.env.DATABASE_URL}`;

// Dynamically fix the Supabase pooler issue for Render without exposing credentials
let connectionString = originalUrl;
if (connectionString.includes('aws-0-ap-southeast-2.pooler.supabase.com')) {
  connectionString = connectionString
    .replace('postgres.lipdcxbwmhjvjsaqoiio', 'postgres')
    .replace('aws-0-ap-southeast-2.pooler.supabase.com:5432', 'db.lipdcxbwmhjvjsaqoiio.supabase.co:5432');
}

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
export default prisma;
