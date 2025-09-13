const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde public
app.use(express.static('public'));

// CORS configuration y cache control
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.get('User-Agent') || 'Unknown'}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Disable cache for development
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Manejar las funciones de API de Vercel
app.use('/api', async (req, res) => {
  try {
    console.log(`API Request: ${req.method} ${req.path} with query:`, req.query);
    
    // Handle HEAD requests for health checks
    if (req.method === 'HEAD') {
      return res.status(200).end();
    }
    
    // Handle root API requests
    if (req.path === '/' || req.path === '') {
      return res.status(200).json({ 
        success: true, 
        message: 'Bible Alive API is running',
        endpoints: ['books', 'versions', 'chapter-improved', 'version-history', 'verse-of-day']
      });
    }
    
    // Obtener solo el primer segmento de la ruta
    const seg = req.path.replace(/^\/+/, '').replace(/^bible\//, ''); // Support /api/bible/* legacy routes
    const name = seg.split('/')[0];
    const apiFile = path.join(__dirname, 'api', name + '.js');
    
    console.log(`Looking for API file: ${apiFile} for endpoint: ${name}`);
    
    // Verificar si el archivo de API existe
    if (fs.existsSync(apiFile)) {
      delete require.cache[require.resolve(apiFile)];
      const mod = require(apiFile);
      const handler = mod.default || mod; // Support both CJS and ESM exports
      
      // Simular el objeto request/response de Vercel
      const vercelReq = {
        ...req,
        query: { ...req.query, ...req.params }
      };
      
      const vercelRes = {
        ...res,
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
          return vercelRes;
        },
        send: (data) => {
          res.send(data);
          return vercelRes;
        },
        setHeader: (name, value) => {
          res.setHeader(name, value);
          return vercelRes;
        },
        end: (data) => {
          res.end(data);
          return vercelRes;
        }
      };
      
      // Ejecutar la función de API
      await handler(vercelReq, vercelRes);
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manejar rutas de la aplicación (SPA) - Compatible con Express 5
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bible Alive server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 PWA ready for development and testing`);
  console.log(`🌐 External access: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});