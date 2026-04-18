
(function(){
'use strict';


function getTileImg(tileId){
  const key = tileImgKey(tileId);
  if(!key || !TILE_IMAGES[key]) return null;
  const img = new Image();
  img.src = TILE_IMAGES[key];
  return img;
}

// Pre-load all tile images into a cache



/* ═══════════════════════════════════════
   CONSTANTS & TILE DATABASE
   ═══════════════════════════════════════ */

// Grid square = SQ pixels. One DUN square = 1 unit.
const SQ = 20;

// Reveal states
const FOG = 0, VISIBLE = 1, SEEN = 2;

// ── DUN-accurate colour palettes (from tile card study) ──
// Dungeon: warm reddish-brown flagstone, rough dark stone walls
// Crypt:   cooler grey-green stone, mossy mortar
// Sewer:   dark slate, wet reflective floor
// Outdoor: earthy sandy/grass tone
const THEME = {
  dungeon: {
    floor_a: '#7a5840', floor_b: '#6e4e38', floor_c: '#855e48',  // flagstone variations
    grout:   '#3a2518',                                            // mortar between flags
    wall_face: '#4a3828', wall_top: '#3a2c20', wall_shadow: '#221810', // wall faces
    wall_crack: '#2a1e14',
    torch: '#e8902020',
  },
  crypt: {
    floor_a: '#5a6050', floor_b: '#505848', floor_c: '#626858',
    grout:   '#2a3028',
    wall_face: '#3a4038', wall_top: '#2e3430', wall_shadow: '#1a2018',
    wall_crack: '#202820',
    torch: '#60d06020',
  },
  sewer: {
    floor_a: '#384858', floor_b: '#304050', floor_c: '#404f60',
    grout:   '#202830',
    wall_face: '#2a3840', wall_top: '#223038', wall_shadow: '#141c22',
    wall_crack: '#1a2830',
    torch: '#4080c020',
  },
  outdoor: {
    floor_a: '#5a6830', floor_b: '#526028', floor_c: '#627038',
    grout:   '#3a4820',
    wall_face: '#484030', wall_top: '#3a3428', wall_shadow: '#282418',
    wall_crack: '#303020',
    torch: '#e8b84020',
  },
};

// DUN tile catalogue
// cat: 'dungeon' | 'civilised' | 'outdoor'

/* ═══════════════════════════════════════
   ELEMENT DATABASE
   Special Elements and Furniture from the DUN rulebook.
   These are placed into rooms after generation.
   ═══════════════════════════════════════ */


// Resolve exit templates
function resolveExits(e) {
  if (e === 'std-corridor') return 'Roll 1d6: 1-2 Exploration arrow, 3-5 Single door, 6 Double door';
  if (e === 'std-room')     return 'Roll 1d6: 1-2 Single door (3-5), 3-5 Single door, 6 Double door';
  if (e === 'std-room-outdoor') return 'Roll 3d6: Single door 3-4, Exploration arrow 3-6, Double door 6';
  if (Array.isArray(e))     return e.map(x => `${x.type} (${x.dir})`).join(', ');
  return String(e);
}

/* ═══════════════════════════════════════
   QUEST DECK SYSTEM
   ═══════════════════════════════════════ */

// Active category — filters which tiles are used when generating
let activeCategory = 'dungeon'; // 'dungeon' | 'civilised' | 'outdoor' | 'all'
let activeTheme    = 'any';     // 'any' | 'dungeon' | 'crypt' | 'cave' | 'sewer' | 'forest' | 'outdoor'

function catFilter(t){ return activeCategory==='all' || t.cat===activeCategory || t.altCat===activeCategory; }

function tileArea(t){ return t.sz[0]*t.sz[1]; }

// Decks are rebuilt whenever activeCategory or activeTheme changes.
// In theme-cohesion mode, pools are weighted 3:1 toward the chosen theme.
// Corridors and boss rooms are always strictly theme-matched.
let DECK_AVERAGE, DECK_LARGE, DECK_BOSS, DECK_CORRIDOR, DECK_ALL;
let canalExits = [];
let placedElements = [];
function rebuildDecks(){
  const pool = TILE_DB.filter(t => catFilter(t) && !t.isBoat);

  if(activeTheme==='any'){
    DECK_AVERAGE  = pool.filter(t=> t.type==='room'     && !t.isDead && !t.isStart && !t.isMain && !t.isBossRoom);
    DECK_LARGE    = pool.filter(t=> t.type==='room'     && !t.isDead && !t.isStart &&  t.isMain===true);
    DECK_BOSS     = pool.filter(t=> t.isBossRoom===true);
    DECK_CORRIDOR = pool.filter(t=> t.type==='corridor' && !t.isStart);
    DECK_ALL      = pool.filter(t=> !t.isStart && !t.isDead && !t.isBossRoom);
  } else {
    const themed = pool.filter(t=> t.theme===activeTheme);
    const other  = pool.filter(t=> t.theme!==activeTheme);

    // Rooms: 3:1 weighted toward chosen theme for cohesion
    const tR = themed.filter(t=> t.type==='room' && !t.isDead && !t.isStart && !t.isMain && !t.isBossRoom);
    const oR = other.filter( t=> t.type==='room' && !t.isDead && !t.isStart && !t.isMain && !t.isBossRoom);
    DECK_AVERAGE = [...tR,...tR,...tR,...oR];

    // Large rooms: themed preferred, fall back to any
    const tL = themed.filter(t=> t.type==='room' && !t.isDead && !t.isStart && t.isMain);
    const oL = other.filter( t=> t.type==='room' && !t.isDead && !t.isStart && t.isMain);
    DECK_LARGE = tL.length ? [...tL,...tL,...oL] : oL;

    // Boss rooms: themed only, fall back to full pool
    const tB = themed.filter(t=> t.isBossRoom);
    DECK_BOSS = tB.length ? tB : pool.filter(t=> t.isBossRoom);

    // Corridors: strictly themed — visual cohesion most critical here
    const tC = themed.filter(t=> t.type==='corridor' && !t.isStart);
    DECK_CORRIDOR = tC.length ? tC : pool.filter(t=> t.type==='corridor' && !t.isStart);

    // Option B all-pool: 2:1 weighted toward theme
    const tA = themed.filter(t=> !t.isStart && !t.isDead && !t.isBossRoom);
    const oA = other.filter( t=> !t.isStart && !t.isDead && !t.isBossRoom);
    DECK_ALL = [...tA,...tA,...oA];
  }

  // Safety fallbacks — ensure no deck is ever empty
  if(!DECK_BOSS.length)     DECK_BOSS     = DECK_LARGE.length ? DECK_LARGE : pool.filter(t=> t.type==='room' && !t.isDead && !t.isStart);
  if(!DECK_CORRIDOR.length) DECK_CORRIDOR = pool.filter(t=> t.type==='corridor' && !t.isStart);
  if(!DECK_AVERAGE.length)  DECK_AVERAGE  = pool.filter(t=> t.type==='room'     && !t.isDead && !t.isStart && !t.isBossRoom);
  if(!DECK_ALL.length)      DECK_ALL      = pool.filter(t=> !t.isStart && !t.isDead && !t.isBossRoom);
}
rebuildDecks();

// Quest deck definitions per level/option
// boss is always 1 large room (the final room, enemy boss lives here)
const QUEST_DECKS = {
  '1A': { label:'Level 1–2 · Option A', avgRooms:3, largeRooms:1, corridors:4, boss:1 },
  '1B': { label:'Level 1–2 · Option B', random:8,  boss:1 },
  '3A': { label:'Level 3–4 · Option A', avgRooms:4, largeRooms:2, corridors:4, boss:1 },
  '3B': { label:'Level 3–4 · Option B', random:10, boss:1 },
  '5A': { label:'Level 5–6 · Option A', avgRooms:5, largeRooms:2, corridors:5, boss:1 },
  '5B': { label:'Level 5–6 · Option B', random:12, boss:1 },
};

/* ═══════════════════════════════════════
   MISSIONS
   ═══════════════════════════════════════ */
const MISSIONS = [
  {
    id: 1,
    name: 'Defeat the Leader',
    icon: '⚔',
    goal: 'Knock out the Quest Leader.',
    setup: 'Choose or randomise the setting (Dungeon, Civilised, or Outdoor). The Quest Leader is the boss in the final room.',
    rules: [
      'The Quest Leader is placed in the Boss Room.',
      'Heroes win when the Quest Leader is knocked out.',
      'The Dark Player wins if all heroes are knocked out before the leader falls.',
    ],
    settings: ['dungeon','civilised','outdoor'],
    allowRandom: true,
  },
  {
    id: 2,
    name: 'Steal the Relic',
    icon: '💎',
    goal: 'Steal the relic from the leader and escape the scenario.',
    setup: 'Choose the setting: Dungeon or Civilised. The Quest Leader holds the relic and is placed in the Boss Room.',
    rules: [
      'To steal the relic, a hero must be adjacent to the Quest Leader and use an action to make an opposed roll: Skilled Hands vs. Perception.',
      'If the hero wins the roll, they take the relic. The hero carrying the relic must then exit the scenario.',
      'The heroes win when the relic-carrying hero leaves the board via the start tile exit.',
      'The Dark Player wins if all heroes are knocked out, or if the turn limit expires.',
      'Time limit: Heroes have 45 turns to steal the relic and escape.',
    ],
    settings: ['dungeon','civilised'],
    allowRandom: true,
    turnLimit: 45,
  },
  // Missions 3–12 will be added here
];

let activeMission = null;  // set when a mission is started

// Draw n unique cards from pool (seeded)
function drawCards(pool, n) {
  if (!pool.length) return [];
  const shuffled = [...pool];
  for (let i = shuffled.length-1; i > 0; i--) {
    const j = Math.floor(rng() * (i+1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // If pool smaller than n, allow repeats
  const result = [];
  while (result.length < n) result.push(...shuffled);
  return result.slice(0, n);
}

// Build quest deck — returns array of tile defs in placement order.
// Non-boss cards are shuffled. Boss card is separated and placed LAST
// after a guaranteed path is established.
function buildQuestDeck(levelKey, option) {
  const key = levelKey + option;
  const spec = QUEST_DECKS[key];
  if (!spec) return { mainDeck:[], bossCard:null, label:'?' };

  let mainDeck = [];
  let bossCard = null;

  // Boss is ALWAYS drawn from the large/main room pool
  const bossPool = DECK_BOSS;
  bossCard = { ...bossPool[Math.floor(rng() * bossPool.length)], isBoss:true };

  if (spec.random) {
    // Option B: draw randomly from all non-boss tiles
    const pool = DECK_ALL.filter(t => t.id !== bossCard.id);
    mainDeck = drawCards(pool, spec.random);
  } else {
    // Option A: fixed composition
    const avgCards  = drawCards(DECK_AVERAGE.filter(t=>t.id!==bossCard.id), spec.avgRooms);
    const largeCards= drawCards(DECK_LARGE.filter(t=>t.id!==bossCard.id),   spec.largeRooms);
    const corrCards = drawCards(DECK_CORRIDOR, spec.corridors);
    mainDeck = [...avgCards, ...largeCards, ...corrCards];
    // Shuffle non-boss cards
    for (let i=mainDeck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[mainDeck[i],mainDeck[j]]=[mainDeck[j],mainDeck[i]];}
  }

  addLog(`⚔ Quest deck — Level ${{'1':'1–2','3':'3–4','5':'5–6'}[levelKey]} Option ${option}`, 'li');
  const themeLabel = activeTheme==='any' ? 'Any' : {dungeon:'Stone',crypt:'Crypt',cave:'Cave',sewer:'Sewer',outdoor:'Wilderness',forest:'Forest'}[activeTheme]||activeTheme;
  addLog(`  Setting: ${{ dungeon:'⚔ Dungeon', civilised:'🏰 Civilised', outdoor:'🌲 Outdoor', all:'✦ All' }[activeCategory]} · Theme: ${themeLabel}`, '');
  addLog(`  ${mainDeck.length} sections + 1 boss room`, '');
  addLog(`  Boss: ${bossCard.name}`, 'ld');

  // Warn if pools are very small (tiles will repeat)
  if (DECK_AVERAGE.length < spec.avgRooms)
    addLog(`  ⚠ Only ${DECK_AVERAGE.length} avg rooms available — some repeated`, 'ld');
  if (DECK_LARGE.length < (spec.largeRooms||0)+1)
    addLog(`  ⚠ Only ${DECK_LARGE.length} large rooms available — some repeated`, 'ld');
  if (DECK_CORRIDOR.length < (spec.corridors||0))
    addLog(`  ⚠ Only ${DECK_CORRIDOR.length} corridors available — some repeated`, 'ld');

  return { mainDeck, bossCard, label: spec.label };
}

/* ═══════════════════════════════════════
   RNG & HELPERS
   ═══════════════════════════════════════ */
let rng, seed;
function mkRng(s) {
  let x = s | 0;
  return () => { x = (Math.imul(1664525, x) + 1013904223) | 0; return (x >>> 0) / 0xFFFFFFFF; };
}
function ri(lo, hi) { return Math.floor(rng() * (hi - lo + 1)) + lo; }
function pick(arr) { return arr[ri(0, arr.length - 1)]; }
function rollD6(n) { let t = 0; for (let i = 0; i < (n||1); i++) t += ri(1,6); return t; }
function rollD6Real(n) { let t = 0; for (let i = 0; i < (n||1); i++) t += Math.floor(Math.random()*6)+1; return t; }

/* ═══════════════════════════════════════
   DUNGEON DATA MODEL
   ═══════════════════════════════════════ */
let placed = [];   // { tile, gx, gy, rot, revealed, entityType }
let connections = []; // { from, to, door, ex, ey } — doors/arrows linking placed tiles
let heroPos = { gx:0, gy:0 };
let levelNum = 0;
let logLines = [];
let selectedTile = null;

/* Grid for rendering: sparse map gx,gy → cell type */
const W = 64, H = 48;

/* ═══════════════════════════════════════════════════════
   DESIGN RULES
   • Every exit = { fromId, side, slot, doorType }
     slot = the WORLD grid coord of the first of the 2
     connecting cells (row for E/W, col for N/S).
   • Tiles are placed flush — no gap cell between them.
   • Corridors must align their narrow end with the slot.
   • Rooms can align any part of their face with the slot.
═══════════════════════════════════════════════════════ */

function oppSide(s){ return {N:'S',S:'N',E:'W',W:'E'}[s]; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]];} }

/* ── occupancy ──────────────────────────────────────── */
let occ; // Set of "gx,gy" — recreated per newDungeon()

function occAdd(pl){
  for(let dy=0;dy<pl.h;dy++)
    for(let dx=0;dx<pl.w;dx++)
      occ.add(`${pl.gx+dx},${pl.gy+dy}`);
}

/* Check if rect (gx,gy,w,h) is free to place —
   tiles may touch edge-to-edge but not overlap. */
function canFit(gx, gy, w, h, entryFace){
  for(let dy=0; dy<h; dy++){
    for(let dx=0; dx<w; dx++){
      if(occ.has(`${gx+dx},${gy+dy}`)) return false;
    }
  }
  return true;
}

/* ── tryPlace ────────────────────────────────────────────
   Try to place tDef against exit.
   Returns {gx,gy,w,h} or null.

   For a corridor:
     • Orient so the narrow side (2 cells) is PERPENDICULAR
       to the travel direction.
     • The narrow dimension MUST start exactly at exit.slot
       (strict alignment so the throat lines up).
   For a room:
     • Try every perpendicular offset where exit.slot and
       exit.slot+1 both land inside the tile's face.
─────────────────────────────────────────────────────── */
const BORDER = 2;

function tryPlace(exit, tDef){
  const {side, slot} = exit;
  const horiz = side==='E' || side==='W';  // travel is horizontal
  const fromPl = placed.find(p=>p.id===exit.fromId);
  if(!fromPl) return null;
  /* Refuse to place a normal tile through a water side of the from-tile.
     Canal exits (isCanal:true) are exempt — they connect water-to-water. */
  if(!exit.isCanal && fromPl.tile.canalWaterSides && fromPl.tile.canalWaterSides.includes(exit.side)) return null;
  /* Canal exit: the incoming tile must have the entry side as a water side */
  if(exit.isCanal && !(tDef.canalWaterSides && tDef.canalWaterSides.includes(oppSide(exit.side)))) return null;

  /* Determine tile dimensions with correct orientation */
  let tw, th;
  if(tDef.type==='corridor'){
    const long  = Math.max(tDef.sz[0], tDef.sz[1]);
    const short = Math.min(tDef.sz[0], tDef.sz[1]);
    if(horiz){ tw=long;  th=short; }   // E/W: long runs left-right, narrow top-bottom
    else      { tw=short; th=long;  }  // N/S: long runs top-bottom, narrow left-right
  } else {
    tw=tDef.sz[0]; th=tDef.sz[1];
  }

  /* Anchor position: flush against the exit tile */
  let anchorX, anchorY;
  switch(side){
    case 'E': anchorX = fromPl.gx + fromPl.w; break;  // new tile left  = right of from
    case 'W': anchorX = fromPl.gx - tw;        break;  // new tile right = left  of from
    case 'S': anchorY = fromPl.gy + fromPl.h;  break;  // new tile top   = bottom of from
    case 'N': anchorY = fromPl.gy - th;        break;  // new tile bottom= top    of from
  }

  /* Build perpendicular placement candidates.
     Corridors: only one valid position (narrow end aligns with slot).
     Rooms: prefer centre-aligned positions first for tidy grid-aligned layouts,
            fall back to other valid offsets only if needed. */
  const candidates = [];
  if(tDef.type==='corridor'){
    candidates.push(slot);
  } else {
    const faceLen = horiz ? th : tw;
    const fromFaceStart = horiz ? fromPl.gy : fromPl.gx;
    const fromFaceLen   = horiz ? fromPl.h  : fromPl.w;

    // Centre of the new tile's face aligned with centre of from-tile's face
    const fromCentred = Math.round(fromFaceStart + fromFaceLen/2 - faceLen/2);
    // Centre of new tile's face aligned with the slot midpoint
    const slotCentred = Math.round(slot + 0.5 - faceLen/2);
    // Flush alignments with from-tile edges
    const flushStart = fromFaceStart;
    const flushEnd   = fromFaceStart + fromFaceLen - faceLen;

    // Priority: most-aligned first, then fallback offsets outward from centre
    const seen = new Set();
    const prefer = [fromCentred, slotCentred, flushStart, flushEnd];
    for(const p of prefer){
      if(!seen.has(p)){ seen.add(p); candidates.push(p); }
    }
    // Remaining valid offsets sorted by distance from centre (least offset = most aligned)
    const lo = slot - faceLen + 2, hi = slot;
    const mid = Math.round((lo + hi) / 2);
    const rest = [];
    for(let b = lo; b <= hi; b++) if(!seen.has(b)) rest.push(b);
    rest.sort((a,b) => Math.abs(a-mid) - Math.abs(b-mid));
    for(const b of rest) candidates.push(b);
  }

  for(const perp of candidates){
    let gx, gy;
    if(horiz){ gx = anchorX; gy = perp; }
    else      { gx = perp;   gy = anchorY; }

    if(gx < BORDER || gy < BORDER || gx+tw > W-BORDER || gy+th > H-BORDER) continue;

    // Narrow tiles (1 cell in the perpendicular dimension) only need to overlap
    // one slot cell rather than the full 2-cell slot
    const slotRequired = (horiz ? th : tw) === 1 ? 1 : 2;

    if(horiz){
      if(gy > slot || gy+th < slot+slotRequired) continue;
    } else {
      if(gx > slot || gx+tw < slot+slotRequired) continue;
    }

    if(canFit(gx, gy, tw, th, oppSide(side)))
      return {gx, gy, w:tw, h:th};
  }
  return null;
}

/* ── Slot helpers ──────────────────────────────────── */
function centreSlot(pl, side){
  /* Returns the grid coord of the first cell of a centred 2-slot on the given face */
  const horiz = side==='E'||side==='W';
  const base  = horiz ? pl.gy : pl.gx;
  const len   = horiz ? pl.h  : pl.w;
  return base + Math.floor((len-2)/2);
}

function makeExit(pl, side, dType){
  return { fromId:pl.id, side, slot:centreSlot(pl,side), doorType:dType||'single-door' };
}

/* ── Record a connection ───────────────────────────── */
function recordConn(exit, newPl){
  const fromPl = placed.find(p=>p.id===exit.fromId);
  const {side,slot} = exit;
  /* ex,ey = top-left grid cell of the 2-slot on the shared wall */
  let ex, ey;
  switch(side){
    case 'E': ex=fromPl.gx+fromPl.w; ey=slot; break;
    case 'W': ex=newPl.gx+newPl.w;   ey=slot; break;
    case 'S': ex=slot; ey=fromPl.gy+fromPl.h; break;
    case 'N': ex=slot; ey=newPl.gy+newPl.h;   break;
  }
  connections.push({ fromId:exit.fromId, toId:newPl.id,
    doorType:exit.doorType, side, slot, ex, ey });
}

/* ── buildExits from a freshly placed tile ─────────── */
function buildExits(newPl, entrySide){
  const exits = [];
  /* Water sides — canal tiles block doors on sides that face the water channel */
  const waterSides = newPl.tile.canalWaterSides || [];
  const isValidSide = s => !waterSides.includes(s);

  if(newPl.tile.type==='corridor'){
    /* Far end continues in same direction, slot = corridor's narrow start */
    const farSide = oppSide(entrySide);
    const horiz   = farSide==='E'||farSide==='W';
    const farSlot = horiz ? newPl.gy : newPl.gx;  // narrow dimension start
    if(isValidSide(farSide)){
      exits.push({ fromId:newPl.id, side:farSide, slot:farSlot,
        doorType:rollD6()>=5?'double-door':(rollD6()>=3?'single-door':'arrow') });
    }
    /* Optional lateral branch — suppressed for bridge tiles and water sides */
    if(!newPl.tile.isBridge && rng()>0.68){
      const candidates = (horiz ? ['N','S'] : ['E','W']).filter(isValidSide);
      if(candidates.length) exits.push(makeExit(newPl, pick(candidates), 'single-door'));
    }
  } else {
    /* Room: up to 3 exits on remaining sides — skip water sides */
    const sides = ['N','S','E','W'].filter(s => s!==entrySide && isValidSide(s));
    shuffle(sides);
    const n = ri(1, Math.min(3, sides.length));
    for(let i=0;i<n;i++)
      exits.push(makeExit(newPl, sides[i], rollD6()>=5?'double-door':'single-door'));
  }
  return exits;
}

/* ── buildCanalExits: water-side exits for canal linking ── */
function buildCanalExits(newPl){
  if(!newPl.tile.canalWaterSides || !newPl.tile.canalWaterSides.length) return [];
  return newPl.tile.canalWaterSides.map(side => ({
    fromId: newPl.id, side, slot: centreSlot(newPl, side),
    doorType: 'canal', isCanal: true
  }));
}

/* Returns all canal tiles that can connect water-to-water from a given entry side.
   A compatible tile must have the opposite side in its canalWaterSides. */
function canalCompatible(entrySide){
  const needed = oppSide(entrySide);
  return TILE_DB.filter(t => t.canalWaterSides && t.canalWaterSides.includes(needed) && catFilter(t));
}

/* ── spawnEntities ──────────────────────────────────── */
function spawnEntities(tDef, isBoss, lv){
  if(isBoss){
    const e=[];
    for(let i=0;i<2+Math.floor((lv+1)/2);i++) e.push({type:'enemy'});
    e.push({type:'treasure'},{type:'exit'});
    return e;
  }
  const e=[], roll=rollD6()+Math.floor((lv-1)/2);
  if(tDef.type==='room'){
    if(roll>=4) e.push({type:'enemy'});
    if(roll>=5) e.push({type:'enemy'});
    if(rollD6()>=5) e.push({type:'treasure'});
  } else {
    if(rollD6()===6) e.push({type:'enemy'});
  }
  return e;
}

/* ── placeTile: create placed record + occupy + record conn ── */
function placeTile(exit, tDef, extra={}){
  const pos = tryPlace(exit, tDef);
  if(!pos) return null;
  const lv = parseInt(document.getElementById('sel-level').value)||1;
  const newPl = { tile:tDef, gx:pos.gx, gy:pos.gy, w:pos.w, h:pos.h,
    revealed:false, entities:spawnEntities(tDef,!!extra.isBoss,lv),
    id:placed.length, ...extra };
  placed.push(newPl);
  occAdd(newPl);
  recordConn(exit, newPl);
  return newPl;
}

function newDungeon(){
  levelNum++;
  seed = Math.floor(Math.random()*99999)+1000;
  rng  = mkRng(seed);
  placed=[]; connections=[]; logLines=[]; selectedTile=null; canalExits=[]; placedElements=[];
  occ = new Set();
  document.getElementById('seed-val').textContent = seed;

  rebuildDecks(); // ensure decks match current category setting

  const levelKey   = document.getElementById('sel-level').value;
  const option     = document.getElementById('sel-option').value;
  const deckSpec   = QUEST_DECKS[levelKey+option];
  const levelLabel = {'1':'1-2','3':'3-4','5':'5-6'}[levelKey]||levelKey;
  const lv         = parseInt(levelKey)||1;
  document.getElementById('s-level').textContent  = levelLabel;
  document.getElementById('s-option').textContent = option;

  const questDeck  = buildQuestDeck(levelKey, option);
  const deckDesc   = deckSpec.random
    ? deckSpec.random+' random + boss'
    : deckSpec.avgRooms+' avg / '+deckSpec.largeRooms+' large / '+deckSpec.corridors+' corr + boss';
  document.getElementById('deck-desc').textContent = deckDesc;

  /* ── Start tile ── */
  const startDef = TILE_DB.find(t=>t.isStart && catFilter(t)) || TILE_DB.find(t=>t.isStart);
  const sw=startDef.sz[0], sh=startDef.sz[1];
  const sgx=Math.floor(W/2)-Math.floor(sw/2);
  const sgy=Math.floor(H/2)-Math.floor(sh/2);
  const startPl={tile:startDef,gx:sgx,gy:sgy,w:sw,h:sh,revealed:true,entities:[],id:0};
  placed.push(startPl); occAdd(startPl);
  heroPos={gx:sgx+Math.floor(sw/2), gy:sgy+Math.floor(sh/2)};
  addLog('☀ Level '+levelLabel+' · Option '+option,'li');
  if(activeMission) addLog(`📜 ${activeMission.icon} Mission ${activeMission.id}: ${activeMission.name}`,'li');

  /* ── Open exits seeded from start tile ──
     Start tile (24af) has exactly one physical exit: a double-door to the East.
     We only seed that one exit so the first connection is unambiguous. */
  const openExits = [ makeExit(startPl, 'E', 'double-door') ];

  /* ── Place deck cards ── */
  const {mainDeck, bossCard} = questDeck;
  let deck=[...mainDeck], guard=0;
  while(deck.length>0 && openExits.length>0 && guard++<800){
    const exit = openExits.splice(ri(0,openExits.length-1),1)[0];
    const fromPl = placed.find(p=>p.id===exit.fromId);
    const wantCorr = fromPl && fromPl.tile.type==='room';
    const sorted = [...deck].sort((a,b)=>
      wantCorr ? (a.type==='corridor'?0:1)-(b.type==='corridor'?0:1)
               : (a.type==='room'?0:1)-(b.type==='room'?0:1));
    for(let di=0;di<Math.min(sorted.length,8);di++){
      const tDef=sorted[di];
      const newPl=placeTile(exit,tDef);
      if(!newPl) continue;
      deck.splice(deck.indexOf(tDef),1);
      openExits.push(...buildExits(newPl, oppSide(exit.side)));
      if(newPl.tile.canalWaterSides) canalExits.push(...buildCanalExits(newPl));
      break;
    }
  }
  if(deck.length>0) addLog('⚠ '+deck.length+' section(s) unplaced.','ld');

  /* ── Canal linking pass ──
     For each water-side exit on a placed canal tile, try to connect
     a compatible canal tile (water-to-water). Chain up to 4 sections
     so canals form a continuous channel through the dungeon. */
  let canalGuard = 0;
  while(canalExits.length > 0 && canalGuard++ < 40){
    const cExit = canalExits.shift();
    // Skip if this side is already connected
    if(connections.some(c => c.fromId===cExit.fromId && c.side===cExit.side)) continue;
    const fromPl = placed.find(p => p.id===cExit.fromId);
    if(!fromPl) continue;
    // Find compatible canal tiles (water faces entry side)
    const pool = canalCompatible(cExit.side);
    if(!pool.length) continue;
    // Try each compatible tile
    shuffle([...pool]);
    for(const tDef of pool){
      const newPl = placeTile(cExit, tDef);
      if(!newPl) continue;
      addLog(`  ≋ Canal link: ${tDef.name}`, '');
      // Build further canal exits from the new tile (chain the canal)
      canalExits.push(...buildCanalExits(newPl));
      break;
    }
  }

  /* ── Boss room (guaranteed last, always connected) ── */
  let bossPlaced=false;
  /* Boss should only connect off tiles placed after the first 6 sections
     so it sits deep in the dungeon. Fall back to all tiles if needed. */
  const BOSS_DEPTH = 6;
  const deepPlaced = placed.filter(p => p.id >= BOSS_DEPTH && !p.tile.isStart);

  /* Priority: open exits from deep tiles, corridors first */
  const bossQ = [...openExits]
    .filter(e => { const p=placed.find(t=>t.id===e.fromId); return p && p.id >= BOSS_DEPTH; })
    .sort((a,b)=>{
      const ap=placed.find(p=>p.id===a.fromId), bp=placed.find(p=>p.id===b.fromId);
      return (ap?.tile.type==='corridor'?0:1)-(bp?.tile.type==='corridor'?0:1);
    });
  /* Fallback: fresh exits from deep tiles */
  for(const pl of deepPlaced.slice().reverse())
    for(const s of ['E','S','W','N'])
      bossQ.push(makeExit(pl,s,'double-door'));
  /* Last resort: any tile */
  for(const pl of [...placed].reverse())
    for(const s of ['E','S','W','N'])
      bossQ.push(makeExit(pl,s,'double-door'));

  for(let att=0;att<bossQ.length&&!bossPlaced;att++){
    const bExit=bossQ[att];
    /* Try boss directly */
    const bossPl=placeTile(bExit, bossCard, {isBoss:true,isObjective:true});
    if(bossPl){ bossPlaced=true; addLog('⚔ Boss: '+bossCard.name,'ld'); break; }
    /* Try via a connector corridor first */
    if(DECK_CORRIDOR.length){
      const corrPl=placeTile(bExit, pick(DECK_CORRIDOR));
      if(corrPl){
        const nb=makeExit(corrPl, bExit.side, 'double-door');
        const bossPl2=placeTile(nb, bossCard, {isBoss:true,isObjective:true});
        if(bossPl2){ bossPlaced=true; addLog('⚔ Boss (via corridor): '+bossCard.name,'ld'); break; }
        /* Undo corridor */
        placed.pop(); connections.pop(); occ.clear(); placed.forEach(p=>occAdd(p));
      }
    }
  }
  if(!bossPlaced) addLog('⚠ Boss room could not be placed!','ld');

  // Place elements into rooms
  placeElements();

  addLog('Dungeon ready: '+(placed.length-1)+' sections.','li');
  updateStats(); showTileInfo(null);
  // fitDungeon + draw is deferred by callers to allow canvas reflow
}

/* ── placeElements ─────────────────────────────────────
   After generation, randomly assign elements to rooms.
   Standard dungeon: 3 special elements + 3 furniture.
   Never block entry/exit squares. Only placed in rooms.
   ──────────────────────────────────────────────────── */
function placeElements(){
  placedElements = [];
  const rooms = placed.filter(p => p.tile.type==='room' && !p.tile.isStart && !p.tile.isBossRoom);
  if(!rooms.length) return;

  // Filter elements to active category
  const eligible = ELEMENT_DB.filter(e => e.cat.includes(activeCategory) || activeCategory==='all');
  const specials  = eligible.filter(e => e.type==='special');
  const furniture = eligible.filter(e => e.type==='furniture');
  if(!specials.length && !furniture.length) return;

  // Per rulebook: 3 special elements + 3 furniture for standard dungeon
  const numSpecial   = Math.min(3, specials.length);
  const numFurniture = Math.min(3, furniture.length);

  // Draw random elements (no repeats)
  const drawnSpecials  = drawCards(specials,  numSpecial);
  const drawnFurniture = drawCards(furniture, numFurniture);
  const allDrawn = [...drawnSpecials, ...drawnFurniture];

  // Assign each element to a random room, avoiding start and boss rooms
  // Place at a random interior cell (not on the edge/exit squares)
  allDrawn.forEach(el => {
    // Pick a random room weighted by size (bigger rooms more likely)
    const room = pick(rooms);
    // Find a valid interior cell — at least 1 cell from any edge
    const margin = 1;
    const minX = room.gx + margin;
    const maxX = room.gx + room.w - margin - 1;
    const minY = room.gy + margin;
    const maxY = room.gy + room.h - margin - 1;
    if(maxX < minX || maxY < minY) return; // room too small
    const ex = minX + Math.floor(rng() * (maxX - minX + 1));
    const ey = minY + Math.floor(rng() * (maxY - minY + 1));
    placedElements.push({ el, gx:ex, gy:ey, roomId:room.id, searched:false });
    addLog(`  ★ ${el.type==='furniture'?'Furniture':'Element'}: ${el.name} → ${room.tile.name}`, '');
  });
}

/* ═══════════════════════════════════════
   REVEAL LOGIC (DUN rules)
   ═══════════════════════════════════════ */
function revealTile(pl) {
  if (pl.revealed) return;
  pl.revealed = true;
  heroPos = { gx: pl.gx + Math.floor(pl.w/2), gy: pl.gy + Math.floor(pl.h/2) };

  const t = pl.tile;
  const isRoom = t.type === 'room';
  const isMain = t.isMain || pl.isBoss;
  const levelKey = parseInt(document.getElementById('sel-level').value) || 1;

  addLog(`▶ ${t.name} revealed!`, 'li');
  if (t.theme) addLog(`  ${t.theme.toUpperCase()}${t.isEnchanted?' · ENCHANTED':''}${t.isWater?' · FLOODED':''}`, '');

  // ── Special elements ──
  if (t.special) addLog(`  ★ ${t.special}`, 'ls');

  // ── Encounter roll (DUN rules) ──
  if (isRoom && !pl.isBoss) {
    const encRoll = rollD6Real(1) + (isMain ? 1 : 0);
    const encMod = isMain ? ' (+1 main room)' : '';
    if (encRoll >= 5) {
      addLog(`  🎲 Encounter roll: ${encRoll}${encMod} — ENCOUNTER CARD drawn!`, 'ld');
    } else if (encRoll >= 3) {
      addLog(`  🎲 Encounter roll: ${encRoll}${encMod} — No encounter.`, '');
    } else {
      addLog(`  🎲 Encounter roll: ${encRoll}${encMod} — Clear.`, '');
    }
  }

  // ── Enemies ──
  const enemies = pl.entities.filter(e => e.type === 'enemy');
  if (enemies.length) {
    if (pl.isBoss) {
      addLog(`  ⚔ BOSS ROOM! ${enemies.length} enemies! Roll initiative — heroes may be caught by surprise!`, 'ld');
    } else {
      addLog(`  ⚔ ${enemies.length} enem${enemies.length>1?'ies':'y'} encountered! Roll initiative!`, 'ld');
    }
  }

  // ── Treasure ──
  const treasure = pl.entities.filter(e => e.type === 'treasure');
  if (treasure.length) {
    addLog(`  ✦ Treasure chest present — Dexterity test to open (1 attempt only).`, 'lt');
  }

  // ── Furniture roll (DUN rules) ──
  if (isRoom && t.furniture && t.furniture !== 'std-room') {
    addLog(`  🪑 Furniture: ${t.furniture}`, 'ls');
  } else if (isRoom) {
    const furnRoll = rollD6Real(1);
    if (furnRoll >= 4) {
      addLog(`  🪑 Furniture roll: ${furnRoll} — Draw Furniture card.${furnRoll>=5?' Draw again if furniture card.':''}`, 'ls');
    } else {
      addLog(`  🪑 Furniture roll: ${furnRoll} — No furniture.`, '');
    }
  }

  // ── Searching rooms ──
  if (isRoom) {
    addLog(`  🔍 Search room: Perception test to find hidden treasure (1d3+1 coins on success).`, '');
  }

  // ── Boss / objective ──
  if (pl.isBoss) {
    addLog(`  🏆 QUEST OBJECTIVE — Defeat the boss to complete the mission!`, 'le');
  }

  updateStats();
  draw();
  showTileInfo(pl);
}

function getConnectionsFrom(id) {
  return connections.filter(c => c.fromId === id || c.toId === id);
}
function getOtherEnd(conn, myId) {
  return conn.fromId === myId ? conn.toId : conn.fromId;
}

/* ═══════════════════════════════════════
   CANVAS / ZOOM / SCROLL
   ═══════════════════════════════════════ */
const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
const mapWrap = document.getElementById('map-wrap');

// Canvas is sized to the mapWrap and we draw with a transform
let zoom = 1.0;
let offsetX = 0, offsetY = 0;   // pan offset in canvas pixels (pre-zoom)
const ZOOM_MIN = 0.3, ZOOM_MAX = 8.0, ZOOM_STEP = 0.15;

function resizeCanvas() {
  canvas.width  = mapWrap.clientWidth  || 800;
  canvas.height = mapWrap.clientHeight || 600;
}

function clampOffset() {
  // Total dungeon extent in canvas pixels
  const dungeonW = W * SQ, dungeonH = H * SQ;
  const vw = canvas.width, vh = canvas.height;
  // Allow seeing at least 80px of dungeon at the edges
  const margin = 80;
  const minOX = margin / zoom - dungeonW;
  const maxOX = vw / zoom - margin;
  const minOY = margin / zoom - dungeonH;
  const maxOY = vh / zoom - margin;
  offsetX = Math.max(minOX, Math.min(maxOX, offsetX));
  offsetY = Math.max(minOY, Math.min(maxOY, offsetY));
}

function applyTransform() {
  // ctx transform: scale then translate
  ctx.setTransform(zoom, 0, 0, zoom, offsetX * zoom, offsetY * zoom);
  document.getElementById('zoom-label').textContent = `ZOOM ${Math.round(zoom * 100)}%`;
}

function resetTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Zoom centred on a viewport point (sx, sy in screen px relative to canvas)
function zoomAt(sx, sy, newZoom) {
  // Point in world coords before zoom
  const wx = (sx / zoom) - offsetX;
  const wy = (sy / zoom) - offsetY;
  zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
  // Keep same world point under sx,sy
  offsetX = (sx / zoom) - wx;
  offsetY = (sy / zoom) - wy;
  clampOffset();
}

// Zoom centred on canvas centre
function zoomCenter(newZoom) {
  zoomAt(canvas.width / 2, canvas.height / 2, newZoom);
}

function fitDungeon() {
  if (!placed.length) return;
  resizeCanvas();
  const minGx = Math.min(...placed.map(p => p.gx));
  const minGy = Math.min(...placed.map(p => p.gy));
  const maxGx = Math.max(...placed.map(p => p.gx + p.w));
  const maxGy = Math.max(...placed.map(p => p.gy + p.h));
  const dw = (maxGx - minGx) * SQ;
  const dh = (maxGy - minGy) * SQ;
  const pad = 60;
  zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX,
    Math.min((canvas.width - pad) / dw, (canvas.height - pad) / dh)));
  offsetX = (canvas.width  / zoom - dw) / 2 - minGx * SQ;
  offsetY = (canvas.height / zoom - dh) / 2 - minGy * SQ;
  clampOffset();
}

