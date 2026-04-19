'use strict';
var f = function(){};
var _els = {};

function MockEl(id){
  this.id=id; this.innerHTML=''; this.value=''; this.textContent=''; this.className='';
  this.style={cursor:'',display:'',cssText:''}; this.dataset={}; this.tagName='DIV';
  this.width=900; this.height=700; this.clientWidth=900; this.clientHeight=700;
  this.firstChild=null; this._ev={}; this._ch=[]; this.children={length:0};
}
MockEl.prototype.addEventListener=function(ev,fn){if(!this._ev[ev])this._ev[ev]=[];this._ev[ev].push(fn);};
MockEl.prototype.trigger=function(ev,arg){if(this._ev[ev])this._ev[ev].forEach(function(fn){try{fn(arg||{stopPropagation:f,currentTarget:{}});}catch(e){}});};
MockEl.prototype.appendChild=function(c){if(c){this._ch.push(c);this.children={length:this._ch.length};}return c;};
MockEl.prototype.insertBefore=function(c){if(c){this._ch.unshift(c);this.children={length:this._ch.length};}return c;};
MockEl.prototype.removeChild=function(c){this._ch=this._ch.filter(function(x){return x!==c;});};
MockEl.prototype.querySelector=function(sel){var k='q_'+this.id+'_'+sel;if(!_els[k])_els[k]=new MockEl(k);return _els[k];};
MockEl.prototype.querySelectorAll=function(){return{forEach:f};};
MockEl.prototype.getBoundingClientRect=function(){return{left:0,top:0,width:900,height:700};};
MockEl.prototype.getContext=function(){return{clearRect:f,save:f,restore:f,scale:f,translate:f,fillRect:f,strokeRect:f,beginPath:f,moveTo:f,lineTo:f,stroke:f,fill:f,arc:f,fillText:f,roundRect:f,drawImage:f,measureText:function(){return{width:0};},setLineDash:f,setTransform:f,fillStyle:'',strokeStyle:'',lineWidth:1,globalAlpha:1,font:'',textAlign:'',textBaseline:''};};

function getById(id){if(!_els[id])_els[id]=new MockEl(id);return _els[id];}
var window={addEventListener:f,launchApp:f,_builderInit:null};
var localStorage={getItem:function(){return null;},setItem:f};
var document={
  getElementById:getById,
  querySelectorAll:function(){return{forEach:f};},
  createElement:function(tag){var el=new MockEl('_'+tag+'_'+(Math.random()*1e6|0));el.tagName=tag.toUpperCase();return el;},
  addEventListener:f
};
var console={log:f,error:function(m){process.stderr.write('ERR:'+m+'\n');}};
var _timers=[];
function setTimeout(fn,ms){_timers.push({fn:fn,ms:ms});}
function clearTimeout(){}
function alert(){}
function confirm(){return true;}
Math.imul=Math.imul||function(a,b){return(a*b)|0;};

var TILE_DB=[
  {id:'s1',name:'Start Tile',sz:[4,2],cat:'dungeon',theme:'dungeon',type:'corridor',isStart:true,isBossRoom:false,isDead:false},
  {id:'b1',name:'Boss Room',sz:[8,10],cat:'dungeon',theme:'dungeon',type:'room',isStart:false,isBossRoom:true,isDead:false},
  {id:'r1',name:'Dungeon Room',sz:[6,6],cat:'dungeon',theme:'dungeon',type:'room',isStart:false,isBossRoom:false,isDead:false},
  {id:'d1',name:'Dead End',sz:[6,6],cat:'dungeon',theme:'dungeon',type:'room',isStart:false,isBossRoom:false,isDead:true},
  {id:'c1',name:'Corridor',sz:[6,2],cat:'dungeon',theme:'dungeon',type:'corridor',isStart:false,isBossRoom:false,isDead:false},
];
var ELEMENT_DB=[
  {id:'el_pit',name:'Pit',type:'special',sz:1,cat:['dungeon'],special:'test',auto:false,searchable:false,impassable:true,cover:null},
  {id:'fu_chest',name:'Chest',type:'furniture',sz:1,cat:['dungeon'],special:'draw',auto:false,searchable:true,impassable:false,cover:null},
];
var IMG_CROPS={};var TILE_IMAGES={};var tileImgCache={};
function tileImgKey(id){return id;}
/* ═══════════════════════════════════════════════════════
   DUNGEON BUILDER v2
   ═══════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── Constants ── */
var SQ = 20;
var GRID_W = 100, GRID_H = 80;
var ZOOM_MIN = 0.2, ZOOM_MAX = 8.0, ZOOM_STEP = 0.15;

/* ── State ── */
var layouts = [];
var current = null;
var nextLayoutId = 1;
var nextPlacedId = 1;
var selectedTool = null;
var selectedElementTool = null;
var selectedPlaced = null;
var ghostPos = null;
var placedRotation = 0;
var isDragging = false;
var dragStart = null;
var overlapWarning = null;
var selectedConn = null;
var selectedElement = null;
var zoom = 1.0;
var offsetX = 0, offsetY = 0;
var isPanning = false;
var panLast = null;
var dungeonCount = 0;

/* ── DOM refs (lazy — grabbed after init) ── */
var bCanvas, bCtx, bWrap;

function getEl(id){ return document.getElementById(id); }

/* ════════════════════════════════
   LAYOUT MODEL
   ════════════════════════════════ */
function newLayout(name){
  return { id:nextLayoutId++, name:name||('Dungeon '+nextLayoutId),
    created:Date.now(), modified:Date.now(),
    tiles:[], elements:[], connections:[],
    mission:null, campaign:null, fogRevealed:[], heroPos:null };
}
function saveLayouts(){
  try{ localStorage.setItem('dun_builder_v2', JSON.stringify(layouts)); }catch(e){}
}
function loadLayouts(){
  try{
    var d=localStorage.getItem('dun_builder_v2');
    if(d){ layouts=JSON.parse(d); nextLayoutId=layouts.reduce(function(m,l){return Math.max(m,l.id+1);},1); }
  }catch(e){}
}

/* ════════════════════════════════
   TILE HELPERS
   ════════════════════════════════ */
function getTileDef(id){ return TILE_DB.find(function(t){return t.id===id;}); }

function rotatedSize(tileId, rot){
  var t=getTileDef(tileId);
  if(!t) return {w:1,h:1};
  var w=Array.isArray(t.sz)?t.sz[0]:t.sz;
  var h=Array.isArray(t.sz)?t.sz[1]:t.sz;
  return (rot===1||rot===3)?{w:h,h:w}:{w:w,h:h};
}

function buildOcc(excludeId){
  var occ={};
  (current.tiles||[]).forEach(function(pl){
    if(pl.id===excludeId) return;
    var sz=rotatedSize(pl.tileId,pl.rot||0);
    for(var dy=0;dy<sz.h;dy++) for(var dx=0;dx<sz.w;dx++)
      occ[(pl.gx+dx)+','+(pl.gy+dy)]=pl.id;
  });
  return occ;
}

