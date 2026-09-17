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
app.use(express.json({ limit: '10mb' }));

// Database Client Setup
const databaseUrl = process.env.DATABASE_URL?.trim();
const sql = databaseUrl ? neon(databaseUrl) : null;

// In-memory fallback store when DATABASE_URL is not set yet
let memoryProducts: Product[] = [];
let memorySettings: StoreSettings = { ...INITIAL_SETTINGS };

// Auto-initialize DB tables on startup if Neon DB URL is connected
async function initDb() {
  if (!sql) {
    console.log('⚡ No DATABASE_URL found in .env — using in-memory mode. Set DATABASE_URL to enable Neon PostgreSQL.');
    return;
  }

  try {
    console.log('⏳ Connecting to Neon PostgreSQL & verifying schema...');

    // Create products table
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

    // Create store_settings table
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
        categories JSONB NOT NULL DEFAULT '["Stickers", "Badge Pins", "Flowers", "Other Crafts"]'::jsonb,
        social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT single_row CHECK (id = 1)
      );
    `;

    // Seed settings if empty
    const existingSettings = await sql`SELECT id FROM store_settings WHERE id = 1`;
    if (existingSettings.length === 0) {
      await sql`
        INSERT INTO store_settings (
          id, store_name, owner_name, tagline, logo_url, admin_pin, currency,
          contact_messenger, contact_instagram, contact_facebook, contact_tiktok,
          categories, social_links
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
          ${INITIAL_SETTINGS.contactTikTok},
          ${JSON.stringify(INITIAL_SETTINGS.categories)}::jsonb,
          ${JSON.stringify(INITIAL_SETTINGS.socialLinks)}::jsonb
        );
      `;
    }


    console.log('✅ Neon PostgreSQL database initialized successfully!');
  } catch (err) {
    console.error('❌ Failed to initialize Neon PostgreSQL database:', err);
  }
}

// Initialize DB schema
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
      return res.json(rows);
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
          ${product.id}, ${product.title}, ${product.category}, ${product.price}, 
          ${product.description || ''}, ${product.imageUrl || ''}, ${product.status || 'Available'}, 
          ${product.tag || null}, ${product.featured || false}, ${product.createdAt || Date.now()}
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

// 4. GET STORE SETTINGS
app.get('/api/settings', async (_req, res) => {
  try {
    if (sql) {
      const rows = await sql`
        SELECT 
          store_name as "storeName",
          owner_name as "ownerName",
          tagline,
          logo_url as "logoUrl",
          admin_pin as "adminPin",
          currency,
          contact_messenger as "contactMessenger",
          contact_instagram as "contactInstagram",
          contact_facebook as "contactFacebook",
          contact_tiktok as "contactTikTok",
          categories,
          social_links as "socialLinks"
        FROM store_settings 
        WHERE id = 1
      `;
      if (rows.length > 0) {
        return res.json(rows[0]);
      }
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
      await sql`
        INSERT INTO store_settings (
          id, store_name, owner_name, tagline, logo_url, admin_pin, currency,
          contact_messenger, contact_instagram, contact_facebook, contact_tiktok,
          categories, social_links
        ) VALUES (
          1,
          ${settings.storeName},
          ${settings.ownerName},
          ${settings.tagline},
          ${settings.logoUrl || ''},
          ${settings.adminPin},
          ${settings.currency},
          ${settings.contactMessenger},
          ${settings.contactInstagram},
          ${settings.contactFacebook},
          ${settings.contactTikTok},
          ${JSON.stringify(settings.categories)}::jsonb,
          ${JSON.stringify(settings.socialLinks)}::jsonb
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
          categories = EXCLUDED.categories,
          social_links = EXCLUDED.social_links,
          updated_at = CURRENT_TIMESTAMP;
      `;
    } else {
      memorySettings = { ...settings };
    }

    res.json({ success: true, settings });
  } catch (err: any) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// 6. CLEAR ALL PRODUCTS / RESET SETTINGS
app.post('/api/reset', async (_req, res) => {
  try {
    if (sql) {
      await sql`DELETE FROM products`;
      await sql`
        UPDATE store_settings SET
          store_name = ${INITIAL_SETTINGS.storeName},
          owner_name = ${INITIAL_SETTINGS.ownerName},
          tagline = ${INITIAL_SETTINGS.tagline},
          logo_url = ${INITIAL_SETTINGS.logoUrl || ''},
          admin_pin = ${INITIAL_SETTINGS.adminPin},
          currency = ${INITIAL_SETTINGS.currency},
          contact_messenger = ${INITIAL_SETTINGS.contactMessenger},
          contact_instagram = ${INITIAL_SETTINGS.contactInstagram},
          contact_facebook = ${INITIAL_SETTINGS.contactFacebook},
          contact_tiktok = ${INITIAL_SETTINGS.contactTikTok},
          categories = ${JSON.stringify(INITIAL_SETTINGS.categories)}::jsonb,
          social_links = ${JSON.stringify(INITIAL_SETTINGS.socialLinks)}::jsonb
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
