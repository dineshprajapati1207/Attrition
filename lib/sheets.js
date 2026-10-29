// Shared Google Sheets reader for the Vercel serverless functions (api/*).
// Same logic as server.js, but stateless-friendly: a short in-memory cache per warm function
// instance plus CDN caching headers, because Vercel functions are not long-running servers.
const crypto = require('crypto');
const zlib = require('zlib');

const SHEETS = {
  attrition: process.env.ATTRITION_SHEET_ID || '1jT8Lo0SAdCnkhbg6oeqi-bVOIhEAIO1wrt2P1nakhwI',
  ta: process.env.TA_SHEET_ID || '1JELHBP1rJym7rxwgDGLzN45GzgULmrHZ15JhijXWtu8',
};
const CACHE_SECONDS = +process.env.CACHE_SECONDS || 30;

// ---------- Google auth (service-account JWT -> access token) ----------
let KEY = null, TOKEN = null;
function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }
function loadKey() {
  if (KEY) return KEY;
  let raw = (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '').trim(), k;
  if (!raw) throw httpErr(500, 'GOOGLE_SERVICE_ACCOUNT_JSON is not set. In Vercel: Settings > Environment Variables > add it (paste the whole service-account key JSON), then Redeploy.');
  // Accept the JSON as pasted, wrapped in quotes, or base64-encoded
  if (/^['"]/.test(raw) && raw.endsWith(raw[0])) raw = raw.slice(1, -1);
  if (!raw.startsWith('{')) { try { raw = Buffer.from(raw, 'base64').toString('utf8'); } catch (e) {} }
  try { k = JSON.parse(raw); } catch (e) { throw httpErr(500, 'GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON - paste the whole key file content.'); }
  if (!k.client_email || !k.private_key) throw httpErr(500, 'Service account key is missing client_email / private_key.');
  // Env-var editors often turn real line breaks into literal "\n" text (or add \r) - repair them
  k.private_key = k.private_key.replace(/\\n/g, '\n').replace(/\r/g, '').trim() + '\n';
  try { crypto.createPrivateKey(k.private_key); } catch (e) { throw httpErr(500, 'private_key in the service account key is damaged (' + e.message + '). Paste the key JSON again.'); }
  return KEY = k;
}
const b64u = b => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
async function token() {
  if (TOKEN && TOKEN.exp > Date.now() + 60e3) return TOKEN.v;
  const k = loadKey(), now = Math.floor(Date.now() / 1000);
  const claim = { iss: k.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 };
  const unsigned = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' + b64u(JSON.stringify(claim));
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(k.private_key);
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + b64u(sig) }),
  });
  const j = await r.json();
  if (!r.ok) {
    let m = j.error_description || j.error || String(r.status);
    if (/invalid jwt signature|invalid_grant/i.test(m)) m += ' - Google does not accept key ' + (k.private_key_id || '?') + ' for ' + k.client_email +
      '. The key was deleted/disabled in Google Cloud or belongs to another service account. Create a new JSON key and update GOOGLE_SERVICE_ACCOUNT_JSON.';
    throw httpErr(502, 'Google sign-in failed: ' + m);
  }
  TOKEN = { v: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return TOKEN.v;
}
async function gget(url) {
  const r = await fetch(url, { headers: { authorization: 'Bearer ' + await token() } });
  if (r.ok) return r.json();
  let m = ''; try { m = (await r.json()).error.message; } catch (e) {}
  if (r.status == 403 || r.status == 404) m = 'No access to the sheet (share it with ' + loadKey().client_email + ' as Viewer). ' + m;
  throw httpErr(r.status == 403 || r.status == 404 ? r.status : 502, m || 'Google API error ' + r.status);
}

// ---------- Sheet reader: every visible grid tab as raw values (dates as serial numbers) ----------
async function readSpreadsheet(id) {
  const base = 'https://sheets.googleapis.com/v4/spreadsheets/' + id;
  const meta = await gget(base + '?fields=properties.title,properties.timeZone,sheets.properties(title,sheetType,hidden)');
  const tabs = meta.sheets.map(s => s.properties).filter(p => p.sheetType == 'GRID' && !p.hidden).map(p => p.title);
  const out = [];
  for (let i = 0; i < tabs.length; i += 40) {
    const q = new URLSearchParams({ valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER', majorDimension: 'ROWS' });
    tabs.slice(i, i + 40).forEach(t => q.append('ranges', "'" + t.replace(/'/g, "''") + "'"));
    const j = await gget(base + '/values:batchGet?' + q);
    j.valueRanges.forEach((vr, k) => {
      const rows = vr.values || [];
      while (rows.length && !rows[rows.length - 1].some(c => c !== '' && c != null)) rows.pop(); // drop trailing blank rows (keeps the response small)
      out.push({ name: tabs[i + k], rows });
    });
  }
  return { title: meta.properties.title, fetchedAt: Date.now(), sheets: out };
}

// ---------- short in-memory cache (per warm instance) ----------
const CACHE = {}, INFLIGHT = {};
function refresh(key) {
  if (INFLIGHT[key]) return INFLIGHT[key];
  return INFLIGHT[key] = readSpreadsheet(SHEETS[key]).then(d => { CACHE[key] = { at: Date.now(), gz: zlib.gzipSync(JSON.stringify(d)) }; }).finally(() => { delete INFLIGHT[key]; });
}
async function cached(key, force) {
  const c = CACHE[key], age = c ? Date.now() - c.at : Infinity;
  if (c && age < (force ? 10e3 : CACHE_SECONDS * 1000)) return c.gz;
  try { await refresh(key); } catch (e) { if (!c) throw e; console.error(key, e.message); }
  return CACHE[key].gz;
}

function sheetHandler(key) {
  return async (req, res) => {
    try {
      const force = /(^|[?&])fresh=/.test(req.url || '');
      const gz = await cached(key, force);
      res.setHeader('content-type', 'application/json');
      res.setHeader('cache-control', force ? 'no-store' : 'public, s-maxage=15, stale-while-revalidate=30');
      res.setHeader('vary', 'accept-encoding');
      if (/\bgzip\b/.test(req.headers['accept-encoding'] || '')) { res.setHeader('content-encoding', 'gzip'); return res.status(200).send(gz); }
      return res.status(200).send(zlib.gunzipSync(gz));
    } catch (e) {
      res.setHeader('cache-control', 'no-store');
      return res.status(e.status || 500).json({ error: e.message });
    }
  };
}
async function health(req, res) {
  res.setHeader('cache-control', 'no-store');
  let key = {}; try { const k = loadKey(); key = { client_email: k.client_email, private_key_id: k.private_key_id, source: 'env GOOGLE_SERVICE_ACCOUNT_JSON' }; } catch (e) { key = { error: e.message }; }
  let google = 'ok'; try { await token(); } catch (e) { google = e.message; }
  res.status(200).json({ ok: google == 'ok', platform: 'vercel', sheets: Object.keys(SHEETS), key, google });
}
module.exports = { SHEETS, sheetHandler, health };