// Convert screen px → world grid cell
function screenToGrid(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  const wx = sx / zoom - offsetX;
  const wy = sy / zoom - offsetY;
  return { mx: Math.floor(wx / SQ), my: Math.floor(wy / SQ), rawX: wx, rawY: wy };
}

// Centre view on hero
function centreOnHero() {
  const wx = (heroPos.gx + 0.5) * SQ;
  const wy = (heroPos.gy + 0.5) * SQ;
  offsetX = canvas.width  / (2 * zoom) - wx;
  offsetY = canvas.height / (2 * zoom) - wy;
  clampOffset();
  draw();
}

function getTh(theme) { return THEME[theme] || THEME.dungeon; }

/* ── Colour helpers ── */
function parseCol(hex){const v=parseInt(hex.replace('#',''),16);return[(v>>16)&255,(v>>8)&255,v&255];}
function toHex(r,g,b){'use strict';return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
function dimCol(hex,f){const[r,g,b]=parseCol(hex);return toHex(r*f,g*f,b*f);}
function lightenCol(hex,f){const[r,g,b]=parseCol(hex);return toHex(r+(255-r)*f,g+(255-g)*f,b+(255-b)*f);}
function darkenCol(hex,f){const[r,g,b]=parseCol(hex);return toHex(r*(1-f),g*(1-f),b*(1-f));}

/* ── Deterministic per-cell noise ── */
function cellNoise(gx,gy,s){let h=(gx*374761393+gy*668265263+(s||0))|0;h^=h>>>13;h=Math.imul(h,1274126177);h^=h>>>16;return(h>>>0)/0xFFFFFFFF;}

/* ── Shared cell map: "gx,gy" → placed tile ── */
let cellMap={};
function rebuildCellMap(){
  cellMap={};
  placed.forEach(pl=>{
    for(let dy=0;dy<pl.h;dy++) for(let dx=0;dx<pl.w;dx++) cellMap[`${pl.gx+dx},${pl.gy+dy}`]=pl;
  });
}

/* ── Draw one flagstone floor cell ── */
function drawFloorCell(gx,gy,th,dim){
  const px=gx*SQ,py=gy*SQ;
  const n=cellNoise(gx,gy,1),n2=cellNoise(gx,gy,2);
  const f=dim?0.42:1;
  // Base slab colour
  let fc=n<0.33?th.floor_a:n<0.66?th.floor_b:th.floor_c;
  if(dim)fc=dimCol(fc,f);
  ctx.fillStyle=fc;
  ctx.fillRect(px+1,py+1,SQ-1,SQ-1);
  // Mortar lines (top + left edge)
  ctx.fillStyle=dim?dimCol(th.grout,f):th.grout;
  ctx.fillRect(px,py,SQ,1);
  ctx.fillRect(px,py,1,SQ);
  // Bevel: lighter top-left, darker bottom-right
  ctx.fillStyle=lightenCol(fc,dim?0.06:0.13);
  ctx.fillRect(px+1,py+1,SQ-2,1);
  ctx.fillRect(px+1,py+1,1,SQ-2);
  ctx.fillStyle=darkenCol(fc,dim?0.10:0.22);
  ctx.fillRect(px+1,py+SQ-2,SQ-2,1);
  ctx.fillRect(px+SQ-2,py+1,1,SQ-2);
  // Random crack
  if(n2<0.11){
    ctx.fillStyle=dim?dimCol(th.grout,0.5):th.grout;
    const cx2=px+3+Math.floor(n*(SQ-7)),cy2=py+3+Math.floor(n2*9*(SQ-7));
    ctx.fillRect(cx2,cy2,2,1);ctx.fillRect(cx2+1,cy2+1,1,2);
  }
  // Speck
  if(n>0.87){ctx.fillStyle=darkenCol(fc,0.35);ctx.fillRect(px+2+Math.floor(n*3),py+2+Math.floor(n2*3),1,1);}
}

/* ── Draw one wall cell ── */
function drawWallCell(gx,gy,th,dim){
  const px=gx*SQ,py=gy*SQ;
  const n=cellNoise(gx,gy,3),n2=cellNoise(gx,gy,4);
  const f=dim?0.35:1;
  const wc=dim?dimCol(th.wall_face,f):th.wall_face;
  const wt=dim?dimCol(th.wall_top,f):th.wall_top;
  const ws=dim?dimCol(th.wall_shadow,f):th.wall_shadow;
  const gr=dim?dimCol(th.grout,f):th.grout;
  // Fill
  ctx.fillStyle=wc;ctx.fillRect(px,py,SQ,SQ);
  // Stone course split
  const bh=Math.floor(SQ*0.48);
  ctx.fillStyle=wt;ctx.fillRect(px,py,SQ,bh);
  ctx.fillStyle=ws;ctx.fillRect(px,py+bh+1,SQ,SQ-bh-1);
  // Mortar line between courses
  ctx.fillStyle=gr;ctx.fillRect(px,py+bh,SQ,1);
  // Vertical joint (offset per row for running bond)
  const jx=(gy%2===0)?Math.floor(SQ*0.5):Math.floor(SQ*0.25);
  ctx.fillRect(px+jx,py,1,bh);
  ctx.fillRect(px+(jx+Math.floor(SQ*0.5))%SQ,py+bh+1,1,SQ-bh-1);
  // Texture fleck
  if(n>0.78){ctx.fillStyle=wt;ctx.fillRect(px+2+Math.floor(n*(SQ-5)),py+2+Math.floor(n2*(SQ-5)),2,1);}
  if(n2<0.09){ctx.fillStyle=ws;ctx.fillRect(px+4+Math.floor(n*3),py+4,1,3);}
}

/* ════════════════════════════════════════
   TILE IMAGE CROP TABLE (module scope — used by draw() and PNG export)
════════════════════════════════════════ */

/* ════════════════════════════════════════
   MAIN DRAW
════════════════════════════════════════ */
function draw(){
  resizeCanvas();
  rebuildCellMap();
  // Clear with identity transform
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#0d0a07';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // Apply zoom/offset for all world drawing
  applyTransform();

  // Collect cell sets — ONLY revealed tiles are drawn; everything else is fog
  const revSet=new Set();
  placed.forEach(pl=>{
    if(!pl.revealed) return;
    for(let dy=0;dy<pl.h;dy++) for(let dx=0;dx<pl.w;dx++)
      revSet.add(`${pl.gx+dx},${pl.gy+dy}`);
  });

  // Wall cells: empty cells immediately bordering revealed floor (1-cell border)
  const wallSet=new Map();
  revSet.forEach(k=>{
    const[gx,gy]=k.split(',').map(Number);
    for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
      const nk=`${gx+dx},${gy+dy}`;
      if(!revSet.has(nk)) wallSet.set(nk,{dim:false});
    }
  });

  // Pass 1 – walls (only around revealed areas)
  wallSet.forEach(({dim},k)=>{
    const[gx,gy]=k.split(',').map(Number);
    let th=THEME.dungeon;
    for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1]]){const pl=cellMap[`${gx+dx},${gy+dy}`];if(pl){th=getTh(pl.tile.theme);break;}}
    drawWallCell(gx,gy,th,false);
  });

  // Pass 2 – revealed floor: draw tile images, fall back to drawn floor cells
  placed.filter(p=>p.revealed).forEach(pl=>{
    const px=pl.gx*SQ, py=pl.gy*SQ, pw=pl.w*SQ, ph=pl.h*SQ;
    const imgKey = tileImgKey(pl.tile.id);
    const img = imgKey && tileImgCache[imgKey];
    if(img && img.complete && img.naturalWidth>0){
      ctx.fillStyle='#000';
      ctx.fillRect(px, py, pw, ph);
      const cr = IMG_CROPS[imgKey] || [0, 0, img.naturalWidth, img.naturalHeight];
      const imgW = cr[2], imgH = cr[3];
      const imgIsLandscape = imgW > imgH;
      const tileIsLandscape = pw > ph;
      ctx.save();
      if(imgIsLandscape !== tileIsLandscape){
        // Image and tile orientations differ — rotate canvas 90° around tile centre
        const cx = px + pw/2, cy = py + ph/2;
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI/2);
        ctx.translate(-cy, -cx);
        // After 90° rotation, draw into the rotated frame using swapped dimensions
        ctx.fillStyle='#000';
        ctx.fillRect(py, px, ph, pw);
        ctx.drawImage(img, cr[0], cr[1], imgW, imgH, py, px, ph, pw);
      } else {
        ctx.drawImage(img, cr[0], cr[1], imgW, imgH, px, py, pw, ph);
      }
      ctx.restore();
    } else {
      for(let dy=0;dy<pl.h;dy++) for(let dx=0;dx<pl.w;dx++)
        drawFloorCell(pl.gx+dx, pl.gy+dy, getTh(pl.tile.theme), false);
    }
  });

  // Pass 3 – red tint for boss room (revealed), green tint for start
  placed.filter(p=>p.revealed).forEach(pl=>{
    const px=pl.gx*SQ, py=pl.gy*SQ, pw=pl.w*SQ, ph=pl.h*SQ;
    if(pl.isBoss){
      ctx.fillStyle='rgba(180,20,15,0.32)';
      ctx.fillRect(px,py,pw,ph);
      ctx.strokeStyle='rgba(230,40,20,0.85)';
      ctx.lineWidth=3;
      ctx.strokeRect(px+2,py+2,pw-4,ph-4);
      ctx.lineWidth=1;
      // BOSS label
      ctx.save();
      ctx.font=`bold ${SQ*0.7}px serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle='rgba(0,0,0,0.55)';
      ctx.fillRect(px+pw/2-22,py+4,44,13);
      ctx.fillStyle='#ff4030';
      ctx.fillText('BOSS',px+pw/2,py+10);
      ctx.restore();
    }
    if(pl.tile.isStart){
      ctx.fillStyle='rgba(30,100,50,0.18)';
      ctx.fillRect(px,py,pw,ph);
    }
  });

  // Pass 4 – wall drop-shadows onto adjacent revealed floor
  wallSet.forEach(({dim},k)=>{
    if(dim)return;
    const[gx,gy]=k.split(',').map(Number);
    // Shadow below wall
    if(revSet.has(`${gx},${gy+1}`)){ctx.fillStyle='rgba(0,0,0,0.45)';ctx.fillRect(gx*SQ,(gy+1)*SQ,SQ,4);}
    // Shadow right of wall
    if(revSet.has(`${gx+1},${gy}`)){ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect((gx+1)*SQ,gy*SQ,3,SQ);}
  });

  // Pass 5 – torchlight glow
  placed.filter(p=>p.revealed).forEach(pl=>{
    const th=getTh(pl.tile.theme);
    const cx2=(pl.gx+pl.w/2)*SQ,cy2=(pl.gy+pl.h/2)*SQ;
    const rad=Math.max(pl.w,pl.h)*SQ*0.9;
    const g=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,rad);
    g.addColorStop(0,th.torch);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;
    ctx.fillRect(pl.gx*SQ-SQ,pl.gy*SQ-SQ,(pl.w+2)*SQ,(pl.h+2)*SQ);
  });

  // Pass 6 – tile labels (Cinzel font, subtle)
  placed.filter(p=>p.revealed).forEach(pl=>{
    const px=pl.gx*SQ,py=pl.gy*SQ;
    ctx.save();
    ctx.globalAlpha=0.55;
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillRect(px+2,py+2,pl.tile.id.length*5+4,9);
    ctx.fillStyle='#c8901a';
    ctx.font='7px serif';
    ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText(pl.tile.id.toUpperCase(),px+3,py+3);
    ctx.restore();
  });

  // Pass 7 – connections / doors
  connections.forEach(c=>drawConnection(c));

  // Pass 8 – explore hints
  drawExploreHints();

  // Pass 9 – entities
  placed.filter(p=>p.revealed).forEach(pl=>drawEntities(pl));

  // Pass 9b – elements & furniture
  drawElements();

  // Pass 10 – hero
  drawHero();

  // Pass 11 – fog edge
  drawFogEdge(revSet);

  // Reset to identity for any screen-space overlay
  ctx.setTransform(1,0,0,1,0,0);
  updateStats();
}

/* ── Entities ── */
function drawEntities(pl){
  const spread=Math.min(pl.w,pl.h)*SQ*0.28;
  pl.entities.forEach((ent,i)=>{
    const ang=(i/Math.max(pl.entities.length,1))*Math.PI*2;
    const r=pl.entities.length>1?spread:0;
    const ex=(pl.gx+pl.w/2)*SQ+Math.cos(ang)*r;
    const ey=(pl.gy+pl.h/2)*SQ+Math.sin(ang)*r;
    if(ent.type==='enemy'){
      ctx.fillStyle='#6a1010';ctx.beginPath();ctx.arc(ex,ey,7,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#b83030';ctx.beginPath();ctx.arc(ex,ey,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ffaaaa';ctx.fillRect(ex-3,ey-2,2,2);ctx.fillRect(ex+1,ey-2,2,2);
      ctx.fillStyle='#eee';ctx.fillRect(ex-2,ey+1,1,2);ctx.fillRect(ex,ey+1,1,2);ctx.fillRect(ex+2,ey+1,1,2);
    }
    if(ent.type==='treasure'){
      ctx.fillStyle='#4a2c06';ctx.fillRect(ex-6,ey-4,12,9);
      ctx.fillStyle='#b8820a';ctx.fillRect(ex-5,ey-3,10,7);
      ctx.fillStyle='#e8b830';ctx.fillRect(ex-5,ey-3,10,3);
      ctx.fillStyle='#4a2c06';ctx.fillRect(ex-2,ey-1,4,2);
      ctx.fillStyle='#e8c040';ctx.fillRect(ex-1,ey-1,2,2);
    }
    if(ent.type==='exit'){
      ctx.fillStyle='#103a10';ctx.beginPath();ctx.arc(ex,ey,8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#208820';ctx.beginPath();ctx.arc(ex,ey,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#50cc50';
      for(let s=0;s<3;s++)ctx.fillRect(ex-3+s*2,ey-2+s*2,5-s*2,1);
      ctx.strokeStyle='#50cc50';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(ex,ey,7,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1;
    }
  });
}

/* ── Hero token ── */
function drawHero(){
  const hx=(heroPos.gx+0.5)*SQ,hy=(heroPos.gy+0.5)*SQ;
  // Torch halo
  const g=ctx.createRadialGradient(hx,hy,0,hx,hy,SQ*3.5);
  g.addColorStop(0,'rgba(255,200,80,0.20)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(hx-SQ*3.5,hy-SQ*3.5,SQ*7,SQ*7);
  // Token shadow
  ctx.fillStyle='rgba(0,0,0,0.45)';
  ctx.beginPath();ctx.ellipse(hx+1,hy+2,7,5,0,0,Math.PI*2);ctx.fill();
  // Base disc
  ctx.fillStyle='#12336a';ctx.beginPath();ctx.arc(hx,hy,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2468b0';ctx.beginPath();ctx.arc(hx,hy,6,0,Math.PI*2);ctx.fill();
  // Highlight arc
  ctx.fillStyle='rgba(160,210,255,0.30)';
  ctx.beginPath();ctx.arc(hx-1,hy-1,4,Math.PI*1.1,Math.PI*1.9);ctx.fill();
  // Sword
  ctx.strokeStyle='#c8e0ff';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(hx-3,hy+3);ctx.lineTo(hx+2,hy-2);ctx.stroke();
  ctx.lineWidth=1;ctx.fillStyle='#c8e0ff';ctx.fillRect(hx-1,hy-3,3,1);
  // Ring
  ctx.strokeStyle='#4a90d8';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(hx,hy,7,0,Math.PI*2);ctx.stroke();
}


const BOSS_MIN_EXPLORED = 6; // sections revealed before boss door becomes active
function exploredCount(){ return placed.filter(p=>p.revealed && !p.tile.isStart).length; }

/* ── Connections / doors ── */
/* ── drawElements ─────────────────────────────────── */
function drawElements(){
  if(!placedElements.length) return;
  placedElements.forEach(pe => {
    const room = placed.find(p=>p.id===pe.roomId);
    if(!room || !room.revealed) return;
    const px = pe.gx*SQ, py = pe.gy*SQ;
    const isFurn = pe.el.type==='furniture';
    const isAuto = pe.el.auto;
    const searched = pe.searched;

    // Token background
    ctx.save();
    ctx.globalAlpha = searched ? 0.4 : 0.92;

    // Colour by type
    const bg   = isFurn ? 'rgba(60,40,10,0.88)'  : isAuto ? 'rgba(80,10,10,0.88)' : 'rgba(10,30,60,0.88)';
    const edge = isFurn ? '#c8a040' : isAuto ? '#d04030' : '#4080c0';
    const r = Math.max(4, SQ*0.38);

    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(px+1, py+1, SQ-2, SQ-2, 4);
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = searched ? 0.5 : 1.5;
    ctx.stroke();

    // Icon
    ctx.globalAlpha = searched ? 0.3 : 0.95;
    ctx.font = `bold ${Math.max(8, Math.round(SQ*0.42))}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icon = searched ? '✓' : isFurn ? '⚱' : isAuto ? '!' : '?';
    const iconCol = searched ? '#6a5030' : isFurn ? '#e8c060' : isAuto ? '#ff6040' : '#80c0ff';
    ctx.fillStyle = iconCol;
    ctx.fillText(icon, px+SQ/2, py+SQ/2);

    // Auto-trigger marker
    if(isAuto && !searched){
      ctx.globalAlpha = 0.9;
      ctx.font = `${Math.max(5, Math.round(SQ*0.25))}px serif`;
      ctx.fillStyle = '#ff8060';
      ctx.fillText('AUTO', px+SQ/2, py+SQ*0.82);
    }

    ctx.restore();
  });
}

