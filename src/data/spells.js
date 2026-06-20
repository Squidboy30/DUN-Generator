/**
 * DUN Spell Data
 * Extracted from worldofarasca.dungeonuniversalis.com (Magus the Bright hero spell picker)
 * + rulebook p.38-40 for system rules
 *
 * 16 Lores across 4 God Realms:
 *   Elements:         Fire, Earth, Air, Water
 *   Light & Harmony:  Light, Blessings, Runic, Music
 *   Darkness:         Necromancy, Witchcraft, Underworld, Corruption
 *   Nature:           Nature, Tribal, Channeling, Animism
 *
 * Progression rules (p.79-80):
 *   - Each spell learned: +2 mana to pool, +2 VP
 *   - Mana pool cap: Intelligence × 3
 *   - Learning cost: coins (at School of Magic between quests)
 *   - Each spell can be cast max 3× per quest (Mana Potion resets one)
 *   - No two heroes in the same party can know the same spell
 *   - Sorcery levels: Apprentice (VP<15), Journeyman (VP 15-29), Archmage (VP≥30)
 *
 * manaCost: 1 = basic spell, 2+ = superior spell (cannot combine with move)
 */

// ─── LORE SYSTEM ─────────────────────────────────────────────────────────────
const LORE_REALMS = {
  'Elements':        ['Fire','Earth','Air','Water'],
  'Light & Harmony': ['Light','Blessings','Runic','Music'],
  'Darkness':        ['Necromancy','Witchcraft','Underworld','Corruption'],
  'Nature':          ['Nature','Tribal','Channeling','Animism'],
};

const LORE_COLORS = {
  Fire:'#c04020',  Earth:'#806030', Air:'#40a040',    Water:'#2060a0',
  Light:'#c0a020', Blessings:'#80c080', Runic:'#6040a0', Music:'#a06080',
  Necromancy:'#301040', Witchcraft:'#602080', Underworld:'#402060', Corruption:'#5a1e3a',
  Nature:'#206040', Tribal:'#804030', Channeling:'#305080', Animism:'#407060',
};

// Which classes can access which lores (rulebook p.38 + class cards)
const CLASS_LORES = {
  wizard:        ['Fire','Earth','Air','Water','Light','Blessings'],  // base — no Corruption/Underworld by default
  sorcerer:      ['Fire','Tribal'],          // tribal magic (race-restricted)
  animist:       ['Nature','Animism','Channeling'],
  necromancer:   ['Necromancy','Underworld','Corruption'],
  runic_master:  ['Runic','Earth','Light'],
  battle_wizard: ['Fire','Air','Light'],
};

// Race lore restrictions (most restrictive wins, rulebook p.78)
const RACE_LORE_BANS = {
  'Elves':       ['Corruption','Underworld'],
  'Amphibians':  ['Corruption','Underworld'],
  'Reptilians':  ['Corruption','Underworld'],
  'Ratfolk':     [],  // Fire and Corruption only (wizard)
};

