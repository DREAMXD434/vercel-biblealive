// API Route: /api/books
// Vercel Serverless Function for Bible Books

const bibleBooks = [
  // Antiguo Testamento
  { id: 1, name: 'Génesis', nameEn: 'Genesis', chapters: 50, testament: 'Antiguo' },
  { id: 2, name: 'Éxodo', nameEn: 'Exodus', chapters: 40, testament: 'Antiguo' },
  { id: 3, name: 'Levítico', nameEn: 'Leviticus', chapters: 27, testament: 'Antiguo' },
  { id: 4, name: 'Números', nameEn: 'Numbers', chapters: 36, testament: 'Antiguo' },
  { id: 5, name: 'Deuteronomio', nameEn: 'Deuteronomy', chapters: 34, testament: 'Antiguo' },
  { id: 6, name: 'Josué', nameEn: 'Joshua', chapters: 24, testament: 'Antiguo' },
  { id: 7, name: 'Jueces', nameEn: 'Judges', chapters: 21, testament: 'Antiguo' },
  { id: 8, name: 'Rut', nameEn: 'Ruth', chapters: 4, testament: 'Antiguo' },
  { id: 9, name: '1 Samuel', nameEn: '1 Samuel', chapters: 31, testament: 'Antiguo' },
  { id: 10, name: '2 Samuel', nameEn: '2 Samuel', chapters: 24, testament: 'Antiguo' },
  { id: 11, name: '1 Reyes', nameEn: '1 Kings', chapters: 22, testament: 'Antiguo' },
  { id: 12, name: '2 Reyes', nameEn: '2 Kings', chapters: 25, testament: 'Antiguo' },
  { id: 13, name: '1 Crónicas', nameEn: '1 Chronicles', chapters: 29, testament: 'Antiguo' },
  { id: 14, name: '2 Crónicas', nameEn: '2 Chronicles', chapters: 36, testament: 'Antiguo' },
  { id: 15, name: 'Esdras', nameEn: 'Ezra', chapters: 10, testament: 'Antiguo' },
  { id: 16, name: 'Nehemías', nameEn: 'Nehemiah', chapters: 13, testament: 'Antiguo' },
  { id: 17, name: 'Ester', nameEn: 'Esther', chapters: 10, testament: 'Antiguo' },
  { id: 18, name: 'Job', nameEn: 'Job', chapters: 42, testament: 'Antiguo' },
  { id: 19, name: 'Salmos', nameEn: 'Psalms', chapters: 150, testament: 'Antiguo' },
  { id: 20, name: 'Proverbios', nameEn: 'Proverbs', chapters: 31, testament: 'Antiguo' },
  { id: 21, name: 'Eclesiastés', nameEn: 'Ecclesiastes', chapters: 12, testament: 'Antiguo' },
  { id: 22, name: 'Cantares', nameEn: 'Song of Songs', chapters: 8, testament: 'Antiguo' },
  { id: 23, name: 'Isaías', nameEn: 'Isaiah', chapters: 66, testament: 'Antiguo' },
  { id: 24, name: 'Jeremías', nameEn: 'Jeremiah', chapters: 52, testament: 'Antiguo' },
  { id: 25, name: 'Lamentaciones', nameEn: 'Lamentations', chapters: 5, testament: 'Antiguo' },
  { id: 26, name: 'Ezequiel', nameEn: 'Ezekiel', chapters: 48, testament: 'Antiguo' },
  { id: 27, name: 'Daniel', nameEn: 'Daniel', chapters: 12, testament: 'Antiguo' },
  { id: 28, name: 'Oseas', nameEn: 'Hosea', chapters: 14, testament: 'Antiguo' },
  { id: 29, name: 'Joel', nameEn: 'Joel', chapters: 3, testament: 'Antiguo' },
  { id: 30, name: 'Amós', nameEn: 'Amos', chapters: 9, testament: 'Antiguo' },
  { id: 31, name: 'Abdías', nameEn: 'Obadiah', chapters: 1, testament: 'Antiguo' },
  { id: 32, name: 'Jonás', nameEn: 'Jonah', chapters: 4, testament: 'Antiguo' },
  { id: 33, name: 'Miqueas', nameEn: 'Micah', chapters: 7, testament: 'Antiguo' },
  { id: 34, name: 'Nahúm', nameEn: 'Nahum', chapters: 3, testament: 'Antiguo' },
  { id: 35, name: 'Habacuc', nameEn: 'Habakkuk', chapters: 3, testament: 'Antiguo' },
  { id: 36, name: 'Sofonías', nameEn: 'Zephaniah', chapters: 3, testament: 'Antiguo' },
  { id: 37, name: 'Hageo', nameEn: 'Haggai', chapters: 2, testament: 'Antiguo' },
  { id: 38, name: 'Zacarías', nameEn: 'Zechariah', chapters: 14, testament: 'Antiguo' },
  { id: 39, name: 'Malaquías', nameEn: 'Malachi', chapters: 4, testament: 'Antiguo' },
  
  // Nuevo Testamento
  { id: 40, name: 'Mateo', nameEn: 'Matthew', chapters: 28, testament: 'Nuevo' },
  { id: 41, name: 'Marcos', nameEn: 'Mark', chapters: 16, testament: 'Nuevo' },
  { id: 42, name: 'Lucas', nameEn: 'Luke', chapters: 24, testament: 'Nuevo' },
  { id: 43, name: 'Juan', nameEn: 'John', chapters: 21, testament: 'Nuevo' },
  { id: 44, name: 'Hechos', nameEn: 'Acts', chapters: 28, testament: 'Nuevo' },
  { id: 45, name: 'Romanos', nameEn: 'Romans', chapters: 16, testament: 'Nuevo' },
  { id: 46, name: '1 Corintios', nameEn: '1 Corinthians', chapters: 16, testament: 'Nuevo' },
  { id: 47, name: '2 Corintios', nameEn: '2 Corinthians', chapters: 13, testament: 'Nuevo' },
  { id: 48, name: 'Gálatas', nameEn: 'Galatians', chapters: 6, testament: 'Nuevo' },
  { id: 49, name: 'Efesios', nameEn: 'Ephesians', chapters: 6, testament: 'Nuevo' },
  { id: 50, name: 'Filipenses', nameEn: 'Philippians', chapters: 4, testament: 'Nuevo' },
  { id: 51, name: 'Colosenses', nameEn: 'Colossians', chapters: 4, testament: 'Nuevo' },
  { id: 52, name: '1 Tesalonicenses', nameEn: '1 Thessalonians', chapters: 5, testament: 'Nuevo' },
  { id: 53, name: '2 Tesalonicenses', nameEn: '2 Thessalonians', chapters: 3, testament: 'Nuevo' },
  { id: 54, name: '1 Timoteo', nameEn: '1 Timothy', chapters: 6, testament: 'Nuevo' },
  { id: 55, name: '2 Timoteo', nameEn: '2 Timothy', chapters: 4, testament: 'Nuevo' },
  { id: 56, name: 'Tito', nameEn: 'Titus', chapters: 3, testament: 'Nuevo' },
  { id: 57, name: 'Filemón', nameEn: 'Philemon', chapters: 1, testament: 'Nuevo' },
  { id: 58, name: 'Hebreos', nameEn: 'Hebrews', chapters: 13, testament: 'Nuevo' },
  { id: 59, name: 'Santiago', nameEn: 'James', chapters: 5, testament: 'Nuevo' },
  { id: 60, name: '1 Pedro', nameEn: '1 Peter', chapters: 5, testament: 'Nuevo' },
  { id: 61, name: '2 Pedro', nameEn: '2 Peter', chapters: 3, testament: 'Nuevo' },
  { id: 62, name: '1 Juan', nameEn: '1 John', chapters: 5, testament: 'Nuevo' },
  { id: 63, name: '2 Juan', nameEn: '2 John', chapters: 1, testament: 'Nuevo' },
  { id: 64, name: '3 Juan', nameEn: '3 John', chapters: 1, testament: 'Nuevo' },
  { id: 65, name: 'Judas', nameEn: 'Jude', chapters: 1, testament: 'Nuevo' },
  { id: 66, name: 'Apocalipsis', nameEn: 'Revelation', chapters: 22, testament: 'Nuevo' }
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
  
  res.status(200).json({ success: true, books: bibleBooks });
}