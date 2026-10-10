const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch {
  // No .env file: rely on the real environment.
}

const express = require('express');
const { parseCharacter, parseBonusRolls } = require('./lib/parse');
const { getItems, bossFromSourceName } = require('./lib/items');
const blizzard = require('./lib/blizzard');

if (!blizzard.isConfigured()) {
  console.error('Missing BLIZZARD_CLIENT_ID / BLIZZARD_CLIENT_SECRET. Copy .env.example to .env and fill them in.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.text({ type: '*/*', limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/parse', async (req, res) => {
  const text = typeof req.body === 'string' ? req.body : '';
  const rolls = parseBonusRolls(text);
  if (!rolls) {
    return res.status(400).json({ error: 'No bonus_roll_items line found in that SimC string.' });
  }

  const items = await getItems(rolls.flatMap((r) => [r.itemId, r.sourceItemId]));
  const entries = rolls.map((r) => {
    const source = items.get(r.sourceItemId);
    return {
      ...r,
      item: items.get(r.itemId),
      source: { ...source, boss: bossFromSourceName(source.name) },
    };
  });

  res.json({ character: parseCharacter(text), entries });
});

app.listen(PORT, () => {
  console.log(`Bonus roll viewer running at http://localhost:${PORT}`);});
