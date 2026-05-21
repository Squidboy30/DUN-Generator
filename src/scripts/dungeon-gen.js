/* ═══════════════════════════════════════════════════════════════
   DUNGEON GENERATOR v2 — Procedural dungeon layout engine
   Inspired by Advanced HeroQuest, Warhammer Quest, Diablo.
   No external dependencies. Works entirely offline.
   ═══════════════════════════════════════════════════════════════ */

(function(global){
'use strict';

/* ── RNG (seeded Mulberry32) ─────────────────────────────────── */
function mkRng(seed) {
  var s = (seed >>> 0) || 1;
  return function() {
    s += 0x6D2B79F5;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function ri(rng,min,max){ return min+Math.floor(rng()*(max-min+1)); }
function pick(rng,arr){ return arr[Math.floor(rng()*arr.length)]; }
function shuffle(rng,arr){
  var a=arr.slice();
  for(var i=a.length-1;i>0;i--){var j=Math.floor(rng()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
  return a;
}

/* ── TILE POOLS ──────────────────────────────────────────────── */
var POOLS = {
  dungeon:  { start:'24af', corridors:['21ae','3ae','4ae','29ae','33ae','34ae','3be','4be'], rooms:['2ac','5ac','6bc3','8ac','12ac','12bc','15ac','14ac','36ac','36bc'], boss:['44aa','43ba','01aa'], stairs:'06bc' },
  crypt:    { start:'24af', corridors:['22ae','82ae','21ae'], rooms:['6ac','7ac','5bc','78ac','79ac','88ac','89ac'], boss:['69bc'], stairs:'06bc' },
  cave:     { start:'24af', corridors:['60ae','54ae','59ae','46be'], rooms:['47ac','48ac','49ac','50ac','55ac','56ac'], boss:['44ba'], stairs:'06bc' },
  sewer:    { start:'24bf', corridors:['21be','22be','23be','21ae'], rooms:['18bc','17bc','61bc','62bc','63bc'], boss:['01aa'], stairs:'06bc' },
  civilised:{ start:'civstart', corridors:['90be','84ae','85ae','45ae','46ae'], rooms:['14bc','78bc','79bc','80ac','86ac','87ac'], boss:['31ba'], stairs:'06bc' },
  outdoor:  { start:'24af', corridors:['90ae','91ae','92ae','93ae'], rooms:['15bc','26ab','28ab','25ab'], boss:['01ba','02ba'], stairs:'68aa' },
};

/* ── TILE SIZES ──────────────────────────────────────────────── */
// Hard-coded so we don't depend on TILE_DB at generation time
var TILE_SIZES = {
  // start tiles
  '24af':[4,2], '24bf':[4,2], 'civstart':[4,2], '42as':[3,3],
  // standard corridors 6×2
  '21ae':[6,2],'22ae':[6,2],'3ae':[6,2],'4ae':[6,2],'29ae':[6,2],'33ae':[6,2],'34ae':[6,2],
  '3be':[6,2],'4be':[6,2],'82ae':[6,2],'46be':[6,2],'60ae':[6,2],'54ae':[6,2],'59ae':[6,2],
  '21be':[6,2],'22be':[6,2],'23be':[6,2],'90ae':[6,2],'91ae':[6,2],'92ae':[6,2],'93ae':[6,2],
  '90be':[6,2],'84ae':[6,2],'85ae':[6,2],'45ae':[6,2],'46ae':[6,2],
  // narrow corridors 1×6
  '37ag':[1,6],'10ag':[1,6],'10bg':[1,6],'11ag':[1,6],
  // standard rooms 6×6
  '2ac':[6,6],'5ac':[6,6],'6bc3':[6,6],'8ac':[6,6],'12ac':[6,6],'12bc':[6,6],'12ae':[6,6],
  '15ac':[6,6],'14ac':[6,6],'36ac':[6,6],'36bc':[6,6],'7bc':[6,6],'19ad':[6,4],
  '6ac':[6,6],'7ac':[6,6],'5bc':[6,6],'78ac':[6,6],'79ac':[6,6],'88ac':[6,6],'89ac':[6,6],
  '47ac':[6,6],'48ac':[6,6],'49ac':[6,6],'50ac':[6,6],'55ac':[6,6],'56ac':[6,6],
  '18bc':[6,6],'17bc':[6,6],'61bc':[6,6],'62bc':[6,6],'63bc':[6,6],
  '14bc':[6,6],'78bc':[6,6],'79bc':[6,6],'80ac':[6,6],'86ac':[6,6],'87ac':[6,6],
  '15bc':[6,6],
  // large rooms 4×10
  '26ab':[4,10],'28ab':[4,10],'25ab':[4,10],
  // boss rooms 8×10
  '01aa':[8,10],'02aa':[8,10],'44aa':[8,10],'43ba':[8,10],'68ba':[8,10],
  '44ba':[8,10],'69bc':[8,10],'31ba':[8,10],'01ba':[8,10],'02ba':[8,10],
  // stair rooms
  '06bc':[6,6],'68aa':[8,10],
};
function tsz(id){ var s=TILE_SIZES[id]; return s?{w:s[0],h:s[1]}:{w:6,h:6}; }
function rsz(id,rot){ var s=tsz(id); return (rot===1||rot===3)?{w:s.h,h:s.w}:{w:s.w,h:s.h}; }

/* ── OCCUPANCY ───────────────────────────────────────────────── */
function buildOcc(tiles){
  var o={};
  tiles.forEach(function(t){
    var s=rsz(t.tileId,t.rot||0);
    for(var dy=0;dy<s.h;dy++) for(var dx=0;dx<s.w;dx++) o[(t.gx+dx)+','+(t.gy+dy)]=true;
  });
  return o;
}
function canPlace(tiles,tileId,gx,gy,rot){
  if(gx<0||gy<0) return false;
  var s=rsz(tileId,rot||0);
  if(gx+s.w>98||gy+s.h>78) return false;
  var o=buildOcc(tiles);
  for(var dy=0;dy<s.h;dy++) for(var dx=0;dx<s.w;dx++) if(o[(gx+dx)+','+(gy+dy)]) return false;
  return true;
}
function tryPlace(tiles,tileId,gx,gy,rot){
  // Try exact position, then nudge up to ±4 squares
  for(var d=0;d<=4;d++){
    var offsets=d===0?[[0,0]]:[[d,0],[-d,0],[0,d],[0,-d],[d,d],[-d,-d],[d,-d],[-d,d]];
    for(var i=0;i<offsets.length;i++){
      var nx=gx+offsets[i][0], ny=gy+offsets[i][1];
      if(canPlace(tiles,tileId,nx,ny,rot)) return {gx:nx,gy:ny};
    }
  }
  return null;
}

/* ══════════════════════════════════════════════════════════════
   ROOM ARCHETYPES
   Abstract grid of nodes (rooms) + edges (corridors).
   Positions are in abstract units, converted to grid coords later.
══════════════════════════════════════════════════════════════ */
var ARCHETYPES = {

  // AHQ Spine: main corridor with side wings
  spine: function(rng, sz) {
    var n = sz==='small'?5 : sz==='medium'?7 : 9;
    var rooms=[
      {role:'start',  ax:0, ay:2},
      {role:'guard',  ax:1, ay:2},
      {role:'branch', ax:2, ay:2},
      {role:'room',   ax:2, ay:0},
      {role:'room',   ax:2, ay:4},
      {role:'branch', ax:3, ay:2},
      {role:'room',   ax:3, ay:0},
      {role:'room',   ax:3, ay:4},
      {role:'boss',   ax:4, ay:2},
    ].slice(0,n);
    var edges=[[0,1],[1,2],[2,3],[2,4],[2,5],[5,6],[5,7],[5,8]];
    // Shortcut loop from early branch to late branch
    edges.push([1,5]);
    return {rooms:rooms,edges:edges};
  },

  // Diablo Catacombs: grid with loops
  catacombs: function(rng, sz) {
    var cols=sz==='small'?2:sz==='medium'?3:4;
    var rows=3;
    var rooms=[];
    var edges=[];
    for(var c=0;c<cols;c++) for(var r=0;r<rows;r++){
      var role='room';
      if(c===0&&r===1) role='start';
      else if(c===cols-1&&r===1) role='boss';
      else if(c===0) role='dead-end';
      else if(c===cols-1&&r!==1) role='treasure';
      rooms.push({role:role, ax:c*2, ay:r*2});
    }
    // Horizontal connections — most rows
    for(var c2=0;c2<cols-1;c2++) for(var r2=0;r2<rows;r2++){
      if(rng()<0.85) edges.push([c2*rows+r2,(c2+1)*rows+r2]);
    }
    // Vertical connections — create loops
    for(var c3=0;c3<cols;c3++) for(var r3=0;r3<rows-1;r3++){
      if(rng()<0.6) edges.push([c3*rows+r3,c3*rows+r3+1]);
    }
    // Guarantee start + boss are connected
    var startIdx=1; // row1 of col0
    var bossIdx=(cols-1)*rows+1;
    if(!edges.find(function(e){return e[0]===startIdx||e[1]===startIdx;}))
      edges.push([startIdx,startIdx+rows]);
    return {rooms:rooms,edges:edges};
  },

  // Warhammer Quest Hub: central junction, radiating wings
  hub: function(rng, sz) {
    var rooms=[
      {role:'start',   ax:0, ay:3},
      {role:'hub',     ax:2, ay:3},
      {role:'room',    ax:2, ay:1},
      {role:'room',    ax:2, ay:5},
      {role:'room',    ax:4, ay:1},
      {role:'treasure',ax:4, ay:5},
      {role:'hub',     ax:4, ay:3},
      {role:'dead-end',ax:5, ay:1},
      {role:'dead-end',ax:5, ay:5},
      {role:'boss',    ax:6, ay:3},
    ];
    var edges=[[0,1],[1,2],[1,3],[1,6],[2,4],[3,5],[4,6],[5,6],[4,7],[5,8],[6,9],[7,9],[8,9]];
    if(sz==='small') { rooms=rooms.slice(0,7); edges=edges.filter(function(e){return e[0]<7&&e[1]<7;}); }
    if(sz==='large') {
      rooms.push({role:'room',ax:3,ay:0}); rooms.push({role:'room',ax:3,ay:6});
      edges.push([2,rooms.length-2],[3,rooms.length-1]);
    }
    return {rooms:rooms,edges:edges};
  },

  // AHQ Barrow: linear with shortcuts
  barrow: function(rng, sz) {
    var rooms=[
      {role:'start',   ax:0, ay:2},
      {role:'guard',   ax:1, ay:2},
      {role:'room',    ax:2, ay:1},
      {role:'treasure',ax:2, ay:3},
      {role:'hub',     ax:3, ay:2},
      {role:'dead-end',ax:3, ay:0},
      {role:'dead-end',ax:3, ay:4},
      {role:'guard',   ax:4, ay:2},
      {role:'boss',    ax:5, ay:2},
    ];
    var edges=[[0,1],[1,2],[1,3],[2,4],[3,4],[4,5],[4,6],[4,7],[7,8],[1,4]]; // shortcut
    if(sz==='large'){ rooms.push({role:'room',ax:4,ay:0}); edges.push([7,rooms.length-1],[rooms.length-1,8]); }
    return {rooms:rooms,edges:edges};
  },
};

function pickArchetype(rng,routes){
  if(routes==='linear')   return pick(rng,['spine','barrow']);
  if(routes==='open')     return pick(rng,['hub','catacombs']);
  return pick(rng,['spine','barrow','hub','catacombs']);
}

/* ══════════════════════════════════════════════════════════════
   LAYOUT ENGINE
   Converts abstract archetype to real tile placements.
   Grid: 100×80. Start tile at left (gx~2). Spread east.
══════════════════════════════════════════════════════════════ */

// Abstract unit → grid squares. Rooms are ~6-8 wide, corridors bridge the gap.
var AX = 16;  // horizontal spacing per abstract unit
var AY = 12;  // vertical spacing per abstract unit
var OX = 2;   // left margin
var OY = 18;  // top margin (places rooms in vertical centre)

function layoutDungeon(rng, arch, pool, addStairs) {
  var tiles = [];
  var idSeq = 1;
  var placed = []; // {gx, gy, tileId, idx}

  // 1. Place rooms
  arch.rooms.forEach(function(room, idx) {
    var tileId = pickRoomTile(rng, room.role, pool);
    var gx0 = OX + room.ax * AX;
    var gy0 = OY + (room.ay - 2) * AY; // centre ay=2 vertically
    var pos = tryPlace(tiles, tileId, gx0, gy0, 0);
    if (pos) {
      var t = {id: idSeq++, tileId: tileId, gx: pos.gx, gy: pos.gy, rot: 0, _role: room.role, _idx: idx};
      tiles.push(t);
      placed.push(t);
    } else {
      placed.push(null); // failed placement — mark null so edges can skip
    }
  });

  // 2. Connect rooms with corridors
  arch.edges.forEach(function(edge) {
    var a = placed[edge[0]];
    var b = placed[edge[1]];
    if (!a || !b) return;
    connectRooms(rng, tiles, idSeq, pool, a, b);
    idSeq = tiles.length + 1;
  });

  // 3. Add stair tile if multi-floor
  if (addStairs) {
    var stairId = pool.stairs || '06bc';
    // Place near the middle of the dungeon
    var midX = Math.floor((OX + OX + arch.rooms.length * AX / 2));
    var midY = OY + AY;
    var pos = tryPlace(tiles, stairId, midX, midY, 0);
    if (!pos) pos = tryPlace(tiles, stairId, OX + 2*AX, OY + AY, 0);
    if (pos) tiles.push({id: idSeq++, tileId: stairId, gx: pos.gx, gy: pos.gy, rot: 0, _role:'stairs'});
  }

  return tiles;
}

function pickRoomTile(rng, role, pool) {
  if (role==='start')                  return pool.start;
  if (role==='boss')                   return pick(rng, pool.boss);
  if (role==='stairs')                 return pool.stairs;
  if (role==='hub'||role==='branch')   return pick(rng, pool.rooms); // could be large later
  return pick(rng, pool.rooms);
}

/* ── CORRIDOR ROUTING ────────────────────────────────────────
   Key insight: corridor is 6×2. It attaches edge-to-edge.
   We route from the nearest edge of room A to the nearest
   edge of room B using L-shaped segments.
──────────────────────────────────────────────────────────── */
function connectRooms(rng, tiles, idSeq, pool, a, b) {
  var aSz = rsz(a.tileId, a.rot||0);
  var bSz = rsz(b.tileId, b.rot||0);

  // Centres
  var aCX = a.gx + aSz.w/2;
  var aCY = a.gy + aSz.h/2;
  var bCX = b.gx + bSz.w/2;
  var bCY = b.gy + bSz.h/2;

  var dx = bCX - aCX;
  var dy = bCY - aCY;
  var corrId = pick(rng, pool.corridors);
  var cSz = tsz(corrId); // always 6×2 for standard corridors

  // Decide routing: primarily horizontal, then vertical elbow
  var horzFirst = Math.abs(dx) >= Math.abs(dy);

  if (horzFirst) {
    // Horizontal segment from right edge of A
    var startX = dx > 0 ? a.gx + aSz.w : b.gx + bSz.w;
    var endX   = dx > 0 ? b.gx          : a.gx;
    var corrY  = Math.round(aCY - cSz.h/2);

    placeHCorridors(rng, tiles, pool, idSeq, startX, endX, corrY);
    idSeq = tiles.length + 1;

    // Vertical elbow if there's a Y gap
    if (Math.abs(dy) > 2) {
      var elbowX = dx > 0 ? b.gx - cSz.h - 1 : a.gx - cSz.h - 1;
      elbowX = Math.max(OX, Math.min(90, elbowX));
      var startY = dy > 0 ? a.gy + aSz.h : b.gy + bSz.h;
      var endY   = dy > 0 ? b.gy          : a.gy;
      placeVCorridors(rng, tiles, pool, idSeq, elbowX, startY, endY);
      idSeq = tiles.length + 1;
    }
  } else {
    // Vertical first
    var startY2 = dy > 0 ? a.gy + aSz.h : b.gy + bSz.h;
    var endY2   = dy > 0 ? b.gy          : a.gy;
    var corrX   = Math.round(aCX - cSz.h/2);
    placeVCorridors(rng, tiles, pool, idSeq, corrX, startY2, endY2);
    idSeq = tiles.length + 1;

    // Horizontal elbow
    if (Math.abs(dx) > 2) {
      var elbowY2 = dy > 0 ? b.gy - cSz.h - 1 : a.gy - cSz.h - 1;
      elbowY2 = Math.max(0, Math.min(72, elbowY2));
      var startX2 = dx > 0 ? a.gx + aSz.w : b.gx + bSz.w;
      var endX2   = dx > 0 ? b.gx          : a.gx;
      placeHCorridors(rng, tiles, pool, idSeq, startX2, endX2, elbowY2);
      idSeq = tiles.length + 1;
    }
  }
}

function placeHCorridors(rng, tiles, pool, startId, x1, x2, y) {
  if (x1 > x2) { var tmp=x1; x1=x2; x2=tmp; }
  var corrId = pick(rng, pool.corridors);
  var cW = tsz(corrId).w; // 6
  var cH = tsz(corrId).h; // 2
  var x = x1;
  var limit = 0;
  while (x < x2 - 1 && limit++ < 20) {
    var space = x2 - x;
    if (space < 2) break;
    // Try to place corridor; if too long just place what fits
    var w = Math.min(cW, space);
    if (w < 2) break;
    // Use the corridor tile but only if it fits
    if (canPlace(tiles, corrId, x, y, 0)) {
      tiles.push({id: startId++, tileId: corrId, gx: x, gy: y, rot: 0});
      x += cW;
    } else {
      x += 1; // nudge past obstacle
    }
  }
}

function placeVCorridors(rng, tiles, pool, startId, x, y1, y2) {
  if (y1 > y2) { var tmp=y1; y1=y2; y2=tmp; }
  var corrId = pick(rng, pool.corridors);
  var cW = tsz(corrId).w; // 6 (becomes height when rotated)
  var cH = tsz(corrId).h; // 2 (becomes width when rotated)
  // rot=1: tile becomes cH wide × cW tall
  var y = y1;
  var limit = 0;
  while (y < y2 - 1 && limit++ < 20) {
    var space = y2 - y;
    if (space < 2) break;
    if (canPlace(tiles, corrId, x, y, 1)) {
      tiles.push({id: startId++, tileId: corrId, gx: x, gy: y, rot: 1});
      y += cW; // cW is the long dimension, which is now vertical
    } else {
      y += 1;
    }
  }
}

/* ── NAMES ───────────────────────────────────────────────────── */
var NAMES = {
  dungeon:  ['The Iron Cells','The Warlord\'s Keep','Barracks of the Damned','The Sunken Hall','The Dark Passage','Halls of the Fallen','The Torture Pits','Fortress of the Betrayer'],
  crypt:    ['The Silent Tomb','Barrow of the Lich King','Ossuary of Shadows','The Cursed Vault','Chamber of Eternal Rest','The Bone Labyrinth','Catacombs of the Damned'],
  cave:     ['The Black Grotto','Caverns of the Deep','The Hungry Dark','Stalactite Halls','The Breathing Rock','Lair of the Ancient','The Dripping Dark'],
  sewer:    ['The Rat Warrens','Beneath the City','The Overflow Tunnels','Plague Pipes','The Seeping Dark','Channels of Ruin'],
  civilised:['The Merchant Quarter','Guildhall of Blades','The Old Palace','Customs House','The Locked Ward','The Debtors\' Court'],
  outdoor:  ['The Blighted Moor','Ruins of the Old Empire','The Broken Hills','Forsaken Outpost','The Grey Wastes','The Shattered Vale'],
};

/* ══════════════════════════════════════════════════════════════
   PUBLIC API
   generate(opts) → { name, theme, seed, floors:[{name,tiles}], stairLinks:[] }
══════════════════════════════════════════════════════════════ */
function generate(opts) {
  opts = opts || {};
  var theme     = opts.theme  || 'dungeon';
  var size      = opts.size   || 'medium';
  var routes    = opts.routes || 'branching';
  var numFloors = Math.max(1, Math.min(4, opts.floors || 1));
  var seed      = opts.seed   || (Math.random()*999999|0);
  var rng       = mkRng(seed);
  var pool      = POOLS[theme] || POOLS.dungeon;
  var baseName  = pick(rng, NAMES[theme] || NAMES.dungeon);
  var floors    = [];

  for (var f = 0; f < numFloors; f++) {
    var archFn    = ARCHETYPES[pickArchetype(rng, routes)];
    var arch      = archFn(rng, size);
    var addStairs = f < numFloors - 1;
    var tiles     = layoutDungeon(rng, arch, pool, addStairs);

    var floorName = numFloors > 1
      ? baseName + (f===0 ? ' — Ground Floor' : f===numFloors-1 ? ' — Final Level' : ' — Level '+(f+1))
      : baseName;

    floors.push({ name: floorName, tiles: tiles, seed: seed });
  }

  return { name: baseName, theme: theme, seed: seed, floors: floors, stairLinks: [] };
}

global.DungeonGen = { generate: generate };

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