function drawConnection(conn){
  const fromPl=placed[conn.fromId];
  const toPl=placed.find(p=>p.id===conn.toId);
  if(!fromPl||!toPl) return;
  if(!fromPl.revealed&&!toPl.revealed) return;
  const bothRev=fromPl.revealed&&toPl.revealed;
  const isDouble=conn.doorType==='double-door';

  // Boss door stays sealed until enough sections explored
  const unrevPl = fromPl.revealed ? toPl : fromPl;
  const bossLocked = unrevPl.isBoss && exploredCount() < BOSS_MIN_EXPLORED;

  const slot = conn.slot !== undefined ? conn.slot : (conn.slotStart||0);
  const span = 2 * SQ;
  const vertical = conn.side==='E'||conn.side==='W';

  // Shared wall pixel coordinate.
  // conn.side is direction FROM fromPl TO toPl.
  // E: wall = fromPl's right = toPl's left  → x = (fromPl.gx+fromPl.w)*SQ
  // W: wall = fromPl's left  = toPl's right → x =  fromPl.gx            *SQ
  // S: wall = fromPl's bottom= toPl's top   → y = (fromPl.gy+fromPl.h)*SQ
  // N: wall = fromPl's top   = toPl's bottom→ y =  fromPl.gy            *SQ
  let edgeX, edgeY;
  switch(conn.side){
    case 'E': edgeX=(fromPl.gx+fromPl.w)*SQ; edgeY=slot*SQ; break;
    case 'W': edgeX= fromPl.gx           *SQ; edgeY=slot*SQ; break;
    case 'S': edgeX=slot*SQ; edgeY=(fromPl.gy+fromPl.h)*SQ; break;
    case 'N': edgeX=slot*SQ; edgeY= fromPl.gy           *SQ; break;
    default: return;
  }
  // Door centre (used for label, arrow, click)
  const cx = vertical ? edgeX : edgeX + SQ;
  const cy = vertical ? edgeY + SQ : edgeY;

  // ── Clear only the 1px grout line at the shared wall — preserve tile image ──
  const revPl = fromPl.revealed ? fromPl : toPl;
  const th = getTh(revPl.tile.theme);
  const wallGx = Math.floor(edgeX/SQ);
  const wallGy = Math.floor(edgeY/SQ);
  const n0 = cellNoise(slot, slot+1, 1);
  const fc = n0<0.33 ? th.floor_a : n0<0.66 ? th.floor_b : th.floor_c;
  ctx.fillStyle = fc;
  if(vertical){
    // Erase only the 1px grout lines at the shared vertical wall
    for(let r=0; r<2; r++){
      ctx.fillRect( wallGx*SQ,           (slot+r)*SQ, 1, SQ ); // left edge of wallGx
      ctx.fillRect((wallGx-1)*SQ+SQ-1,   (slot+r)*SQ, 1, SQ ); // right edge of wallGx-1
    }
  } else {
    // Erase only the 1px grout lines at the shared horizontal wall
    for(let c=0; c<2; c++){
      ctx.fillRect((slot+c)*SQ,  wallGy*SQ,           SQ, 1 ); // top edge of wallGy
      ctx.fillRect((slot+c)*SQ, (wallGy-1)*SQ+SQ-1,   SQ, 1 ); // bottom edge of wallGy-1
    }
  }

  // ── Exploration arrow ──
  if(conn.doorType==='arrow'){
    // Show arrow on whichever side is REVEALED, pointing toward the unrevealed side
    const revealedSide = fromPl.revealed ? conn.side : oppSide(conn.side);
    const unrevIsTo    = fromPl.revealed;
    // Only draw if exactly one side is revealed
    if(fromPl.revealed === toPl.revealed) return;
    // Suppress hint if boss door is still locked
    const unrevPl2 = fromPl.revealed ? toPl : fromPl;
    if(unrevPl2.isBoss && exploredCount() < BOSS_MIN_EXPLORED) return;
    // Inset the arrow into the revealed tile (away from the wall)
    const inset = SQ * 0.9;
    let ax = cx, ay = cy;
    if(conn.side==='E'){ ax -= unrevIsTo ? inset : -inset; }
    if(conn.side==='W'){ ax += unrevIsTo ? inset : -inset; }
    if(conn.side==='S'){ ay -= unrevIsTo ? inset : -inset; }
    if(conn.side==='N'){ ay += unrevIsTo ? inset : -inset; }
    // Arrow points toward the unrevealed side
    const ang = {E:0,W:Math.PI,S:Math.PI/2,N:-Math.PI/2}[
      fromPl.revealed ? conn.side : oppSide(conn.side)];
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    ctx.fillStyle='rgba(255,220,60,0.25)';
    ctx.beginPath();ctx.arc(0,0,SQ*0.9,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f0c830';
    ctx.beginPath();
    ctx.moveTo(SQ*0.55,0);
    ctx.lineTo(-SQ*0.3,-SQ*0.38);
    ctx.lineTo(-SQ*0.1,-SQ*0.15);
    ctx.lineTo(-SQ*0.35,-SQ*0.15);
    ctx.lineTo(-SQ*0.35,SQ*0.15);
    ctx.lineTo(-SQ*0.1,SQ*0.15);
    ctx.lineTo(-SQ*0.3,SQ*0.38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle='#a07808';ctx.lineWidth=1;ctx.stroke();
    ctx.restore();
    return;
  }

  const ARCH = Math.max(4, Math.round(SQ*0.28)); // arch/frame depth in px

  if(bothRev){
    // ── Open door — stone arch frame, open passage ──
    ctx.fillStyle='#2a1c0a';
    if(vertical){
      ctx.fillRect(edgeX-ARCH, edgeY,        ARCH, span);  // left jamb
      ctx.fillRect(edgeX,      edgeY,        ARCH, span);  // right jamb
    } else {
      ctx.fillRect(edgeX, edgeY-ARCH,        span, ARCH);  // top lintel
      ctx.fillRect(edgeX, edgeY,             span, ARCH);  // bottom sill
    }
    // Keystone / centre voussoir highlight
    ctx.fillStyle='#5a3c1a';
    if(vertical){
      ctx.fillRect(edgeX-ARCH+1, edgeY+Math.floor(span/2)-2, ARCH*2-2, 4);
    } else {
      ctx.fillRect(edgeX+Math.floor(span/2)-2, edgeY-ARCH+1, 4, ARCH*2-2);
    }
    return;
  }

  // ── Closed door — prominent arch + door panel ──
  // Stone arch surround
  ctx.fillStyle='#1a1208';
  if(vertical){
    ctx.fillRect(edgeX-ARCH,   edgeY,  ARCH*2+2, span);
  } else {
    ctx.fillRect(edgeX,   edgeY-ARCH,  span,   ARCH*2+2);
  }
  // Door panel (oak-brown)
  const doorCol = isDouble ? '#7a5820' : '#6a4c18';
  ctx.fillStyle=doorCol;
  if(vertical){
    ctx.fillRect(edgeX-ARCH+2, edgeY+2, ARCH*2-2, span-4);
  } else {
    ctx.fillRect(edgeX+2, edgeY-ARCH+2, span-4, ARCH*2-2);
  }
  // Door planks (vertical grain)
  ctx.fillStyle='rgba(0,0,0,0.25)';
  if(vertical){
    // Horizontal planks on a vertical door bar
    for(let i=1;i<4;i++){
      const py=edgeY+Math.round((span/4)*i);
      ctx.fillRect(edgeX-ARCH+2,py,ARCH*2-2,1);
    }
  } else {
    // Vertical planks on a horizontal door bar
    for(let i=1;i<4;i++){
      const px=edgeX+Math.round((span/4)*i);
      ctx.fillRect(px,edgeY-ARCH+2,1,ARCH*2-2);
    }
  }
  // Centre split line for double door
  if(isDouble){
    ctx.fillStyle='#1a1208';
    if(vertical) ctx.fillRect(edgeX-1,edgeY+2,2,span-4);
    else         ctx.fillRect(edgeX+2,edgeY-1,span-4,2);
  }
  // Iron ring handle(s)
  ctx.strokeStyle='#c8a830';ctx.lineWidth=1.5;
  const rings = isDouble ? [span*0.3, span*0.7] : [span*0.5];
  rings.forEach(s=>{
    if(vertical){
      const ry = edgeY+s;
      ctx.beginPath();ctx.arc(edgeX+1,ry,3,0,Math.PI*2);ctx.stroke();
    } else {
      const rx = edgeX+s;
      ctx.beginPath();ctx.arc(rx,edgeY+1,3,0,Math.PI*2);ctx.stroke();
    }
  });
  ctx.lineWidth=1;

  if(bossLocked){
    // Sealed boss door: dark red, show padlock hint
    ctx.save();
    ctx.shadowColor='rgba(80,0,0,0.6)'; ctx.shadowBlur=6;
    ctx.strokeStyle='rgba(120,20,20,0.8)'; ctx.lineWidth=3;
    if(vertical) ctx.strokeRect(edgeX-ARCH, edgeY, ARCH*2+2, span);
    else         ctx.strokeRect(edgeX, edgeY-ARCH, span, ARCH*2+2);
    ctx.restore();
    const needed = BOSS_MIN_EXPLORED - exploredCount();
    ctx.save();
    ctx.globalAlpha=0.9;
    ctx.font=`bold ${Math.max(6,Math.round(SQ*0.35))}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const sealTxt = `🔒 ${needed} more`;
    const stw = ctx.measureText(sealTxt).width + 6;
    ctx.fillStyle='rgba(40,0,0,0.85)'; ctx.fillRect(cx-stw/2, cy-7, stw, 14);
    ctx.fillStyle='#aa3030'; ctx.fillText(sealTxt, cx, cy);
    ctx.restore();
  } else {
    // Normal glow
    const glowCol   = unrevPl.isBoss ? 'rgba(255,50,30,0.95)' : 'rgba(255,190,50,0.85)';
    const shadowCol = unrevPl.isBoss ? 'rgba(255,0,0,0.9)'    : 'rgba(255,180,40,0.9)';
    ctx.save();
    ctx.shadowColor=shadowCol; ctx.shadowBlur=10;
    ctx.strokeStyle=glowCol;  ctx.lineWidth=3;
    if(vertical) ctx.strokeRect(edgeX-ARCH, edgeY, ARCH*2+2, span);
    else         ctx.strokeRect(edgeX, edgeY-ARCH, span, ARCH*2+2);
    ctx.restore();
    const r=SQ*2.5;
    const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    grd.addColorStop(0,'rgba(255,210,60,0.38)');
    grd.addColorStop(0.4,'rgba(255,160,20,0.15)');
    grd.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grd; ctx.fillRect(cx-r,cy-r,r*2,r*2);
    // Door label
    ctx.save();
    ctx.globalAlpha=0.82;
    ctx.font=`bold ${Math.max(7,Math.round(SQ*0.4))}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const txt = isDouble ? 'DD' : 'D';
    const tw2 = ctx.measureText(txt).width + 6;
    ctx.fillStyle='rgba(10,6,2,0.75)'; ctx.fillRect(cx-tw2/2, cy-6, tw2, 12);
    ctx.fillStyle = unrevPl.isBoss ? '#ff4030' : '#ffc840';
    ctx.fillText(txt, cx, cy);
    ctx.restore();
  }
}

/* ── Fog edge ── */
function drawExploreHints(){
  connections.forEach(conn=>{
    const fromPl=placed[conn.fromId];
    const toPl=placed.find(p=>p.id===conn.toId);
    if(!fromPl||!toPl||conn.doorType==='arrow') return;
    // Only draw if exactly one side is revealed
    if(fromPl.revealed === toPl.revealed) return;
    // Suppress hint if boss door is still locked
    const unrevPl2 = fromPl.revealed ? toPl : fromPl;
    if(unrevPl2.isBoss && exploredCount() < BOSS_MIN_EXPLORED) return;
    if(fromPl.revealed&&!toPl.revealed){
      const dc = doorEdgeCentre(conn);
      if(!dc) return;
      const g=ctx.createRadialGradient(dc.cx,dc.cy,0,dc.cx,dc.cy,SQ*1.5);
      g.addColorStop(0,'rgba(220,160,40,0.25)');g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.fillRect(dc.cx-SQ*1.5,dc.cy-SQ*1.5,SQ*3,SQ*3);
    }
  });
}

function drawFogEdge(revSet){
  revSet.forEach(key=>{
    const[gx,gy]=key.split(',').map(Number);
    for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){
      const nk=`${gx+dx},${gy+dy}`;
      if(!revSet.has(nk)&&!cellMap[nk]){
        const fx=(gx+dx)*SQ,fy=(gy+dy)*SQ;
        ctx.fillStyle='rgba(13,10,7,0.88)';ctx.fillRect(fx,fy,SQ,SQ);
        ctx.fillStyle='rgba(0,0,0,0.55)';
        for(let sy=0;sy<SQ;sy+=2)
          for(let sx=(sy%4===0?0:1);sx<SQ;sx+=2)
            ctx.fillRect(fx+sx,fy+sy,1,1);
      }
    }
  });
}

/* ═══════════════════════════════════════
   INPUT EVENTS
   ═══════════════════════════════════════ */

// Scroll to pan (arrow keys + scroll wheel pans, +/- zooms)
const SCROLL_SPEED = 40; // world-px per keypress / scroll tick

// Mousewheel: Ctrl+wheel or plain wheel → zoom; plain scroll → pan
mapWrap.addEventListener('wheel', e => {
  e.preventDefault();
  if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    // Vertical scroll or ctrl+wheel → zoom centred on cursor
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    zoomAt(sx, sy, zoom + delta);
  } else {
    // Horizontal scroll → pan horizontally
    offsetX -= e.deltaX / zoom;
    clampOffset();
  }
  draw();
}, { passive: false });

