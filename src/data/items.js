/**
 * DUN Equipment & Items Data
 * Extracted from worldofarasca.dungeonuniversalis.com equipment modal
 * 
 * Fields present on physical cards:
 *   cost: gold pieces
 *   weight: carry weight units  
 *   armorBonus: total armor value (armor/shields only)
 *   damageDice: damage dice (weapons)
 *   hands: 1 or 2 (weapons)
 *   isHeavyArmor: bool (affects movement/skills)
 *   isNaturalWeapon: bool
 *   slot: "hands" | "body" | "backpack"
 *
 * Attribute modifiers (currentAttrMods) affect current value display:
 *   { agility: -1, combatSkill: -1 } etc.
 * These are applied on top of base attrs to show current values.
 */

const ITEM_DB = [

  // ─── MELEE WEAPONS ────────────────────────────────────────────────────────
  { id:20,  name:"Axe",                cat:"melee_weapon",    slot:"hands", hands:1, cost:2,  weight:3, damageDice:"1-2" },
  { id:9,   name:"Bastard Sword",      cat:"melee_weapon",    slot:"hands", hands:1, cost:3,  weight:7, damageDice:"1-2" },
  { id:264, name:"Battle Staff",       cat:"melee_weapon",    slot:"hands", hands:2, cost:3,  weight:2, damageDice:"1-2" },
  { id:22,  name:"Battleaxe",          cat:"melee_weapon",    slot:"hands", hands:1, cost:4,  weight:5, damageDice:"1-2" },
  { id:8,   name:"Broadsword",         cat:"melee_weapon",    slot:"hands", hands:1, cost:2,  weight:5, damageDice:"1"   },
  { id:14,  name:"Claws",              cat:"melee_weapon",    slot:"hands", hands:1, cost:0,  weight:0, damageDice:"1",   isNaturalWeapon:true },
  { id:15,  name:"Club",               cat:"melee_weapon",    slot:"hands", hands:1, cost:1,  weight:5, damageDice:"1-5" },
  { id:6,   name:"Dagger",             cat:"melee_weapon",    slot:"hands", hands:1, cost:4,  weight:1, damageDice:"1"   },
  { id:32,  name:"Double-headed Axe",  cat:"melee_weapon",    slot:"hands", hands:2, cost:5,  weight:6, damageDice:"1-2" },
  { id:11,  name:"Elven Sword",        cat:"melee_weapon",    slot:"hands", hands:1, cost:3,  weight:12, damageDice:"1-2" },
  { id:30,  name:"Falcata Sword",      cat:"melee_weapon",    slot:"hands", hands:1, cost:3,  weight:3, damageDice:"1-2" },
  { id:29,  name:"Falx",               cat:"melee_weapon",    slot:"hands", hands:1, cost:2,  weight:3, damageDice:"1-2" },
  { id:33,  name:"Fangs",              cat:"melee_weapon",    slot:"hands", hands:1, cost:0,  weight:0, damageDice:"1",   isNaturalWeapon:true },
  { id:28,  name:"Fausal Sword",       cat:"melee_weapon",    slot:"hands", hands:1, cost:3,  weight:5, damageDice:"1-3" },
  { id:36,  name:"Flail",              cat:"melee_weapon",    slot:"hands", hands:1, cost:3,  weight:5, damageDice:"1-3" },
  { id:26,  name:"Gladiator Scissors", cat:"melee_weapon",    slot:"hands", hands:1, cost:1,  weight:3, damageDice:"1-4" },
  { id:25,  name:"Great Falx",         cat:"melee_weapon",    slot:"hands", hands:2, cost:4,  weight:5, damageDice:"1-2" },
  { id:27,  name:"Great Flail",        cat:"melee_weapon",    slot:"hands", hands:2, cost:5,  weight:5, damageDice:"1-3" },
  { id:24,  name:"Greatsword",         cat:"melee_weapon",    slot:"hands", hands:2, cost:4,  weight:7, damageDice:"1-2" },
  { id:2,   name:"Halberd",            cat:"melee_weapon",    slot:"hands", hands:2, cost:3,  weight:5, damageDice:"1-3" },
  { id:31,  name:"Hammer",             cat:"melee_weapon",    slot:"hands", hands:1, cost:2,  weight:3, damageDice:"1-3" },
  { id:34,  name:"Horns",              cat:"melee_weapon",    slot:"hands", hands:1, cost:0,  weight:0, damageDice:"1-2", isNaturalWeapon:true },
  { id:1,   name:"Improvised Weapon",  cat:"melee_weapon",    slot:"hands", hands:1, cost:0,  weight:1, damageDice:"1-6" },
  { id:35,  name:"Iron Fist",          cat:"melee_weapon",    slot:"hands", hands:1, cost:2,  weight:3, damageDice:"1-2" },
  { id:38,  name:"Katana",             cat:"melee_weapon",    slot:"hands", hands:2, cost:8,  weight:3, damageDice:"1-3" },
  { id:13,  name:"Katar",              cat:"melee_weapon",    slot:"hands", hands:1, cost:8,  weight:3, damageDice:"1-3" },
  { id:37,  name:"Kopesh Sword",       cat:"melee_weapon",    slot:"hands", hands:1, cost:7,  weight:3, damageDice:"1-2" },
  { id:16,  name:"Kukri",              cat:"melee_weapon",    slot:"hands", hands:1, cost:8,  weight:2, damageDice:"1-2" },
  { id:10,  name:"Kusarigama",         cat:"melee_weapon",    slot:"hands", hands:2, cost:8,  weight:2, damageDice:"1-2" },
  { id:39,  name:"Lance",              cat:"melee_weapon",    slot:"hands", hands:2, cost:3,  weight:3, damageDice:"1-2" },
  { id:21,  name:"Lucerne Hammer",     cat:"melee_weapon",    slot:"hands", hands:2, cost:3,  weight:5, damageDice:"1-3" },
  { id:7,   name:"Mace",               cat:"melee_weapon",    slot:"hands", hands:1, cost:2,  weight:3, damageDice:"1-3" },
  { id:40,  name:"Macuahuitl",         cat:"melee_weapon",    slot:"hands", hands:1, cost:7,  weight:1, damageDice:"1-2" },
  { id:41,  name:"Morningstar",        cat:"melee_weapon",    slot:"hands", hands:1, cost:3,  weight:4, damageDice:"1-2" },
  { id:42,  name:"Parrying Dagger",    cat:"melee_weapon",    slot:"hands", hands:1, cost:1,  weight:1, damageDice:"1"   },
  { id:43,  name:"Rapier",             cat:"melee_weapon",    slot:"hands", hands:1, cost:2,  weight:4, damageDice:"1-2" },
  { id:44,  name:"Saber",              cat:"melee_weapon",    slot:"hands", hands:1, cost:2,  weight:4, damageDice:"1-2" },
  { id:45,  name:"Sai",                cat:"melee_weapon",    slot:"hands", hands:1, cost:1,  weight:2, damageDice:"1-2" },
  { id:46,  name:"Scimitar",           cat:"melee_weapon",    slot:"hands", hands:1, cost:2,  weight:4, damageDice:"1-2" },
  { id:47,  name:"Scythe",             cat:"melee_weapon",    slot:"hands", hands:2, cost:2,  weight:3, damageDice:"1-2" },
  { id:48,  name:"Serrated Sword",     cat:"melee_weapon",    slot:"hands", hands:1, cost:7,  weight:3, damageDice:"1-2" },
  { id:49,  name:"Short Sword",        cat:"melee_weapon",    slot:"hands", hands:1, cost:1,  weight:3, damageDice:"1"   },
  { id:50,  name:"Spear",              cat:"melee_weapon",    slot:"hands", hands:2, cost:2,  weight:2, damageDice:"1-2" },
  { id:3,   name:"Staff",              cat:"melee_weapon",    slot:"hands", hands:2, cost:1,  weight:1, damageDice:"1-2" },
  { id:51,  name:"Throwing Axe",       cat:"melee_weapon",    slot:"hands", hands:1, cost:1,  weight:2, damageDice:"1-2" },
  { id:52,  name:"Tool",               cat:"melee_weapon",    slot:"hands", hands:1, cost:1,  weight:1, damageDice:"1-3" },
  { id:53,  name:"Trident",            cat:"melee_weapon",    slot:"hands", hands:2, cost:2,  weight:3, damageDice:"1-3" },
  { id:4,   name:"Unarmed",            cat:"melee_weapon",    slot:"hands", hands:1, cost:0,  weight:0, damageDice:"1-3" },
  { id:54,  name:"Warhammer",          cat:"melee_weapon",    slot:"hands", hands:1, cost:4,  weight:5, damageDice:"1-3" },
  { id:55,  name:"Whip",               cat:"melee_weapon",    slot:"hands", hands:1, cost:1,  weight:2, damageDice:"1-2" },
  { id:56,  name:"Zanbato",            cat:"melee_weapon",    slot:"hands", hands:2, cost:5,  weight:8, damageDice:"1-2" },

  // ─── RANGED WEAPONS ───────────────────────────────────────────────────────
  { id:64,  name:"Arquebus",           cat:"ranged_weapon",   slot:"hands", hands:2, cost:18, weight:8, damageDice:"1-4" },
  { id:71,  name:"Blowgun",            cat:"ranged_weapon",   slot:"hands", hands:2, cost:6,  weight:1, damageDice:"1"   },
  { id:65,  name:"Composite Bow",      cat:"ranged_weapon",   slot:"hands", hands:2, cost:20, weight:3, damageDice:"1-3" },
  { id:69,  name:"Crossbow",           cat:"ranged_weapon",   slot:"hands", hands:2, cost:24, weight:5, damageDice:"1-3" },
  { id:148, name:"Crossbow Pistol",    cat:"ranged_weapon",   slot:"hands", hands:1, cost:12, weight:2, damageDice:"1-2" },
  { id:67,  name:"Elven Bow",          cat:"ranged_weapon",   slot:"hands", hands:2, cost:24, weight:1, damageDice:"1",  note:"Only average-size (not Ratfolk/Dwarves)" },
  { id:76,  name:"Handgun",            cat:"ranged_weapon",   slot:"hands", hands:1, cost:10, weight:5, damageDice:"1-4" },
  { id:147, name:"Heavy Javelin",      cat:"ranged_weapon",   slot:"hands", hands:1, cost:2,  weight:2, damageDice:"1-2" },
  { id:66,  name:"Javelin",            cat:"ranged_weapon",   slot:"hands", hands:1, cost:3,  weight:2, damageDice:"1-2" },
  { id:68,  name:"Longbow",            cat:"ranged_weapon",   slot:"hands", hands:2, cost:24, weight:4, damageDice:"1-2" },
  { id:75,  name:"Net",                cat:"ranged_weapon",   slot:"hands", hands:1, cost:3,  weight:1, damageDice:"1-3" },
  { id:73,  name:"Repeating Crossbow", cat:"ranged_weapon",   slot:"hands", hands:2, cost:20, weight:6, damageDice:"1-4" },
  { id:72,  name:"Short Bow",          cat:"ranged_weapon",   slot:"hands", hands:2, cost:1,  weight:4, damageDice:"1-2" },
  { id:70,  name:"Sling",              cat:"ranged_weapon",   slot:"hands", hands:1, cost:1,  weight:2, damageDice:"1-2" },
  { id:74,  name:"Sling with Lead",    cat:"ranged_weapon",   slot:"hands", hands:1, cost:3,  weight:2, damageDice:"1-2" },
  { id:77,  name:"Throwing Dagger",    cat:"ranged_weapon",   slot:"hands", hands:1, cost:2,  weight:1, damageDice:"1-2" },

  // ─── SHIELDS ──────────────────────────────────────────────────────────────
  // armorBonus = armor value granted; attrMods = penalty to attributes
  { id:88,  name:"Buckler",            cat:"shield", slot:"hands", hands:1, cost:2,  weight:2, armorBonus:0, attrMods:{} },
  { id:130, name:"Dwarf Steel Shield", cat:"shield", slot:"hands", hands:1, cost:4,  weight:5, armorBonus:0, attrMods:{} },
  { id:129, name:"Elven Shield",       cat:"shield", slot:"hands", hands:1, cost:2,  weight:4, armorBonus:0, attrMods:{agility:-1} },
  { id:87,  name:"Great Shield",       cat:"shield", slot:"hands", hands:1, cost:6,  weight:6, armorBonus:0, attrMods:{} },
  { id:128, name:"Improvised Shield",  cat:"shield", slot:"hands", hands:1, cost:0,  weight:6, armorBonus:0, attrMods:{agility:-1}, note:"Always fails breaking rolls" },
  { id:86,  name:"Shield",             cat:"shield", slot:"hands", hands:1, cost:4,  weight:3, armorBonus:0, attrMods:{} },

  // ─── ARMOR ────────────────────────────────────────────────────────────────
  // armorBonus = bonus to total armor; isHeavyArmor affects movement/skills
  { id:123, name:"Breastplate",        cat:"armor", slot:"body", cost:6,  weight:8,  armorBonus:2, isHeavyArmor:true,  attrMods:{agility:-1, combatSkill:-1, movement:-1} },
  { id:83,  name:"Chainmail",          cat:"armor", slot:"body", cost:6,  weight:8,  armorBonus:2, isHeavyArmor:true,  attrMods:{agility:-1, combatSkill:-1, movement:-1} },
  { id:84,  name:"Elven Armor",        cat:"armor", slot:"body", cost:9,  weight:15, armorBonus:1, isHeavyArmor:false, attrMods:{agility:-1} },
  { id:124, name:"Full Armor",         cat:"armor", slot:"body", cost:8,  weight:20, armorBonus:3, isHeavyArmor:true,  attrMods:{agility:-1, combatSkill:-1, movement:-1} },
  { id:127, name:"Larnil Armor",       cat:"armor", slot:"body", cost:10, weight:25, armorBonus:3, isHeavyArmor:true,  attrMods:{agility:-1, combatSkill:-1, movement:-2} },
  { id:85,  name:"Leather Armor",      cat:"armor", slot:"body", cost:3,  weight:4,  armorBonus:1, isHeavyArmor:false, attrMods:{agility:-1} },
  { id:126, name:"Lorica Segmentata",  cat:"armor", slot:"body", cost:6,  weight:12, armorBonus:2, isHeavyArmor:true,  attrMods:{agility:-1, combatSkill:-1, movement:-1}, note:"Takes 1 less damage die vs katanas/sabers/falx/scimitars" },
  { id:80,  name:"Scale Armor",        cat:"armor", slot:"body", cost:6,  weight:10, armorBonus:2, isHeavyArmor:true,  attrMods:{agility:-1, combatSkill:-1, movement:-1}, note:"Takes 1 less damage die vs maces/hammers/flails" },
  { id:122, name:"Studded Armor",      cat:"armor", slot:"body", cost:4,  weight:6,  armorBonus:1, isHeavyArmor:false, attrMods:{agility:-1}, note:"Takes 1 less damage die vs bows/crossbows/throwing weapons" },
  { id:125, name:"Superior Armor",     cat:"armor", slot:"body", cost:9,  weight:20, armorBonus:2, isHeavyArmor:true,  attrMods:{agility:-1, combatSkill:-1, movement:-1}, note:"Takes 1 less damage die vs melee and ranged" },
  { id:82,  name:"Yoroi",              cat:"armor", slot:"body", cost:9,  weight:16, armorBonus:2, isHeavyArmor:true,  attrMods:{agility:-1, combatSkill:-1, movement:-1, agility:-2}, note:"Takes 1 less damage die vs melee weapons" },

  // ─── COMMON OBJECTS ───────────────────────────────────────────────────────
  { id:152, name:"Antidote",           cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:280, name:"Bell",               cat:"common_object", slot:"backpack", cost:1, weight:4 },
  { id:284, name:"Camouflage Paints",  cat:"common_object", slot:"backpack", cost:1, weight:3 },
  { id:279, name:"Healing Brew",       cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:106, name:"Healing Herbs",      cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:281, name:"Hook",               cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:151, name:"Incendiary Arrows",  cat:"common_object", slot:"backpack", cost:1, weight:1 },
  { id:154, name:"Lantern",            cat:"common_object", slot:"backpack", cost:1, weight:3 },
  { id:285, name:"Lucky Clover",       cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:159, name:"Mandrake Root",      cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:282, name:"Master Key",         cat:"common_object", slot:"backpack", cost:1, weight:1 },
  { id:157, name:"Mushrooms of Frenzy",cat:"common_object", slot:"backpack", cost:1, weight:1 },
  { id:150, name:"Musical Instrument", cat:"common_object", slot:"backpack", cost:1, weight:3 },
  { id:110, name:"Pack of Provisions", cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:283, name:"Pick",               cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:111, name:"Pickaxe",            cat:"common_object", slot:"backpack", cost:1, weight:3 },
  { id:104, name:"Picklocks",          cat:"common_object", slot:"backpack", cost:1, weight:1 },
  { id:108, name:"Rat Poison",         cat:"common_object", slot:"backpack", cost:1, weight:1 },
  { id:103, name:"Rope",               cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:278, name:"Smoke Bomb",         cat:"common_object", slot:"backpack", cost:1, weight:1 },
  { id:155, name:"Torch",              cat:"common_object", slot:"backpack", cost:1, weight:1 },
  { id:156, name:"Trap",               cat:"common_object", slot:"backpack", cost:1, weight:2 },
  { id:158, name:"Vial of Acid",       cat:"common_object", slot:"backpack", cost:1, weight:1 },
  { id:102, name:"Whetstone",          cat:"common_object", slot:"backpack", cost:1, weight:1 },

  // ─── SPECIAL OBJECTS ──────────────────────────────────────────────────────
  { id:113, name:"Amulet of Protection",    cat:"special_object", slot:"body",    cost:5, weight:1 },
  { id:114, name:"Battle Horn",             cat:"special_object", slot:"backpack",cost:3, weight:2 },
  { id:160, name:"Bear Trap",               cat:"special_object", slot:"backpack",cost:3, weight:3 },
  { id:288, name:"Belt of Agility",         cat:"special_object", slot:"body",    cost:5, weight:1, attrMods:{agility:1} },
  { id:289, name:"Boots of Speed",          cat:"special_object", slot:"body",    cost:5, weight:1, attrMods:{movement:1} },
  { id:290, name:"Cloak of Shadows",        cat:"special_object", slot:"body",    cost:5, weight:1 },
  { id:291, name:"Component Pouch",         cat:"special_object", slot:"backpack",cost:3, weight:2 },
  { id:293, name:"Crystal Ball",            cat:"special_object", slot:"backpack",cost:5, weight:2 },
  { id:287, name:"Cursed Ring",             cat:"special_object", slot:"body",    cost:0, weight:1 },
  { id:292, name:"Dexterity Potion",        cat:"special_object", slot:"backpack",cost:1, weight:1, attrMods:{dexterity:2} },
  { id:286, name:"Elven Cloak",             cat:"special_object", slot:"body",    cost:5, weight:1 },
  { id:294, name:"Enchanted Quiver",        cat:"special_object", slot:"body",    cost:4, weight:2 },
  { id:116, name:"Healing Potion",          cat:"special_object", slot:"backpack",cost:1, weight:1 },
  { id:112, name:"Holy Water",              cat:"special_object", slot:"backpack",cost:2, weight:1 },
  { id:117, name:"Intelligence Potion",     cat:"special_object", slot:"backpack",cost:3, weight:1, attrMods:{intelligence:2} },
  { id:119, name:"Magic Torch",             cat:"special_object", slot:"backpack",cost:2, weight:1 },
  { id:115, name:"Mana Potion",             cat:"special_object", slot:"backpack",cost:2, weight:1 },
  { id:120, name:"Medallion of Courage",    cat:"special_object", slot:"body",    cost:4, weight:1, attrMods:{courage:1} },
  { id:121, name:"Paralysing Powder",       cat:"special_object", slot:"backpack",cost:2, weight:1 },
  { id:297, name:"Perception Potion",       cat:"special_object", slot:"backpack",cost:3, weight:1, attrMods:{perception:2} },
  { id:298, name:"Poison Vial",             cat:"special_object", slot:"backpack",cost:2, weight:1 },
  { id:299, name:"Protective Runes",        cat:"special_object", slot:"backpack",cost:3, weight:1 },
  { id:300, name:"Ring of Protection",      cat:"special_object", slot:"body",    cost:5, weight:1 },
  { id:301, name:"Scroll of Recall",        cat:"special_object", slot:"backpack",cost:3, weight:1 },
  { id:302, name:"Smoke Arrow",             cat:"special_object", slot:"backpack",cost:2, weight:1 },
  { id:303, name:"Strength Potion",         cat:"special_object", slot:"backpack",cost:3, weight:1, attrMods:{strength:2} },
  { id:304, name:"Vitality Potion",         cat:"special_object", slot:"backpack",cost:3, weight:1 },
  { id:308, name:"War Paint",               cat:"special_object", slot:"backpack",cost:2, weight:1 },

  // ─── MAGIC OBJECTS (sample — expand from physical cards) ──────────────────
  { id:161, name:"Amulet of Regeneration",  cat:"magic_object", slot:"body",    cost:10, weight:1 },
  { id:171, name:"Boots of Stealth",        cat:"magic_object", slot:"body",    cost:12, weight:1 },
  { id:174, name:"Bracers of Defense",      cat:"magic_object", slot:"body",    cost:10, weight:2, armorBonus:1 },
  { id:176, name:"Cloak of Elvenkind",      cat:"magic_object", slot:"body",    cost:15, weight:1 },
  { id:179, name:"Enchanted Shield",        cat:"magic_object", slot:"hands",   cost:12, weight:3, armorBonus:1 },
  { id:182, name:"Flame Tongue Sword",      cat:"magic_object", slot:"hands",   cost:20, weight:5 },
  { id:185, name:"Gauntlets of Power",      cat:"magic_object", slot:"body",    cost:12, weight:2, attrMods:{strength:1} },
  { id:188, name:"Helm of Courage",         cat:"magic_object", slot:"body",    cost:10, weight:2, attrMods:{courage:1} },
  { id:195, name:"Ring of Agility",         cat:"magic_object", slot:"body",    cost:10, weight:1, attrMods:{agility:1} },
  { id:196, name:"Ring of Intelligence",    cat:"magic_object", slot:"body",    cost:12, weight:1, attrMods:{intelligence:1} },
  { id:198, name:"Ring of Vitality",        cat:"magic_object", slot:"body",    cost:12, weight:1 },
  { id:199, name:"Ring of Warding",         cat:"magic_object", slot:"body",    cost:12, weight:1 },
  { id:202, name:"Rune Axe",                cat:"magic_object", slot:"hands",   cost:18, weight:5 },
  { id:203, name:"Rune Sword",              cat:"magic_object", slot:"hands",   cost:20, weight:5 },
  { id:204, name:"Staff of Power",          cat:"magic_object", slot:"hands",   cost:15, weight:2 },
  { id:207, name:"Sword of Light",          cat:"magic_object", slot:"hands",   cost:18, weight:5 },
  { id:214, name:"Talisman of Fortune",     cat:"magic_object", slot:"body",    cost:15, weight:1 },
  { id:224, name:"Vorpal Blade",            cat:"magic_object", slot:"hands",   cost:20, weight:3 },
  { id:230, name:"Wand of Fireballs",       cat:"magic_object", slot:"backpack",cost:15, weight:1 },
  { id:231, name:"Wand of Healing",         cat:"magic_object", slot:"backpack",cost:12, weight:1 },
  { id:232, name:"Wand of Lightning",       cat:"magic_object", slot:"backpack",cost:15, weight:1 },
  { id:234, name:"War Horn of Giants",      cat:"magic_object", slot:"backpack",cost:18, weight:3 },
];