function checkOverlap(tileId,gx,gy,rot,excludeId){
  var sz=rotatedSize(tileId,rot||0);
  var occ=buildOcc(excludeId);
  var conflicts=[];
  for(var dy=0;dy<sz.h;dy++) for(var dx=0;dx<sz.w;dx++){
    var k=(gx+dx)+','+(gy+dy);
    if(occ[k]&&conflicts.indexOf(occ[k])<0) conflicts.push(occ[k]);
  }
  return conflicts;
}

/* ════════════════════════════════
   CONNECTIONS
   ════════════════════════════════ */
function buildConnections(){
  if(!current) return;
  current.connections=[];
  var tiles=current.tiles;
  for(var i=0;i<tiles.length;i++){
    var a=tiles[i]; var szA=rotatedSize(a.tileId,a.rot||0);
    for(var j=i+1;j<tiles.length;j++){
      var b=tiles[j]; var szB=rotatedSize(b.tileId,b.rot||0);
      // A right -> B left
      if(a.gx+szA.w===b.gx){
        var y1=Math.max(a.gy,b.gy), y2=Math.min(a.gy+szA.h,b.gy+szB.h);
        if(y2-y1>=2){ current.connections.push({fromId:a.id,toId:b.id,side:'E',slot:y1,doorType:'single-door'}); continue; }
      }
      // B right -> A left
      if(b.gx+szB.w===a.gx){
        var y3=Math.max(a.gy,b.gy), y4=Math.min(a.gy+szA.h,b.gy+szB.h);
        if(y4-y3>=2){ current.connections.push({fromId:b.id,toId:a.id,side:'E',slot:y3,doorType:'single-door'}); continue; }
      }
      // A bottom -> B top
      if(a.gy+szA.h===b.gy){
        var x1=Math.max(a.gx,b.gx), x2=Math.min(a.gx+szA.w,b.gx+szB.w);
        if(x2-x1>=2){ current.connections.push({fromId:a.id,toId:b.id,side:'S',slot:x1,doorType:'single-door'}); continue; }
      }
      // B bottom -> A top
      if(b.gy+szB.h===a.gy){
        var x3=Math.max(a.gx,b.gx), x4=Math.min(a.gx+szA.w,b.gx+szB.w);
        if(x4-x3>=2){ current.connections.push({fromId:b.id,toId:a.id,side:'S',slot:x3,doorType:'single-door'}); }
      }
    }
  }
}

/* ════════════════════════════════
   COORDS
   ════════════════════════════════ */
function screenToGrid(clientX, clientY){
  var rect=bCanvas.getBoundingClientRect();
  var sx=clientX-rect.left, sy=clientY-rect.top;
  var wx=sx/zoom-offsetX, wy=sy/zoom-offsetY;
  return { gx:Math.floor(wx/SQ), gy:Math.floor(wy/SQ) };
}
function clampOffset(){
  var dungeonW=GRID_W*SQ, dungeonH=GRID_H*SQ;
  var vw=bCanvas.width, vh=bCanvas.height, margin=80;
  offsetX=Math.max(margin/zoom-dungeonW, Math.min(vw/zoom-margin, offsetX));
  offsetY=Math.max(margin/zoom-dungeonH, Math.min(vh/zoom-margin, offsetY));
}
function zoomAt(sx, sy, newZoom){
  var wx=sx/zoom-offsetX, wy=sy/zoom-offsetY;
  zoom=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,newZoom));
  offsetX=sx/zoom-wx; offsetY=sy/zoom-wy;
  clampOffset();
}
function centreView(){
  resizeCanvas();
  var pad=60;
  var dw=GRID_W*SQ, dh=GRID_H*SQ;
  zoom=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,
    Math.min((bCanvas.width-pad)/dw, (bCanvas.height-pad)/dh)));
  offsetX=(bCanvas.width/zoom-dw)/2;
  offsetY=(bCanvas.height/zoom-dh)/2;
  clampOffset();
}

/* ════════════════════════════════
   THEMES
   ════════════════════════════════ */
var THEMES={
  dungeon: {floor_a:'#7a5840',floor_b:'#6e4e38',floor_c:'#855e48',grout:'#3a2518'},
  crypt:   {floor_a:'#5a6050',floor_b:'#505848',floor_c:'#626858',grout:'#2a3028'},
  cave:    {floor_a:'#5a4830',floor_b:'#4e4028',floor_c:'#625238',grout:'#2e2418'},
  sewer:   {floor_a:'#384858',floor_b:'#304050',floor_c:'#404f60',grout:'#202830'},
  civilised:{floor_a:'#8a7060',floor_b:'#7c6455',floor_c:'#967868',grout:'#4a3828'},
  outdoor: {floor_a:'#4a6838',floor_b:'#425e32',floor_c:'#527040',grout:'#2a3820'},
  forest:  {floor_a:'#3a5828',floor_b:'#325020',floor_c:'#426030',grout:'#1e3010'},
};
function getTh(theme){ return THEMES[theme]||THEMES.dungeon; }
function cellNoise(gx,gy,s){var h=(gx*374761393+gy*668265263+(s||0))|0;h^=h>>>13;h=Math.imul(h,1274126177);h^=h>>>16;return(h>>>0)/0xFFFFFFFF;}

/* ════════════════════════════════
   DRAW
   ════════════════════════════════ */
function resizeCanvas(){
  if(!bCanvas||!bWrap) return;
  bCanvas.width  = bWrap.clientWidth  || 800;
  bCanvas.height = bWrap.clientHeight || 600;
}

function drawFloorCell(gx,gy,th){
  var px=gx*SQ,py=gy*SQ,n=cellNoise(gx,gy,1);
  var fc=n<0.33?th.floor_a:n<0.66?th.floor_b:th.floor_c;
  bCtx.fillStyle=fc; bCtx.fillRect(px+1,py+1,SQ-1,SQ-1);
  bCtx.fillStyle=th.grout; bCtx.fillRect(px,py,SQ,1); bCtx.fillRect(px,py,1,SQ);
}