// Helper: compute door edge centre in world pixels (mirrors drawConnection logic)
function doorEdgeCentre(conn){
  const fromPl=placed[conn.fromId];
  const toPl=placed.find(p=>p.id===conn.toId);
  if(!fromPl||!toPl) return null;
  const slot = conn.slot !== undefined ? conn.slot : (conn.slotStart||0);
  let cx, cy;
  // Must match drawConnection's edgeX/edgeY exactly
  switch(conn.side){
    case 'E': cx=(fromPl.gx+fromPl.w)*SQ; cy=(slot+1)*SQ; break;
    case 'W': cx= fromPl.gx           *SQ; cy=(slot+1)*SQ; break;
    case 'S': cx=(slot+1)*SQ; cy=(fromPl.gy+fromPl.h)*SQ; break;
    case 'N': cx=(slot+1)*SQ; cy= fromPl.gy           *SQ; break;
    default:  return null;
  }
  return { cx, cy };
}

// Click handler
canvas.addEventListener('click', e => {
  const { mx, my, rawX, rawY } = screenToGrid(e.clientX, e.clientY);

  // Check if we're clicking near a door/arrow first (takes priority over tile info)
  const HIT = SQ * 2.5;
  const clickedConn = connections.find(conn => {
    const fromPl = placed[conn.fromId];
    const toPl   = placed.find(p => p.id === conn.toId);
    if (!fromPl || !toPl) return false;
    if (!(fromPl.revealed ^ toPl.revealed)) return false;
    // Block if boss door is still locked
    const unrevPl = fromPl.revealed ? toPl : fromPl;
    if (unrevPl.isBoss && exploredCount() < BOSS_MIN_EXPLORED) return false;
    const dc = doorEdgeCentre(conn);
    if (!dc) return false;
    return Math.abs(rawX - dc.cx) < HIT && Math.abs(rawY - dc.cy) < HIT;
  });
  if (clickedConn) {
    const fromPl = placed[clickedConn.fromId];
    const toPl   = placed.find(p => p.id === clickedConn.toId);
    revealTile(fromPl.revealed ? toPl : fromPl);
    return;
  }

  // Check if clicking an element token
  const clickedEl = placedElements.find(pe => {
    const room = placed.find(p=>p.id===pe.roomId);
    return room && room.revealed && mx===pe.gx && my===pe.gy;
  });
  if(clickedEl){
    showElementInfo(clickedEl);
    draw();
    return;
  }

  // Click inside a revealed tile — show info
  const clickedRev = placed.find(p => p.revealed &&
    mx >= p.gx && mx < p.gx+p.w && my >= p.gy && my < p.gy+p.h);
  if (clickedRev) {
    selectedTile = clickedRev;
    showTileInfo(clickedRev);
    draw();
    return;
  }

  // Click unrevealed tile — reveal if connected to a revealed tile
  const clickedUnrev = placed.find(p => !p.revealed &&
    mx >= p.gx && mx < p.gx+p.w && my >= p.gy && my < p.gy+p.h);
  if (clickedUnrev) {
    if (clickedUnrev.isBoss && exploredCount() < BOSS_MIN_EXPLORED) return;
    const hasRevConn = connections.some(c => {
      const other = c.fromId === clickedUnrev.id ? c.toId : (c.toId === clickedUnrev.id ? c.fromId : -1);
      const otherPl = placed.find(p => p.id === other);
      return otherPl && otherPl.revealed;
    });
    if (hasRevConn) revealTile(clickedUnrev);
  }
});