// ─── LOOKUPS ──────────────────────────────────────────────────────────────────
const ITEM_BY_ID = Object.fromEntries(ITEM_DB.map(i => [i.id, i]));
const ITEM_BY_NAME = Object.fromEntries(ITEM_DB.map(i => [i.name.toLowerCase(), i]));
const ITEMS_BY_CAT = {};
ITEM_DB.forEach(i => { (ITEMS_BY_CAT[i.cat] = ITEMS_BY_CAT[i.cat]||[]).push(i); });

const CATEGORY_LABELS = {
  melee_weapon:   "Melee Weapons",
  ranged_weapon:  "Ranged Weapons",
  shield:         "Shields",
  armor:          "Armor",
  common_object:  "Common Objects",
  special_object: "Special Objects",
  magic_object:   "Magic Objects",
  relic:          "Relics",
  crafting:       "Crafting Resources",
};

/**
 * Calculate current attribute value given base attrs + equipped items.
 * @param {Object} baseAttrs  - hero's base attribute object
 * @param {string[]} equipped - array of item names/IDs currently equipped
 * @returns {Object} currentAttrs with item modifiers applied
 */
function calcCurrentAttrs(baseAttrs, equippedItemIds) {
  const current = { ...baseAttrs };
  
  for (const itemId of equippedItemIds) {
    const item = ITEM_BY_ID[itemId];
    if (!item?.attrMods) continue;
    for (const [attr, mod] of Object.entries(item.attrMods)) {
      if (current[attr] != null) current[attr] += mod;
    }
    // Armor bonus updates totalArmor
    if (item.armorBonus) {
      current.totalArmor = (current.totalArmor || current.naturalArmor || 0) + item.armorBonus;
    }
  }
  
  return current;
}

if (typeof module !== 'undefined') module.exports = { ITEM_DB, ITEM_BY_ID, ITEM_BY_NAME, ITEMS_BY_CAT, CATEGORY_LABELS, calcCurrentAttrs };
