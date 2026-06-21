export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'method not allowed' });
    return;
  }

  const ownerToken = process.env.OLIVIA_PANINI_OWNER_TOKEN?.trim();
  if (!ownerToken) {
    response.status(503).json({ error: 'panini owner token is not configured' });
    return;
  }

  response.status(200).json({ ownerToken });
}