function drawOneTile(pl, alpha, hl){
  var tile=getTileDef(pl.tileId); if(!tile) return;
  var rot=pl.rot||0;
  var sz=rotatedSize(pl.tileId,rot);
  var px=pl.gx*SQ, py=pl.gy*SQ, pw=sz.w*SQ, ph=sz.h*SQ;
  bCtx.save();
  bCtx.globalAlpha=alpha||1;
  var imgKey=tileImgKey(pl.tileId);
  var img=tileImgCache&&tileImgCache[imgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    var cr=(typeof IMG_CROPS!=='undefined'&&IMG_CROPS[imgKey])||[0,0,img.naturalWidth,img.naturalHeight];
    var imgW=cr[2], imgH=cr[3];
    var imgIsLandscape=imgW>imgH, tileIsLandscape=pw>ph;
    bCtx.save();
    bCtx.fillStyle='#111'; bCtx.fillRect(px,py,pw,ph);
    if(imgIsLandscape!==tileIsLandscape){
      var mx=px+pw/2, my=py+ph/2;
      bCtx.translate(mx,my); bCtx.rotate(Math.PI/2); bCtx.translate(-my,-mx);
      bCtx.drawImage(img,cr[0],cr[1],imgW,imgH,py,px,ph,pw);
    } else {
      bCtx.drawImage(img,cr[0],cr[1],imgW,imgH,px,py,pw,ph);
    }
    bCtx.restore();
  } else {
    var th2=getTh(tile.theme);
    for(var dy=0;dy<sz.h;dy++) for(var dx=0;dx<sz.w;dx++) drawFloorCell(pl.gx+dx,pl.gy+dy,th2);
  }
  if(hl==='select'){ bCtx.fillStyle='rgba(200,160,60,0.22)'; bCtx.fillRect(px,py,pw,ph); bCtx.strokeStyle='#c8a040'; bCtx.lineWidth=2; bCtx.strokeRect(px+1,py+1,pw-2,ph-2); }
  if(hl==='overlap'){ bCtx.fillStyle='rgba(200,40,20,0.28)'; bCtx.fillRect(px,py,pw,ph); bCtx.strokeStyle='#d04020'; bCtx.lineWidth=2; bCtx.strokeRect(px+1,py+1,pw-2,ph-2); }
  bCtx.globalAlpha=(alpha||1)*0.65;
  bCtx.font='bold 8px serif'; bCtx.fillStyle='#c8901a';
  bCtx.textAlign='left'; bCtx.textBaseline='top';
  bCtx.fillText(tile.id.toUpperCase(),px+3,py+3);
  bCtx.restore();
}

function drawConn(conn){
  var a=(current.tiles||[]).find(function(p){return p.id===conn.fromId;});
  var b=(current.tiles||[]).find(function(p){return p.id===conn.toId;});
  if(!a||!b) return;
  var szA=rotatedSize(a.tileId,a.rot||0);
  var slot=conn.slot||0;
  var edgeX,edgeY;
  if(conn.side==='E'){ edgeX=(a.gx+szA.w)*SQ; edgeY=slot*SQ; }
  else if(conn.side==='S'){ edgeX=slot*SQ; edgeY=(a.gy+szA.h)*SQ; }
  else return;
  var vertical=conn.side==='E';
  var span=2*SQ;
  var cx=vertical?edgeX:edgeX+SQ, cy=vertical?edgeY+SQ:edgeY;
  var isSelected=selectedConn&&selectedConn===conn;
  var col=conn.doorType==='double-door'?'#e8c060':conn.doorType==='open'?'#405830':'#c8a040';
  bCtx.save();
  // Selected highlight
  if(isSelected){ bCtx.strokeStyle='rgba(255,220,80,0.35)'; bCtx.lineWidth=8;
    bCtx.beginPath();
    if(vertical){bCtx.moveTo(edgeX,edgeY);bCtx.lineTo(edgeX,edgeY+span);}
    else{bCtx.moveTo(edgeX,edgeY);bCtx.lineTo(edgeX+span,edgeY);}
    bCtx.stroke(); }
  if(conn.doorType==='open'){
    // Dashed green line — open access
    bCtx.setLineDash([3,4]); bCtx.strokeStyle=col; bCtx.lineWidth=2;
    bCtx.beginPath();
    if(vertical){bCtx.moveTo(edgeX,edgeY);bCtx.lineTo(edgeX,edgeY+span);}
    else{bCtx.moveTo(edgeX,edgeY);bCtx.lineTo(edgeX+span,edgeY);}
    bCtx.stroke(); bCtx.setLineDash([]);
  } else {
    bCtx.strokeStyle=col; bCtx.lineWidth=conn.doorType==='double-door'?3:2;
    bCtx.beginPath();
    if(vertical){bCtx.moveTo(edgeX,edgeY);bCtx.lineTo(edgeX,edgeY+span);}
    else{bCtx.moveTo(edgeX,edgeY);bCtx.lineTo(edgeX+span,edgeY);}
    bCtx.stroke();
    // Door rect
    bCtx.fillStyle=col;
    if(vertical){ bCtx.fillRect(edgeX-3,edgeY+SQ-3,6,6); }
    else { bCtx.fillRect(edgeX+SQ-3,edgeY-3,6,6); }
    if(conn.doorType==='double-door'){
      bCtx.fillStyle='rgba(0,0,0,0.5)'; bCtx.fillRect(cx-2,cy-8,4,16);
    }
  }
  // Click target dot
  bCtx.fillStyle=isSelected?'#ffe040':col;
  bCtx.globalAlpha=0.8;
  bCtx.beginPath(); bCtx.arc(cx,cy,5,0,Math.PI*2); bCtx.fill();
  bCtx.restore();
}

function draw(){
  if(!bCtx||!bCanvas) return;
  bCtx.setTransform(1,0,0,1,0,0);
  bCtx.clearRect(0,0,bCanvas.width,bCanvas.height);
  bCtx.setTransform(zoom,0,0,zoom,offsetX*zoom,offsetY*zoom);
  bCtx.fillStyle='#0e0c08';
  bCtx.fillRect(0,0,GRID_W*SQ,GRID_H*SQ);
  // Grid
  bCtx.strokeStyle='rgba(80,60,40,0.18)'; bCtx.lineWidth=0.5;
  for(var gx=0;gx<=GRID_W;gx++){ bCtx.beginPath();bCtx.moveTo(gx*SQ,0);bCtx.lineTo(gx*SQ,GRID_H*SQ);bCtx.stroke(); }
  for(var gy=0;gy<=GRID_H;gy++){ bCtx.beginPath();bCtx.moveTo(0,gy*SQ);bCtx.lineTo(GRID_W*SQ,gy*SQ);bCtx.stroke(); }
  if(current){
    (current.tiles||[]).forEach(function(pl){
      drawOneTile(pl,1,pl.id===selectedPlaced?'select':pl.id===overlapWarning?'overlap':null);
    });
    (current.connections||[]).forEach(drawConn);
    (current.elements||[]).forEach(function(pe){
      var px=pe.gx*SQ,py=pe.gy*SQ;
      var el=typeof ELEMENT_DB!=='undefined'?ELEMENT_DB.find(function(e){return e.id===pe.elementId;}):null;
      var isSel=(pe.id===selectedElement);
      var isFurn=el&&el.type==='furniture';
      bCtx.save();
      bCtx.fillStyle=isFurn?'rgba(60,40,10,0.9)':'rgba(10,30,60,0.9)';
      bCtx.strokeStyle=isSel?'#c8a040':(isFurn?'#a07830':'#4080c0');
      bCtx.lineWidth=isSel?2.5:1.5;
      bCtx.beginPath(); bCtx.roundRect(px+1,py+1,SQ-2,SQ-2,3); bCtx.fill(); bCtx.stroke();
      if(isSel){
        bCtx.fillStyle='rgba(200,160,60,0.18)';
        bCtx.fillRect(px+1,py+1,SQ-2,SQ-2);
      }
      bCtx.fillStyle=isSel?'#c8a040':(isFurn?'#e8c060':'#80c0ff');
      bCtx.font='bold 9px serif'; bCtx.textAlign='center'; bCtx.textBaseline='middle';
      bCtx.fillText(isFurn?'F':'E',px+SQ/2,py+SQ/2);
      bCtx.restore();
    });
  }
  // Ghost
  if(ghostPos&&(selectedTool||selectedElementTool)){
    if(selectedTool){
      var conflicts=checkOverlap(selectedTool,ghostPos.gx,ghostPos.gy,placedRotation);
      drawOneTile({id:-1,tileId:selectedTool,gx:ghostPos.gx,gy:ghostPos.gy,rot:placedRotation},0.55,conflicts.length?'overlap':null);
    }
    if(selectedElementTool){
      var px2=ghostPos.gx*SQ, py2=ghostPos.gy*SQ;
      var inTile=tileAtCell(ghostPos.gx,ghostPos.gy);
      bCtx.save(); bCtx.globalAlpha=0.65;
      bCtx.fillStyle=inTile?'rgba(10,30,60,0.8)':'rgba(120,40,20,0.5)';
      bCtx.strokeStyle=inTile?'#4080c0':'#c04020';
      bCtx.lineWidth=1.5;
      bCtx.beginPath(); bCtx.roundRect(px2+1,py2+1,SQ-2,SQ-2,3); bCtx.fill(); bCtx.stroke();
      bCtx.restore();
    }
  }
  bCtx.setTransform(1,0,0,1,0,0);
}

