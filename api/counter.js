// Hand-rolled visitor counter — the authentic GeoCities pattern: a server-rendered
// SVG odometer embedded as an <img>, so the page stays zero client-JS and no trackers.
// Backed by Upstash Redis (REST). Counts page hits. Data stays Jesse's.
//
// Env (set in Vercel project settings):
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
//
// Until those are set, this renders a "warming up" dash row (HTTP 200) so the
// site degrades gracefully instead of showing a broken image.

const COUNTER_KEY = 'site:visits';

// Known non-human / preview fetchers — these GET the value but don't inflate it.
const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|vkshare|preview|fetch|monitor|curl|wget|headless|lighthouse|gtmetrix|pingdom|uptime/i;

async function upstash(url, token, path) {
  const res = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const data = await res.json();
  return data.result;
}

function renderSVG(value) {
  // value: number → padded count; null → dash placeholder ("warming up")
  const digits =
    value === null
      ? '-------'.split('')
      : String(value).padStart(7, '0').slice(-7).split('');

  const cw = 30,
    ch = 46,
    gap = 4,
    pad = 6;
  const width = pad * 2 + digits.length * cw + (digits.length - 1) * gap;
  const height = ch + pad * 2;
  const label = value === null ? 'visitor counter warming up' : `${value} visitors`;

  let cells = '';
  digits.forEach((d, i) => {
    const x = pad + i * (cw + gap);
    cells += `<rect x="${x}" y="${pad}" width="${cw}" height="${ch}" rx="4" fill="#0a0a0a" stroke="#3a3a3a" stroke-width="1"/>`;
    cells += `<text x="${x + cw / 2}" y="${pad + ch / 2 + 1}" fill="#ffb000" font-family="'Courier New',Courier,monospace" font-size="30" font-weight="bold" text-anchor="middle" dominant-baseline="central">${d}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
<rect x="0" y="0" width="${width}" height="${height}" rx="6" fill="#1a1a1a"/>
${cells}
</svg>`;
}

export default async function handler(req, res) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  let value = null;
  if (url && token) {
    try {
      const ua = String(req.headers['user-agent'] || '');
      const isBot = BOT_RE.test(ua);
      value = await upstash(url, token, isBot ? `get/${COUNTER_KEY}` : `incr/${COUNTER_KEY}`);
      value = Number(value) || 0;
    } catch (err) {
      // Don't break the page on a transient Redis hiccup — show placeholder.
      value = null;
    }
  }

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.status(200).send(renderSVG(value));
}