// Tooltip on hover
canvas.addEventListener('mousemove', e => {
  const tip = document.getElementById('tooltip');
  const { mx, my, rawX, rawY } = screenToGrid(e.clientX, e.clientY);

  // Check door hover first
  const HIT = SQ * 2.5;
  const hovConn = connections.find(conn => {
    const fromPl = placed[conn.fromId];
    const toPl   = placed.find(p => p.id === conn.toId);
    if (!fromPl || !toPl) return false;
    if (!(fromPl.revealed ^ toPl.revealed)) return false;
    const dc = doorEdgeCentre(conn);
    return dc && Math.abs(rawX - dc.cx) < HIT && Math.abs(rawY - dc.cy) < HIT;
  });
  if (hovConn) {
    const fromPl2 = placed[hovConn.fromId];
    const toPl2   = placed.find(p => p.id === hovConn.toId);
    const unrevPl3 = fromPl2 && fromPl2.revealed ? toPl2 : fromPl2;
    const locked = unrevPl3 && unrevPl3.isBoss && exploredCount() < BOSS_MIN_EXPLORED;
    canvas.style.cursor = locked ? 'not-allowed' : 'pointer';
    tip.style.display = 'block';
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top  = (e.clientY + 10) + 'px';
    if (locked) {
      const needed = BOSS_MIN_EXPLORED - exploredCount();
      tip.textContent = `🔒 Boss chamber sealed\nExplore ${needed} more section${needed!==1?'s':''} first`;
    } else {
      const dt = hovConn.doorType === 'double-door' ? 'Double door' : hovConn.doorType === 'arrow' ? 'Passage' : 'Door';
      tip.textContent = `${dt} — click to explore`;
    }
    return;
  }

  canvas.style.cursor = 'crosshair';
  const hov = placed.find(p => mx >= p.gx && mx < p.gx+p.w && my >= p.gy && my < p.gy+p.h);
  if (hov && hov.revealed) {
    tip.style.display = 'block';
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top  = (e.clientY + 10) + 'px';
    tip.textContent = `${hov.tile.name} [${hov.tile.id}]\n${hov.tile.type.toUpperCase()} · ${hov.tile.theme.toUpperCase()}\n${hov.w}×${hov.h} squares`;
  } else {
    tip.style.display = 'none';
  }
});
canvas.addEventListener('mouseleave', () => { document.getElementById('tooltip').style.display = 'none'; });

