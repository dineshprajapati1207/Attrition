// GET /api/data  - returns the most recently uploaded attrition data (same for every visitor).
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'attrition/' });
    if (!blobs.length) return res.status(404).json({ error: 'No file has been uploaded yet' });
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const r = await fetch(latest.url, { cache: 'no-store' });
    if (!r.ok) return res.status(502).json({ error: 'Could not read the stored file' });
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(await r.text());
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
