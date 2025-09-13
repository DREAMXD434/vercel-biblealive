// API Route: /api/version-history
// Vercel Serverless Function for managing Bible version history

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetHistory(req, res);
      case 'POST':
        return handleAddToHistory(req, res);
      case 'PUT':
        return handleUpdateHistory(req, res);
      case 'DELETE':
        return handleDeleteFromHistory(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling version history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// GET - Obtener historial de versiones
function handleGetHistory(req, res) {
  const { userId = 'default' } = req.query;
  
  // En un entorno real, esto se obtendría de una base de datos
  // Por ahora, retornamos un historial de ejemplo
  const mockHistory = {
    userId: userId,
    recentVersions: [
      { 
        id: 'en-kjv', 
        name: 'King James Version', 
        lang: 'en',
        lastUsed: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        usageCount: 15,
        favorite: true
      },
      { 
        id: 'es-rvr1960', 
        name: 'Reina-Valera 1960', 
        lang: 'es',
        lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        usageCount: 8,
        favorite: true
      },
      { 
        id: 'en-asv', 
        name: 'American Standard Version', 
        lang: 'en',
        lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        usageCount: 3,
        favorite: false
      },
      { 
        id: 'pt-acf', 
        name: 'Almeida Corrigida Fiel', 
        lang: 'pt',
        lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        usageCount: 1,
        favorite: false
      }
    ],
    favoriteVersions: [
      'en-kjv',
      'es-rvr1960'
    ],
    defaultVersion: 'en-kjv',
    lastSync: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    history: mockHistory
  });
}

// POST - Agregar versión al historial
function handleAddToHistory(req, res) {
  const { versionId, versionName, lang, userId = 'default' } = req.body;
  
  if (!versionId || !versionName || !lang) {
    return res.status(400).json({
      success: false,
      error: 'versionId, versionName, and lang are required'
    });
  }

  // En un entorno real, esto se guardaría en una base de datos
  const historyEntry = {
    id: versionId,
    name: versionName,
    lang: lang,
    lastUsed: new Date().toISOString(),
    usageCount: 1,
    favorite: false,
    addedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    message: 'Version added to history',
    entry: historyEntry
  });
}

// PUT - Actualizar entrada del historial (ej: marcar como favorito)
function handleUpdateHistory(req, res) {
  const { versionId, favorite, usageCount, userId = 'default' } = req.body;
  
  if (!versionId) {
    return res.status(400).json({
      success: false,
      error: 'versionId is required'
    });
  }

  // En un entorno real, esto actualizaría la base de datos
  const updatedEntry = {
    id: versionId,
    lastUsed: new Date().toISOString(),
    favorite: favorite !== undefined ? favorite : false,
    usageCount: usageCount || 1
  };

  res.status(200).json({
    success: true,
    message: 'Version history updated',
    entry: updatedEntry
  });
}

// DELETE - Eliminar versión del historial
function handleDeleteFromHistory(req, res) {
  const { versionId, userId = 'default' } = req.body;
  
  if (!versionId) {
    return res.status(400).json({
      success: false,
      error: 'versionId is required'
    });
  }

  // En un entorno real, esto eliminaría de la base de datos
  res.status(200).json({
    success: true,
    message: 'Version removed from history',
    versionId: versionId
  });
}