// ─── SPELL DB ─────────────────────────────────────────────────────────────────
const SPELL_DB = [

  // ─── WATER ───────────────────────────────────────────────────────────────
  { id:197, name:"Crushing Wave",    lore:"Water", manaCost:1, learningCost:10 },
  { id:198, name:"Ice Arrows",       lore:"Water", manaCost:1, learningCost:10 },
  { id:298, name:"Ice Bridge",       lore:"Water", manaCost:1, learningCost:15 },
  { id:196, name:"Ice Wall",         lore:"Water", manaCost:1, learningCost:15 },
  { id:194, name:"Treacherous Waters",lore:"Water", manaCost:2, learningCost:20 },
  { id:195, name:"Walking on Water", lore:"Water", manaCost:1, learningCost:10 },
  { id:199, name:"Water Elemental",  lore:"Water", manaCost:2, learningCost:25 },
  { id:200, name:"Water of Life",    lore:"Water", manaCost:1, learningCost:15 },
  { id:201, name:"Water Shield",     lore:"Water", manaCost:1, learningCost:10 },
  { id:193, name:"Water Whip",       lore:"Water", manaCost:1, learningCost:15 },

  // ─── AIR ─────────────────────────────────────────────────────────────────
  { id:210, name:"Burst of Speed",   lore:"Air",   manaCost:1, learningCost:10 },
  { id:211, name:"Choke",            lore:"Air",   manaCost:1, learningCost:10 },
  { id:212, name:"Sneaking",         lore:"Air",   manaCost:1, learningCost:10 },

  // ─── CORRUPTION ──────────────────────────────────────────────────────────
  { id:220, name:"Bleeding",         lore:"Corruption", manaCost:1, learningCost:10 },
  { id:221, name:"Damage Mind",      lore:"Corruption", manaCost:1, learningCost:10 },
  { id:222, name:"Entrail Blast",    lore:"Corruption", manaCost:1, learningCost:15 },
  { id:223, name:"Great Tumors",     lore:"Corruption", manaCost:2, learningCost:20 },
  { id:224, name:"Hunger",           lore:"Corruption", manaCost:1, learningCost:10 },
  { id:225, name:"Inner Fire",       lore:"Corruption", manaCost:1, learningCost:10 },
  { id:226, name:"Marshy Ground",    lore:"Corruption", manaCost:1, learningCost:15 },
  { id:227, name:"Mind Corruption",  lore:"Corruption", manaCost:2, learningCost:20 },
  { id:228, name:"Panic",            lore:"Corruption", manaCost:1, learningCost:10 },
  { id:229, name:"Vile Vomit",       lore:"Corruption", manaCost:1, learningCost:15 },

  // ─── FIRE ────────────────────────────────────────────────────────────────
  { id:230, name:"Burning Fist",     lore:"Fire",  manaCost:1, learningCost:10 },
  { id:231, name:"Burning Ground",   lore:"Fire",  manaCost:1, learningCost:10 },
  { id:232, name:"Fire Elemental",   lore:"Fire",  manaCost:2, learningCost:25 },
  { id:233, name:"Fire Wall",        lore:"Fire",  manaCost:1, learningCost:15 },
  { id:234, name:"Fireball",         lore:"Fire",  manaCost:1, learningCost:15 },
  { id:235, name:"Firestorm",        lore:"Fire",  manaCost:2, learningCost:20 },
  { id:236, name:"Flamestrike",      lore:"Fire",  manaCost:1, learningCost:10 },
  { id:237, name:"Flaming Weapon",   lore:"Fire",  manaCost:1, learningCost:10 },
  { id:238, name:"Skin of Fire",     lore:"Fire",  manaCost:1, learningCost:10 },
  { id:239, name:"Wound Healing",    lore:"Fire",  manaCost:1, learningCost:15 },

  // ─── UNDERWORLD ──────────────────────────────────────────────────────────
  { id:240, name:"Deathtouch",       lore:"Underworld", manaCost:2, learningCost:20 },
  { id:241, name:"Demonic Seduction",lore:"Underworld", manaCost:1, learningCost:15 },
  { id:242, name:"Favour of the Gods",lore:"Underworld",manaCost:1, learningCost:10 },
  { id:243, name:"Fire of Chaos",    lore:"Underworld", manaCost:2, learningCost:20 },
  { id:244, name:"Fire Ring",        lore:"Underworld", manaCost:1, learningCost:15 },
  { id:245, name:"Infernal Possession",lore:"Underworld",manaCost:2,learningCost:25},
  { id:246, name:"Regeneration",     lore:"Underworld", manaCost:1, learningCost:10 },
  { id:247, name:"Summon Demon",     lore:"Underworld", manaCost:2, learningCost:25 },
  { id:248, name:"Summon Imps",      lore:"Underworld", manaCost:1, learningCost:15 },
  { id:249, name:"Whip of Evil",     lore:"Underworld", manaCost:1, learningCost:10 },

  // ─── LIGHT ───────────────────────────────────────────────────────────────
  { id:250, name:"Blast of Light",   lore:"Light", manaCost:1, learningCost:10 },
  { id:251, name:"Clairvoyance",     lore:"Light", manaCost:1, learningCost:10 },
  { id:252, name:"Demon Bane",       lore:"Light", manaCost:1, learningCost:15 },
  { id:253, name:"Flashing Weapon",  lore:"Light", manaCost:1, learningCost:10 },
  { id:254, name:"Great Dispelling", lore:"Light", manaCost:1, learningCost:15 },
  { id:255, name:"Healing Light",    lore:"Light", manaCost:1, learningCost:10 },
  { id:256, name:"Holy Light",       lore:"Light", manaCost:1, learningCost:10 },
  { id:257, name:"Light Aura",       lore:"Light", manaCost:1, learningCost:10 },
  { id:258, name:"Light Spear",      lore:"Light", manaCost:1, learningCost:10 },
  { id:259, name:"Sheltering Light", lore:"Light", manaCost:1, learningCost:15 },

  // ─── EARTH ───────────────────────────────────────────────────────────────
  { id:260, name:"Gravity Rocks",    lore:"Earth", manaCost:1, learningCost:10 },
  { id:261, name:"Jade Arrows",      lore:"Earth", manaCost:1, learningCost:10 },
  { id:262, name:"Mud",              lore:"Earth", manaCost:1, learningCost:10 },
  { id:263, name:"Rain of Stones",   lore:"Earth", manaCost:1, learningCost:15 },
  { id:264, name:"Restoring Earth",  lore:"Earth", manaCost:1, learningCost:15 },
  { id:265, name:"Stone Bridge",     lore:"Earth", manaCost:1, learningCost:10 },
  { id:266, name:"Stone Skin",       lore:"Earth", manaCost:1, learningCost:10 },
  { id:267, name:"Summon Elemental", lore:"Earth", manaCost:2, learningCost:25 },
  { id:268, name:"Walkthrough",      lore:"Earth", manaCost:1, learningCost:20 },
  { id:269, name:"Wall of Stone",    lore:"Earth", manaCost:1, learningCost:15 },

  // ─── OTHER LORES (from rulebook — cards not visible in this hero's picker) ─
  // Necromancy (Necromancer class)
  { id:270, name:"Animate Dead",     lore:"Necromancy", manaCost:2, learningCost:20 },
  { id:271, name:"Death Bolt",       lore:"Necromancy", manaCost:1, learningCost:10 },
  { id:272, name:"Drain Life",       lore:"Necromancy", manaCost:1, learningCost:15 },
  { id:273, name:"Fear",             lore:"Necromancy", manaCost:1, learningCost:10 },
  { id:274, name:"Raise Skeleton",   lore:"Necromancy", manaCost:2, learningCost:20 },
  { id:275, name:"Soul Trap",        lore:"Necromancy", manaCost:1, learningCost:15 },

  // Witchcraft (Sorcerer with witchcraft)
  { id:280, name:"Curse of Weakness",lore:"Witchcraft", manaCost:1, learningCost:10 },
  { id:281, name:"Evil Eye",         lore:"Witchcraft", manaCost:1, learningCost:10 },
  { id:282, name:"Hex",              lore:"Witchcraft", manaCost:1, learningCost:10 },
  { id:283, name:"Polymorph",        lore:"Witchcraft", manaCost:2, learningCost:20 },
  { id:284, name:"Spell of Binding", lore:"Witchcraft", manaCost:1, learningCost:15 },

  // Blessings (Paladin / Celestial)
  { id:290, name:"Bless Weapon",     lore:"Blessings",  manaCost:1, learningCost:10 },
  { id:291, name:"Divine Shield",    lore:"Blessings",  manaCost:1, learningCost:10 },
  { id:292, name:"Holy Aura",        lore:"Blessings",  manaCost:1, learningCost:15 },
  { id:293, name:"Scourge of Evil",  lore:"Blessings",  manaCost:1, learningCost:10 },
  { id:294, name:"Smite",            lore:"Blessings",  manaCost:1, learningCost:10 },

  // Runic (Runic Master / Dwarf)
  { id:300, name:"Rune of Fortitude",lore:"Runic",      manaCost:1, learningCost:10 },
  { id:301, name:"Rune of Power",    lore:"Runic",      manaCost:1, learningCost:10 },
  { id:302, name:"Rune of Speed",    lore:"Runic",      manaCost:1, learningCost:10 },
  { id:303, name:"Rune Shield",      lore:"Runic",      manaCost:1, learningCost:15 },
  { id:304, name:"Runic Blast",      lore:"Runic",      manaCost:1, learningCost:10 },

  // Nature (Animist / Ranger)
  { id:310, name:"Barkskin",         lore:"Nature",     manaCost:1, learningCost:10 },
  { id:311, name:"Entangle",         lore:"Nature",     manaCost:1, learningCost:10 },
  { id:312, name:"Healing Berries",  lore:"Nature",     manaCost:1, learningCost:10 },
  { id:313, name:"Speak with Animals",lore:"Nature",    manaCost:1, learningCost:10 },
  { id:314, name:"Summon Beast",     lore:"Nature",     manaCost:2, learningCost:20 },
  { id:315, name:"Thornwall",        lore:"Nature",     manaCost:1, learningCost:15 },

  // Tribal (Sorcerer tribal — Orc, Beastmen, Goblin, etc.)
  { id:320, name:"Battle Cry",       lore:"Tribal",     manaCost:1, learningCost:10 },
  { id:321, name:"Blood Frenzy",     lore:"Tribal",     manaCost:1, learningCost:10 },
  { id:322, name:"Curse of Cowardice",lore:"Tribal",    manaCost:1, learningCost:10 },
  { id:323, name:"Hex of Pain",      lore:"Tribal",     manaCost:1, learningCost:10 },
  { id:324, name:"Spirit Shield",    lore:"Tribal",     manaCost:1, learningCost:15 },

  // Channeling (Animist / Fairy)
  { id:330, name:"Channel Energy",   lore:"Channeling", manaCost:1, learningCost:10 },
  { id:331, name:"Dispel Magic",     lore:"Channeling", manaCost:1, learningCost:15 },
  { id:332, name:"Mana Shield",      lore:"Channeling", manaCost:1, learningCost:10 },
  { id:333, name:"Telekinesis",      lore:"Channeling", manaCost:1, learningCost:15 },

  // Animism (Animist — nature spirits)
  { id:340, name:"Animal Form",      lore:"Animism",    manaCost:2, learningCost:20 },
  { id:341, name:"Call of the Wild", lore:"Animism",    manaCost:1, learningCost:10 },
  { id:342, name:"Spirit Walk",      lore:"Animism",    manaCost:1, learningCost:15 },
  { id:343, name:"Totemic Ward",     lore:"Animism",    manaCost:1, learningCost:10 },

  // Music (Bard)
  { id:350, name:"Battle Hymn",      lore:"Music",      manaCost:1, learningCost:10 },
  { id:351, name:"Lullaby",          lore:"Music",      manaCost:1, learningCost:10 },
  { id:352, name:"Song of Courage",  lore:"Music",      manaCost:1, learningCost:10 },
  { id:353, name:"Song of Healing",  lore:"Music",      manaCost:1, learningCost:15 },
];

