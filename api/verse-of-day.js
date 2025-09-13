// API Route: /api/verse-of-day
// Vercel Serverless Function for Verse of the Day

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Lista de versículos inspiradores con referencias internacionales
    const inspirationalVerses = [
      {
        book: "john",
        bookDisplay: "Juan",
        chapter: 3,
        verse: 16,
        text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
        version: "es-rvr1960"
      },
      {
        book: "philippians",
        bookDisplay: "Filipenses",
        chapter: 4,
        verse: 13,
        text: "Todo lo puedo en Cristo que me fortalece.",
        version: "es-rvr1960"
      },
      {
        book: "psalms",
        bookDisplay: "Salmos",
        chapter: 23,
        verse: 1,
        text: "Jehová es mi pastor; nada me faltará.",
        version: "es-rvr1960"
      },
      {
        book: "proverbs",
        bookDisplay: "Proverbios",
        chapter: 3,
        verse: 5,
        text: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.",
        version: "es-rvr1960"
      },
      {
        book: "jeremiah",
        bookDisplay: "Jeremías",
        chapter: 29,
        verse: 11,
        text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.",
        version: "es-rvr1960"
      },
      {
        book: "isaiah",
        bookDisplay: "Isaías",
        chapter: 40,
        verse: 31,
        text: "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.",
        version: "es-rvr1960"
      },
      {
        book: "matthew",
        bookDisplay: "Mateo",
        chapter: 11,
        verse: 28,
        text: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.",
        version: "es-rvr1960"
      },
      {
        book: "romans",
        bookDisplay: "Romanos",
        chapter: 8,
        verse: 28,
        text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
        version: "es-rvr1960"
      }
    ];
    
    // Seleccionar versículo basado en el día del año
    const verseIndex = dayOfYear % inspirationalVerses.length;
    const selectedVerse = inspirationalVerses[verseIndex];
    
    // Intentar obtener desde GitHub API (usando la misma estrategia que chapter-improved)
    try {
      const githubUrl = `https://cdn.jsdelivr.net/gh/aruljohn/Bible-Database@master/json/spanish_rvr1960.json`;
      const response = await fetch(githubUrl);
      
      if (response.ok) {
        const bibleData = await response.json();
        const book = bibleData.find(b => b.book.toLowerCase().includes(selectedVerse.book.substring(0, 4)));
        
        if (book && book.chapters && book.chapters[selectedVerse.chapter - 1]) {
          const chapter = book.chapters[selectedVerse.chapter - 1];
          const verse = chapter.find(v => v.verse === selectedVerse.verse);
          
          if (verse) {
            return res.status(200).json({
              success: true,
              verse: {
                book: selectedVerse.bookDisplay,
                chapter: selectedVerse.chapter,
                verse: selectedVerse.verse,
                text: verse.text,
                version: selectedVerse.version,
                reference: `${selectedVerse.bookDisplay} ${selectedVerse.chapter}:${selectedVerse.verse}`,
                source: 'github-api'
              }
            });
          }
        }
      }
    } catch (githubError) {
      console.log('GitHub API fallback for verse of day:', githubError.message);
    }
    
    // Fallback a bible-api.com para versiones en inglés
    try {
      const bibleApiUrl = `https://bible-api.com/${selectedVerse.bookDisplay}+${selectedVerse.chapter}:${selectedVerse.verse}`;
      const response = await fetch(bibleApiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.text) {
          return res.status(200).json({
            success: true,
            verse: {
              book: selectedVerse.bookDisplay,
              chapter: selectedVerse.chapter,
              verse: selectedVerse.verse,
              text: data.text,
              version: 'en-kjv',
              reference: `${selectedVerse.bookDisplay} ${selectedVerse.chapter}:${selectedVerse.verse}`,
              source: 'bible-api'
            }
          });
        }
      }
    } catch (apiError) {
      console.log('Bible API fallback for verse of day:', apiError.message);
    }
    
    // Fallback a versículo local
    return res.status(200).json({
      success: true,
      verse: {
        book: selectedVerse.bookDisplay,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verse,
        text: selectedVerse.text,
        version: selectedVerse.version,
        reference: `${selectedVerse.bookDisplay} ${selectedVerse.chapter}:${selectedVerse.verse}`,
        source: 'local-fallback'
      }
    });
    
  } catch (error) {
    console.error('Error in verse of day API:', error);
    
    // Fallback de emergencia
    return res.status(200).json({
      success: true,
      verse: {
        book: "Juan",
        chapter: 3,
        verse: 16,
        text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
        version: "es-rvr1960",
        reference: "Juan 3:16",
        source: 'emergency-fallback'
      }
    });
  }
}