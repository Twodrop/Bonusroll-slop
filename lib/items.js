const blizzard = require('./blizzard');

const FALLBACK_ICON = 'https://render.worldofwarcraft.com/us/icons/56/inv_misc_questionmark.jpg';
const cache = new Map();

function getItem(id) {
  if (!cache.has(id)) {
    const promise = blizzard.getItem(id)
      .then((data) => ({
        id,
        name: data.name || `Item ${id}`,
        quality: data.quality,
        icon: data.icon || FALLBACK_ICON,
        url: `https://www.wowhead.com/item=${id}`,
      }))
      .catch((err) => {
        console.warn(`Blizzard lookup failed for item ${id}: ${err.message}`);
        cache.delete(id); // allow a retry on the next request
        return { id, name: `Item ${id}`, quality: 1, icon: FALLBACK_ICON, url: `https://www.wowhead.com/item=${id}` };
      });
    cache.set(id, promise);
  }
  return cache.get(id);
}

async function getItems(ids) {
  const unique = [...new Set(ids)];
  const items = await Promise.all(unique.map(getItem));
  return new Map(items.map((item) => [item.id, item]));
}

// "Nebulous Voidcache: Ula'tek" -> "Ula'tek"
function bossFromSourceName(name) {
  const idx = name.indexOf(': ');
  return idx === -1 ? name : name.slice(idx + 2);
}

module.exports = { getItems, bossFromSourceName };