/* ════════════════════════════════
   SIDEBAR PICKER
   ════════════════════════════════ */
function renderPickerCanvas(tile, container){
  var w=Array.isArray(tile.sz)?tile.sz[0]:tile.sz;
  var h=Array.isArray(tile.sz)?tile.sz[1]:tile.sz;
  var maxPx=60;
  var scale=Math.min(maxPx/(w*SQ), maxPx/(h*SQ), 1);
  var cvs=document.createElement('canvas');
  cvs.width=Math.round(w*SQ*scale);
  cvs.height=Math.round(h*SQ*scale);
  cvs.style.width=cvs.width+'px';
  cvs.style.height=cvs.height+'px';
  cvs.style.imageRendering='pixelated';
  var ctx2=cvs.getContext('2d');
  var imgKey=tileImgKey(tile.id);
  var img=tileImgCache[imgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    var cr=(typeof IMG_CROPS!=='undefined'&&IMG_CROPS[imgKey])||[0,0,img.naturalWidth,img.naturalHeight];
    ctx2.drawImage(img,cr[0],cr[1],cr[2],cr[3],0,0,cvs.width,cvs.height);
  } else if(img){
    // Image loading — redraw when ready
    img.onload=function(){
      ctx2.drawImage(img,0,0,cvs.width,cvs.height);
    };
    ctx2.fillStyle='#2a1e14'; ctx2.fillRect(0,0,cvs.width,cvs.height);
    ctx2.fillStyle='#7a5830'; ctx2.font='8px serif'; ctx2.textAlign='center';
    ctx2.fillText(tile.id,cvs.width/2,cvs.height/2+3);
  } else {
    ctx2.fillStyle='#2a1e14'; ctx2.fillRect(0,0,cvs.width,cvs.height);
    ctx2.fillStyle='#7a5830'; ctx2.font='8px serif'; ctx2.textAlign='center';
    ctx2.fillText(tile.id,cvs.width/2,cvs.height/2+3);
  }
  container.appendChild(cvs);
}

function buildTilePicker(){
  var container=getEl('bld-picker-tiles');
  if(!container) return;
  container.innerHTML='';
  var groups=[
    {label:'START',     filter:function(t){return !!t.isStart;}},
    {label:'BOSS',      filter:function(t){return !!t.isBossRoom;}},
    {label:'ROOMS',     filter:function(t){return t.type==='room'&&!t.isBossRoom&&!t.isStart&&!t.isDead;}},
    {label:'DEAD ENDS', filter:function(t){return !!t.isDead;}},
    {label:'CORRIDORS', filter:function(t){return t.type==='corridor'&&!t.isStart;}},
  ];
  groups.forEach(function(grp){
    var tiles=TILE_DB.filter(grp.filter);
    if(!tiles.length) return;
    var hdr=document.createElement('div'); hdr.className='bld-picker-hdr';
    hdr.textContent=grp.label+' ('+tiles.length+')';
    var body=document.createElement('div'); body.className='bld-picker-group';
    hdr.addEventListener('click',function(){ body.style.display=body.style.display==='none'?'flex':'none'; });
    container.appendChild(hdr); container.appendChild(body);
    tiles.forEach(function(tile){
      var item=document.createElement('div');
      item.className='bld-picker-item';
      item.dataset.tileId=tile.id;
      item.title=tile.name;
      renderPickerCanvas(tile, item);
      var lbl=document.createElement('div'); lbl.className='bld-picker-label';
      lbl.textContent=tile.name;
      item.appendChild(lbl);
      item.addEventListener('click',function(){ selectTool(tile.id); });
      body.appendChild(item);
    });
  });
}

function buildElementPicker(){
  var container=getEl('bld-picker-elements');
  if(!container||typeof ELEMENT_DB==='undefined') return;
  container.innerHTML='';
  var hdr=document.createElement('div'); hdr.className='bld-picker-hdr';
  hdr.textContent='ELEMENTS ('+ELEMENT_DB.length+')';
  var body=document.createElement('div'); body.className='bld-picker-group';
  hdr.addEventListener('click',function(){ body.style.display=body.style.display==='none'?'flex':'none'; });
  container.appendChild(hdr); container.appendChild(body);
  ELEMENT_DB.forEach(function(el){
    var item=document.createElement('div');
    item.className='bld-picker-item bld-picker-el';
    item.dataset.elementId=el.id; item.title=el.name;
    var icon=document.createElement('div'); icon.className='bld-el-icon';
    icon.textContent=el.type==='furniture'?'🪑':'★'; item.appendChild(icon);
    var lbl=document.createElement('div'); lbl.className='bld-picker-label';
    lbl.textContent=el.name; item.appendChild(lbl);
    item.addEventListener('click',function(){ selectElementTool(el.id); });
    body.appendChild(item);
  });
}

/* ════════════════════════════════
   TOOL SELECTION
   ════════════════════════════════ */
