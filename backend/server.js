require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
const { nanoid } = require('nanoid');

const app = express();
const sql = neon(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get all pages
app.get('/api/pages', async (req, res) => {
  try {
    const pages = await sql`SELECT * FROM pages ORDER BY created_at DESC`;
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single page with all data
app.get('/api/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    // Get page info
    const pages = await sql`SELECT * FROM pages WHERE id = ${pageId}`;
    
    if (pages.length === 0) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    
    const page = pages[0];
    
    // Get sections
    const sections = await sql`
      SELECT * FROM sections 
      WHERE page_id = ${pageId} 
      ORDER BY position ASC
    `;
    
    // Get items for each section
    for (let section of sections) {
      const items = await sql`
        SELECT * FROM items 
        WHERE section_id = ${section.id} 
        ORDER BY position ASC
      `;
      section.items = items;
    }
    
    page.sections = sections;
    
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new page
app.post('/api/pages', async (req, res) => {
  try {
    const { name } = req.body;
    const pageId = 'page_' + Date.now();
    const shareCode = nanoid(8);
    
    await sql`
      INSERT INTO pages (id, name, share_code) 
      VALUES (${pageId}, ${name}, ${shareCode})
    `;
    
    res.json({ success: true, data: { id: pageId, name, share_code: shareCode } });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update page
app.put('/api/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { name } = req.body;
    
    await sql`
      UPDATE pages 
      SET name = ${name}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${pageId}
    `;
    
    res.json({ success: true, message: 'Page updated' });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete page
app.delete('/api/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    if (pageId === 'default') {
      return res.status(400).json({ success: false, error: 'Cannot delete default page' });
    }
    
    await sql`DELETE FROM pages WHERE id = ${pageId}`;
    
    res.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save complete page data (sections + items)
app.post('/api/pages/:pageId/save', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { sections } = req.body;
    
    // Delete existing sections and items (cascade will handle items)
    await sql`DELETE FROM sections WHERE page_id = ${pageId}`;
    
    // Insert sections and items
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionId = section.id || Date.now() + i;
      
      await sql`
        INSERT INTO sections (id, page_id, headline, position) 
        VALUES (${sectionId}, ${pageId}, ${section.headline}, ${i})
      `;
      
      // Insert items
      if (section.items && section.items.length > 0) {
        for (let j = 0; j < section.items.length; j++) {
          const item = section.items[j];
          const itemId = item.id || Date.now() + i * 1000 + j;
          
          await sql`
            INSERT INTO items (id, section_id, title, subtitle, image_url, image_large, position) 
            VALUES (
              ${itemId}, 
              ${sectionId}, 
              ${item.title}, 
              ${item.subtitle || ''}, 
              ${item.imageUrl || item.image_url}, 
              ${item.imageLarge || item.image_large || item.imageUrl || item.image_url}, 
              ${j}
            )
          `;
        }
      }
    }
    
    res.json({ success: true, message: 'Page saved successfully' });
  } catch (error) {
    console.error('Error saving page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get page share info
app.get('/api/pages/:pageId/share', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    const pages = await sql`SELECT id, name, share_code FROM pages WHERE id = ${pageId}`;
    if (pages.length === 0) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    
    const page = pages[0];
    const shareUrl = `${req.protocol}://${req.get('host')}/view/${page.share_code}`;
    
    res.json({ success: true, data: { shortCode: page.share_code, shareUrl } });
  } catch (error) {
    console.error('Error getting share info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get page by share code
app.get('/api/share/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Get page data by share_code
    const pages = await sql`SELECT * FROM pages WHERE share_code = ${shortCode}`;
    
    if (pages.length === 0) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    
    const page = pages[0];
    const pageId = page.id;
    
    // Get sections and items
    const sections = await sql`
      SELECT * FROM sections 
      WHERE page_id = ${pageId} 
      ORDER BY position ASC
    `;
    
    for (let section of sections) {
      const items = await sql`
        SELECT * FROM items 
        WHERE section_id = ${section.id} 
        ORDER BY position ASC
      `;
      section.items = items;
    }
    
    page.sections = sections;
    
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error fetching shared page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL.split('@')[1].split('/')[0]}`);
});