// ─── LOOKUPS ─────────────────────────────────────────────────────────────────
const SPELL_BY_ID   = Object.fromEntries(SPELL_DB.map(s => [s.id, s]));
const SPELLS_BY_LORE = {};
SPELL_DB.forEach(s => { (SPELLS_BY_LORE[s.lore] = SPELLS_BY_LORE[s.lore]||[]).push(s); });

/**
 * Get spells available to a given class/race, respecting lore restrictions.
 * @param {string} classId   - e.g. "wizard"
 * @param {string} raceName  - e.g. "Elves"
 * @returns {Object[]} filtered spell list
 */
function getAvailableSpells(classId, raceName) {
  const classLores = CLASS_LORES[classId] || [];
  const banned = RACE_LORE_BANS[raceName] || [];
  const accessibleLores = classLores.filter(l => !banned.includes(l));
  return SPELL_DB.filter(s => accessibleLores.includes(s.lore));
}

/**
 * Calculate mana pool size.
 * @param {number} intelligence
 * @param {string[]} knownSpells - spell names
 * @returns {{ pool: number, cap: number }}
 */
function calcManaPool(intelligence, knownSpells) {
  const pool = knownSpells.length * 2;
  const cap  = intelligence * 3;
  return { pool: Math.min(pool, cap), cap };
}

/**
 * Sorcery level from VP.
 */
function sorceryLevel(vp) {
  if (vp >= 30) return 'Archmage';
  if (vp >= 15) return 'Journeyman';
  return 'Apprentice';
}

if (typeof module !== 'undefined') module.exports = {
  SPELL_DB, SPELL_BY_ID, SPELLS_BY_LORE, LORE_REALMS, LORE_COLORS, CLASS_LORES,
  getAvailableSpells, calcManaPool, sorceryLevel
};