/* ═══════════════════════════════════════
   UI UPDATES
   ═══════════════════════════════════════ */
function showElementInfo(pe){
  const el = pe.el;
  const room = placed.find(p=>p.id===pe.roomId);
  const typeLabel = el.type==='furniture' ? '🪑 FURNITURE' : el.auto ? '⚡ SPECIAL (AUTO)' : '★ SPECIAL ELEMENT';
  const coverStr  = el.cover ? ' · '+el.cover.toUpperCase()+' COVER' : '';
  document.getElementById('tile-name').textContent = el.name;
  document.getElementById('tile-type').textContent = typeLabel+' · '+el.sz+' sq'+coverStr+(el.impassable?' · IMPASSABLE':'')+(pe.searched?' · SEARCHED':'');
  document.getElementById('tile-desc').textContent =
    (el.searchable && !pe.searched ? 'SEARCHABLE - Use Action when adjacent. ' : '') +
    (el.auto ? 'AUTO-TRIGGER - Effect activates on entry. ' : '') +
    el.special + (room ? ' | Room: '+room.tile.name : '');
  const rollEl = document.getElementById('tile-roll');
  rollEl.innerHTML = '';
  if(el.searchable && !pe.searched){
    const btn = document.createElement('button');
    btn.textContent = 'MARK SEARCHED';
    btn.style.cssText = "font-family:'Cinzel',serif;font-size:11px;padding:4px 10px;border:1px solid #c8a040;background:#1a1408;color:#c8a060;cursor:pointer;margin-top:4px;";
    btn.onclick = function(){ pe.searched=true; draw(); showElementInfo(pe); };
    rollEl.appendChild(btn);
  }
}

