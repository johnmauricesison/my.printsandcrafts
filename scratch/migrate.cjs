const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL.trim());

async function run() {
  console.log('Creating categories and social_links tables...');
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS social_links (
      id VARCHAR(255) PRIMARY KEY,
      platform VARCHAR(100) NOT NULL,
      url TEXT NOT NULL,
      icon_name VARCHAR(100)
    );
  `;

  const cats = ["Stickers", "Badge Pins", "Flowers", "Other Crafts"];
  for (const c of cats) {
    await sql`INSERT INTO categories (name) VALUES (${c}) ON CONFLICT DO NOTHING;`;
  }

  const links = [
    { id: '1', platform: 'Instagram', url: 'https://instagram.com/vcre8tives' },
    { id: '2', platform: 'Facebook', url: 'https://facebook.com/vcre8tives' },
    { id: '3', platform: 'TikTok', url: 'https://tiktok.com/@vcre8tives' },
    { id: '4', platform: 'Messenger', url: 'https://m.me/vcre8tives' },
  ];
  for (const link of links) {
    await sql`
      INSERT INTO social_links (id, platform, url, icon_name)
      VALUES (${link.id}, ${link.platform}, ${link.url}, ${link.iconName || null})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  console.log('✅ Final Database Tables:', tables);
}

run().catch(console.error);