function selectTool(tileId){
  selectedTool=tileId; selectedElementTool=null; selectedPlaced=null;
  placedRotation=0;
  document.querySelectorAll('.bld-picker-item').forEach(function(el){ el.classList.toggle('active',el.dataset.tileId===tileId); });
  bCanvas.style.cursor='crosshair';
  updateInfoPanel();
}
function selectElementTool(elId){
  selectedElementTool=elId; selectedTool=null; selectedPlaced=null;
  document.querySelectorAll('.bld-picker-item').forEach(function(el){ el.classList.toggle('active',el.dataset.elementId===elId); });
  bCanvas.style.cursor='crosshair';
}
function clearTool(){
  selectedTool=null; selectedElementTool=null; selectedConn=null; selectedElement=null;
  document.querySelectorAll('.bld-picker-item').forEach(function(el){ el.classList.remove('active'); });
  bCanvas.style.cursor='default'; ghostPos=null; draw();
}
function rotateTool(dir){
  placedRotation=((placedRotation+(dir||1))+4)%4;
  updateInfoPanel();
}
function rotatePlaced(id){
  if(!current) return;
  var pl=current.tiles.find(function(p){return p.id===id;});
  if(pl){ pl.rot=((pl.rot||0)+1)%4; buildConnections(); current.modified=Date.now(); draw(); }
}
function deletePlaced(id){
  if(!current) return;
  current.tiles=current.tiles.filter(function(p){return p.id!==id;});
  current.elements=current.elements.filter(function(p){return p.id!==id;});
  buildConnections(); current.modified=Date.now();
  if(selectedPlaced===id){ selectedPlaced=null; bCanvas.style.cursor='default'; }
  updateInfoPanel(); draw();
}
function selectPlaced(id){
  selectedPlaced=id; selectedTool=null; selectedElementTool=null;
  document.querySelectorAll('.bld-picker-item').forEach(function(el){ el.classList.remove('active'); });
  bCanvas.style.cursor='move'; updateInfoPanel(); draw();
}
function cycleDoor(conn){
  var types=['single-door','double-door','open'];
  conn.doorType=types[(types.indexOf(conn.doorType)+1)%types.length];
  selectedConn=conn; updateInfoPanel(); draw();
}
function findConnAt(gx,gy){
  if(!current) return null;
  return (current.connections||[]).find(function(c){
    var a=current.tiles.find(function(p){return p.id===c.fromId;});
    if(!a) return false;
    var szA=rotatedSize(a.tileId,a.rot||0);
    var ex,ey;
    if(c.side==='E'){ex=a.gx+szA.w;ey=c.slot;}
    else if(c.side==='S'){ex=c.slot;ey=a.gy+szA.h;}
    else return false;
    return Math.abs(gx-ex)<=1&&Math.abs(gy-ey)<=1;
  });
}

/* ════════════════════════════════
   HELPERS
   ════════════════════════════════ */
function tileAtCell(gx, gy){
  if(!current) return null;
  return (current.tiles||[]).find(function(pl){
    var sz=rotatedSize(pl.tileId,pl.rot||0);
    return gx>=pl.gx&&gx<pl.gx+sz.w&&gy>=pl.gy&&gy<pl.gy+sz.h;
  })||null;
}
function connSlotRange(conn){
  // Returns {lo,hi} — valid slot range for this connector (inclusive)
  var a=current.tiles.find(function(p){return p.id===conn.fromId;});
  var b=current.tiles.find(function(p){return p.id===conn.toId;});
  if(!a||!b) return null;
  var szA=rotatedSize(a.tileId,a.rot||0);
  var szB=rotatedSize(b.tileId,b.rot||0);
  if(conn.side==='E'){
    var lo=Math.max(a.gy,b.gy);
    var hi=Math.min(a.gy+szA.h,b.gy+szB.h)-2;
    return {lo:lo,hi:hi};
  } else if(conn.side==='S'){
    var lo2=Math.max(a.gx,b.gx);
    var hi2=Math.min(a.gx+szA.w,b.gx+szB.w)-2;
    return {lo:lo2,hi:hi2};
  }
  return null;
}
function moveConn(conn, delta){
  var range=connSlotRange(conn);
  if(!range) return;
  conn.slot=Math.max(range.lo,Math.min(range.hi,conn.slot+delta));
  draw();
}

/* ════════════════════════════════
   PLACE
   ════════════════════════════════ */
function placeTile(gx,gy){
  if(!selectedTool||!current) return;
  var conflicts=checkOverlap(selectedTool,gx,gy,placedRotation);
  if(conflicts.length){
    overlapWarning=conflicts[0];
    addBuildLog('⚠ Overlap — placed anyway','warn');
    setTimeout(function(){overlapWarning=null;draw();},1500);
  }
  var pl={id:nextPlacedId++,tileId:selectedTool,gx:gx,gy:gy,rot:placedRotation};
  current.tiles.push(pl);
  buildConnections(); current.modified=Date.now();
  updateInfoPanel(); updateDungeonHeader(); draw();
}
function placeElement(gx,gy){
  if(!selectedElementTool||!current) return;
  // Must be inside a placed tile
  if(!tileAtCell(gx,gy)){
    addBuildLog('⚠ Elements must be placed inside a tile','warn');
    return;
  }
  // Warn on overlap
  var overlap=(current.elements||[]).find(function(pe){return pe.gx===gx&&pe.gy===gy;});
  if(overlap) addBuildLog('⚠ Element overlaps another — placed anyway','warn');
  var pe={id:nextPlacedId++,elementId:selectedElementTool,gx:gx,gy:gy};
  current.elements.push(pe);
  current.modified=Date.now(); draw();
}
function deleteElement(id){
  if(!current) return;
  current.elements=current.elements.filter(function(pe){return pe.id!==id;});
  current.modified=Date.now();
  if(selectedElement===id) selectedElement=null;
  updateInfoPanel(); draw();
}
function selectElement(id){
  selectedElement=id;
  selectedPlaced=null; selectedConn=null; selectedTool=null; selectedElementTool=null;
  document.querySelectorAll('.bld-picker-item').forEach(function(el){el.classList.remove('active');});
  bCanvas.style.cursor='default';
  updateInfoPanel(); draw();
}

/* ════════════════════════════════
   INFO PANEL
   ════════════════════════════════ */