function showTileInfo(pl) {
  const nameEl = document.getElementById('tile-name');
  const typeEl = document.getElementById('tile-type');
  const descEl = document.getElementById('tile-desc');
  const rollEl = document.getElementById('tile-roll');

  if (!pl) {
    nameEl.textContent = '—';
    typeEl.textContent = '';
    descEl.textContent = 'Click a revealed section to inspect it.';
    rollEl.innerHTML = '';
    return;
  }

  const t = pl.tile;
  nameEl.textContent = t.name;

  const catIcon = { dungeon:'⚔', civilised:'🏰', outdoor:'🌲' }[t.cat] || '✦';
  const catLabel = (t.cat||'dungeon').toUpperCase();
  typeEl.textContent = `${catIcon} ${catLabel} · [${t.id.toUpperCase()}] ${t.type.toUpperCase()} · ${t.theme.toUpperCase()} · ${pl.w}×${pl.h} sq`;

  let desc = '';
  if (t.special) desc += t.special + '\n';
  if (t.isMain) desc += 'MAIN ROOM — Quest objective may be here.\n';
  if (t.isDead) desc += 'DEAD END — No further exits.\n';
  if (t.isWater) desc += 'FLOODED — Difficult terrain.\n';
  if (t.isEnchanted) desc += 'ENCHANTED — Magic effects active.\n';
  descEl.textContent = desc || t.name;

  // Show exit roll + entity info
  let html = '';
  html += `<p>EXITS: ${resolveExits(t.exits)}</p>`;
  if (t.furniture) html += `<p>FURNITURE: ${t.furniture}</p>`;

  if (pl.entities.length) {
    pl.entities.forEach(en => {
      if (en.type === 'enemy')   html += `<p class="roll-danger">⚔ ENEMY PRESENT — Roll for encounter!</p>`;
      if (en.type === 'treasure') html += `<p class="roll-treasure">✦ TREASURE CHEST — Dexterity test to open.</p>`;
      if (en.type === 'exit')    html += `<p class="roll-exit">🏆 QUEST OBJECTIVE — Complete your mission here!</p>`;
    });
  }

  // DUN encounter roll
  const encRoll = rollD6Real(1);
  html += `<p style="margin-top:4px;color:#666">Encounter roll: <span class="roll-result">${encRoll}</span>${t.isMain?' (+1 bonus)':''}</p>`;
  if (encRoll + (t.isMain?1:0) >= 5) html += `<p class="roll-danger">⚠ ENCOUNTER CARD drawn!</p>`;

  rollEl.innerHTML = html;
}

function updateStats() {
  const total = placed.length - 1; // exclude start tile
  const rev   = placed.filter(p => p.revealed).length - 1;
  const enemies  = placed.filter(p=>p.revealed).reduce((a,p)=>a+p.entities.filter(e=>e.type==='enemy').length,0);
  const treasure = placed.filter(p=>p.revealed).reduce((a,p)=>a+p.entities.filter(e=>e.type==='treasure').length,0);
  document.getElementById('s-tiles').textContent    = Math.max(0,total);
  document.getElementById('s-pct').textContent      = total>0 ? Math.round(Math.max(0,rev)/total*100)+'%' : '0%';
  document.getElementById('s-enemies').textContent  = enemies;
  document.getElementById('s-treasure').textContent = treasure;
}

function addLog(msg, cls) {
  logLines.unshift({ msg, cls: cls||'' });
  if (logLines.length > 40) logLines.pop();
  const el = document.getElementById('log-body');
  el.innerHTML = logLines.map(l => `<p class="${l.cls}">${l.msg}</p>`).join('');
}

/* ═══════════════════════════════════════
/* ═══════════════════════════════════════
   MISSION MODAL
   ═══════════════════════════════════════ */

(function initMissionModal(){
  const overlay      = document.getElementById('mission-overlay');
  const list         = document.getElementById('mission-list');
  const settingRow   = document.getElementById('mission-setting-row');
  const startBtn     = document.getElementById('mission-start-btn');
  const settingBtns  = document.querySelectorAll('.setting-btn');

  let selectedMission = null;
  let selectedSetting = null;  // 'dungeon' | 'civilised' | 'outdoor' | null (if random)

  // ── Populate mission cards ──
  MISSIONS.forEach(m => {
    const card = document.createElement('div');
    card.className = 'mission-card';
    card.dataset.id = m.id;
    const rulesHtml = m.rules.map(r=>`<div>• ${r}</div>`).join('');
    card.innerHTML = `
      <div class="mc-header">
        <span class="mc-num">${m.icon} ${m.id}.</span>
        <span class="mc-name">${m.name}</span>
      </div>
      <div class="mc-goal">${m.goal}</div>
      <div class="mc-rules">${m.setup}<br><br>${rulesHtml}</div>`;
    card.addEventListener('click', () => selectMission(m, card));
    list.appendChild(card);
  });

  function selectMission(m, card){
    document.querySelectorAll('.mission-card').forEach(c=>c.classList.remove('selected'));
    card.classList.add('selected');
    selectedMission = m;
    selectedSetting = null;
    settingBtns.forEach(b=>b.classList.remove('active'));
    settingRow.style.display = 'block';
    startBtn.style.display   = 'block';
    startBtn.disabled        = true;
    updateStartBtn();
  }

  // ── Setting buttons ──
  settingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      settingBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      if(btn.dataset.cat === 'random'){
        // Pick random setting from mission's allowed list
        const allowed = selectedMission.settings;
        selectedSetting = allowed[Math.floor(Math.random()*allowed.length)];
      } else {
        selectedSetting = btn.dataset.cat;
      }
      updateStartBtn();
    });
  });

  function updateStartBtn(){
    startBtn.disabled = !(selectedMission && selectedSetting);
    if(selectedMission && selectedSetting){
      const label = {dungeon:'⚔ Dungeon',civilised:'🏰 Civilised',outdoor:'🌲 Outdoor'}[selectedSetting];
      startBtn.textContent = `BEGIN — ${selectedMission.name} · ${label} ▶`;
    }
  }

  // ── Start button ──
  startBtn.addEventListener('click', () => {
    if(!selectedMission || !selectedSetting) return;

    activeMission = { ...selectedMission, chosenSetting: selectedSetting };
    activeMission.turnsLeft = selectedMission.turnLimit || null;

    // Apply setting to the category selector
    const catSel = document.getElementById('sel-category');
    catSel.value = selectedSetting;
    activeCategory = selectedSetting;
    activeTheme = 'any';
    const themeSelM = document.getElementById('sel-theme');
    const themeCtrlM = document.getElementById('ctrl-theme');
    themeCtrlM.style.display = selectedSetting==='civilised' ? 'none' : '';
    themeSelM.value = 'any';
    rebuildDecks();

    // Update mission display in sidebar
    document.getElementById('mission-display').style.display = 'flex';
    document.getElementById('s-mission-name').textContent = `${selectedMission.icon} Mission ${selectedMission.id}: ${selectedMission.name}`;
    document.getElementById('s-mission-goal').textContent = selectedMission.goal;

    // Turn counter
    const turnRow = document.getElementById('turn-limit-row');
    const turnEl  = document.getElementById('s-turns');
    const endTurnBtn = document.getElementById('btn-end-turn');
    if(selectedMission.turnLimit){
      turnRow.style.display = 'flex';
      turnEl.textContent = selectedMission.turnLimit;
      turnEl.style.color = '#e8b040';
      endTurnBtn.style.display = '';
    } else {
      turnRow.style.display = 'none';
      endTurnBtn.style.display = 'none';
    }

    // Update header subtitle
    document.querySelector('#header p').textContent =
      `MISSION ${selectedMission.id}: ${selectedMission.name.toUpperCase()} · ${selectedSetting.toUpperCase()}`;

    overlay.style.display = 'none';
    newDungeon();
    requestAnimationFrame(() => { resizeCanvas(); fitDungeon(); draw(); });
  });

  // ── Re-open modal from toolbar ──
  document.getElementById('btn-mission-select').addEventListener('click', () => {
    overlay.style.display = 'flex';
  });

  // The overlay starts visible on load — no need to show it manually
})();

/* ═══════════════════════════════════════
   BUILDER PLAY MODE HOOK
   Called by the dungeon builder's ▶ PLAY button
   ═══════════════════════════════════════ */
window.loadBuilderDungeon = function(builderPlaced, builderConns) {
  // Reset generator state
  levelNum++;
  seed = Math.floor(Math.random()*99999)+1000;
  rng  = mkRng(seed);
  placed=[]; connections=[]; logLines=[]; selectedTile=null; canalExits=[]; placedElements=[];
  occ = new Set();

  // Load builder tiles into generator format
  builderPlaced.forEach(function(bp) {
    var pl = {
      id: bp.id,
      tile: bp.tile,
      gx: bp.gx, gy: bp.gy,
      w: bp.w, h: bp.h,
      rot: bp.rot||0,
      revealed: bp.revealed||false,
      entities: [],
      isBoss: bp.isBoss||false,
      isObjective: bp.isObjective||false,
    };
    placed.push(pl);
    occAdd(pl);
  });

  // Load connections
  connections = builderConns.map(function(c) {
    return {
      fromId: c.fromId, toId: c.toId,
      side: c.side, slot: c.slot,
      doorType: c.doorType||'single-door'
    };
  });

  // Hide mission overlay, update header
  var overlay = document.getElementById('mission-overlay');
  if(overlay) overlay.style.display = 'none';
  var headerP = document.querySelector('#header p');
  if(headerP) headerP.textContent = 'BUILDER DUNGEON · CUSTOM LAYOUT';
  var seedEl = document.getElementById('seed-val');
  if(seedEl) seedEl.textContent = seed;

  // Update stats
  updateStats();
  rebuildDecks();

  requestAnimationFrame(function() {
    resizeCanvas(); fitDungeon(); draw();
  });
};

   /* ═══════════════════════════════════════
   BUTTON WIRING
   ═══════════════════════════════════════ */
document.getElementById('sel-category').addEventListener('change', e => {
  activeCategory = e.target.value;
  // Update theme options to match setting
  const themeSel = document.getElementById('sel-theme');
  const themeCtrl = document.getElementById('ctrl-theme');
  // Show/hide theme selector based on category
  themeCtrl.style.display = (activeCategory==='civilised') ? 'none' : '';
  if(activeCategory==='civilised'){ activeTheme='any'; themeSel.value='any'; }
  // Swap theme options for outdoor vs dungeon
  const isDungeon = activeCategory==='dungeon'||activeCategory==='all';
  const isOutdoor = activeCategory==='outdoor';
  themeSel.innerHTML = '<option value="any">✦ Any</option>';
  if(isDungeon||activeCategory==='all'){
    themeSel.innerHTML += '<option value="dungeon">⚔ Stone</option>'
      +'<option value="crypt">💀 Crypt</option>'
      +'<option value="cave">🪨 Cave</option>'
      +'<option value="sewer">💧 Sewer</option>';
  }
  if(isOutdoor||activeCategory==='all'){
    themeSel.innerHTML += '<option value="outdoor">☀ Wilderness</option>'
      +'<option value="forest">🌿 Forest</option>';
  }
  activeTheme = 'any';
  themeSel.value = 'any';
  rebuildDecks();
  addLog(`Setting changed to: ${e.target.options[e.target.selectedIndex].text}`, 'li');
});

document.getElementById('sel-theme').addEventListener('change', e => {
  activeTheme = e.target.value;
  rebuildDecks();
  const label = e.target.options[e.target.selectedIndex].text;
  addLog(`Theme: ${label}`, 'li');
});

document.getElementById('btn-new').addEventListener('click', () => { newDungeon(); requestAnimationFrame(() => { resizeCanvas(); fitDungeon(); draw(); }); });

document.getElementById('btn-reveal').addEventListener('click', () => {
  placed.forEach(p => { if (!p.revealed) revealTile(p); });
  addLog('All sections revealed (Game Master mode).', 'li');
  draw();
});

document.getElementById('btn-fog').addEventListener('click', () => {
  placed.forEach((p, i) => { if (i > 0) p.revealed = false; });
  heroPos = { gx: placed[0].gx + Math.floor(placed[0].w/2), gy: placed[0].gy + Math.floor(placed[0].h/2) };
  addLog('Fog of war restored.', '');
  updateStats();
  draw();
  showTileInfo(null);
});

document.getElementById('btn-roll').addEventListener('click', () => {
  const r = rollD6Real(1);
  document.getElementById('dice-result').textContent = `🎲 ${r}`;
  addLog(`D6 roll: ${r}`, '');
});

document.getElementById('btn-end-turn').addEventListener('click', () => {
  if(!activeMission || !activeMission.turnsLeft) return;
  activeMission.turnsLeft--;
  const turnEl = document.getElementById('s-turns');
  turnEl.textContent = activeMission.turnsLeft;
  // Colour shift as time runs out
  if(activeMission.turnsLeft <= 0){
    turnEl.style.color = '#e03020';
    addLog('⏱ Time expired! Dark Player wins!', 'ld');
  } else if(activeMission.turnsLeft <= 10){
    turnEl.style.color = '#e03020';
    addLog(`⏱ Turn ended — ${activeMission.turnsLeft} turn${activeMission.turnsLeft!==1?'s':''} remaining!`, 'ld');
  } else if(activeMission.turnsLeft <= 20){
    turnEl.style.color = '#e08020';
    addLog(`⏱ Turn ended — ${activeMission.turnsLeft} turns remaining.`, '');
  } else {
    addLog(`⏱ Turn ended — ${activeMission.turnsLeft} turns remaining.`, '');
  }
});

