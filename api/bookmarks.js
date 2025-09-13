// API Route: /api/bookmarks
// Vercel Serverless Function for Bookmarks (placeholder for future backend)

module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { verse, reference } = req.body;
    
    // Placeholder response - en producción esto se conectaría a una base de datos
    res.status(200).json({ 
      success: true, 
      message: 'Bookmark guardado (localmente)', 
      id: Date.now() 
    });
  } else if (req.method === 'GET') {
    res.status(200).json({ 
      success: true, 
      bookmarks: [] 
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}