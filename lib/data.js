// Enum.ItemCreationContext values the bonus roll prompt can report.
const CONTEXTS = {
  0: 'Unknown',
  1: 'Dungeon Normal',
  2: 'Dungeon Heroic',
  3: 'Raid Normal',
  4: 'Raid Finder',
  5: 'Raid Heroic',
  6: 'Raid Mythic',
  7: 'PvP Unranked',
  8: 'PvP Ranked',
  9: 'Scenario Normal',
  10: 'Scenario Heroic',
  16: 'Mythic+',
  23: 'Dungeon Mythic',
};

const MYTHIC_PLUS_CONTEXTS = new Set([16]);

// Specialization IDs -> class / spec.
const SPECS = {
  62: ['mage', 'Arcane'], 63: ['mage', 'Fire'], 64: ['mage', 'Frost'],
  65: ['paladin', 'Holy'], 66: ['paladin', 'Protection'], 70: ['paladin', 'Retribution'],
  71: ['warrior', 'Arms'], 72: ['warrior', 'Fury'], 73: ['warrior', 'Protection'],
  102: ['druid', 'Balance'], 103: ['druid', 'Feral'], 104: ['druid', 'Guardian'], 105: ['druid', 'Restoration'],
  250: ['deathknight', 'Blood'], 251: ['deathknight', 'Frost'], 252: ['deathknight', 'Unholy'],
  253: ['hunter', 'Beast Mastery'], 254: ['hunter', 'Marksmanship'], 255: ['hunter', 'Survival'],
  256: ['priest', 'Discipline'], 257: ['priest', 'Holy'], 258: ['priest', 'Shadow'],
  259: ['rogue', 'Assassination'], 260: ['rogue', 'Outlaw'], 261: ['rogue', 'Subtlety'],
  262: ['shaman', 'Elemental'], 263: ['shaman', 'Enhancement'], 264: ['shaman', 'Restoration'],
  265: ['warlock', 'Affliction'], 266: ['warlock', 'Demonology'], 267: ['warlock', 'Destruction'],
  268: ['monk', 'Brewmaster'], 269: ['monk', 'Windwalker'], 270: ['monk', 'Mistweaver'],
  577: ['demonhunter', 'Havoc'], 581: ['demonhunter', 'Vengeance'], 1480: ['demonhunter', 'Devourer'],
  1467: ['evoker', 'Devastation'], 1468: ['evoker', 'Preservation'], 1473: ['evoker', 'Augmentation'],
};

const CLASS_NAMES = {
  deathknight: 'Death Knight', demonhunter: 'Demon Hunter', druid: 'Druid', evoker: 'Evoker',
  hunter: 'Hunter', mage: 'Mage', monk: 'Monk', paladin: 'Paladin', priest: 'Priest',
  rogue: 'Rogue', shaman: 'Shaman', warlock: 'Warlock', warrior: 'Warrior',
};

function describeContext(id) {
  return CONTEXTS[id] ?? `Context ${id}`;
}

function describeSpec(id) {
  const spec = SPECS[id];
  if (!spec) return { id, name: id ? `Spec ${id}` : 'Unknown', className: null, classKey: null };
  const [classKey, name] = spec;
  return { id, name, classKey, className: CLASS_NAMES[classKey] };
}

module.exports = { describeContext, describeSpec, MYTHIC_PLUS_CONTEXTS };
