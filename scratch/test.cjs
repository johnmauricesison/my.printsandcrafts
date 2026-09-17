const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

let url = process.env.DATABASE_URL || '';
url = url.trim();

console.log('Testing connection to URL:', url);

try {
  const sql = neon(url);
  sql`SELECT NOW() as now, current_database() as db`
    .then((res) => console.log('✅ NEON CONNECTED SUCCESSFULLY:', res))
    .catch((err) => console.error('❌ NEON QUERY ERROR:', err));
} catch (err) {
  console.error('❌ NEON SETUP ERROR:', err);
}
