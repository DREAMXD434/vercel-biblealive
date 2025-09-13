// API Route: /api/chapter-improved
// Enhanced Vercel Serverless Function for Bible Chapters using real Bible APIs

module.exports = async function handler(req, res) {
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

  try {
    const { book, chapter, version = 'en-kjv' } = req.query;
    
    if (!book || !chapter) {
      return res.status(400).json({ 
        success: false, 
        error: 'Book and chapter parameters are required' 
      });
    }

    // Normalize book name for APIs
    const bookName = normalizeBookName(book);
    
    // Get version details to determine which API to use
    const versionInfo = getVersionInfo(version);
    
    let chapterData = null;
    
    // Try wldeh Bible API first (supports 200+ versions)
    chapterData = await fetchFromWldehAPI(version, bookName, chapter);
    
    // Fallback to bible-api.com for English versions only (Bible-API only supports English KJV)
    if (!chapterData && (version.startsWith('en-') || version === 'kjv-fallback')) {
      chapterData = await fetchFromBibleAPI(bookName, chapter);
    }
    
    // Try Bolls API for specific versions (if needed)
    if (!chapterData && versionInfo.apiSource === 'bolls') {
      chapterData = await fetchFromBollsAPI(versionInfo.apiId, book, chapter);
    }
    
    // Final fallback handling
    if (!chapterData) {
      // For Spanish versions, return proper error instead of English content
      if (version.startsWith('es-')) {
        return res.status(503).json({
          success: false,
          error: 'Spanish Bible versions temporarily unavailable',
          message: 'Las versiones de la Biblia en español no están disponibles temporalmente. Inténtelo más tarde.',
          code: 503
        });
      }
      
      // For English versions, generate fallback content
      chapterData = generateFallbackChapter(book, chapter, version);
    }

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800'); // 1h cache, 30m stale
    
    res.status(200).json({
      success: true,
      book: book,
      chapter: parseInt(chapter),
      version: version,
      verses: chapterData.verses,
      totalVerses: chapterData.verses.length,
      apiSource: chapterData.source
    });
    
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Helper function to normalize book names for different APIs
function normalizeBookName(book) {
  const bookMappings = {
    'genesis': 'genesis',
    'génesis': 'genesis',
    'exodus': 'exodus',
    'éxodo': 'exodus',
    'leviticus': 'leviticus',
    'levítico': 'leviticus',
    'numbers': 'numbers',
    'números': 'numbers',
    'deuteronomy': 'deuteronomy',
    'deuteronomio': 'deuteronomy',
    'joshua': 'joshua',
    'josué': 'joshua',
    'judges': 'judges',
    'jueces': 'judges',
    'ruth': 'ruth',
    'rut': 'ruth',
    '1 samuel': '1samuel',
    '2 samuel': '2samuel',
    '1 kings': '1kings',
    '1 reyes': '1kings',
    '2 kings': '2kings',
    '2 reyes': '2kings',
    'psalms': 'psalms',
    'salmos': 'psalms',
    'proverbs': 'proverbs',
    'proverbios': 'proverbs',
    'ecclesiastes': 'ecclesiastes',
    'eclesiastés': 'ecclesiastes',
    'isaiah': 'isaiah',
    'isaías': 'isaiah',
    'jeremiah': 'jeremiah',
    'jeremías': 'jeremiah',
    'ezekiel': 'ezekiel',
    'ezequiel': 'ezekiel',
    'daniel': 'daniel',
    'matthew': 'matthew',
    'mateo': 'matthew',
    'mark': 'mark',
    'marcos': 'mark',
    'luke': 'luke',
    'lucas': 'luke',
    'john': 'john',
    'juan': 'john',
    'acts': 'acts',
    'hechos': 'acts',
    'romans': 'romans',
    'romanos': 'romans',
    '1 corinthians': '1corinthians',
    '1 corintios': '1corinthians',
    '2 corinthians': '2corinthians',
    '2 corintios': '2corinthians',
    'galatians': 'galatians',
    'gálatas': 'galatians',
    'ephesians': 'ephesians',
    'efesios': 'ephesians',
    'philippians': 'philippians',
    'filipenses': 'philippians',
    'colossians': 'colossians',
    'colosenses': 'colossians',
    '1 thessalonians': '1thessalonians',
    '1 tesalonicenses': '1thessalonians',
    '2 thessalonians': '2thessalonians',
    '2 tesalonicenses': '2thessalonians',
    '1 timothy': '1timothy',
    '1 timoteo': '1timothy',
    '2 timothy': '2timothy',
    '2 timoteo': '2timothy',
    'hebrews': 'hebrews',
    'hebreos': 'hebrews',
    'james': 'james',
    'santiago': 'james',
    '1 peter': '1peter',
    '1 pedro': '1peter',
    '2 peter': '2peter',
    '2 pedro': '2peter',
    '1 john': '1john',
    '1 juan': '1john',
    '2 john': '2john',
    '2 juan': '2john',
    '3 john': '3john',
    '3 juan': '3john',
    'revelation': 'revelation',
    'apocalipsis': 'revelation'
  };
  
  return bookMappings[book.toLowerCase()] || book.toLowerCase();
}

// Helper function to get version information
function getVersionInfo(version) {
  // Map internal version IDs to Bolls API IDs and sources
  const versionMap = {
    // Spanish
    'es-rvr1960': { apiId: 'RVR60', apiSource: 'bolls' },
    'es-pddpt': { apiId: 'PDDPT', apiSource: 'bolls' },
    'es-valera': { apiId: 'RVR1569', apiSource: 'bolls' },
    'es-rvr1909': { apiId: 'RVR1909', apiSource: 'bolls' },
    'es-btx': { apiId: 'BTX', apiSource: 'bolls' },
    'es-nvi': { apiId: 'NVI', apiSource: 'bolls' },
    
    // English
    'en-niv': { apiId: 'NIV', apiSource: 'bolls' },
    'en-esv': { apiId: 'ESV', apiSource: 'bolls' },
    'en-nlt': { apiId: 'NLT', apiSource: 'bolls' },
    'en-nasb': { apiId: 'NASB', apiSource: 'bolls' },
    
    // Portuguese
    'pt-ara': { apiId: 'ARA', apiSource: 'bolls' },
    'pt-nvi': { apiId: 'NVI-PT', apiSource: 'bolls' },
    
    // French
    'fr-lsg': { apiId: 'LSG', apiSource: 'bolls' },
    'fr-bds': { apiId: 'BDS', apiSource: 'bolls' },
    
    // German
    'de-luther': { apiId: 'LUTHER', apiSource: 'bolls' },
    
    // Italian
    'it-cei': { apiId: 'CEI', apiSource: 'bolls' },
    'it-riveduta': { apiId: 'RIVEDUTA', apiSource: 'bolls' },
    
    // Russian
    'ru-synodal': { apiId: 'SYNODAL', apiSource: 'bolls' },
    
    // Common English versions - explicitly mapped to avoid misattribution
    'en-kjv': { apiId: 'KJV', apiSource: 'bible-api' },
    'en-asv': { apiId: 'KJV', apiSource: 'bible-api' }, // Bible-api only supports KJV, so fallback but will be clearly labeled
    'en-web': { apiId: 'KJV', apiSource: 'bible-api' }, // Bible-api only supports KJV, so fallback but will be clearly labeled  
    'en-ylt': { apiId: 'KJV', apiSource: 'bible-api' }, // Bible-api only supports KJV, so fallback but will be clearly labeled
    'kjv-fallback': { apiId: 'KJV', apiSource: 'bible-api' }
  };
  
  return versionMap[version] || { apiId: version, apiSource: 'github' };
}

// Helper to map book names for Bolls API (uses book numbers)
function getBookNumberForBolls(bookName) {
  const bookNumbers = {
    'genesis': 1, 'génesis': 1,
    'exodus': 2, 'éxodo': 2,
    'leviticus': 3, 'levítico': 3,
    'numbers': 4, 'números': 4,
    'deuteronomy': 5, 'deuteronomio': 5,
    'joshua': 6, 'josué': 6,
    'judges': 7, 'jueces': 7,
    'ruth': 8, 'rut': 8,
    '1samuel': 9, '1 samuel': 9,
    '2samuel': 10, '2 samuel': 10,
    '1kings': 11, '1 reyes': 11,
    '2kings': 12, '2 reyes': 12,
    '1chronicles': 13, '1 crónicas': 13,
    '2chronicles': 14, '2 crónicas': 14,
    'ezra': 15, 'esdras': 15,
    'nehemiah': 16, 'nehemías': 16,
    'esther': 17, 'ester': 17,
    'job': 18,
    'psalms': 19, 'salmos': 19,
    'proverbs': 20, 'proverbios': 20,
    'ecclesiastes': 21, 'eclesiastés': 21,
    'songofsolomon': 22, 'cantares': 22,
    'isaiah': 23, 'isaías': 23,
    'jeremiah': 24, 'jeremías': 24,
    'lamentations': 25, 'lamentaciones': 25,
    'ezekiel': 26, 'ezequiel': 26,
    'daniel': 27,
    'hosea': 28, 'oseas': 28,
    'joel': 29,
    'amos': 30, 'amós': 30,
    'obadiah': 31, 'abdías': 31,
    'jonah': 32, 'jonás': 32,
    'micah': 33, 'miqueas': 33,
    'nahum': 34, 'nahúm': 34,
    'habakkuk': 35, 'habacuc': 35,
    'zephaniah': 36, 'sofonías': 36,
    'haggai': 37, 'hageo': 37,
    'zechariah': 38, 'zacarías': 38,
    'malachi': 39, 'malaquías': 39,
    'matthew': 40, 'mateo': 40,
    'mark': 41, 'marcos': 41,
    'luke': 42, 'lucas': 42,
    'john': 43, 'juan': 43,
    'acts': 44, 'hechos': 44,
    'romans': 45, 'romanos': 45,
    '1corinthians': 46, '1 corintios': 46,
    '2corinthians': 47, '2 corintios': 47,
    'galatians': 48, 'gálatas': 48,
    'ephesians': 49, 'efesios': 49,
    'philippians': 50, 'filipenses': 50,
    'colossians': 51, 'colosenses': 51,
    '1thessalonians': 52, '1 tesalonicenses': 52,
    '2thessalonians': 53, '2 tesalonicenses': 53,
    '1timothy': 54, '1 timoteo': 54,
    '2timothy': 55, '2 timoteo': 55,
    'titus': 56, 'tito': 56,
    'philemon': 57, 'filemón': 57,
    'hebrews': 58, 'hebreos': 58,
    'james': 59, 'santiago': 59,
    '1peter': 60, '1 pedro': 60,
    '2peter': 61, '2 pedro': 61,
    '1john': 62, '1 juan': 62,
    '2john': 63, '2 juan': 63,
    '3john': 64, '3 juan': 64,
    'jude': 65, 'judas': 65,
    'revelation': 66, 'apocalipsis': 66
  };
  
  return bookNumbers[bookName.toLowerCase()] || null;
}

// New: Fetch chapter from Bolls Bible API
async function fetchFromBollsAPI(apiId, book, chapter) {
  try {
    const bookNumber = getBookNumberForBolls(book);
    if (!bookNumber) {
      throw new Error(`Book "${book}" not found in Bolls API mapping`);
    }
    
    const url = `https://bolls.life/get-text/${apiId}/${bookNumber}/${chapter}/`;
    console.log('Calling Bolls API:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Bolls API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Bolls API response success:', !!data?.length);
    
    if (data && Array.isArray(data) && data.length > 0) {
      // Bolls API returns array of verse objects with 'pk' (verse number) and 'text'
      return {
        verses: data.map(v => ({
          verse: v.pk || v.verse || v.vs,
          text: (v.text || v.verse_text || '').trim()
        })).filter(v => v.text), // Filter out empty verses
        source: 'bolls-api'
      };
    }
    
    return null;
  } catch (error) {
    console.log('Bolls API error:', error.message);
    return null;
  }
}


// Primary: Fetch chapter from Wldeh Bible API (200+ versions)
async function fetchFromWldehAPI(version, book, chapter) {
  try {
    const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${version}/books/${book}/chapters/${chapter}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.verses) {
      return {
        verses: data.verses.map(v => ({
          verse: v.verse,
          text: v.text
        })),
        source: 'wldeh-api'
      };
    }
    
    return null;
  } catch (error) {
    console.log('Wldeh API error:', error.message);
    return null;
  }
}

// Primary: bible-api.com (most reliable)
async function fetchFromBibleAPI(book, chapter) {
  try {
    const url = `https://bible-api.com/${book}+${chapter}`;
    console.log('Calling Bible API:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Bible API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Bible API response success:', !!data?.verses);
    
    if (data && data.verses) {
      return {
        verses: data.verses.map(v => ({
          verse: v.verse,
          text: v.text.trim()
        })),
        source: 'bible-api'
      };
    }
    
    return null;
  } catch (error) {
    console.log('Bible API error:', error.message);
    return null;
  }
}

// Generate fallback chapter data
function generateFallbackChapter(book, chapter, version) {
  const verses = [];
  const versesInChapter = Math.floor(Math.random() * 30) + 5;
  
  for (let i = 1; i <= versesInChapter; i++) {
    verses.push({
      verse: i,
      text: `⚠️ CONTENIDO DE RESPALDO: Versículo ${i} del capítulo ${chapter} de ${book} (${version}). El texto real no está disponible en este momento.`
    });
  }
  
  return {
    verses,
    source: 'fallback-synthetic'
  };
}