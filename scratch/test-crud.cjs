const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const url = process.env.DATABASE_URL.trim();
const sql = neon(url);

async function testCrud() {
  console.log('--- Testing Store Settings Table ---');
  const settings = await sql`SELECT * FROM store_settings WHERE id = 1`;
  console.log('Current Settings:', settings);

  console.log('--- Testing Products Table ---');
  const products = await sql`SELECT * FROM products`;
  console.log('Current Products count:', products.length, products);
}

testCrud().catch(console.error);
