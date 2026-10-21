// POST /api/upload  - saves the latest attrition data so EVERY visitor sees the same report.
// Needs: a Vercel Blob store connected to the project, and an ADMIN_PASSWORD environment variable.
const crypto = require('crypto');

function sameText(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set in the Vercel project settings.' });
  if (!sameText(req.headers['x-admin-password'], pw)) return res.status(401).json({ error: 'Wrong password' });

  const b = req.body;
  if (!b || !Array.isArray(b.rows) || !b.rows.length || typeof b.asof !== 'number') {
    return res.status(400).json({ error: 'The uploaded data is empty or invalid.' });
  }

  try {
    const { put, list, del } = await import('@vercel/blob');
    const data = { v: 1, asof: b.asof, name: String(b.name || 'uploaded file').slice(0, 200), at: Date.now(), rows: b.rows };
    const saved = await put('attrition/data.json', JSON.stringify(data), {
      access: 'public', addRandomSuffix: true, contentType: 'application/json'
    });
    const { blobs } = await list({ prefix: 'attrition/' });
    const old = blobs.filter(x => x.url !== saved.url).map(x => x.url);
    if (old.length) await del(old); // keep only the newest upload
    const me = blobs.find(x => x.url === saved.url);
    const ver = new Date(me ? me.uploadedAt : Date.now()).toISOString();
    return res.status(200).json({ ok: true, name: data.name, at: data.at, ver });
  } catch (e) {
    return res.status(500).json({ error: 'Storage error: ' + (e && e.message ? e.message : e) + ' (is a Blob store connected to this project?)' });
  }
};
