require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('🚀 Running migration...');
    
    // Check if share_code column exists
    const tableInfo = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pages' AND column_name = 'share_code'
    `;
    
    if (tableInfo.length === 0) {
      console.log('Adding share_code column...');
      
      // Add column as nullable first
      await sql`ALTER TABLE pages ADD COLUMN share_code VARCHAR(20)`;
      
      // Update existing pages with their id as share_code
      await sql`UPDATE pages SET share_code = id WHERE share_code IS NULL`;
      
      // Make it NOT NULL and UNIQUE
      await sql`ALTER TABLE pages ALTER COLUMN share_code SET NOT NULL`;
      await sql`ALTER TABLE pages ADD CONSTRAINT pages_share_code_unique UNIQUE (share_code)`;
      
      console.log('✅ share_code column added successfully');
    } else {
      console.log('✅ share_code column already exists');
    }
    
    console.log('🎉 Migration completed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();