function updateInfoPanel(){
  var panel=getEl('bld-info-panel');
  if(!panel) return;
  if(selectedPlaced&&current){
    var pl=current.tiles.find(function(p){return p.id===selectedPlaced;});
    if(!pl){panel.innerHTML='<div class="bld-info-empty">Nothing selected</div>';return;}
    var tile=getTileDef(pl.tileId);
    var sz=rotatedSize(pl.tileId,pl.rot||0);
    var rots=[' 0°',' 90°','180°','270°'];
    panel.innerHTML='<div class="bld-info-name">'+(tile?tile.name:pl.tileId)+'</div>'
      +'<div class="bld-info-meta">'+(tile?tile.cat+' · '+tile.theme:'')+'</div>'
      +'<div class="bld-info-meta">'+sz.w+'×'+sz.h+' sq · '+rots[pl.rot||0]+'</div>'
      +(tile&&tile.special?'<div class="bld-info-special">'+tile.special+'</div>':'')
      +'<div class="bld-info-btns">'
      +'<button class="bld-act-btn" id="bip-rot">↻ ROTATE</button>'
      +'<button class="bld-act-btn danger" id="bip-del">✕ DELETE</button>'
      +'</div>';
    var rotBtn=getEl('bip-rot'); var delBtn=getEl('bip-del');
    if(rotBtn) rotBtn.addEventListener('click',function(){rotatePlaced(selectedPlaced);updateInfoPanel();});
    if(delBtn) delBtn.addEventListener('click',function(){deletePlaced(selectedPlaced);});
    return;
  }
  if(selectedTool){
    var tile2=getTileDef(selectedTool); if(!tile2) return;
    var sz2=rotatedSize(selectedTool,placedRotation);
    var rots2=[' 0°',' 90°','180°','270°'];
    panel.innerHTML='<div class="bld-info-name">'+tile2.name+'</div>'
      +'<div class="bld-info-meta">'+tile2.cat+' · '+tile2.theme+'</div>'
      +'<div class="bld-info-meta">'+sz2.w+'×'+sz2.h+' sq · placing at '+rots2[placedRotation]+'</div>'
      +(tile2.special?'<div class="bld-info-special">'+tile2.special+'</div>':'')
      +'<div class="bld-info-btns">'
      +'<button class="bld-act-btn" id="bip-ccw">◀</button>'
      +'<span style="font-family:Cinzel,serif;font-size:11px;color:#9a8060;padding:0 6px;" id="bip-rot-lbl">'+rots2[placedRotation]+'</span>'
      +'<button class="bld-act-btn" id="bip-cw">▶</button>'
      +'<button class="bld-act-btn" id="bip-cancel">CANCEL</button>'
      +'</div>';
    var ccw=getEl('bip-ccw'),cw=getEl('bip-cw'),cancel=getEl('bip-cancel');
    if(ccw) ccw.addEventListener('click',function(){rotateTool(-1);updateInfoPanel();draw();});
    if(cw)  cw.addEventListener('click',function(){rotateTool(1);updateInfoPanel();draw();});
    if(cancel) cancel.addEventListener('click',clearTool);
    return;
  }
  if(selectedElement&&current){
    var pe=current.elements.find(function(e){return e.id===selectedElement;});
    if(!pe){panel.innerHTML='<div class="bld-info-empty">Nothing selected</div>';return;}
    var el=typeof ELEMENT_DB!=='undefined'?ELEMENT_DB.find(function(e){return e.id===pe.elementId;}):null;
    var host=tileAtCell(pe.gx,pe.gy);
    var hostTile=host?getTileDef(host.tileId):null;
    panel.innerHTML='<div class="bld-info-name">'+(el?el.name:pe.elementId)+'</div>'
      +'<div class="bld-info-meta">'+(el?el.type:'')+'</div>'
      +'<div class="bld-info-meta">In: '+(hostTile?hostTile.name:'open area')+'</div>'
      +(el&&el.special?'<div class="bld-info-special">'+el.special+'</div>':'')
      +'<div class="bld-info-btns">'
      +'<button class="bld-act-btn danger" id="bip-el-del">✕ DELETE</button>'
      +'</div>';
    var delBtn=getEl('bip-el-del');
    if(delBtn) delBtn.addEventListener('click',function(){deleteElement(selectedElement);});
    return;
  }
  if(selectedConn){
    var dtLabel={'single-door':'Single Door','double-door':'Double Door','open':'Open Access'}[selectedConn.doorType]||selectedConn.doorType;
    var dtCol={'single-door':'#c8a040','double-door':'#e8c060','open':'#60a860'}[selectedConn.doorType]||'#9a8060';
    var range=connSlotRange(selectedConn);
    var moveDir=selectedConn.side==='E'?['▲','▼']:['◀','▶'];
    panel.innerHTML='<div class="bld-info-name">Connection</div>'
      +'<div class="bld-info-meta">'+selectedConn.side+' wall · slot '+selectedConn.slot+'</div>'
      +'<div class="bld-info-meta" style="color:'+dtCol+';margin-top:4px;font-family:Cinzel,serif;">'+dtLabel+'</div>'
      +'<div class="bld-info-btns">'
      +'<button class="bld-act-btn" id="bip-conn-m1">'+moveDir[0]+'</button>'
      +'<button class="bld-act-btn" id="bip-conn-p1">'+moveDir[1]+'</button>'
      +'<button class="bld-act-btn" id="bip-door-cycle">⇄ TYPE</button>'
      +'</div>'
      +(range?'<div class="bld-info-meta" style="margin-top:4px;">Range: '+range.lo+' – '+range.hi+'</div>':'');
    var m1=getEl('bip-conn-m1'), p1=getEl('bip-conn-p1'), cyc=getEl('bip-door-cycle');
    if(m1) m1.addEventListener('click',function(){moveConn(selectedConn,-1);updateInfoPanel();});
    if(p1) p1.addEventListener('click',function(){moveConn(selectedConn,1);updateInfoPanel();});
    if(cyc) cyc.addEventListener('click',function(){cycleDoor(selectedConn);updateInfoPanel();});
    return;
  }
  panel.innerHTML='<div class="bld-info-empty">Pick a tile from the panel to place it on the canvas.<br><br><span style="color:#4a3420;font-size:11px;">R = rotate · Esc = cancel · Del = delete selected · click connector to edit door</span></div>';
}

/* ════════════════════════════════
   DUNGEON MANAGEMENT
   ════════════════════════════════ */
function updateDungeonHeader(){
  var n=getEl('bld-dungeon-name'); if(n) n.value=current?current.name:'';
  var c=getEl('bld-tile-count'); if(c) c.textContent=current?(current.tiles.length+' tiles'):'';
}
function refreshSavedList(){
  var list=getEl('bld-saved-list'); if(!list) return;
  list.innerHTML='';
  if(!layouts.length){
    list.innerHTML='<div style="font-family:Crimson Text,serif;font-size:13px;color:#3a2818;padding:12px;font-style:italic;">No saved dungeons yet</div>';
    return;
  }
  layouts.slice().reverse().forEach(function(l){
    var row=document.createElement('div');
    row.className='bld-saved-row'+(current&&current.id===l.id?' active':'');
    row.innerHTML='<span class="bld-saved-name">'+l.name+'</span>'
      +'<span class="bld-saved-meta">'+(l.tiles?l.tiles.length:0)+' tiles</span>'
      +'<button class="bld-saved-del" data-lid="'+l.id+'">✕</button>';
    row.querySelector('.bld-saved-name').addEventListener('click',function(){loadDungeon(l.id);});
    row.querySelector('.bld-saved-del').addEventListener('click',function(e){
      e.stopPropagation(); var btn=e.currentTarget;
      if(btn.dataset.confirmed){ deleteDungeon(parseInt(btn.dataset.lid)); }
      else{ btn.dataset.confirmed='1'; btn.textContent='CONFIRM?'; btn.style.color='#d06040';
        setTimeout(function(){btn.dataset.confirmed='';btn.textContent='✕';btn.style.color='';},2000); }
    });
    list.appendChild(row);
  });
}
function newDungeon(){
  dungeonCount++;
  var layout=newLayout('Dungeon '+dungeonCount);
  layouts.push(layout); current=layout;
  selectedTool=null; selectedElementTool=null; selectedPlaced=null;
  centreView(); saveLayouts(); refreshSavedList(); updateDungeonHeader(); updateInfoPanel(); draw();
  addBuildLog('New dungeon created: '+layout.name,'ok');
}
function loadDungeon(id){
  var l=layouts.find(function(x){return x.id===id;});
  if(!l) return; current=l;
  selectedTool=null; selectedElementTool=null; selectedPlaced=null;
  centreView(); buildConnections(); refreshSavedList(); updateDungeonHeader(); updateInfoPanel(); draw();
  addBuildLog('Loaded: '+l.name,'ok');
}
function saveCurrent(){
  if(!current) return; current.modified=Date.now();
  var idx=layouts.findIndex(function(x){return x.id===current.id;});
  if(idx>=0) layouts[idx]=current; else layouts.push(current);
  saveLayouts(); refreshSavedList();
  addBuildLog('Saved: '+current.name,'ok');
}
function deleteDungeon(id){
  layouts=layouts.filter(function(x){return x.id!==id;});
  if(current&&current.id===id) current=layouts[0]||null;
  saveLayouts(); refreshSavedList(); updateDungeonHeader(); draw();
}
function renameCurrent(name){
  if(!current||!name.trim()) return; current.name=name.trim(); saveCurrent(); updateDungeonHeader();
}

