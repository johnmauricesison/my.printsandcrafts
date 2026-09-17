const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const url = process.env.DATABASE_URL.trim();
const sql = neon(url);

async function testTables() {
  console.log('--- Current Tables in Neon DB ---');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  console.log('Tables:', tables);

  console.log('--- Testing Store Settings Row ---');
  const settings = await sql`SELECT * FROM store_settings WHERE id = 1`;
  console.log('Settings:', settings);
}

testTables().catch(console.error);
