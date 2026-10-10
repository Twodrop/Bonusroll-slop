// Official Blizzard Game Data API. Needs BLIZZARD_CLIENT_ID / BLIZZARD_CLIENT_SECRET.
const QUALITY = { POOR: 0, COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5, ARTIFACT: 6, HEIRLOOM: 7 };

const clientId = process.env.BLIZZARD_CLIENT_ID;
const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;
const region = (process.env.BLIZZARD_REGION || 'eu').toLowerCase();
const locale = process.env.BLIZZARD_LOCALE || 'en_US';

let token = null;

const isConfigured = () => Boolean(clientId && clientSecret);

// Shares one in-flight token request between concurrent lookups.
function getToken() {
  if (!token || token.expiresAt <= Date.now()) {
    const entry = { expiresAt: Infinity };
    entry.value = requestToken().then(
      ({ accessToken, expiresIn }) => {
        // Refresh a minute early to avoid using a token right as it expires.
        entry.expiresAt = Date.now() + (expiresIn - 60) * 1000;
        return accessToken;
      },
      (err) => {
        if (token === entry) token = null;
        throw err;
      },
    );
    token = entry;
  }
  return token.value;
}

async function requestToken() {
  const res = await fetch('https://oauth.battle.net/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Blizzard OAuth HTTP ${res.status}`);
  const data = await res.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

async function apiGet(path) {
  const url = new URL(`https://${region}.api.blizzard.com${path}`);
  url.searchParams.set('namespace', `static-${region}`);
  url.searchParams.set('locale', locale);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${await getToken()}` } });
  if (res.status === 401) token = null;
  if (!res.ok) throw new Error(`Blizzard API HTTP ${res.status} for ${path}`);
  return res.json();
}

// The render CDN's non-US paths are missing many newer icons (they return 403),
// so always point at the US copy.
function normalizeIconUrl(url) {
  return url?.replace(/(render\.worldofwarcraft\.com\/)[a-z]{2}\//, '$1us/') ?? null;
}

async function getItem(id) {
  const [item, media] = await Promise.all([
    apiGet(`/data/wow/item/${id}`),
    apiGet(`/data/wow/media/item/${id}`),
  ]);
  return {
    name: item.name,
    quality: QUALITY[item.quality?.type] ?? 1,
    icon: normalizeIconUrl(media.assets?.find((a) => a.key === 'icon')?.value),
  };
}

module.exports = { isConfigured, getItem };
