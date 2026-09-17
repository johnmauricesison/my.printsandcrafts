import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../src/data/initialData';
import type { Product, StoreSettings } from '../src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' })); // Allows base64 logo images up to 20MB

// Database Client Setup
const databaseUrl = process.env.DATABASE_URL?.trim();
const sql = databaseUrl ? neon(databaseUrl) : null;

// In-memory fallback store when DATABASE_URL is not set
let memoryProducts: Product[] = [];
let memorySettings: StoreSettings = { ...INITIAL_SETTINGS };

// Initialize Normalized DB Schema
async function initDb() {
  if (!sql) {
    console.log('⚡ No DATABASE_URL found in .env — using in-memory mode.');
    return;
  }

  try {
    console.log('⏳ Connecting to Neon PostgreSQL & initializing database tables...');

    // 1. PRODUCTS TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        description TEXT,
        image_url TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Available',
        tag VARCHAR(100),
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        created_at BIGINT NOT NULL
      );
    `;

    // 2. CATEGORIES TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `;

    // 3. SOCIAL LINKS TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS social_links (
        id VARCHAR(255) PRIMARY KEY,
        platform VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        icon_name VARCHAR(100)
      );
    `;

    // 4. STORE SETTINGS TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS store_settings (
        id INT PRIMARY KEY DEFAULT 1,
        store_name VARCHAR(255) NOT NULL DEFAULT 'M.Y Prints & Crafts',
        owner_name VARCHAR(255) DEFAULT 'by Vcre8tives',
        tagline TEXT,
        logo_url TEXT,
        admin_pin VARCHAR(50) DEFAULT '1234',
        currency VARCHAR(10) DEFAULT '₱',
        contact_messenger VARCHAR(255),
        contact_instagram VARCHAR(255),
        contact_facebook VARCHAR(255),
        contact_tiktok VARCHAR(255),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT single_row CHECK (id = 1)
      );
    `;

    // Seed default categories if empty
    const catCount = await sql`SELECT COUNT(*) as count FROM categories`;
    if (Number(catCount[0]?.count || 0) === 0) {
      for (const cat of INITIAL_SETTINGS.categories) {
        await sql`INSERT INTO categories (name) VALUES (${cat}) ON CONFLICT DO NOTHING`;
      }
    }

    // Seed default social links if empty
    const linkCount = await sql`SELECT COUNT(*) as count FROM social_links`;
    if (Number(linkCount[0]?.count || 0) === 0) {
      for (const link of INITIAL_SETTINGS.socialLinks) {
        await sql`
          INSERT INTO social_links (id, platform, url, icon_name)
          VALUES (${link.id}, ${link.platform}, ${link.url}, ${link.iconName || null})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Seed default store settings if empty
    const settingsCount = await sql`SELECT COUNT(*) as count FROM store_settings`;
    if (Number(settingsCount[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO store_settings (
          id, store_name, owner_name, tagline, logo_url, admin_pin, currency,
          contact_messenger, contact_instagram, contact_facebook, contact_tiktok
        ) VALUES (
          1,
          ${INITIAL_SETTINGS.storeName},
          ${INITIAL_SETTINGS.ownerName},
          ${INITIAL_SETTINGS.tagline},
          ${INITIAL_SETTINGS.logoUrl || ''},
          ${INITIAL_SETTINGS.adminPin},
          ${INITIAL_SETTINGS.currency},
          ${INITIAL_SETTINGS.contactMessenger},
          ${INITIAL_SETTINGS.contactInstagram},
          ${INITIAL_SETTINGS.contactFacebook},
          ${INITIAL_SETTINGS.contactTikTok}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }

    console.log('✅ Neon PostgreSQL database schema fully initialized!');
  } catch (err) {
    console.error('❌ Failed to initialize Neon PostgreSQL database schema:', err);
  }
}

// Run schema initialization
initDb();

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. GET ALL PRODUCTS
app.get('/api/products', async (_req, res) => {
  try {
    if (sql) {
      const rows = await sql`
        SELECT 
          id, title, category, price::float, description, 
          image_url as "imageUrl", status, tag, featured, created_at as "createdAt"
        FROM products 
        ORDER BY created_at DESC
      `;
      const formatted = rows.map((r: any) => ({
        ...r,
        createdAt: Number(r.createdAt) || Date.now(),
      }));
      return res.json(formatted);
    }
    return res.json(memoryProducts);
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// 2. CREATE / UPDATE PRODUCT
app.post('/api/products', async (req, res) => {
  try {
    const product: Product = req.body;
    if (!product.id || !product.title) {
      return res.status(400).json({ error: 'Invalid product data' });
    }

    if (sql) {
      await sql`
        INSERT INTO products (id, title, category, price, description, image_url, status, tag, featured, created_at)
        VALUES (
          ${product.id}, 
          ${product.title || 'Untitled Craft'}, 
          ${product.category || 'Stickers'}, 
          ${product.price || 0}, 
          ${product.description || ''}, 
          ${product.imageUrl || ''}, 
          ${product.status || 'Available'}, 
          ${product.tag || null}, 
          ${Boolean(product.featured)}, 
          ${product.createdAt || Date.now()}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          status = EXCLUDED.status,
          tag = EXCLUDED.tag,
          featured = EXCLUDED.featured;
      `;
    } else {
      const index = memoryProducts.findIndex((p) => p.id === product.id);
      if (index >= 0) {
        memoryProducts[index] = product;
      } else {
        memoryProducts.unshift(product);
      }
    }

    res.json({ success: true, product });
  } catch (err: any) {
    console.error('Error saving product:', err);
    res.status(500).json({ error: 'Failed to save product', details: err.message });
  }
});

// 3. DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (sql) {
      await sql`DELETE FROM products WHERE id = ${id}`;
    } else {
      memoryProducts = memoryProducts.filter((p) => p.id !== id);
    }
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// 4. GET STORE SETTINGS (Combined from tables)
app.get('/api/settings', async (_req, res) => {
  try {
    if (sql) {
      const [settingsRows, categoryRows, socialRows] = await Promise.all([
        sql`SELECT * FROM store_settings WHERE id = 1`,
        sql`SELECT name FROM categories ORDER BY id ASC`,
        sql`SELECT id, platform, url, icon_name as "iconName" FROM social_links`
      ]);

      const baseSettings = settingsRows[0] || {};
      const categories = categoryRows.map((c: any) => c.name);
      const socialLinks = socialRows;

      return res.json({
        storeName: baseSettings.store_name || INITIAL_SETTINGS.storeName,
        ownerName: baseSettings.owner_name || INITIAL_SETTINGS.ownerName,
        tagline: baseSettings.tagline || INITIAL_SETTINGS.tagline,
        logoUrl: baseSettings.logo_url || '',
        adminPin: baseSettings.admin_pin || INITIAL_SETTINGS.adminPin,
        currency: baseSettings.currency || INITIAL_SETTINGS.currency,
        contactMessenger: baseSettings.contact_messenger || '',
        contactInstagram: baseSettings.contact_instagram || '',
        contactFacebook: baseSettings.contact_facebook || '',
        contactTikTok: baseSettings.contact_tiktok || '',
        categories: categories.length > 0 ? categories : INITIAL_SETTINGS.categories,
        socialLinks: socialLinks.length > 0 ? socialLinks : INITIAL_SETTINGS.socialLinks,
      });
    }
    return res.json(memorySettings);
  } catch (err: any) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
});

// 5. UPDATE STORE SETTINGS
app.put('/api/settings', async (req, res) => {
  try {
    const settings: StoreSettings = req.body;
    if (sql) {
      // Update store_settings
      await sql`
        INSERT INTO store_settings (
          id, store_name, owner_name, tagline, logo_url, admin_pin, currency,
          contact_messenger, contact_instagram, contact_facebook, contact_tiktok
        ) VALUES (
          1,
          ${settings.storeName || 'M.Y Prints & Crafts'},
          ${settings.ownerName || ''},
          ${settings.tagline || ''},
          ${settings.logoUrl || ''},
          ${settings.adminPin || '1234'},
          ${settings.currency || '₱'},
          ${settings.contactMessenger || ''},
          ${settings.contactInstagram || ''},
          ${settings.contactFacebook || ''},
          ${settings.contactTikTok || ''}
        )
        ON CONFLICT (id) DO UPDATE SET
          store_name = EXCLUDED.store_name,
          owner_name = EXCLUDED.owner_name,
          tagline = EXCLUDED.tagline,
          logo_url = EXCLUDED.logo_url,
          admin_pin = EXCLUDED.admin_pin,
          currency = EXCLUDED.currency,
          contact_messenger = EXCLUDED.contact_messenger,
          contact_instagram = EXCLUDED.contact_instagram,
          contact_facebook = EXCLUDED.contact_facebook,
          contact_tiktok = EXCLUDED.contact_tiktok,
          updated_at = CURRENT_TIMESTAMP;
      `;

      // Sync categories table
      if (Array.isArray(settings.categories)) {
        for (const cat of settings.categories) {
          if (cat) {
            await sql`
              INSERT INTO categories (name) VALUES (${cat})
              ON CONFLICT (name) DO NOTHING;
            `;
          }
        }
      }

      // Sync social_links table
      if (Array.isArray(settings.socialLinks)) {
        for (const link of settings.socialLinks) {
          if (link && link.id) {
            await sql`
              INSERT INTO social_links (id, platform, url, icon_name)
              VALUES (${link.id}, ${link.platform}, ${link.url}, ${link.iconName || null})
              ON CONFLICT (id) DO UPDATE SET
                platform = EXCLUDED.platform,
                url = EXCLUDED.url,
                icon_name = EXCLUDED.icon_name;
            `;
          }
        }
      }
    } else {
      memorySettings = { ...settings };
    }

    res.json({ success: true, settings });
  } catch (err: any) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// 6. GET/ADD CATEGORIES API
app.get('/api/categories', async (_req, res) => {
  try {
    if (sql) {
      const rows = await sql`SELECT name FROM categories ORDER BY id ASC`;
      return res.json(rows.map((r: any) => r.name));
    }
    return res.json(memorySettings.categories);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name required' });
    if (sql) {
      await sql`INSERT INTO categories (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`;
    } else {
      if (!memorySettings.categories.includes(name)) {
        memorySettings.categories.push(name);
      }
    }
    res.json({ success: true, name });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// 7. CLEAR ALL PRODUCTS / RESET SETTINGS
app.post('/api/reset', async (_req, res) => {
  try {
    if (sql) {
      await sql`DELETE FROM products`;
      await sql`
        UPDATE store_settings SET
          store_name = ${INITIAL_SETTINGS.storeName},
          owner_name = ${INITIAL_SETTINGS.ownerName},
          tagline = ${INITIAL_SETTINGS.tagline},
          logo_url = '',
          admin_pin = ${INITIAL_SETTINGS.adminPin},
          currency = ${INITIAL_SETTINGS.currency},
          contact_messenger = ${INITIAL_SETTINGS.contactMessenger},
          contact_instagram = ${INITIAL_SETTINGS.contactInstagram},
          contact_facebook = ${INITIAL_SETTINGS.contactFacebook},
          contact_tiktok = ${INITIAL_SETTINGS.contactTikTok}
        WHERE id = 1;
      `;
    } else {
      memoryProducts = [];
      memorySettings = { ...INITIAL_SETTINGS };
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error clearing database:', err);
    res.status(500).json({ error: 'Failed to clear database', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 M.Y Prints & Crafts Backend running on http://localhost:${PORT}`);
});
