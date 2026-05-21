/* ═══════════════════════════════════════════════════════════════
   DUNGEON GENERATOR — Procedural dungeon layout engine
   Produces multi-floor dungeons with multiple routes,
   inspired by Advanced HeroQuest, Warhammer Quest, Diablo.
   ═══════════════════════════════════════════════════════════════ */

(function(global){
'use strict';

/* ── RNG (seeded) ──────────────────────────────────────────── */
function mkRng(seed) {
  var s = seed || Date.now();
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
function rndInt(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }
function rndPick(rng, arr)     { return arr[Math.floor(rng() * arr.length)]; }
function shuffle(rng, arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ── TILE POOLS ──────────────────────────────────────────────
   Organised by theme. Each theme has:
   start, corridors[], rooms[], largeRooms[], boss[], stairs[]
──────────────────────────────────────────────────────────────*/
var POOLS = {
  dungeon: {
    start:      '24af',
    corridors:  ['21ae','3ae','4ae','29ae','33ae','34ae','3be','4be'],
    rooms:      ['2ac','5ac','6bc3','8ac','12ac','12bc','12ae','15ac','14ac','36ac','36bc','7bc','19ad'],
    largeRooms: ['01aa','02aa'],
    boss:       ['44aa','43ba','68ba','01aa'],
    stairs:     ['06bc','68aa'],
  },
  crypt: {
    start:      '24af',
    corridors:  ['22ae','37ag','82ae'],
    rooms:      ['6ac','7ac','5bc','78ac','79ac','88ac','89ac'],
    largeRooms: ['69bc'],
    boss:       ['69bc'],
    stairs:     ['06bc'],
  },
  cave: {
    start:      '24af',
    corridors:  ['60ae','54ae','59ae','46be','10ag','10bg'],
    rooms:      ['47ac','48ac','49ac','50ac','55ac','56ac','57ac','58ac'],
    largeRooms: ['44ba'],
    boss:       ['44ba'],
    stairs:     ['06bc'],
  },
  sewer: {
    start:      '24bf',
    corridors:  ['21be','22be','23be'],
    rooms:      ['18bc','17bc','17ac3','61bc','62bc','63bc','64bc'],
    largeRooms: ['18bc'],
    boss:       ['01aa'],
    stairs:     ['06bc'],
  },
  civilised: {
    start:      'civstart',
    corridors:  ['90be','51be','84ae','85ae','45ae','46ae','51bc'],
    rooms:      ['14bc','78bc','79bc','80ac','80bc','81ac','81bc','86ac','87ac','87bc'],
    largeRooms: ['31ba'],
    boss:       ['31ba','68ba'],
    stairs:     ['06bc'],
  },
  outdoor: {
    start:      '24af',
    corridors:  ['90ae','91ae','92ae','93ae','82be','29be','30ae'],
    rooms:      ['15bc','26ab','28ab','25ab','25bb','72ab'],
    largeRooms: ['01ba','02ba'],
    boss:       ['01ba','02ba','32aa','32ba'],
    stairs:     ['68aa'],
  },
};

/* ── TILE SIZE LOOKUP ────────────────────────────────────────*/
function tileSize(tileId) {
  if (!global.TILE_DB) return {w:6,h:6};
  var t = global.TILE_DB.find(function(x){return x.id===tileId;});
  if (!t) return {w:6,h:6};
  var sz = Array.isArray(t.sz) ? t.sz : [t.sz,t.sz];
  return {w:sz[0], h:sz[1]};
}
function rotSize(tileId, rot) {
  var s = tileSize(tileId);
  return (rot===1||rot===3) ? {w:s.h, h:s.w} : {w:s.w, h:s.h};
}

/* ── OCCUPANCY MAP ──────────────────────────────────────────*/
function buildOcc(tiles) {
  var occ = {};
  tiles.forEach(function(t) {
    var s = rotSize(t.tileId, t.rot||0);
    for (var dy=0; dy<s.h; dy++) for (var dx=0; dx<s.w; dx++)
      occ[(t.gx+dx)+','+(t.gy+dy)] = true;
  });
  return occ;
}
function canPlace(tiles, tileId, gx, gy, rot) {
  var occ = buildOcc(tiles);
  var s = rotSize(tileId, rot||0);
  if (gx < 0 || gy < 0 || gx+s.w > 100 || gy+s.h > 80) return false;
  for (var dy=0; dy<s.h; dy++) for (var dx=0; dx<s.w; dx++)
    if (occ[(gx+dx)+','+(gy+dy)]) return false;
  return true;
}

/* ══════════════════════════════════════════════════════════════
   LAYOUT ARCHETYPES
   Each archetype is a room-graph description:
   - rooms: array of {role, pos: {x,y} in abstract units, size}
   - corridors: array of {from, to} indices
   roles: 'start' | 'guard' | 'treasure' | 'ambush' | 'ritual' |
          'junction' | 'dead-end' | 'stairs' | 'boss'
══════════════════════════════════════════════════════════════*/

var ARCHETYPES = {

  // AHQ classic: spine + 2 wings, boss at end
  spine: function(rng, size) {
    var rooms = [
      {role:'start',    x:0,  y:2},
      {role:'guard',    x:2,  y:2},
      {role:'junction', x:4,  y:2},
      {role:'treasure', x:4,  y:0},
      {role:'ambush',   x:4,  y:4},
      {role:'junction', x:6,  y:2},
      {role:'dead-end', x:6,  y:0},
      {role:'ritual',   x:6,  y:4},
      {role:'boss',     x:8,  y:2},
    ];
    var corridors = [[0,1],[1,2],[2,3],[2,4],[2,5],[5,6],[5,7],[5,8]];
    if (size === 'large') {
      rooms.push({role:'guard',    x:3, y:0});
      rooms.push({role:'treasure', x:7, y:0});
      corridors.push([rooms.length-2, 3]);
      corridors.push([rooms.length-1, 6]);
    }
    return {rooms:rooms, corridors:corridors};
  },

  // Diablo catacombs: 3-wide grid with loops
  catacombs: function(rng, size) {
    var cols = size==='small' ? 2 : size==='medium' ? 3 : 4;
    var rows = 3;
    var rooms = [];
    var corridors = [];
    // Build grid of rooms
    for (var c=0; c<cols; c++) for (var r=0; r<rows; r++) {
      var role = 'guard';
      if (c===0 && r===1) role='start';
      else if (c===cols-1 && r===1) role='boss';
      else if (c===0) role='dead-end';
      else if (c===cols-1) role='treasure';
      else role = rndPick(rng, ['guard','ambush','treasure','ritual','dead-end']);
      rooms.push({role:role, x:c*2, y:r*2});
    }
    // Horizontal corridors
    for (var c2=0; c2<cols-1; c2++) for (var r2=0; r2<rows; r2++) {
      if (rng() > 0.2) corridors.push([c2*rows+r2, (c2+1)*rows+r2]);
    }
    // Vertical corridors (loops)
    for (var c3=0; c3<cols; c3++) for (var r3=0; r3<rows-1; r3++) {
      if (rng() > 0.3) corridors.push([c3*rows+r3, c3*rows+r3+1]);
    }
    // Ensure start connected
    if (!corridors.find(function(c){return c[0]===1||c[1]===1;}))
      corridors.push([1,4]);
    return {rooms:rooms, corridors:corridors};
  },

  // Warhammer Quest: open hub with radiating branches
  hub: function(rng, size) {
    var rooms = [
      {role:'start',    x:0, y:3},
      {role:'junction', x:2, y:3},   // central hub
      {role:'guard',    x:2, y:1},
      {role:'treasure', x:2, y:5},
      {role:'ambush',   x:4, y:1},
      {role:'ritual',   x:4, y:5},
      {role:'junction', x:4, y:3},
      {role:'dead-end', x:6, y:1},
      {role:'dead-end', x:6, y:5},
      {role:'boss',     x:6, y:3},
    ];
    var corridors = [
      [0,1],[1,2],[1,3],[1,6],
      [2,4],[3,5],[4,6],[5,6],
      [4,7],[5,8],[6,9],[7,9],[8,9]
    ];
    if (size==='large') {
      rooms.push({role:'ambush',   x:3, y:0});
      rooms.push({role:'treasure', x:3, y:6});
      corridors.push([2, rooms.length-2]);
      corridors.push([3, rooms.length-1]);
    }
    return {rooms:rooms, corridors:corridors};
  },

  // AHQ barrow: linear with shortcuts and secret paths
  barrow: function(rng, size) {
    var rooms = [
      {role:'start',    x:0, y:2},
      {role:'guard',    x:2, y:2},
      {role:'ambush',   x:4, y:1},
      {role:'treasure', x:4, y:3},
      {role:'junction', x:6, y:2},
      {role:'ritual',   x:6, y:0},
      {role:'dead-end', x:6, y:4},
      {role:'guard',    x:8, y:2},
      {role:'boss',     x:10,y:2},
    ];
    var corridors = [
      [0,1],[1,2],[1,3],[2,4],[3,4],
      [4,5],[4,6],[4,7],[7,8]
    ];
    // Shortcut loop
    corridors.push([1,4]);
    if (size==='large') {
      rooms.push({role:'ambush', x:8,y:0});
      corridors.push([7, rooms.length-1]);
      corridors.push([rooms.length-1, 8]);
    }
    return {rooms:rooms, corridors:corridors};
  },
};

/* ── ARCHETYPE SELECTION ────────────────────────────────────*/
function pickArchetype(rng, routes) {
  if (routes==='linear')   return rndPick(rng,['spine','barrow']);
  if (routes==='open')     return rndPick(rng,['hub','catacombs']);
  return rndPick(rng,['spine','barrow','hub','catacombs']);
}

/* ══════════════════════════════════════════════════════════════
   GRID PLACER
   Converts abstract room graph to real tile placements on the
   builder's 100×80 grid.
══════════════════════════════════════════════════════════════*/

var ROOM_STEP_X = 14;  // abstract unit → grid squares
var ROOM_STEP_Y = 12;
var ORIGIN_X    = 2;
var ORIGIN_Y    = 10;

function roleTileId(rng, role, pool, usedBoss) {
  if (role==='start')    return pool.start;
  if (role==='boss')     return rndPick(rng, pool.boss);
  if (role==='stairs')   return rndPick(rng, pool.stairs);
  if (role==='junction') return rndPick(rng, pool.largeRooms.length ? pool.largeRooms : pool.rooms);
  return rndPick(rng, pool.rooms);
}

function placeDungeon(rng, archGraph, pool, addStairs) {
  var tiles = [];
  var nextId = 1;
  var roomPositions = []; // actual gx,gy of each placed room

  // Place rooms
  archGraph.rooms.forEach(function(room, idx) {
    var gx = ORIGIN_X + room.x * ROOM_STEP_X;
    var gy = ORIGIN_Y + room.y * ROOM_STEP_Y;
    var tileId = roleTileId(rng, room.role, pool, false);

    // Try to place, nudge if overlap
    var placed = false;
    for (var dy=-2; dy<=2 && !placed; dy++) {
      for (var dx=-2; dx<=2 && !placed; dx++) {
        if (canPlace(tiles, tileId, gx+dx*2, gy+dy*2, 0)) {
          tiles.push({id:nextId++, tileId:tileId, gx:gx+dx*2, gy:gy+dy*2, rot:0, _role:room.role});
          roomPositions.push({gx:gx+dx*2, gy:gy+dy*2, tileId:tileId});
          placed = true;
        }
      }
    }
    if (!placed) roomPositions.push(null);
  });

  // Place corridors between rooms
  archGraph.corridors.forEach(function(pair) {
    var a = roomPositions[pair[0]];
    var b = roomPositions[pair[1]];
    if (!a || !b) return;
    placeCorridorBetween(rng, tiles, nextId, pool, a, b);
    nextId = tiles.length + 1;
  });

  // Optionally add stair room (for multi-floor)
  if (addStairs) {
    var stairTile = rndPick(rng, pool.stairs);
    // Find a quiet spot near the middle of the dungeon
    var mx = ORIGIN_X + 4 * ROOM_STEP_X;
    var my = ORIGIN_Y + 2 * ROOM_STEP_Y;
    for (var dy2=-3; dy2<=3; dy2++) {
      for (var dx2=-3; dx2<=3; dx2++) {
        if (canPlace(tiles, stairTile, mx+dx2*3, my+dy2*3, 0)) {
          tiles.push({id:nextId++, tileId:stairTile, gx:mx+dx2*3, gy:my+dy2*3, rot:0, _role:'stairs'});
          dy2=99; dx2=99; // break both loops
        }
      }
    }
  }

  return tiles;
}

/* ── CORRIDOR PLACEMENT ─────────────────────────────────────
   Connects two rooms with L-shaped corridor routing.
   Tries horizontal then vertical segments.
──────────────────────────────────────────────────────────── */
function placeCorridorBetween(rng, tiles, nextId, pool, a, b) {
  var aSz = rotSize(a.tileId, 0);
  var bSz = rotSize(b.tileId, 0);

  // Centre points of each room
  var ax = a.gx + Math.floor(aSz.w/2);
  var ay = a.gy + Math.floor(aSz.h/2);
  var bx = b.gx + Math.floor(bSz.w/2);
  var by = b.gy + Math.floor(bSz.h/2);

  var dx = bx - ax;
  var dy = by - ay;

  var corridorTile = rndPick(rng, pool.corridors);
  var cSz = tileSize(corridorTile); // 6×2

  // Horizontal segment
  if (Math.abs(dx) >= cSz.w) {
    var hCount = Math.floor(Math.abs(dx) / cSz.w);
    var hDir   = dx > 0 ? 1 : -1;
    var hX     = ax + (dx>0 ? aSz.w/2 : -cSz.w);
    var hY     = ay - Math.floor(cSz.h/2);
    for (var i=0; i<hCount && i<3; i++) {
      var tx = hX + i * cSz.w * hDir;
      if (canPlace(tiles, corridorTile, tx, hY, 0))
        tiles.push({id:nextId++, tileId:corridorTile, gx:tx, gy:hY, rot:0});
    }
  }

  // Vertical segment (rotated corridor = 2×6)
  if (Math.abs(dy) >= cSz.w) {
    var vCount = Math.floor(Math.abs(dy) / cSz.w);
    var vDir   = dy > 0 ? 1 : -1;
    var vX     = bx - Math.floor(cSz.h/2);
    var vY     = ay + (dy>0 ? aSz.h/2 : -cSz.w);
    for (var j=0; j<vCount && j<3; j++) {
      var ty = vY + j * cSz.w * vDir;
      if (canPlace(tiles, corridorTile, vX, ty, 1))
        tiles.push({id:nextId++, tileId:corridorTile, gx:vX, gy:ty, rot:1});
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   DUNGEON NAMES
══════════════════════════════════════════════════════════════*/
var DUNGEON_NAMES = {
  dungeon:   ['The Iron Cells','The Warlord\'s Keep','Barracks of the Damned','The Dark Passage','Halls of the Fallen'],
  crypt:     ['The Silent Tomb','Barrow of the Lich King','Ossuary of Shadows','The Cursed Vault','Chamber of Eternal Rest'],
  cave:      ['The Black Grotto','Caverns of the Deep','The Hungry Dark','Stalactite Halls','The Breathing Rock'],
  sewer:     ['The Rat Warrens','Beneath the City','The Overflow Tunnels','Plague Pipes','The Seeping Dark'],
  civilised: ['The Merchant Quarter','Guildhall of Blades','The Old Palace','Customs House','The Locked Ward'],
  outdoor:   ['The Blighted Moor','Ruins of the Old Empire','The Broken Hills','Forsaken Outpost','The Grey Wastes'],
};

/* ══════════════════════════════════════════════════════════════
   MAIN ENTRY POINT
   generate(options) → { floors: [{name, tiles, stairRole}], stairLinks }
   options: { theme, size, routes, floors, seed }
══════════════════════════════════════════════════════════════*/
function generate(options) {
  var opts   = options || {};
  var theme  = opts.theme  || 'dungeon';
  var size   = opts.size   || 'medium';
  var routes = opts.routes || 'branching';
  var numFloors = Math.max(1, Math.min(4, opts.floors || 1));
  var seed   = opts.seed   || Math.floor(Math.random() * 999999);
  var rng    = mkRng(seed);

  var pool   = POOLS[theme] || POOLS.dungeon;
  var names  = DUNGEON_NAMES[theme] || DUNGEON_NAMES.dungeon;
  var baseName = rndPick(rng, names);

  var floors     = [];
  var stairLinks = [];

  for (var f=0; f<numFloors; f++) {
    var archType  = pickArchetype(rng, routes);
    var archFn    = ARCHETYPES[archType];
    var archGraph = archFn(rng, size);
    var isLast    = f === numFloors-1;
    var addStairs = !isLast; // all floors except the last need a down-stair

    var tiles = placeDungeon(rng, archGraph, pool, addStairs);

    var floorName = numFloors > 1
      ? baseName + (f===0?' — Ground Floor':(f===numFloors-1?' — Final Level':' — Level '+(f+1)))
      : baseName;

    floors.push({ name: floorName, tiles: tiles, seed: seed });

    // Record stair link between this floor and the next
    if (addStairs) {
      var stairTile = tiles.find(function(t){ return t._role==='stairs'; });
      if (stairTile) {
        stairLinks.push({
          fromFloor: f,
          fromTileId: stairTile.id,
          toFloor: f+1,
          // toTileId will be filled after next floor generates its start
        });
      }
    }
  }

  return {
    name:       baseName,
    theme:      theme,
    seed:       seed,
    archetype:  'generated',
    floors:     floors,
    stairLinks: stairLinks,
  };
}

/* ── EXPORT ─────────────────────────────────────────────────*/
global.DungeonGen = { generate: generate };

})(typeof window !== 'undefined' ? window : global);
