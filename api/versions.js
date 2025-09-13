// API Route: /api/versions
// Vercel Serverless Function for Bible Versions

const bibleVersions = [
  // Español - Versiones populares disponibles
  { 
    id: 'es-rvr1960', 
    apiId: 'es-rvr1960',
    name: 'Reina-Valera 1960', 
    lang: 'es', 
    description: 'Versión tradicional en español más popular',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'es-pddpt', 
    apiId: 'es-pddpt',
    name: 'La Palabra de Dios para Todos', 
    lang: 'es', 
    description: 'Traducción moderna y clara en español',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'es-valera', 
    apiId: 'es-valera',
    name: 'Sagradas Escrituras (1569)', 
    lang: 'es', 
    description: 'Traducción histórica de Casiodoro de Reina',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: false
  },
  
  // Inglés - Versiones disponibles en GitHub API
  { 
    id: 'en-kjv', 
    apiId: 'en-kjv',
    name: 'King James Version', 
    lang: 'en', 
    description: 'Classic English translation (1611)',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-niv2011', 
    apiId: 'NIV2011',
    name: 'NIV 2011 Updated', 
    lang: 'en', 
    description: 'Updated New International Version',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-asv', 
    apiId: 'en-asv',
    name: 'American Standard Version', 
    lang: 'en', 
    description: 'Accurate English translation (1901)',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-web', 
    apiId: 'en-web',
    name: 'World English Bible', 
    lang: 'en', 
    description: 'Modern public domain English translation',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-ylt', 
    apiId: 'en-ylt',
    name: 'Young\'s Literal Translation', 
    lang: 'en', 
    description: 'Literal word-for-word translation',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: false
  },
  
  // Español - Versiones adicionales de Bolls API
  { 
    id: 'es-rvr1909', 
    apiId: 'RVR1909',
    name: 'Reina-Valera 1909', 
    lang: 'es', 
    description: 'Versión histórica Reina-Valera',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: false
  },
  { 
    id: 'es-rvr1995', 
    apiId: 'RVR1995',
    name: 'Reina-Valera 1995', 
    lang: 'es', 
    description: 'Versión actualizada Reina-Valera',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'es-rvr2000', 
    apiId: 'RVR2000',
    name: 'Reina-Valera 2000', 
    lang: 'es', 
    description: 'Versión contemporánea Reina-Valera',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'es-ntv', 
    apiId: 'NTV',
    name: 'Nueva Traducción Viviente', 
    lang: 'es', 
    description: 'Traducción moderna y clara en español contemporáneo',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'es-lbla', 
    apiId: 'LBLA',
    name: 'La Biblia de las Américas', 
    lang: 'es', 
    description: 'Traducción fiel y exacta en español',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'es-dra', 
    apiId: 'DRA',
    name: 'Dios Habla Hoy', 
    lang: 'es', 
    description: 'Versión Popular en español sencillo',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'es-btx', 
    apiId: 'BTX',
    name: 'Biblia Textual', 
    lang: 'es', 
    description: 'Traducción basada en textos originales',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'es-nvi', 
    apiId: 'NVI',
    name: 'Nueva Versión Internacional', 
    lang: 'es', 
    description: 'Traducción moderna en español',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },

  // Inglés - Versiones adicionales de Bolls API
  { 
    id: 'en-niv', 
    apiId: 'NIV',
    name: 'New International Version', 
    lang: 'en', 
    description: 'Popular modern English translation',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-esv', 
    apiId: 'ESV',
    name: 'English Standard Version', 
    lang: 'en', 
    description: 'Contemporary English translation',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-nlt', 
    apiId: 'NLT',
    name: 'New Living Translation', 
    lang: 'en', 
    description: 'Easy-to-read modern English',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-nasb', 
    apiId: 'NASB',
    name: 'New American Standard Bible', 
    lang: 'en', 
    description: 'Accurate literal translation',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-amp', 
    apiId: 'AMP',
    name: 'Amplified Bible', 
    lang: 'en', 
    description: 'Expanded translation with detailed meanings',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-msg', 
    apiId: 'MSG',
    name: 'The Message', 
    lang: 'en', 
    description: 'Contemporary paraphrase by Eugene Peterson',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-nkjv', 
    apiId: 'NKJV',
    name: 'New King James Version', 
    lang: 'en', 
    description: 'Modern update of the King James Version',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'en-csb', 
    apiId: 'CSB',
    name: 'Christian Standard Bible', 
    lang: 'en', 
    description: 'Balance of accuracy and readability',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },

  // Português
  { 
    id: 'pt-acf', 
    apiId: 'pt-acf',
    name: 'Almeida Corrigida Fiel', 
    lang: 'pt', 
    description: 'Tradução tradicional em português',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'pt-ara', 
    apiId: 'ARA',
    name: 'Almeida Revista e Atualizada', 
    lang: 'pt', 
    description: 'Versão atualizada em português',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'pt-nvi', 
    apiId: 'NVI-PT',
    name: 'Nova Versão Internacional', 
    lang: 'pt', 
    description: 'Tradução moderna em português',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },

  // Français
  { 
    id: 'fr-bdm', 
    apiId: 'fr-bdm',
    name: 'Bible de David Martin', 
    lang: 'fr', 
    description: 'Traduction française classique',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'fr-lsg', 
    apiId: 'LSG',
    name: 'Louis Segond 1910', 
    lang: 'fr', 
    description: 'Traduction française traditionnelle',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'fr-bds', 
    apiId: 'BDS',
    name: 'Bible du Semeur', 
    lang: 'fr', 
    description: 'Traduction française contemporaine',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },

  // Deutsch
  { 
    id: 'de-schlachter', 
    apiId: 'de-schlachter',
    name: 'Schlachter Bibel', 
    lang: 'de', 
    description: 'Deutsche Bibelübersetzung',
    apiSource: 'github',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'de-luther', 
    apiId: 'LUTHER',
    name: 'Luther Bibel 1984', 
    lang: 'de', 
    description: 'Deutsche Lutherübersetzung',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },

  // Italiano
  { 
    id: 'it-cei', 
    apiId: 'CEI',
    name: 'Conferenza Episcopale Italiana', 
    lang: 'it', 
    description: 'Traduzione italiana cattolica',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  { 
    id: 'it-riveduta', 
    apiId: 'RIVEDUTA',
    name: 'Bibbia della Riveduta', 
    lang: 'it', 
    description: 'Traduzione italiana classica',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },

  // Русский (Russian)
  { 
    id: 'ru-synodal', 
    apiId: 'SYNODAL',
    name: 'Синодальный перевод', 
    lang: 'ru', 
    description: 'Традиционный русский перевод',
    apiSource: 'bolls',
    scope: 'Complete Bible',
    popular: true
  },
  
  // Idiomas antiguos/originales
  { 
    id: 'he-wlc', 
    apiId: 'he-wlc',
    name: 'Westminster Leningrad Codex', 
    lang: 'he', 
    description: 'Texto hebreo del Antiguo Testamento',
    apiSource: 'github',
    scope: 'Old Testament',
    popular: false
  },
  { 
    id: 'grc-srgnt', 
    apiId: 'grc-srgnt',
    name: 'SBL Greek New Testament', 
    lang: 'grc', 
    description: 'Texto griego del Nuevo Testamento',
    apiSource: 'github',
    scope: 'New Testament',
    popular: false
  },
  
  // Fallback - Bible API versiones
  { 
    id: 'kjv-fallback', 
    apiId: 'kjv',
    name: 'King James Version (Fallback)', 
    lang: 'en', 
    description: 'KJV from bible-api.com',
    apiSource: 'bible-api',
    scope: 'Complete Bible',
    popular: false
  }
];

module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Set cache headers for performance
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200'); // 24h cache, 12h stale
  
  res.status(200).json({ success: true, versions: bibleVersions });
}