/* ════════════════════════════════
   EXPORT PNG
   ════════════════════════════════ */
function exportPNG(){
  if(!current||!current.tiles.length){ addBuildLog('Nothing to export','warn'); return; }
  var minGx=9999,minGy=9999,maxGx=0,maxGy=0;
  current.tiles.forEach(function(pl){
    var sz=rotatedSize(pl.tileId,pl.rot||0);
    minGx=Math.min(minGx,pl.gx); minGy=Math.min(minGy,pl.gy);
    maxGx=Math.max(maxGx,pl.gx+sz.w); maxGy=Math.max(maxGy,pl.gy+sz.h);
  });
  var pad=2, ew=(maxGx-minGx+pad*2)*SQ, eh=(maxGy-minGy+pad*2)*SQ;
  var off=document.createElement('canvas'); off.width=ew; off.height=eh;
  var ctx2=off.getContext('2d');
  ctx2.fillStyle='#0e0c08'; ctx2.fillRect(0,0,ew,eh);
  current.tiles.forEach(function(pl){
    var sz=rotatedSize(pl.tileId,pl.rot||0);
    var ox=(pl.gx-minGx+pad)*SQ, oy=(pl.gy-minGy+pad)*SQ;
    var imgKey=tileImgKey(pl.tileId); var img=tileImgCache[imgKey];
    if(img&&img.complete&&img.naturalWidth>0){
      var cr=(typeof IMG_CROPS!=='undefined'&&IMG_CROPS[imgKey])||[0,0,img.naturalWidth,img.naturalHeight];
      ctx2.drawImage(img,cr[0],cr[1],cr[2],cr[3],ox,oy,sz.w*SQ,sz.h*SQ);
    } else { ctx2.fillStyle='#3a2818'; ctx2.fillRect(ox,oy,sz.w*SQ,sz.h*SQ); }
  });
  var a=document.createElement('a');
  a.download=(current.name||'dungeon').replace(/\s+/g,'_')+'.png';
  a.href=off.toDataURL('image/png'); a.click();
  addBuildLog('Exported PNG','ok');
}

/* ════════════════════════════════
   PLAY MODE
   ════════════════════════════════ */
function launchPlayMode(){
  if(!current||!current.tiles.length){ addBuildLog('Build something first','warn'); return; }
  var genPlaced=current.tiles.map(function(pl,idx){
    var tile=getTileDef(pl.tileId); var sz=rotatedSize(pl.tileId,pl.rot||0);
    return { id:idx, gx:pl.gx, gy:pl.gy, w:sz.w, h:sz.h, tile:tile, rot:pl.rot||0,
      revealed:!!(tile&&tile.isStart), isBoss:!!(tile&&tile.isBossRoom), isObjective:!!(tile&&tile.isBossRoom) };
  });
  var genConns=current.connections.map(function(c){
    var fi=current.tiles.findIndex(function(p){return p.id===c.fromId;});
    var ti=current.tiles.findIndex(function(p){return p.id===c.toId;});
    return {fromId:fi,toId:ti,side:c.side,slot:c.slot,doorType:c.doorType||'single-door'};
  });
  window._builderPlayData={placed:genPlaced,connections:genConns,layout:current};
  window.launchApp('generator');
  setTimeout(function(){
    if(window.loadBuilderDungeon) window.loadBuilderDungeon(genPlaced,genConns);
    else addBuildLog('▶ Play mode launched — generator will use layout','ok');
  },300);
}

/* ════════════════════════════════
   LOG
   ════════════════════════════════ */
function addBuildLog(msg,cls){
  var log=getEl('bld-log'); if(!log) return;
  var p=document.createElement('p');
  p.textContent=msg;
  p.style.cssText='font-family:Crimson Text,serif;font-size:13px;margin:1px 0;color:'+(cls==='warn'?'#c8780a':cls==='ok'?'#70b878':'#6a5030')+';';
  log.insertBefore(p,log.firstChild);
  while(log.children.length>15) log.removeChild(log.lastChild);
}

/* ════════════════════════════════
   CANVAS EVENTS
   ════════════════════════════════ */
