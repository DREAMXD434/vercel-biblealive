// API Route: /api/reading-plans
// Vercel Serverless Function for Reading Plans

const readingPlans = [
  { id: 1, name: 'Biblia en un año', duration: 365, description: 'Lee toda la Biblia en 365 días' },
  { id: 2, name: 'Nuevo Testamento en 3 meses', duration: 90, description: 'Completa el Nuevo Testamento' },
  { id: 3, name: 'Salmos y Proverbios', duration: 60, description: 'Sabiduría diaria' },
  { id: 4, name: 'Evangelios', duration: 30, description: 'Los cuatro evangelios en un mes' },
  { id: 5, name: 'Epistolas de Pablo', duration: 45, description: 'Las cartas del apóstol Pablo' }
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
  
  res.status(200).json({ success: true, plans: readingPlans });
}