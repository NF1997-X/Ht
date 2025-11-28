const { neon } = require('@neondatabase/serverless');
const { nanoid } = require('nanoid');

const sql = neon(process.env.DATABASE_URL);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  const { method } = req;
  const path = req.url.replace('/api', '');

  try {
    // Health check
    if (path === '/health' && method === 'GET') {
      return res.status(200).json({ 
        success: true, 
        status: 'ok', 
        message: 'Server is running' 
      });
    }

    // Get all pages
    if (path === '/pages' && method === 'GET') {
      const pages = await sql`SELECT * FROM pages ORDER BY created_at DESC`;
      return res.status(200).json({ success: true, data: pages });
    }

    // Create new page
    if (path === '/pages' && method === 'POST') {
      const { name } = req.body;
      const pageId = 'page_' + Date.now();
      
      await sql`
        INSERT INTO pages (id, name) 
        VALUES (${pageId}, ${name})
      `;
      
      return res.status(200).json({ success: true, data: { id: pageId, name } });
    }

    // Get single page
    if (path.startsWith('/pages/') && method === 'GET' && !path.includes('/save')) {
      const pageId = path.split('/')[2].split('?')[0];
      
      const pages = await sql`SELECT * FROM pages WHERE id = ${pageId}`;
      
      if (pages.length === 0) {
        return res.status(404).json({ success: false, error: 'Page not found' });
      }
      
      const page = pages[0];
      
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
      
      return res.status(200).json({ success: true, data: page });
    }

    // Update page
    if (path.startsWith('/pages/') && method === 'PUT') {
      const pageId = path.split('/')[2];
      const { name } = req.body;
      
      await sql`
        UPDATE pages 
        SET name = ${name}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${pageId}
      `;
      
      return res.status(200).json({ success: true, message: 'Page updated' });
    }

    // Delete page
    if (path.startsWith('/pages/') && method === 'DELETE') {
      const pageId = path.split('/')[2];
      
      if (pageId === 'default') {
        return res.status(400).json({ success: false, error: 'Cannot delete default page' });
      }
      
      await sql`DELETE FROM pages WHERE id = ${pageId}`;
      
      return res.status(200).json({ success: true, message: 'Page deleted' });
    }

    // Save complete page data
    if (path.match(/\/pages\/.*\/save/) && method === 'POST') {
      const pageId = path.split('/')[2];
      const { sections } = req.body;
      
      await sql`DELETE FROM sections WHERE page_id = ${pageId}`;
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionId = section.id || Date.now() + i;
        
        await sql`
          INSERT INTO sections (id, page_id, headline, position) 
          VALUES (${sectionId}, ${pageId}, ${section.headline}, ${i})
        `;
        
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
      
      return res.status(200).json({ success: true, message: 'Page saved successfully' });
    }

    // Create share link
    if (path.match(/\/share\/[^/]+$/) && method === 'POST') {
      const pageId = path.split('/')[2];
      
      const pages = await sql`SELECT id FROM pages WHERE id = ${pageId}`;
      if (pages.length === 0) {
        return res.status(404).json({ success: false, error: 'Page not found' });
      }
      
      const shortCode = nanoid(8);
      
      await sql`
        INSERT INTO share_links (short_code, page_id) 
        VALUES (${shortCode}, ${pageId})
      `;
      
      return res.status(200).json({ success: true, data: { shortCode } });
    }

    // Get shared page
    if (path.match(/\/share\/[a-zA-Z0-9]+$/) && method === 'GET') {
      const shortCode = path.split('/')[2];
      
      const links = await sql`
        SELECT page_id FROM share_links WHERE short_code = ${shortCode}
      `;
      
      if (links.length === 0) {
        return res.status(404).json({ success: false, error: 'Share link not found' });
      }
      
      const pageId = links[0].page_id;
      
      const pages = await sql`SELECT * FROM pages WHERE id = ${pageId}`;
      
      if (pages.length === 0) {
        return res.status(404).json({ success: false, error: 'Page not found' });
      }
      
      const page = pages[0];
      
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
      
      return res.status(200).json({ success: true, data: page });
    }

    return res.status(404).json({ success: false, error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
