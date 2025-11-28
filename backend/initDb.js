require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function initDatabase() {
  try {
    console.log('🚀 Initializing database...');

    // Create pages table
    await sql`
      CREATE TABLE IF NOT EXISTS pages (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Pages table created');

    // Create sections table
    await sql`
      CREATE TABLE IF NOT EXISTS sections (
        id BIGINT PRIMARY KEY,
        page_id VARCHAR(255) REFERENCES pages(id) ON DELETE CASCADE,
        headline VARCHAR(255) NOT NULL,
        position INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Sections table created');

    // Create items table
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id BIGINT PRIMARY KEY,
        section_id BIGINT REFERENCES sections(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        image_url TEXT NOT NULL,
        image_large TEXT,
        position INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Items table created');

    // Create share_links table
    await sql`
      CREATE TABLE IF NOT EXISTS share_links (
        short_code VARCHAR(20) PRIMARY KEY,
        page_id VARCHAR(255) REFERENCES pages(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Share links table created');

    // Create default page if not exists
    const existingPages = await sql`SELECT id FROM pages WHERE id = 'default'`;
    
    if (existingPages.length === 0) {
      await sql`
        INSERT INTO pages (id, name) 
        VALUES ('default', 'My Gallery')
      `;
      console.log('✅ Default page created');
    }

    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
