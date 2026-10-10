const { describeContext, describeSpec, MYTHIC_PLUS_CONTEXTS } = require('./data');

const MAX_ENTRIES = 500;

// Header looks like: "# Name - Spec - 2026-10-10 21:32 - EU/Realm"
function parseCharacter(text) {
  const header = text.match(/^#\s*(.+?)\s+-\s+(.+?)\s+-\s+[\d-]+\s+[\d:]+\s+-\s+(\S+)/m);
  const classLine = text.match(/^(deathknight|demonhunter|druid|evoker|hunter|mage|monk|paladin|priest|rogue|shaman|warlock|warrior)="([^"]*)"/m);
  return {
    name: classLine?.[2] ?? header?.[1] ?? null,
    classKey: classLine?.[1] ?? null,
    region: header?.[3] ?? null,
  };
}

// The addon writes entries as currency:source:context:keyLevel:itemId:spec, joined by "/".
// "source" is the display item of the bonus roll prompt (e.g. "Nebulous Voidcache: <Boss>").
function parseBonusRolls(text) {
  const match = text.match(/bonus_roll_items=(\S*)/);
  if (!match) return null;

  return match[1]
    .split('/')
    .filter(Boolean)
    .slice(0, MAX_ENTRIES)
    .map((raw) => raw.split(':').map(Number))
    .filter((f) => f.length === 6 && f.every(Number.isInteger))
    .map(([currencyId, sourceItemId, context, keyLevel, itemId, specId]) => ({
      currencyId,
      sourceItemId,
      itemId,
      context,
      difficulty: describeContext(context),
      keyLevel: MYTHIC_PLUS_CONTEXTS.has(context) && keyLevel > 0 ? keyLevel : null,
      spec: describeSpec(specId),
    }));
}

module.exports = { parseCharacter, parseBonusRolls };
