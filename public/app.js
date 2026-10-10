const form = document.getElementById('form');
const input = document.getElementById('input');
const button = form.querySelector('button');
const statusEl = document.getElementById('status');
const results = document.getElementById('results');
const rows = document.getElementById('rows');
const characterEl = document.getElementById('character');

const ICON_BASE = 'https://render.worldofwarcraft.com/us/icons/56';
const CLASS_ICON = (key) => `${ICON_BASE}/classicon_${key}.jpg`;
const MISSING_ICON = `${ICON_BASE}/inv_misc_questionmark.jpg`;

// Blizzard's CDN doesn't have every icon; swap in a placeholder, or hide it, if one fails.
function icon(src, className, { hideOnError = false } = {}) {
  const img = el('img', { class: className, src, alt: '', loading: 'lazy' });
  img.addEventListener('error', () => {
    if (hideOnError) img.remove();
    else if (img.src !== MISSING_ICON) img.src = MISSING_ICON;
  });
  return img;
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children.filter((c) => c != null));
  return node;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
  statusEl.hidden = !message;
}

function difficultyClass(difficulty) {
  const d = difficulty.toLowerCase();
  if (d.includes('mythic')) return 'mythic';
  if (d.includes('heroic')) return 'heroic';
  if (d.includes('finder')) return 'lfr';
  if (d.includes('normal')) return 'normal';
  return '';
}

function renderRow(entry) {
  const { item, source, spec } = entry;

  const itemCell = el('td', {},
    el('div', { class: 'cell' },
      icon(item.icon, 'icon'),
      el('a', { href: item.url, target: '_blank', rel: 'noopener', class: `q${item.quality}` }, item.name),
    ),
  );

  const bossCell = el('td', {},
    el('a', { href: source.url, target: '_blank', rel: 'noopener', title: source.name }, source.boss),
  );

  const diffCell = el('td', {},
    el('span', { class: `badge ${difficultyClass(entry.difficulty)}` }, entry.difficulty),
    entry.keyLevel ? el('div', { class: 'sub' }, `+${entry.keyLevel}`) : null,
  );

  const specCell = el('td', {},
    el('div', { class: 'cell' },
      spec.classKey ? icon(CLASS_ICON(spec.classKey), 'icon small', { hideOnError: true }) : null,
      el('span', { class: spec.classKey ? `c-${spec.classKey}` : '' },
        spec.className ? `${spec.name} ${spec.className}` : spec.name),
    ),
  );

  return el('tr', {}, itemCell, bossCell, diffCell, specCell);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return setStatus('Paste a SimC string first.', true);

  button.disabled = true;
  results.hidden = true;
  setStatus('Looking up items…');

  try {
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: text,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

    if (!data.entries.length) {
      setStatus('The bonus_roll_items line is empty: no bonus rolls recorded this season.');
      return;
    }

    const { character } = data;
    characterEl.textContent = '';
    characterEl.append(
      el('span', { class: character.classKey ? `c-${character.classKey}` : '' }, character.name ?? 'Unknown character'),
      character.region ? el('span', { class: 'sub' }, `  ${character.region}`) : null,
      el('span', { class: 'sub' }, ` · ${data.entries.length} bonus roll item${data.entries.length === 1 ? '' : 's'}`),
    );
    rows.replaceChildren(...data.entries.map(renderRow));
    results.hidden = false;
    setStatus('');
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    button.disabled = false;
  }
});