function wireCanvas(){
  bCanvas.addEventListener('mousemove',function(e){
    var g=screenToGrid(e.clientX,e.clientY);
    if(isPanning&&panLast){
      offsetX+=(e.clientX-panLast.x)/zoom;
      offsetY+=(e.clientY-panLast.y)/zoom;
      clampOffset();
      panLast={x:e.clientX,y:e.clientY}; draw(); return; }
    if(isDragging&&selectedPlaced&&dragStart){
      var dx=g.gx-dragStart.sgx, dy=g.gy-dragStart.sgy;
      var pl=current.tiles.find(function(p){return p.id===selectedPlaced;});
      if(pl){ pl.gx=dragStart.ogx+dx; pl.gy=dragStart.ogy+dy; buildConnections(); draw(); } return;
    }
    if(selectedTool||selectedElementTool){ ghostPos=g; draw(); }
  });

  bCanvas.addEventListener('mousedown',function(e){
    if(e.button===1||e.altKey){ isPanning=true; panLast={x:e.clientX,y:e.clientY}; bCanvas.style.cursor='grabbing'; e.preventDefault(); return; }
    var g=screenToGrid(e.clientX,e.clientY);
    if(e.button===2){
      if(selectedTool){rotateTool(1);draw();}
      else if(selectedPlaced){rotatePlaced(selectedPlaced);updateInfoPanel();}
      return;
    }
    if(selectedTool){ placeTile(g.gx,g.gy); return; }
    if(selectedElementTool){ placeElement(g.gx,g.gy); return; }
    var conn=findConnAt(g.gx,g.gy);
    if(conn){ selectedPlaced=null; selectedConn=conn; selectedElement=null; updateInfoPanel(); draw(); return; }
    // Check element hit
    if(current){
      var hitEl=null;
      for(var ei=(current.elements||[]).length-1;ei>=0;ei--){
        var pe2=current.elements[ei];
        if(pe2.gx===g.gx&&pe2.gy===g.gy){hitEl=pe2;break;}
      }
      if(hitEl){ selectElement(hitEl.id); return; }
    }
    if(current){
      var hit=null;
      for(var i=(current.tiles.length-1);i>=0;i--){
        var pl2=current.tiles[i]; var sz=rotatedSize(pl2.tileId,pl2.rot||0);
        if(g.gx>=pl2.gx&&g.gx<pl2.gx+sz.w&&g.gy>=pl2.gy&&g.gy<pl2.gy+sz.h){hit=pl2;break;}
      }
      if(hit){ selectPlaced(hit.id); isDragging=true; dragStart={sgx:g.gx,sgy:g.gy,ogx:hit.gx,ogy:hit.gy}; return; }
    }
    selectedPlaced=null; selectedConn=null; selectedElement=null; bCanvas.style.cursor=selectedTool?'crosshair':'default'; updateInfoPanel(); draw();
  });

  bCanvas.addEventListener('mouseup',function(){
    if(isPanning){isPanning=false;panLast=null;bCanvas.style.cursor=selectedTool?'crosshair':'default';return;}
    if(isDragging){ isDragging=false; dragStart=null; if(current) current.modified=Date.now(); draw(); }
  });

  bCanvas.addEventListener('contextmenu',function(e){e.preventDefault();});

  bWrap.addEventListener('wheel',function(e){
    e.preventDefault();
    var rect=bCanvas.getBoundingClientRect();
    var sx=e.clientX-rect.left, sy=e.clientY-rect.top;
    if(e.ctrlKey||e.metaKey||Math.abs(e.deltaY)>Math.abs(e.deltaX)){
      zoomAt(sx, sy, zoom+(e.deltaY<0?ZOOM_STEP:-ZOOM_STEP));
    } else {
      offsetX-=e.deltaX/zoom; clampOffset();
    }
    draw();
  },{passive:false});
}

/* ════════════════════════════════
   KEYBOARD
   ════════════════════════════════ */
document.addEventListener('keydown',function(e){
  var active=getEl('app-builder');
  if(!active||!active.classList.contains('active')) return;
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
  if(e.key==='r'||e.key==='R'){rotateTool(1);updateInfoPanel();draw();}
  if(e.key==='Escape') clearTool();
  if(e.key==='Delete'||e.key==='Backspace'){
    if(selectedPlaced) deletePlaced(selectedPlaced);
    else if(selectedElement) deleteElement(selectedElement);
  }
});

/* ════════════════════════════════
   TOOLBAR WIRING
   ════════════════════════════════ */
function wireToolbar(){
  var btnNew=getEl('bld-btn-new'), btnSave=getEl('bld-btn-save');
  var btnExp=getEl('bld-btn-export'), btnPlay=getEl('bld-btn-play');
  var nameInp=getEl('bld-dungeon-name');
  if(btnNew)  btnNew.addEventListener('click',newDungeon);
  if(btnSave) btnSave.addEventListener('click',saveCurrent);
  if(btnExp)  btnExp.addEventListener('click',exportPNG);
  if(btnPlay) btnPlay.addEventListener('click',launchPlayMode);
  if(nameInp) nameInp.addEventListener('change',function(){renameCurrent(this.value);});
}

/* ════════════════════════════════
   INIT
   ════════════════════════════════ */
function init(){
  bCanvas = getEl('builder-canvas');
  bCtx    = bCanvas.getContext('2d');
  bWrap   = getEl('bld-map-wrap');

  resizeCanvas();
  window.addEventListener('resize',function(){resizeCanvas();centreView();draw();});

  wireCanvas();
  wireToolbar();

  loadLayouts();

  if(layouts.length){
    current=layouts[layouts.length-1];
    dungeonCount=layouts.length;
    buildConnections();
    centreView();
  } else {
    newDungeon();
  }

  buildTilePicker();
  buildElementPicker();
  refreshSavedList();
  updateDungeonHeader();
  updateInfoPanel();
  centreView();
  draw();

  addBuildLog('Builder ready · select a tile · R=rotate · Esc=cancel · Del=delete','ok');
}

// Run init after a tick to ensure the DOM is painted
setTimeout(init, 100);

// Test hook — exposes internals for automated testing
if(typeof window !== 'undefined') window._bldTest = {
  selectTool:selectTool, clearTool:clearTool, placeTile:placeTile,
  placeElement:placeElement, buildConnections:buildConnections,
  draw:draw, newDungeon:newDungeon, saveCurrent:saveCurrent,
  loadDungeon:loadDungeon, deletePlaced:deletePlaced,
  getLayouts:function(){return layouts;}, getCurrent:function(){return current;}
};

})();

// Run all queued timers (includes init)
var timerErrors=[];
_timers.forEach(function(t){
  try{t.fn();}catch(e){timerErrors.push(t.ms+'ms: '+e.message);}
});

var passed=0,failed=0,log=[];
function test(name,fn){try{fn();passed++;log.push('PASS: '+name);}catch(e){failed++;log.push('FAIL: '+name+' — '+e.message);}}
function assert(cond,msg){if(!cond)throw new Error(msg||'false');}
var T=window._bldTest;

test('_bldTest hook exposed',function(){assert(T&&typeof T==='object');});
test('bld-btn-new wired',function(){var btn=getById('bld-btn-new');assert(btn._ev.click&&btn._ev.click.length>0,'no click listener');});
test('bld-btn-save wired',function(){assert(getById('bld-btn-save')._ev.click&&getById('bld-btn-save')._ev.click.length>0);});
test('bld-btn-play wired',function(){assert(getById('bld-btn-play')._ev.click&&getById('bld-btn-play')._ev.click.length>0);});
test('bld-picker-tiles has groups',function(){var c=getById('bld-picker-tiles');assert(c._ch.length>=5,'expected 5 groups, got '+c._ch.length);});
test('bld-picker-elements populated',function(){assert(getById('bld-picker-elements')._ch.length>0,'empty');});
test('newDungeon sets name',function(){T.newDungeon();assert(getById('bld-dungeon-name').value.length>0);});
test('getCurrent returns layout',function(){assert(T.getCurrent()!==null);assert(T.getCurrent().tiles!==undefined);});
test('selectTool and placeTile',function(){T.selectTool('r1');T.placeTile(10,10);assert(getById('bld-tile-count').textContent.indexOf('1')>=0);});
test('placeTile adjacency builds connection',function(){T.placeTile(16,10);T.buildConnections();assert(T.getCurrent().connections.length>0);});
test('draw runs cleanly',function(){T.draw();assert(true);});
test('saveCurrent persists layout',function(){T.saveCurrent();assert(T.getLayouts().length>0);});
test('timer errors',function(){assert(timerErrors.length===0,timerErrors.join('; '));});

log.forEach(function(l){process.stdout.write(l+'\n');});
process.stdout.write('\n'+passed+' passed, '+failed+' failed\n');
if(failed>0) process.exit(1);
