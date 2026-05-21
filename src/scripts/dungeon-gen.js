/* ═══════════════════════════════════════════════════════════════
   DUNGEON GENERATOR v3
   Procedural layout engine — no external dependencies.
   Inspired by Advanced HeroQuest, Warhammer Quest, Diablo.
   ═══════════════════════════════════════════════════════════════ */
(function(global){
'use strict';

/* ── RNG ─────────────────────────────────────────────────────── */
function mkRng(seed){
  var s=(seed>>>0)||1;
  return function(){
    s+=0x6D2B79F5; var t=s;
    t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,a){return a[Math.floor(rng()*a.length)];}

/* ── TILE SIZES (hardcoded — no TILE_DB dependency at gen time) ─ */
var SZ={
  '24af':[4,2],'24bf':[4,2],'civstart':[4,2],
  '21ae':[6,2],'22ae':[6,2],'3ae':[6,2],'4ae':[6,2],'29ae':[6,2],
  '33ae':[6,2],'34ae':[6,2],'3be':[6,2],'4be':[6,2],'82ae':[6,2],
  '46be':[6,2],'60ae':[6,2],'54ae':[6,2],'59ae':[6,2],
  '21be':[6,2],'22be':[6,2],'23be':[6,2],
  '90ae':[6,2],'91ae':[6,2],'92ae':[6,2],'93ae':[6,2],
  '90be':[6,2],'84ae':[6,2],'85ae':[6,2],'45ae':[6,2],'46ae':[6,2],
  '37ag':[1,6],'10ag':[1,6],
  '2ac':[6,6],'5ac':[6,6],'6bc3':[6,6],'8ac':[6,6],'12ac':[6,6],
  '12bc':[6,6],'12ae':[6,6],'15ac':[6,6],'14ac':[6,6],'36ac':[6,6],
  '36bc':[6,6],'7bc':[6,6],'19ad':[6,4],
  '6ac':[6,6],'7ac':[6,6],'5bc':[6,6],'78ac':[6,6],'79ac':[6,6],
  '88ac':[6,6],'89ac':[6,6],
  '47ac':[6,6],'48ac':[6,6],'49ac':[6,6],'50ac':[6,6],'55ac':[6,6],'56ac':[6,6],
  '18bc':[6,6],'17bc':[6,6],'61bc':[6,6],'62bc':[6,6],'63bc':[6,6],
  '14bc':[6,6],'78bc':[6,6],'79bc':[6,6],'80ac':[6,6],'86ac':[6,6],'87ac':[6,6],
  '15bc':[6,6],'26ab':[4,10],'28ab':[4,10],'25ab':[4,10],
  '01aa':[8,10],'02aa':[8,10],'44aa':[8,10],'43ba':[8,10],'68ba':[8,10],
  '44ba':[8,10],'69bc':[8,10],'31ba':[8,10],'01ba':[8,10],'02ba':[8,10],
  '06bc':[6,6],'68aa':[8,10],
};
function tsz(id){var s=SZ[id];return s?{w:s[0],h:s[1]}:{w:6,h:6};}
function rsz(id,rot){var s=tsz(id);return(rot===1||rot===3)?{w:s.h,h:s.w}:{w:s.w,h:s.h};}

/* ── TILE POOLS ──────────────────────────────────────────────── */
var POOLS={
  dungeon:  {start:'24af',corr:['21ae','3ae','4ae','29ae','33ae','34ae','3be','4be'],rooms:['2ac','5ac','6bc3','8ac','12ac','12bc','15ac','14ac','36ac','36bc'],boss:['44aa','43ba','01aa'],stair:'06bc'},
  crypt:    {start:'24af',corr:['22ae','82ae','21ae'],rooms:['6ac','7ac','5bc','78ac','79ac','88ac','89ac'],boss:['69bc'],stair:'06bc'},
  cave:     {start:'24af',corr:['60ae','54ae','59ae','46be'],rooms:['47ac','48ac','49ac','50ac','55ac','56ac'],boss:['44ba'],stair:'06bc'},
  sewer:    {start:'24bf',corr:['21be','22be','23be','21ae'],rooms:['18bc','17bc','61bc','62bc','63bc'],boss:['01aa'],stair:'06bc'},
  civilised:{start:'civstart',corr:['90be','84ae','85ae','45ae','46ae'],rooms:['14bc','78bc','79bc','80ac','86ac','87ac'],boss:['31ba'],stair:'06bc'},
  outdoor:  {start:'24af',corr:['90ae','91ae','92ae','93ae'],rooms:['15bc','26ab','28ab','25ab'],boss:['01ba','02ba'],stair:'68aa'},
};

/* ── OCCUPANCY ───────────────────────────────────────────────── */
function buildOcc(tiles){
  var o={};
  tiles.forEach(function(t){
    var s=rsz(t.tileId,t.rot||0);
    for(var dy=0;dy<s.h;dy++)for(var dx=0;dx<s.w;dx++)o[(t.gx+dx)+','+(t.gy+dy)]=true;
  });
  return o;
}
function free(occ,gx,gy,w,h){
  if(gx<0||gy<0||gx+w>98||gy+h>78)return false;
  for(var dy=0;dy<h;dy++)for(var dx=0;dx<w;dx++)if(occ[(gx+dx)+','+(gy+dy)])return false;
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   ARCHETYPES — abstract room graphs
   ax/ay = abstract grid position (multiplied by spacing later)
   ═══════════════════════════════════════════════════════════════ */
var ARCHETYPES={
  spine:function(rng,sz){
    return {rooms:[
      {role:'start',ax:0,ay:0},{role:'guard',ax:1,ay:0},{role:'branch',ax:2,ay:0},
      {role:'room', ax:2,ay:-1},{role:'room',ax:2,ay:1},
      {role:'branch',ax:3,ay:0},{role:'room',ax:3,ay:-1},{role:'room',ax:3,ay:1},
      {role:'boss',ax:4,ay:0}
    ],edges:[[0,1],[1,2],[2,3],[2,4],[2,5],[5,6],[5,7],[5,8],[1,5]]};
  },
  catacombs:function(rng,sz){
    var cols=sz==='small'?2:sz==='medium'?3:4,rows=3;
    var rooms=[],edges=[];
    for(var c=0;c<cols;c++)for(var r=0;r<rows;r++){
      var role='room';
      if(c===0&&r===1)role='start';
      else if(c===cols-1&&r===1)role='boss';
      else if(c===0)role='dead-end';
      else if(c===cols-1)role='treasure';
      rooms.push({role:role,ax:c*2,ay:r-1});
    }
    for(var c2=0;c2<cols-1;c2++)for(var r2=0;r2<rows;r2++)if(rng()<0.85)edges.push([c2*rows+r2,(c2+1)*rows+r2]);
    for(var c3=0;c3<cols;c3++)for(var r3=0;r3<rows-1;r3++)if(rng()<0.6)edges.push([c3*rows+r3,c3*rows+r3+1]);
    if(!edges.find(function(e){return e[0]===1||e[1]===1;}))edges.push([1,1+rows]);
    return {rooms:rooms,edges:edges};
  },
  hub:function(rng,sz){
    return {rooms:[
      {role:'start',ax:0,ay:0},{role:'branch',ax:2,ay:0},
      {role:'room',ax:2,ay:-1},{role:'room',ax:2,ay:1},
      {role:'room',ax:3,ay:-1},{role:'treasure',ax:3,ay:1},
      {role:'branch',ax:3,ay:0},{role:'dead-end',ax:4,ay:-1},
      {role:'dead-end',ax:4,ay:1},{role:'boss',ax:4,ay:0}
    ],edges:[[0,1],[1,2],[1,3],[1,6],[2,4],[3,5],[4,6],[5,6],[4,7],[5,8],[6,9],[7,9],[8,9]]};
  },
  barrow:function(rng,sz){
    return {rooms:[
      {role:'start',ax:0,ay:0},{role:'guard',ax:1,ay:0},
      {role:'room',ax:2,ay:-1},{role:'treasure',ax:2,ay:1},
      {role:'branch',ax:3,ay:0},{role:'dead-end',ax:3,ay:-2},{role:'dead-end',ax:3,ay:2},
      {role:'guard',ax:4,ay:0},{role:'boss',ax:5,ay:0}
    ],edges:[[0,1],[1,2],[1,3],[2,4],[3,4],[4,5],[4,6],[4,7],[7,8],[1,4]]};
  },
};
function pickArch(rng,routes){
  if(routes==='linear')return pick(rng,['spine','barrow']);
  if(routes==='open')return pick(rng,['hub','catacombs']);
  return pick(rng,['spine','barrow','hub','catacombs']);
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT ENGINE
   Converts abstract graph → real tile positions.

   Key design: rooms are spaced so corridors (6 wide) fit exactly
   in the gap between them with zero spare squares.
   ═══════════════════════════════════════════════════════════════ */

// Standard room size is 6×6. Corridor is 6×2.
// We want: room_right_edge + corridor(s) = next_room_left_edge
// Spacing: rooms placed every 14 squares horizontally (6 room + 8 gap for 1-2 corridors)
// Vertically: rooms every 10 squares (6 room + 4 gap)

var HX = 14;  // horizontal abstract unit → grid squares
var VY = 13;  // vertical spacing — room(6) + gap(7) = 13, leaves room for 1 corridor(6)+1
var OX = 2;
var OY = 20;  // vertical centre (row 0 of abstract grid)

function placeRooms(rng, arch, pool){
  var placed=[];
  var tiles=[];
  var id=1;

  // First pass: compute ideal positions
  var positions=arch.rooms.map(function(room){
    var tileId=pickRoomTile(rng,room.role,pool);
    var sz=tsz(tileId);
    var cx=OX+room.ax*HX;
    var cy=OY+room.ay*VY;
    return {tileId:tileId,sz:sz,gx:cx,gy:cy-Math.floor(sz.h/2),role:room.role};
  });

  // Second pass: snap horizontal positions so gaps between horizontally adjacent
  // rooms are exact multiples of corridor length (6)
  var CORR_LEN=6;
  arch.edges.forEach(function(edge){
    var a=positions[edge[0]],b=positions[edge[1]];
    if(!a||!b)return;
    var aCX=a.gx+a.sz.w/2, bCX=b.gx+b.sz.w/2;
    if(Math.abs(aCX-bCX)>Math.abs((a.gy+a.sz.h/2)-(b.gy+b.sz.h/2))){
      // Horizontal connection — snap b's left edge so gap is multiple of 6
      var aRight=a.gx+a.sz.w;
      var gap=b.gx-aRight;
      if(gap>0){
        var snapped=Math.ceil(gap/CORR_LEN)*CORR_LEN;
        b.gx=aRight+snapped;
      }
    }
  });

  // Third pass: place tiles, nudging to avoid overlap
  positions.forEach(function(pos,idx){
    var occ=buildOcc(tiles);
    var placed_pos=null;
    outer:for(var d=0;d<=8;d++){
      var offsets=d===0?[[0,0]]:[];
      if(d>0)for(var i=-d;i<=d;i++){offsets.push([d,i]);offsets.push([-d,i]);offsets.push([i,d]);offsets.push([i,-d]);}
      for(var oi=0;oi<offsets.length;oi++){
        var nx=pos.gx+offsets[oi][0],ny=pos.gy+offsets[oi][1];
        if(free(occ,nx,ny,pos.sz.w,pos.sz.h)){placed_pos={gx:nx,gy:ny};break outer;}
      }
    }
    if(placed_pos){
      var t={id:id++,tileId:pos.tileId,gx:placed_pos.gx,gy:placed_pos.gy,rot:0,
             _role:pos.role,_idx:idx,
             _cx:placed_pos.gx+Math.floor(pos.sz.w/2),
             _cy:placed_pos.gy+Math.floor(pos.sz.h/2)};
      tiles.push(t);placed.push(t);
    }else{placed.push(null);}
  });
  return{tiles:tiles,placed:placed,nextId:id};
}

function pickRoomTile(rng,role,pool){
  if(role==='start')return pool.start;
  if(role==='boss')return pick(rng,pool.boss);
  if(role==='stairs')return pool.stair;
  return pick(rng,pool.rooms);
}

/* ── CORRIDOR ROUTING ────────────────────────────────────────────
   Given two placed tiles A and B, fill the gap between their
   facing edges with corridor tiles.

   Strategy:
   1. Find which edges face each other (right→left or bottom→top)
   2. Compute the exact gap in squares
   3. Fill with corridor tiles of the right size/rotation
   4. If rooms are offset on the perpendicular axis, add a jog
──────────────────────────────────────────────────────────────── */
function connectRooms(rng,tiles,pool,a,b,startId){
  var szA=tsz(a.tileId),szB=tsz(b.tileId);
  // Room edges
  var aR=a.gx+szA.w, aL=a.gx,    aT=a.gy,    aBot=a.gy+szA.h;
  var bR=b.gx+szB.w, bL=b.gx,    bT=b.gy,    bBot=b.gy+szB.h;
  var aCX=a.gx+szA.w/2, aCY=a.gy+szA.h/2;
  var bCX=b.gx+szB.w/2, bCY=b.gy+szB.h/2;

  var id=startId;
  var corrId=pick(rng,pool.corr);
  var cLong=6, cShort=2; // corridor is always 6×2; rotated becomes 2×6

  // ── Determine primary direction ──
  var dx=bCX-aCX, dy=bCY-aCY;
  var horzPrimary=Math.abs(dx)>=Math.abs(dy);

  // Compute actual edge gaps
  var edgeGapH = dx>0 ? bL-aR : aL-bR;   // horizontal gap between facing edges
  var edgeGapV = dy>0 ? bT-aBot : aT-bBot; // vertical gap between facing edges
  // If primary-direction gap is too small for a corridor, skip (rooms are adjacent)
  if(horzPrimary && edgeGapH<6) return id;
  if(!horzPrimary && edgeGapV<6) return id;

  if(horzPrimary){
    // A is left of B (or right of B)
    var goRight=dx>0;
    var x1=goRight?aR:bR;   // corridor start X
    var x2=goRight?bL:aL;   // corridor end X
    if(x1>x2){var tmp=x1;x1=x2;x2=tmp;}

    // Y: use the shared vertical zone, or from-room centre
    var sharedYTop=Math.max(a.gy,b.gy);
    var sharedYBot=Math.min(aBot,bBot);
    var corrY;
    if(sharedYBot-sharedYTop>=cShort){
      corrY=sharedYTop; // top of shared zone
    } else {
      corrY=Math.round(aCY)-Math.floor(cShort/2);
    }
    corrY=Math.max(0,Math.min(76,corrY));

    // Fill horizontal gap
    var x=x1,lim=0;
    while(x<x2&&lim++<20){
      if(x2-x>=cLong){
        var occ2=buildOcc(tiles);
        if(free(occ2,x,corrY,cLong,cShort)){tiles.push({id:id++,tileId:corrId,gx:x,gy:corrY,rot:0});x+=cLong;}
        else x++;
      } else { x+=x2-x; }
    }

    // Vertical jog: connect from-room top/bottom edge straight to corridor strip
    // Only needed if rooms don't share a vertical zone
    if(sharedYBot-sharedYTop<cShort){
      // Connect A to the horizontal corridor strip
      var aEdgeToCorr = corrY>aBot ? {y1:aBot,y2:corrY,x:Math.max(a.gx,Math.min(a.gx+szA.w-cShort,Math.round(aCX-cShort/2)))}
                                   : {y1:corrY+cShort,y2:a.gy,x:Math.max(a.gx,Math.min(a.gx+szA.w-cShort,Math.round(aCX-cShort/2)))};
      var bEdgeToCorr = corrY>bBot ? {y1:bBot,y2:corrY,x:Math.max(b.gx,Math.min(b.gx+szB.w-cShort,Math.round(bCX-cShort/2)))}
                                   : {y1:corrY+cShort,y2:b.gy,x:Math.max(b.gx,Math.min(b.gx+szB.w-cShort,Math.round(bCX-cShort/2)))};

      [aEdgeToCorr, bEdgeToCorr].forEach(function(jog){
        if(jog.y2<=jog.y1)return;
        var y=jog.y1,lim2=0;
        while(y<jog.y2&&lim2++<20){
          if(jog.y2-y>=cLong){
            var occ3=buildOcc(tiles);
            if(free(occ3,jog.x,y,cShort,cLong)){tiles.push({id:id++,tileId:corrId,gx:jog.x,gy:y,rot:1});y+=cLong;}
            else y++;
          } else { y+=jog.y2-y; }
        }
      });
    }
  } else {
    // Vertical primary
    var goDown=dy>0;
    var y1v=goDown?aBot:bBot;
    var y2v=goDown?bT:aT;
    if(y1v>y2v){var tmp2=y1v;y1v=y2v;y2v=tmp2;}
    var gapV=y2v-y1v;

    // X alignment — shared horizontal zone
    var sharedXL=Math.max(a.gx,b.gx);
    var sharedXR=Math.min(aR,bR);
    var corrX;
    if(sharedXR-sharedXL>=cShort){
      corrX=Math.floor((sharedXL+sharedXR)/2)-Math.floor(cShort/2);
    } else {
      corrX=Math.round(aCX)-Math.floor(cShort/2);
    }

    // Fill vertical gap (rotated corridors: rot=1 → width=cShort, height=cLong)
    var y=y1v,lim3=0;
    while(y<y2v&&lim3++<20){
      if(y2v-y>=cLong){
        var occ4=buildOcc(tiles);
        if(free(occ4,corrX,y,cShort,cLong)){tiles.push({id:id++,tileId:corrId,gx:corrX,gy:y,rot:1});y+=cLong;}
        else y++;
      } else { y+=(y2v-y); }
    }

    // Horizontal jog if rooms are offset horizontally
    var hJogNeeded=Math.abs(aCX-bCX)>1;
    if(hJogNeeded){
      var jogY=goDown?y2v-cShort:y1v;
      jogY=Math.max(0,Math.min(72,jogY));
      var x1h=Math.min(Math.round(aCX),Math.round(bCX));
      var x2h=Math.max(Math.round(aCX),Math.round(bCX));
      var xh=x1h,lim4=0;
      while(xh<x2h&&lim4++<20){
        var occ5=buildOcc(tiles);
        if(free(occ5,xh,jogY,cLong,cShort)){tiles.push({id:id++,tileId:corrId,gx:xh,gy:jogY,rot:0});xh+=cLong;}
        else xh++;
      }
    }
  }
  return id;
}

/* ── STAIR TILE ──────────────────────────────────────────────── */
function addStairTile(rng,tiles,pool,id){
  var stairId=pool.stair||'06bc';
  var sz=tsz(stairId);
  // Try to find a free spot near the middle of placed tiles
  var xs=tiles.map(function(t){return t.gx;}), ys=tiles.map(function(t){return t.gy;});
  var midX=Math.round(xs.reduce(function(a,b){return a+b;},0)/xs.length);
  var midY=Math.round(ys.reduce(function(a,b){return a+b;},0)/ys.length);
  var occ=buildOcc(tiles);
  for(var d=2;d<=20;d+=2){
    for(var dy=-d;dy<=d;dy+=2)for(var dx=-d;dx<=d;dx+=2){
      var nx=midX+dx,ny=midY+dy;
      if(free(occ,nx,ny,sz.w,sz.h)){
        tiles.push({id:id,tileId:stairId,gx:nx,gy:ny,rot:0,_role:'stairs'});
        return;
      }
    }
  }
}

/* ── NAMES ───────────────────────────────────────────────────── */
var NAMES={
  dungeon: ['The Iron Cells','The Warlord\'s Keep','Barracks of the Damned','The Sunken Hall','The Dark Passage','Halls of the Fallen'],
  crypt:   ['The Silent Tomb','Barrow of the Lich King','Ossuary of Shadows','The Cursed Vault','Chamber of Eternal Rest'],
  cave:    ['The Black Grotto','Caverns of the Deep','The Hungry Dark','Stalactite Halls','The Breathing Rock'],
  sewer:   ['The Rat Warrens','Beneath the City','The Overflow Tunnels','Plague Pipes','The Seeping Dark'],
  civilised:['The Merchant Quarter','Guildhall of Blades','The Old Palace','Customs House','The Locked Ward'],
  outdoor: ['The Blighted Moor','Ruins of the Old Empire','The Broken Hills','Forsaken Outpost','The Grey Wastes'],
};

/* ═══════════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════════ */
function generate(opts){
  opts=opts||{};
  var theme=opts.theme||'dungeon';
  var size=opts.size||'medium';
  var routes=opts.routes||'branching';
  var numFloors=Math.max(1,Math.min(4,opts.floors||1));
  var seed=opts.seed||(Math.random()*999999|0);
  var rng=mkRng(seed);
  var pool=POOLS[theme]||POOLS.dungeon;
  var baseName=pick(rng,NAMES[theme]||NAMES.dungeon);
  var floors=[];

  for(var f=0;f<numFloors;f++){
    var arch=ARCHETYPES[pickArch(rng,routes)](rng,size);
    var result=placeRooms(rng,arch,pool);
    var tiles=result.tiles;
    var placed=result.placed;
    var id=result.nextId;

    // Connect each edge
    arch.edges.forEach(function(edge){
      var a=placed[edge[0]],b=placed[edge[1]];
      if(!a||!b)return;
      id=connectRooms(rng,tiles,pool,a,b,id);
    });

    // Add stair if multi-floor and not last floor
    if(f<numFloors-1) addStairTile(rng,tiles,pool,id++);

    var fname=numFloors>1
      ? baseName+(f===0?' — Ground Floor':f===numFloors-1?' — Final Level':' — Level '+(f+1))
      : baseName;
    floors.push({name:fname,tiles:tiles,seed:seed});
  }

  return{name:baseName,theme:theme,seed:seed,floors:floors,stairLinks:[]};
}

global.DungeonGen={generate:generate};
})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:this));
