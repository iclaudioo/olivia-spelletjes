// Geeft het familie-token terug, maar alleen aan wie het familie-geheim kent
// (?geheim=... in de koppel-link). Zo kan een toevallige bezoeker van de site
// het token niet meer ophalen; gekoppelde toestellen hebben dit endpoint niet nodig.
import { timingSafeEqual } from 'node:crypto';

function veiligGelijk(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'method not allowed' });
    return;
  }

  const ownerToken = process.env.OLIVIA_PANINI_OWNER_TOKEN?.trim();
  const familieGeheim = process.env.OLIVIA_FAMILIE_GEHEIM?.trim();
  if (!ownerToken || !familieGeheim) {
    response.status(503).json({ error: 'family entry is not configured' });
    return;
  }

  const gegeven = String(request.query?.geheim || '').trim();
  if (!gegeven || !veiligGelijk(gegeven, familieGeheim)) {
    response.status(403).json({ error: 'invalid family secret' });
    return;
  }

  response.status(200).json({ ownerToken });
}