document.querySelectorAll('.dice-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const n = parseInt(btn.dataset.n || '1');
    const d = parseInt(btn.dataset.d);
    let total = 0, rolls = [];
    for (let i = 0; i < n; i++) { const r = Math.floor(Math.random()*d)+1; total+=r; rolls.push(r); }
    document.getElementById('dice-result').textContent = `🎲 ${total}${n>1?' ('+rolls.join('+')+')':''}`;
    addLog(`${n}D${d}: ${total}${n>1?' ['+rolls.join(',')+']':''}`, '');
  });
});

document.getElementById('btn-zoom-in').addEventListener('click', () => {
  zoomCenter(zoom + ZOOM_STEP); draw();
});
document.getElementById('btn-zoom-out').addEventListener('click', () => {
  zoomCenter(zoom - ZOOM_STEP); draw();
});
document.getElementById('btn-zoom-fit').addEventListener('click', () => { fitDungeon(); draw(); });
document.getElementById('btn-centre-hero').addEventListener('click', centreOnHero);

/* ── Export PNG ── */
document.getElementById('btn-export-png').addEventListener('click', () => {
  if (!placed.length) { addLog('Nothing to export — generate a dungeon first.', 'ld'); return; }

  // Determine bounding box of all placed tiles (revealed + unrevealed)
  const minGx = Math.min(...placed.map(p => p.gx));
  const minGy = Math.min(...placed.map(p => p.gy));
  const maxGx = Math.max(...placed.map(p => p.gx + p.w));
  const maxGy = Math.max(...placed.map(p => p.gy + p.h));

  const PAD = 3; // padding in grid cells
  const exportSQ = 20; // pixels per grid cell in export
  const exportW = (maxGx - minGx + PAD * 2) * exportSQ;
  const exportH = (maxGy - minGy + PAD * 2) * exportSQ;

  // Create offscreen canvas
  const offCanvas = document.createElement('canvas');
  offCanvas.width  = exportW;
  offCanvas.height = exportH;
  const offCtx = offCanvas.getContext('2d');

  // Background
  offCtx.fillStyle = '#0d0a07';
  offCtx.fillRect(0, 0, exportW, exportH);

  // Translate so minGx/minGy lands at PAD
  const ox = (PAD - minGx) * exportSQ;
  const oy = (PAD - minGy) * exportSQ;

  // Helper colour functions (local copies for offCtx)
  function _parseCol(hex){const v=parseInt(hex.replace('#',''),16);return[(v>>16)&255,(v>>8)&255,v&255];}
  function _toHex(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
  function _dimCol(hex,f){const[r,g,b]=_parseCol(hex);return _toHex(r*f,g*f,b*f);}
  function _lightenCol(hex,f){const[r,g,b]=_parseCol(hex);return _toHex(r+(255-r)*f,g+(255-g)*f,b+(255-b)*f);}
  function _darkenCol(hex,f){const[r,g,b]=_parseCol(hex);return _toHex(r*(1-f),g*(1-f),b*(1-f));}
  function _noise(gx,gy,s){let h=(gx*374761393+gy*668265263+(s||0))|0;h^=h>>>13;h=Math.imul(h,1274126177);h^=h>>>16;return(h>>>0)/0xFFFFFFFF;}

  function _drawFloor(gx,gy,th,dim){
    const px=ox+gx*exportSQ, py=oy+gy*exportSQ, sq=exportSQ;
    const n=_noise(gx,gy,1),n2=_noise(gx,gy,2), f=dim?0.42:1;
    let fc=n<0.33?th.floor_a:n<0.66?th.floor_b:th.floor_c;
    if(dim)fc=_dimCol(fc,f);
    offCtx.fillStyle=fc; offCtx.fillRect(px+1,py+1,sq-1,sq-1);
    offCtx.fillStyle=dim?_dimCol(th.grout,f):th.grout;
    offCtx.fillRect(px,py,sq,1); offCtx.fillRect(px,py,1,sq);
    offCtx.fillStyle=_lightenCol(fc,dim?0.06:0.13);
    offCtx.fillRect(px+1,py+1,sq-2,1); offCtx.fillRect(px+1,py+1,1,sq-2);
    offCtx.fillStyle=_darkenCol(fc,dim?0.10:0.22);
    offCtx.fillRect(px+1,py+sq-2,sq-2,1); offCtx.fillRect(px+sq-2,py+1,1,sq-2);
  }

  function _drawWall(gx,gy,th){
    const px=ox+gx*exportSQ, py=oy+gy*exportSQ, sq=exportSQ;
    const n=_noise(gx,gy,3),n2=_noise(gx,gy,4);
    offCtx.fillStyle=th.wall_face; offCtx.fillRect(px,py,sq,sq);
    const bh=Math.floor(sq*0.48);
    offCtx.fillStyle=th.wall_top; offCtx.fillRect(px,py,sq,bh);
    offCtx.fillStyle=th.wall_shadow; offCtx.fillRect(px,py+bh+1,sq,sq-bh-1);
    offCtx.fillStyle=th.grout; offCtx.fillRect(px,py+bh,sq,1);
    const jx=(gy%2===0)?Math.floor(sq*0.5):Math.floor(sq*0.25);
    offCtx.fillRect(px+jx,py,1,bh);
    offCtx.fillRect(px+(jx+Math.floor(sq*0.5))%sq,py+bh+1,1,sq-bh-1);
  }

  // Collect revealed and wall cells
  const expRevSet = new Set();
  placed.forEach(pl => {
    if (!pl.revealed) return;
    for(let dy=0;dy<pl.h;dy++) for(let dx=0;dx<pl.w;dx++)
      expRevSet.add(`${pl.gx+dx},${pl.gy+dy}`);
  });
  const expWallSet = new Set();
  expRevSet.forEach(k => {
    const[gx,gy]=k.split(',').map(Number);
    for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
      const nk=`${gx+dx},${gy+dy}`;
      if(!expRevSet.has(nk)) expWallSet.add(nk);
    }
  });

  // Draw walls
  expWallSet.forEach(k => {
    const[gx,gy]=k.split(',').map(Number);
    let th=THEME.dungeon;
    for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1]]){
      const pl=cellMap[`${gx+dx},${gy+dy}`];
      if(pl){th=getTh(pl.tile.theme);break;}
    }
    _drawWall(gx,gy,th);
  });

  // Draw floor / tile images
  placed.filter(p=>p.revealed).forEach(pl=>{
    const px=ox+pl.gx*exportSQ, py=oy+pl.gy*exportSQ;
    const pw=pl.w*exportSQ, ph=pl.h*exportSQ;
    const imgKey = tileImgKey(pl.tile.id);
    const img = imgKey && tileImgCache[imgKey];
    if(img && img.complete && img.naturalWidth>0){
      offCtx.fillStyle='#000'; offCtx.fillRect(px,py,pw,ph);
      const cr = IMG_CROPS[imgKey] || [0,0,img.naturalWidth,img.naturalHeight];
      const imgIsLandscape = cr[2]>cr[3], tileIsLandscape = pw>ph;
      offCtx.save();
      if(imgIsLandscape !== tileIsLandscape){
        const cx=px+pw/2, cy=py+ph/2;
        offCtx.translate(cx,cy); offCtx.rotate(Math.PI/2); offCtx.translate(-cy,-cx);
        offCtx.drawImage(img,cr[0],cr[1],cr[2],cr[3],oy+pl.gy*exportSQ,ox+pl.gx*exportSQ,ph,pw);
      } else {
        offCtx.drawImage(img,cr[0],cr[1],cr[2],cr[3],px,py,pw,ph);
      }
      offCtx.restore();
    } else {
      for(let dy=0;dy<pl.h;dy++) for(let dx=0;dx<pl.w;dx++)
        _drawFloor(pl.gx+dx,pl.gy+dy,getTh(pl.tile.theme),false);
    }
    // Boss tint
    if(pl.isBoss){
      offCtx.fillStyle='rgba(180,20,15,0.32)'; offCtx.fillRect(px,py,pw,ph);
      offCtx.strokeStyle='rgba(230,40,20,0.85)'; offCtx.lineWidth=3;
      offCtx.strokeRect(px+2,py+2,pw-4,ph-4); offCtx.lineWidth=1;
      offCtx.save();
      offCtx.font=`bold ${exportSQ*0.7}px serif`;
      offCtx.textAlign='center'; offCtx.textBaseline='middle';
      offCtx.fillStyle='rgba(0,0,0,0.55)'; offCtx.fillRect(px+pw/2-22,py+4,44,13);
      offCtx.fillStyle='#ff4030'; offCtx.fillText('BOSS',px+pw/2,py+10);
      offCtx.restore();
    }
    if(pl.tile.isStart){
      offCtx.fillStyle='rgba(30,100,50,0.18)'; offCtx.fillRect(px,py,pw,ph);
    }
  });

  // Draw wall drop shadows
  expWallSet.forEach(k => {
    const[gx,gy]=k.split(',').map(Number);
    if(expRevSet.has(`${gx},${gy+1}`)){offCtx.fillStyle='rgba(0,0,0,0.45)';offCtx.fillRect(ox+gx*exportSQ,oy+(gy+1)*exportSQ,exportSQ,4);}
    if(expRevSet.has(`${gx+1},${gy}`)){offCtx.fillStyle='rgba(0,0,0,0.25)';offCtx.fillRect(ox+(gx+1)*exportSQ,oy+gy*exportSQ,3,exportSQ);}
  });

  // Torchlight glow
  placed.filter(p=>p.revealed).forEach(pl=>{
    const th=getTh(pl.tile.theme);
    const cx2=ox+(pl.gx+pl.w/2)*exportSQ, cy2=oy+(pl.gy+pl.h/2)*exportSQ;
    const rad=Math.max(pl.w,pl.h)*exportSQ*0.9;
    const g=offCtx.createRadialGradient(cx2,cy2,0,cx2,cy2,rad);
    g.addColorStop(0,th.torch); g.addColorStop(1,'rgba(0,0,0,0)');
    offCtx.fillStyle=g;
    offCtx.fillRect(ox+pl.gx*exportSQ-exportSQ,oy+pl.gy*exportSQ-exportSQ,(pl.w+2)*exportSQ,(pl.h+2)*exportSQ);
  });

  // Draw connections/doors
  connections.forEach(c=>{
    const fromPl=placed.find(p=>p.id===c.fromId);
    const toPl=placed.find(p=>p.id===c.toId);
    if(!fromPl||!toPl||!fromPl.revealed||!toPl.revealed) return;
    const sq=exportSQ;
    const ex=ox+c.ex*sq, ey=oy+c.ey*sq;
    const horiz=c.side==='E'||c.side==='W';
    const doorCol=c.doorType==='double-door'?'#ffd060':'#c8a060';
    offCtx.fillStyle=doorCol;
    if(horiz){ offCtx.fillRect(ex,ey,2,sq*2); offCtx.fillRect(ex,ey,2,sq*2); }
    else      { offCtx.fillRect(ex,ey,sq*2,2); }
  });

  // Title / watermark
  offCtx.save();
  offCtx.font = 'bold 13px serif';
  offCtx.fillStyle = 'rgba(200,160,80,0.7)';
  offCtx.textAlign = 'right';
  offCtx.textBaseline = 'bottom';
  const missionLabel = activeMission ? `${activeMission.icon} Mission ${activeMission.id}: ${activeMission.name}  ·  ` : '';
  offCtx.fillText(`⚔ DUNGEON UNIVERSALIS  ·  ${missionLabel}Seed ${seed}`, exportW - 8, exportH - 6);
  offCtx.restore();

  // Trigger download
  const missionName = activeMission ? activeMission.name.replace(/\s+/g,'_') : 'dungeon';
  const fname = `DUN_${missionName}_seed${seed}.png`;
  offCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fname; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    addLog(`📷 Exported: ${fname}`, 'li');
  }, 'image/png');
});

// Keyboard shortcuts
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  let moved = false;
  if (e.key === '+' || e.key === '=') { zoomCenter(zoom + ZOOM_STEP); moved = true; }
  if (e.key === '-' || e.key === '_') { zoomCenter(zoom - ZOOM_STEP); moved = true; }
  if (e.key === '0' || e.key === 'f' || e.key === 'F') { fitDungeon(); moved = true; }
  if (e.key === ' ') { e.preventDefault(); centreOnHero(); return; }
  if (e.key === 'ArrowLeft')  { offsetX += SCROLL_SPEED / zoom; clampOffset(); moved = true; }
  if (e.key === 'ArrowRight') { offsetX -= SCROLL_SPEED / zoom; clampOffset(); moved = true; }
  if (e.key === 'ArrowUp')    { offsetY += SCROLL_SPEED / zoom; clampOffset(); moved = true; }
  if (e.key === 'ArrowDown')  { offsetY -= SCROLL_SPEED / zoom; clampOffset(); moved = true; }
  if (moved) { e.preventDefault(); draw(); }
});

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */
resizeCanvas();
preloadTileImages();  // Start loading all tile images in background
// Dungeon is generated when player confirms mission in the modal

// Re-fit on window resize
window.addEventListener('resize', () => { resizeCanvas(); fitDungeon(); draw(); });

})();
