








// Pre-cache all tile images


/* ── Colour helpers ── */
function parseCol(hex){const v=parseInt(hex.replace('#',''),16);return[(v>>16)&255,(v>>8)&255,v&255];}
function toHex(r,g,b){return'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
function lightenCol(hex,f){const[r,g,b]=parseCol(hex);return toHex(r+(255-r)*f,g+(255-g)*f,b+(255-b)*f);}
function darkenCol(hex,f){const[r,g,b]=parseCol(hex);return toHex(r*(1-f),g*(1-f),b*(1-f));}
function cellNoise(gx,gy,s){let h=(gx*374761393+gy*668265263+(s||0))|0;h^=h>>>13;h=Math.imul(h,1274126177);h^=h>>>16;return(h>>>0)/0xFFFFFFFF;}

const THEME={
  dungeon:  {floor_a:'#7a5840',floor_b:'#6e4e38',floor_c:'#855e48',grout:'#3a2518',wall_face:'#4a3828',wall_top:'#3a2c20',wall_shadow:'#221810',torch:'#e8902020'},
  crypt:    {floor_a:'#5a6050',floor_b:'#505848',floor_c:'#626858',grout:'#2a3028',wall_face:'#3a4038',wall_top:'#2e3430',wall_shadow:'#1a2018',torch:'#60d06020'},
  sewer:    {floor_a:'#384858',floor_b:'#304050',floor_c:'#404f60',grout:'#202830',wall_face:'#2a3840',wall_top:'#223038',wall_shadow:'#141c22',torch:'#4080c020'},
  cave:     {floor_a:'#5a4830',floor_b:'#4e4028',floor_c:'#625238',grout:'#2e2418',wall_face:'#3a3028',wall_top:'#2e2420',wall_shadow:'#1e1810',torch:'#c0801020'},
  outdoor:  {floor_a:'#5a6830',floor_b:'#526028',floor_c:'#627038',grout:'#3a4820',wall_face:'#484030',wall_top:'#3a3428',wall_shadow:'#282418',torch:'#e8b84020'},
  forest:   {floor_a:'#486030',floor_b:'#405828',floor_c:'#526838',grout:'#2a3820',wall_face:'#383820',wall_top:'#2c2c18',wall_shadow:'#1c1c10',torch:'#80c02020'},
  civilised:{floor_a:'#9a8870',floor_b:'#8a7860',floor_c:'#a89880',grout:'#5a4838',wall_face:'#6a5a48',wall_top:'#5a4c3c',wall_shadow:'#3a3028',torch:'#f0c06020'},
};
function getTh(theme){return THEME[theme]||THEME.dungeon;}

function drawFloor(ctx,gx,gy,th,sq){
  const px=gx*sq,py=gy*sq,n=cellNoise(gx,gy,1),n2=cellNoise(gx,gy,2);
  let fc=n<0.33?th.floor_a:n<0.66?th.floor_b:th.floor_c;
  ctx.fillStyle=fc;ctx.fillRect(px+1,py+1,sq-1,sq-1);
  ctx.fillStyle=th.grout;ctx.fillRect(px,py,sq,1);ctx.fillRect(px,py,1,sq);
  ctx.fillStyle=lightenCol(fc,0.13);ctx.fillRect(px+1,py+1,sq-2,1);ctx.fillRect(px+1,py+1,1,sq-2);
  ctx.fillStyle=darkenCol(fc,0.22);ctx.fillRect(px+1,py+sq-2,sq-2,1);ctx.fillRect(px+sq-2,py+1,1,sq-2);
}
function drawWall(ctx,gx,gy,th,sq){
  const px=gx*sq,py=gy*sq;
  ctx.fillStyle=th.wall_face;ctx.fillRect(px,py,sq,sq);
  const bh=Math.floor(sq*0.48);
  ctx.fillStyle=th.wall_top;ctx.fillRect(px,py,sq,bh);
  ctx.fillStyle=th.wall_shadow;ctx.fillRect(px,py+bh+1,sq,sq-bh-1);
  ctx.fillStyle=th.grout;ctx.fillRect(px,py+bh,sq,1);
  const jx=(gy%2===0)?Math.floor(sq*0.5):Math.floor(sq*0.25);
  ctx.fillRect(px+jx,py,1,bh);ctx.fillRect(px+(jx+Math.floor(sq*0.5))%sq,py+bh+1,1,sq-bh-1);
}
function renderFallback(canvas,tile){
  const PAD=1,tw=tile.sz[0],th=tile.sz[1];
  const totalW=tw+PAD*2,totalH=th+PAD*2;
  const SQ=43; // px per cell — consistent scale across all tile sizes
  canvas.width=totalW*SQ;canvas.height=totalH*SQ;
  canvas.style.width=(totalW*SQ)+'px';canvas.style.height=(totalH*SQ)+'px';
  const ctx=canvas.getContext('2d'),thm=getTh(tile.theme);
  ctx.fillStyle='#0d0a07';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let dy=-PAD;dy<th+PAD;dy++)for(let dx=-PAD;dx<tw+PAD;dx++){
    if(dx>=0&&dx<tw&&dy>=0&&dy<th)drawFloor(ctx,dx+PAD,dy+PAD,thm,SQ);
    else drawWall(ctx,dx+PAD,dy+PAD,thm,SQ);
  }
  if(tile.isBossRoom){ctx.fillStyle='rgba(180,20,15,0.28)';ctx.fillRect(PAD*SQ,PAD*SQ,tw*SQ,th*SQ);}
  if(tile.isStart){ctx.fillStyle='rgba(30,100,50,0.22)';ctx.fillRect(PAD*SQ,PAD*SQ,tw*SQ,th*SQ);}
  if(tile.isEnchanted){ctx.fillStyle='rgba(120,60,200,0.15)';ctx.fillRect(PAD*SQ,PAD*SQ,tw*SQ,th*SQ);}
  if(tile.isWater){ctx.fillStyle='rgba(20,60,120,0.25)';ctx.fillRect(PAD*SQ,PAD*SQ,tw*SQ,th*SQ);}
}
function drawImgOnCanvas(canvas,img,imgKey,tile){
  const cr=IMG_CROPS[imgKey]||[0,0,img.naturalWidth,img.naturalHeight];
  const imgW=cr[2],imgH=cr[3],tw=tile.sz[0],th=tile.sz[1];
  const SQ=43; // px per cell — consistent scale across all tile sizes
  const dispW=Math.round(tw*SQ),dispH=Math.round(th*SQ);
  canvas.width=dispW;canvas.height=dispH;
  canvas.style.width=dispW+'px';canvas.style.height=dispH+'px';
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#0d0a07';ctx.fillRect(0,0,dispW,dispH);
  const imgIsLandscape=imgW>imgH,tileIsLandscape=tw>th;
  ctx.save();
  if(imgIsLandscape!==tileIsLandscape){
    ctx.translate(dispW/2,dispH/2);ctx.rotate(Math.PI/2);ctx.translate(-dispH/2,-dispW/2);
    ctx.drawImage(img,cr[0],cr[1],imgW,imgH,0,0,dispH,dispW);
  } else {
    ctx.drawImage(img,cr[0],cr[1],imgW,imgH,0,0,dispW,dispH);
  }
  ctx.restore();
  if(tile.isBossRoom){ctx.fillStyle='rgba(180,20,15,0.22)';ctx.fillRect(0,0,dispW,dispH);ctx.strokeStyle='rgba(230,40,20,0.7)';ctx.lineWidth=2;ctx.strokeRect(1,1,dispW-2,dispH-2);ctx.lineWidth=1;}
  if(tile.isStart){ctx.fillStyle='rgba(30,100,50,0.15)';ctx.fillRect(0,0,dispW,dispH);}
  if(tile.isEnchanted){ctx.fillStyle='rgba(120,60,200,0.1)';ctx.fillRect(0,0,dispW,dispH);}
  if(tile.isWater){ctx.fillStyle='rgba(20,60,120,0.15)';ctx.fillRect(0,0,dispW,dispH);}
}
function setupImgWrap(wrap,canvas,tile){
  const imgKey=tileImgKey(tile.id);
  const hasImg=imgKey&&TILE_IMAGES[imgKey];
  if(!hasImg){
    renderFallback(canvas,tile);
    wrap.appendChild(canvas);
    const lbl=document.createElement('div');lbl.className='img-key-label';lbl.textContent='no image';
    wrap.appendChild(lbl);return;
  }
  const img=tileImgCache[imgKey];
  const doRender=()=>{
    if(!img.naturalWidth)return;
    drawImgOnCanvas(canvas,img,imgKey,tile);
    wrap.innerHTML='';wrap.appendChild(canvas);
    const lbl=document.createElement('div');lbl.className='img-key-label';lbl.textContent=imgKey;
    wrap.appendChild(lbl);
  };
  renderFallback(canvas,tile);wrap.appendChild(canvas);
  const lbl=document.createElement('div');lbl.className='img-key-label';lbl.textContent=imgKey+'…';
  wrap.appendChild(lbl);
  const tryRender=()=>{if(img.complete&&img.naturalWidth>0)doRender();else{img.onload=doRender;img.onerror=()=>{};}};
  setTimeout(tryRender,50);
}

/* ── Theme group definitions (determines visual sections) ── */
const THEME_GROUPS = [
  // ── DUNGEON ──
  { key:'dun-start',    label:'⚔ DUNGEON — START TILES',        cls:'th-start',    filter:t=>t.cat==='dungeon'&&t.isStart },
  { key:'dun-boss',     label:'⚔ DUNGEON — BOSS ROOMS',          cls:'th-boss',     filter:t=>(t.cat==='dungeon'||t.altCat==='dungeon')&&t.isBossRoom },
  { key:'dun-rooms',    label:'⚔ DUNGEON — STONE ROOMS',         cls:'th-dungeon',  filter:t=>t.cat==='dungeon'&&t.type==='room'&&!t.isBossRoom&&!t.isStart&&t.theme==='dungeon'&&!t.isDead },
  { key:'dun-dead',     label:'⚔ DUNGEON — SPECIAL & DEAD ENDS', cls:'th-special',  filter:t=>t.cat==='dungeon'&&t.type==='room'&&!t.isBossRoom&&!t.isStart&&t.isDead },
  { key:'dun-crypt',    label:'⚔ DUNGEON — CRYPT ROOMS',         cls:'th-crypt',    filter:t=>t.cat==='dungeon'&&t.type==='room'&&!t.isBossRoom&&!t.isStart&&t.theme==='crypt' },
  { key:'dun-cave',     label:'⚔ DUNGEON — CAVERN ROOMS',        cls:'th-cave',     filter:t=>t.cat==='dungeon'&&t.type==='room'&&!t.isBossRoom&&!t.isStart&&t.theme==='cave' },
  { key:'dun-sewer-r',  label:'⚔ DUNGEON — SEWER ROOMS',         cls:'th-sewer',    filter:t=>t.cat==='dungeon'&&t.type==='room'&&!t.isBossRoom&&!t.isStart&&t.theme==='sewer' },
  { key:'dun-corr',     label:'⚔ DUNGEON — STONE CORRIDORS',     cls:'th-dungeon',  filter:t=>t.cat==='dungeon'&&t.type==='corridor'&&!t.isStart&&(t.theme==='dungeon') },
  { key:'dun-crypt-c',  label:'⚔ DUNGEON — CRYPT CORRIDORS',     cls:'th-crypt',    filter:t=>t.cat==='dungeon'&&t.type==='corridor'&&!t.isStart&&t.theme==='crypt' },
  { key:'dun-cave-c',   label:'⚔ DUNGEON — CAVE CORRIDORS',      cls:'th-cave',     filter:t=>t.cat==='dungeon'&&t.type==='corridor'&&!t.isStart&&t.theme==='cave' },
  { key:'dun-sewer-c',  label:'⚔ DUNGEON — SEWER CORRIDORS',     cls:'th-sewer',    filter:t=>t.cat==='dungeon'&&t.type==='corridor'&&!t.isStart&&t.theme==='sewer' },
  // ── CIVILISED ──
  { key:'civ-start',    label:'🏰 CIVILISED — START TILES',      cls:'th-start',    filter:t=>t.cat==='civilised'&&t.isStart },
  { key:'civ-boss',     label:'🏰 CIVILISED — BOSS ROOMS',        cls:'th-boss',     filter:t=>t.cat==='civilised'&&t.isBossRoom&&!t.altCat },
  { key:'civ-rooms',    label:'🏰 CIVILISED — ROOMS',             cls:'th-civilised',filter:t=>t.cat==='civilised'&&t.type==='room'&&!t.isBossRoom&&!t.isStart },
  { key:'civ-corr',     label:'🏰 CIVILISED — CORRIDORS',         cls:'th-civilised',filter:t=>t.cat==='civilised'&&t.type==='corridor'&&!t.isStart },
  // ── OUTDOOR ──
  { key:'out-start',    label:'🌲 OUTDOOR — START TILES',         cls:'th-start',    filter:t=>t.cat==='outdoor'&&t.isStart },
  { key:'out-boss',     label:'🌲 OUTDOOR — BOSS ROOMS',           cls:'th-boss',     filter:t=>t.cat==='outdoor'&&t.isBossRoom },
  { key:'out-main',     label:'🌲 OUTDOOR — LARGE AREAS',          cls:'th-outdoor',  filter:t=>t.cat==='outdoor'&&t.type==='room'&&!t.isBossRoom&&!t.isStart&&t.isMain },
  { key:'out-rooms',    label:'🌲 OUTDOOR — ROOMS',                cls:'th-outdoor',  filter:t=>t.cat==='outdoor'&&t.type==='room'&&!t.isBossRoom&&!t.isStart&&!t.isMain&&t.theme==='outdoor' },
  { key:'out-forest-r', label:'🌲 OUTDOOR — FOREST ROOMS',         cls:'th-forest',   filter:t=>t.cat==='outdoor'&&t.type==='room'&&!t.isBossRoom&&!t.isStart&&!t.isMain&&t.theme==='forest' },
  { key:'out-corr',     label:'🌲 OUTDOOR — PATHS & CORRIDORS',    cls:'th-outdoor',  filter:t=>t.cat==='outdoor'&&t.type==='corridor'&&!t.isStart&&t.theme!=='forest' },
  { key:'out-forest-c', label:'🌲 OUTDOOR — FOREST PATHS',         cls:'th-forest',   filter:t=>t.cat==='outdoor'&&t.type==='corridor'&&!t.isStart&&t.theme==='forest' },
];

function makeBadges(t){
  const typeClass=t.isBossRoom?'badge-boss':t.isStart?'badge-start':t.type==='room'?'badge-room':'badge-corridor';
  const typeLabel=t.isBossRoom?'BOSS':t.isStart?'START':t.type.toUpperCase();
  let h=`<span class="badge ${typeClass}">${typeLabel}</span>`;
  h+=`<span class="badge badge-theme">${t.theme.toUpperCase()}</span>`;
  h+=`<span class="badge badge-sz">${t.sz[0]}×${t.sz[1]}</span>`;
  if(t.isMain)      h+=`<span class="badge badge-large">LARGE</span>`;
  if(t.isDead)      h+=`<span class="badge badge-dead">DEAD END</span>`;
  if(t.isWater)     h+=`<span class="badge badge-water">WATER</span>`;
  if(t.isEnchanted) h+=`<span class="badge badge-enchanted">ENCHANTED</span>`;
  if(t.isBridge)    h+=`<span class="badge badge-bridge">BRIDGE</span>`;
  if(t.isBoat)      h+=`<span class="badge badge-boat">BOAT</span>`;
  return h;
}

function makeCard(tile){
  const imgKey=tileImgKey(tile.id);
  const hasImg=!!(imgKey&&TILE_IMAGES[imgKey]);
  const card=document.createElement('div');
  card.className='tile-card tc-'+(tile.theme||'dungeon')+(hasImg?'':' no-image');
  card.dataset.cat=tile.cat;
  card.dataset.type=tile.isBossRoom?'boss':tile.isStart?'start':tile.type;
  card.dataset.hasimg=hasImg?'1':'0';
  card.dataset.search=(tile.id+' '+tile.name+' '+(tile.special||'')+' '+tile.theme+' '+(tile.furniture||'')).toLowerCase();
  card.dataset.tileid=tile.id;
  const wrap=document.createElement('div');wrap.className='img-wrap';
  const canvas=document.createElement('canvas');
  setupImgWrap(wrap,canvas,tile);
  card.appendChild(wrap);
  const furn=(tile.furniture&&tile.furniture!=='std-room'&&tile.furniture!=='std-corridor')?`<div class="tile-furniture">🪑 ${tile.furniture}</div>`:'';
  const info=document.createElement('div');info.className='tile-info';
  info.innerHTML=`<div class="tile-id">${tile.id.toUpperCase()} · SIDE ${tile.side}</div>`
    +`<div class="tile-name">${tile.name}</div>`
    +`<div class="tile-meta">${makeBadges(tile)}</div>`
    +(tile.special?`<div class="tile-special">★ ${tile.special}</div>`:'')
    +furn
    +`<button class="te-edit-btn">EDIT</button>`;
  card.appendChild(info);

  // Inline edit panel
  const panel=document.createElement('div');
  panel.className='tile-edit-panel';
  panel.innerHTML=
    `<div class="te-row">`
    +`<div style="flex:1;min-width:120px"><span class="te-label">NAME</span><input class="te-input" data-tfield="name" value="${(tile.name||'').replace(/"/g,'&quot;')}"></div>`
    +`<div style="width:90px"><span class="te-label">THEME</span><select class="te-select" data-tfield="theme">`
    +['dungeon','crypt','cave','sewer','civilised','outdoor','forest'].map(th=>`<option value="${th}"${tile.theme===th?' selected':''}>${th}</option>`).join('')
    +`</select></div>`
    +`<div style="width:90px"><span class="te-label">SETTING</span><select class="te-select" data-tfield="cat">`
    +['dungeon','civilised','outdoor'].map(c=>`<option value="${c}"${tile.cat===c?' selected':''}>${c}</option>`).join('')
    +`</select></div>`
    +`</div>`
    +`<div><span class="te-label">SPECIAL TEXT</span><textarea class="te-textarea" data-tfield="special">${tile.special||''}</textarea></div>`
    +`<div><span class="te-label">FURNITURE</span><input class="te-input" data-tfield="furniture" value="${(tile.furniture||'').replace(/"/g,'&quot;')}"></div>`
    +`<div class="te-check-row">`
    +`<label><input type="checkbox" data-tfield="isBossRoom"${tile.isBossRoom?' checked':''}> Boss Room</label>`
    +`<label><input type="checkbox" data-tfield="isStart"${tile.isStart?' checked':''}> Start</label>`
    +`<label><input type="checkbox" data-tfield="isDead"${tile.isDead?' checked':''}> Dead End</label>`
    +`<label><input type="checkbox" data-tfield="isMain"${tile.isMain?' checked':''}> Main/Large</label>`
    +`<label><input type="checkbox" data-tfield="isEnchanted"${tile.isEnchanted?' checked':''}> Enchanted</label>`
    +`</div>`
    +`<div style="margin-top:6px;display:flex;gap:6px;align-items:center;">`
    +`<button class="te-img-upload-btn${imgKey&&TILE_IMAGES[imgKey]?' has-img':''}" data-tileid="${tile.id}">📷 ${imgKey&&TILE_IMAGES[imgKey]?'REPLACE IMAGE':'LINK IMAGE'}</button>`
    +`<input type="file" accept="image/*" style="display:none" class="te-img-file-input" data-tileid="${tile.id}">`
    +`<button class="te-delete-btn" data-tileid="${tile.id}">✕ DELETE</button>`
    +`</div>`;
  card.appendChild(panel);

  // Wire edit button
  info.querySelector('.te-edit-btn').addEventListener('click', function(){
    panel.classList.toggle('open');
    card.classList.toggle('editing');
  });

  // Wire image upload
  var imgUploadBtn = panel.querySelector('.te-img-upload-btn');
  var imgFileInput = panel.querySelector('.te-img-file-input');
  if(imgUploadBtn && imgFileInput){
    imgUploadBtn.addEventListener('click', function(){ imgFileInput.click(); });
    imgFileInput.addEventListener('change', function(){
      var file = this.files[0];
      if(!file) return;
      var tid = this.dataset.tileid;
      var reader = new FileReader();
      reader.onload = function(e){
        var b64 = e.target.result;
        // Derive image key from tile id
        var imgK = tileImgKey(tid) || (tid + '_custom');
        TILE_IMAGES[imgK] = b64;
        // Cache it
        var img = new Image();
        img.src = b64;
        tileImgCache[imgK] = img;
        // Re-render the canvas
        var cvs = card.querySelector('canvas');
        var t = TILE_DB.find(function(t){return t.id===tid;});
        if(cvs && t){
          img.onload = function(){
            setupImgWrap(card.querySelector('.img-wrap'), cvs, t);
          };
        }
        imgUploadBtn.textContent = '📷 REPLACE IMAGE';
        imgUploadBtn.classList.add('has-img');
      };
      reader.readAsDataURL(file);
    });
  }

  // Wire delete button
  var delBtn = panel.querySelector('.te-delete-btn');
  if(delBtn){
    delBtn.addEventListener('click', function(){
      var tid = this.dataset.tileid;
      if(!confirm('Delete tile "'+tid+'"? This cannot be undone.')) return;
      var idx = TILE_DB.findIndex(function(t){return t.id===tid;});
      if(idx >= 0){ TILE_DB.splice(idx,1); updateSummary(); applyFilters(); }
    });
  }

  return card;
}

function buildSections(tiles){
  const container=document.getElementById('tile-sections');container.innerHTML='';
  let shown=0;
  THEME_GROUPS.forEach(grp=>{
    const gt=tiles.filter(grp.filter);
    if(!gt.length)return;
    shown+=gt.length;
    const block=document.createElement('div');block.className='theme-group';
    const hdr=document.createElement('div');
    hdr.className='theme-header '+grp.cls;
    hdr.innerHTML=`${grp.label} <span class="th-count">${gt.length} tile${gt.length!==1?'s':''}</span>`;
    block.appendChild(hdr);
    const grid=document.createElement('div');grid.className='tile-grid';
    gt.forEach(t=>grid.appendChild(makeCard(t)));
    block.appendChild(grid);
    container.appendChild(block);
  });
  document.getElementById('count').textContent=`${shown} tile${shown!==1?'s':''} shown`;

  // Inject Add Section button+form at bottom of tile-sections
  if(!document.getElementById('form-add-section')){
    var addBtn = document.createElement('button');
    addBtn.id = 'btn-add-section';
    addBtn.className = 'add-toggle-btn';
    addBtn.style.cssText = 'margin:20px 0 8px;';
    addBtn.textContent = '+ ADD NEW SECTION';
    container.appendChild(addBtn);

    var formDiv = document.createElement('div');
    formDiv.id = 'form-add-section';
    formDiv.className = 'add-form-wrap';
    formDiv.innerHTML = '<h3>+ ADD NEW SECTION / TILE</h3>'
      +'<div class="add-form-grid">'
      +'<div class="afield"><label>ID</label><input type="text" id="as-id" placeholder="e.g. 99ac"></div>'
      +'<div class="afield wide"><label>NAME</label><input type="text" id="as-name" placeholder="e.g. Dungeon Room 99A" style="width:100%;"></div>'
      +'<div class="afield"><label>SIDE</label><select id="as-side"><option value="A">A</option><option value="B">B</option></select></div>'
      +'<div class="afield"><label>W</label><input type="number" id="as-w" value="6" min="1" max="20"></div>'
      +'<div class="afield"><label>H</label><input type="number" id="as-h" value="6" min="1" max="20"></div>'
      +'<div class="afield"><label>TYPE</label><select id="as-type"><option value="room">Room</option><option value="corridor">Corridor</option></select></div>'
      +'<div class="afield"><label>SETTING</label><select id="as-cat"><option value="dungeon">Dungeon</option><option value="civilised">Civilised</option><option value="outdoor">Outdoor</option></select></div>'
      +'<div class="afield"><label>THEME</label><select id="as-theme"><option value="dungeon">Dungeon</option><option value="crypt">Crypt</option><option value="cave">Cave</option><option value="sewer">Sewer</option><option value="civilised">Civilised</option><option value="outdoor">Outdoor</option><option value="forest">Forest</option></select></div>'
      +'</div>'
      +'<div class="add-form-grid">'
      +'<div class="afield wide"><label>SPECIAL TEXT</label><textarea id="as-special" placeholder="Special rules, terrain effects..."></textarea></div>'
      +'<div class="afield wide"><label>FURNITURE</label><input type="text" id="as-furniture" placeholder="e.g. Throne, Bookcase" style="width:100%;"></div>'
      +'</div>'
      +'<div class="add-check-row">'
      +'<label><input type="checkbox" id="as-boss"> Boss Room</label>'
      +'<label><input type="checkbox" id="as-start"> Start Tile</label>'
      +'<label><input type="checkbox" id="as-dead"> Dead End</label>'
      +'<label><input type="checkbox" id="as-main"> Main/Large</label>'
      +'<label><input type="checkbox" id="as-enchanted"> Enchanted</label>'
      +'<label><input type="checkbox" id="as-water"> Water</label>'
      +'</div>'
      +'<div class="add-form-btns">'
      +'<button class="add-submit-btn" id="btn-submit-section">ADD SECTION</button>'
      +'<button class="add-cancel-btn" id="btn-cancel-section">CANCEL</button>'
      +'<label class="te-img-upload-btn" style="cursor:pointer;margin-left:4px;" id="lbl-as-img">📷 LINK IMAGE<input type="file" accept="image/*" id="as-img-file" style="display:none"></label>'
      +'</div>';
    container.appendChild(formDiv);

    addBtn.addEventListener('click', function(){
      formDiv.classList.toggle('open');
    });
    document.getElementById('btn-cancel-section').addEventListener('click', function(){
      formDiv.classList.remove('open');
    });
    wireSectionSubmit();
    // Wire image file input for new section
    var asImgFile = document.getElementById('as-img-file');
    var asImgLbl  = document.getElementById('lbl-as-img');
    if(asImgFile && asImgLbl){
      asImgFile.addEventListener('change', function(){
        var file = this.files[0];
        if(!file) return;
        var reader = new FileReader();
        reader.onload = function(ev){
          // Store pending image — applied when ADD SECTION is submitted
          asImgFile._pendingB64 = ev.target.result;
          asImgFile._pendingName = file.name;
          asImgLbl.textContent = '📷 ' + file.name.substring(0,18);
          asImgLbl.classList.add('has-img');
        };
        reader.readAsDataURL(file);
      });
    }
  }
}

function updateSummary(){
  document.getElementById('total-count').textContent=TILE_DB.length;
  document.getElementById('s-dungeon').textContent=TILE_DB.filter(t=>t.cat==='dungeon').length;
  document.getElementById('s-civilised').textContent=TILE_DB.filter(t=>t.cat==='civilised').length;
  document.getElementById('s-outdoor').textContent=TILE_DB.filter(t=>t.cat==='outdoor').length;
  document.getElementById('s-rooms').textContent=TILE_DB.filter(t=>t.type==='room'&&!t.isBossRoom&&!t.isStart).length;
  document.getElementById('s-corridors').textContent=TILE_DB.filter(t=>t.type==='corridor'&&!t.isStart).length;
  document.getElementById('s-boss').textContent=TILE_DB.filter(t=>t.isBossRoom).length;
  document.getElementById('s-hasimg').textContent=TILE_DB.filter(t=>{const k=tileImgKey(t.id);return!!(k&&TILE_IMAGES[k]);}).length;
}

let activeFilter='all',searchQuery='';
function applyFilters(){
  let tiles=TILE_DB;
  if(activeFilter==='dungeon')   tiles=tiles.filter(t=>t.cat==='dungeon');
  if(activeFilter==='civilised') tiles=tiles.filter(t=>t.cat==='civilised');
  if(activeFilter==='outdoor')   tiles=tiles.filter(t=>t.cat==='outdoor');
  if(activeFilter==='room')      tiles=tiles.filter(t=>t.type==='room'&&!t.isBossRoom&&!t.isStart);
  if(activeFilter==='corridor')  tiles=tiles.filter(t=>t.type==='corridor'&&!t.isStart);
  if(activeFilter==='boss')      tiles=tiles.filter(t=>t.isBossRoom);
  if(activeFilter==='start')     tiles=tiles.filter(t=>t.isStart);
  if(activeFilter==='hasimg')    tiles=tiles.filter(t=>{const k=tileImgKey(t.id);return!!(k&&TILE_IMAGES[k]);});
  if(searchQuery){const q=searchQuery.toLowerCase();tiles=tiles.filter(t=>t.dataset&&t.dataset.search?t.dataset.search.includes(q):(t.id+' '+t.name+' '+(t.special||'')+' '+t.theme).toLowerCase().includes(q));}
  buildSections(tiles);
}

document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');activeFilter=btn.dataset.filter;
    if(activeFilter==='elements'){
      document.getElementById('tile-sections').style.display='none';
      document.getElementById('elements-section').classList.add('visible');
      buildElementsTable();
    } else {
      document.getElementById('tile-sections').style.display='';
      document.getElementById('elements-section').classList.remove('visible');
      applyFilters();
    }
  });
});
document.getElementById('search').addEventListener('input',e=>{searchQuery=e.target.value.trim();applyFilters();});
updateSummary();
applyFilters();
// Wire save button — must use addEventListener so it works inside deferred script scope
var _saveBtn = document.getElementById('el-save-all-btn');
if(_saveBtn) _saveBtn.addEventListener('click', function(){ saveAllElements(); });

// ── Add Section / Element toggle buttons ──
// ── Submit: Add Section ──
function wireSectionSubmit(){
  var _btnSS = document.getElementById('btn-submit-section');
  if(!_btnSS) return;
  _btnSS.addEventListener('click', function(){
  var id      = document.getElementById('as-id').value.trim();
  var name    = document.getElementById('as-name').value.trim();
  var side    = document.getElementById('as-side').value;
  var w       = parseInt(document.getElementById('as-w').value)||6;
  var h       = parseInt(document.getElementById('as-h').value)||6;
  var type    = document.getElementById('as-type').value;
  var cat     = document.getElementById('as-cat').value;
  var theme   = document.getElementById('as-theme').value;
  var special = document.getElementById('as-special').value.trim()||null;
  var furn    = document.getElementById('as-furniture').value.trim()||null;

  if(!id || !name){ alert('ID and Name are required.'); return; }
  if(TILE_DB.find(function(t){return t.id===id;})){
    alert('ID "'+id+'" already exists.'); return;
  }

  var tile = {
    id:id, name:name, side:side, sz:[w,h], cat:cat, theme:theme, type:type,
    exits: type==='corridor'?'std-corridor':'std-room',
    isBossRoom: document.getElementById('as-boss').checked||undefined,
    isStart:    document.getElementById('as-start').checked||undefined,
    isDead:     document.getElementById('as-dead').checked||undefined,
    isMain:     document.getElementById('as-main').checked||undefined,
    isEnchanted:document.getElementById('as-enchanted').checked||undefined,
    isWater:    document.getElementById('as-water').checked||undefined,
  };
  if(special) tile.special = special;
  if(furn)    tile.furniture = furn;
  // Clean undefined flags
  Object.keys(tile).forEach(function(k){ if(tile[k]===undefined||tile[k]===false) delete tile[k]; });

  // Store uploaded image if any
  var asImgF = document.getElementById('as-img-file');
  if(asImgF && asImgF._pendingB64){
    var imgK = id; // use tile id as key
    TILE_IMAGES[imgK] = asImgF._pendingB64;
    var imgObj = new Image(); imgObj.src = asImgF._pendingB64;
    tileImgCache[imgK] = imgObj;
    asImgF._pendingB64 = null;
    var lbl = document.getElementById('lbl-as-img');
    if(lbl){ lbl.textContent='📷 LINK IMAGE'; lbl.classList.remove('has-img'); }
  }

  TILE_DB.push(tile);
  updateSummary();
  applyFilters();

  // Reset form
  ['as-id','as-name','as-special','as-furniture'].forEach(function(id){ document.getElementById(id).value=''; });
  ['as-boss','as-start','as-dead','as-main','as-enchanted','as-water'].forEach(function(id){ document.getElementById(id).checked=false; });
  document.getElementById('form-add-section').classList.remove('open');

  var btn=document.getElementById('el-save-all-btn');
  if(btn){ btn.textContent='SECTION ADDED'; btn.style.borderColor='#60a860'; btn.style.color='#60a860';
    setTimeout(function(){ btn.textContent='SAVE ALL'; btn.style.borderColor=''; btn.style.color=''; },2000); }
  });
}

// ── Submit: Add Element ──
function wireElementSubmit(){
  var _btnSE = document.getElementById('btn-submit-element');
  if(!_btnSE) return;
  _btnSE.addEventListener('click', function(){
  var id      = document.getElementById('ae-id').value.trim();
  var name    = document.getElementById('ae-name').value.trim();
  var type    = document.getElementById('ae-type').value;
  var w       = parseInt(document.getElementById('ae-w').value)||1;
  var l       = parseInt(document.getElementById('ae-l').value)||1;
  var cover   = document.getElementById('ae-cover').value||null;
  var special = document.getElementById('ae-special').value.trim();

  if(!id || !name){ alert('ID and Name are required.'); return; }
  if(ELEMENT_DB.find(function(e){return e.id===id;})){
    alert('ID "'+id+'" already exists.'); return;
  }

  var cats = [];
  if(document.getElementById('ae-dungeon').checked)   cats.push('dungeon');
  if(document.getElementById('ae-civilised').checked) cats.push('civilised');
  if(document.getElementById('ae-outdoor').checked)   cats.push('outdoor');

  var el = {
    id:id, name:name, type:type,
    sz: w===l ? w : [w,l],
    impassable: document.getElementById('ae-impassable').checked,
    cover: cover,
    auto: document.getElementById('ae-auto').checked,
    searchable: document.getElementById('ae-searchable').checked,
    cat: cats,
    special: special,
  };

  ELEMENT_DB.push(el);

  // Reset form
  ['ae-id','ae-name','ae-special'].forEach(function(id){ document.getElementById(id).value=''; });
  document.getElementById('ae-w').value='1';
  document.getElementById('ae-l').value='1';
  document.getElementById('ae-cover').value='';
  ['ae-auto','ae-impassable','ae-civilised','ae-outdoor'].forEach(function(id){ document.getElementById(id).checked=false; });
  document.getElementById('ae-searchable').checked=true;
  document.getElementById('ae-dungeon').checked=true;
  document.getElementById('form-add-element').classList.remove('open');

  // If elements tab is active, rebuild
  if(document.getElementById('elements-section').classList.contains('visible')){
    buildElementsTable();
  }

  var btn=document.getElementById('el-save-all-btn');
  if(btn){ btn.textContent='ELEMENT ADDED'; btn.style.borderColor='#60a860'; btn.style.color='#60a860';
    setTimeout(function(){ btn.textContent='SAVE ALL'; btn.style.borderColor=''; btn.style.color=''; },2000); }
  });
}

/* ── Elements Table ── */
var _elEdits = {}; // local overrides keyed by el.id

function buildElementsTable(){
  var specials  = ELEMENT_DB.filter(function(e){return e.type==='special';});
  var furniture = ELEMENT_DB.filter(function(e){return e.type==='furniture';});
  document.getElementById('el-special-count').textContent = specials.length+' elements';
  document.getElementById('el-furniture-count').textContent = furniture.length+' items';
  buildElRows('el-tbody-special',  specials);
  buildElRows('el-tbody-furniture', furniture);

  // Inject Add Element button+form at bottom of elements-section (once)
  var esec = document.getElementById('elements-section');
  if(esec && !document.getElementById('form-add-element')){
    var addElBtn = document.createElement('button');
    addElBtn.id = 'btn-add-element';
    addElBtn.className = 'add-toggle-btn';
    addElBtn.style.cssText = 'margin:20px 0 8px;';
    addElBtn.textContent = '+ ADD NEW ELEMENT';
    esec.appendChild(addElBtn);

    var elFormDiv = document.createElement('div');
    elFormDiv.id = 'form-add-element';
    elFormDiv.className = 'add-form-wrap';
    elFormDiv.innerHTML = '<h3>+ ADD NEW ELEMENT</h3>'
      +'<div class="add-form-grid">'
      +'<div class="afield"><label>ID</label><input type="text" id="ae-id" placeholder="e.g. el_newitem"></div>'
      +'<div class="afield wide"><label>NAME</label><input type="text" id="ae-name" placeholder="e.g. Sarcophagus" style="width:100%;"></div>'
      +'<div class="afield"><label>TYPE</label><select id="ae-type"><option value="special">Special Element</option><option value="furniture">Furniture</option></select></div>'
      +'<div class="afield"><label>W</label><input type="number" id="ae-w" value="1" min="1" max="10"></div>'
      +'<div class="afield"><label>L</label><input type="number" id="ae-l" value="1" min="1" max="10"></div>'
      +'<div class="afield"><label>COVER</label><select id="ae-cover"><option value="">None</option><option value="light">Light</option><option value="heavy">Heavy</option></select></div>'
      +'</div>'
      +'<div class="add-form-grid">'
      +'<div class="afield wide"><label>RULES TEXT</label><textarea id="ae-special" placeholder="Description and rules..."></textarea></div>'
      +'</div>'
      +'<div class="add-check-row">'
      +'<label><input type="checkbox" id="ae-auto"> Auto-trigger</label>'
      +'<label><input type="checkbox" id="ae-searchable" checked> Searchable</label>'
      +'<label><input type="checkbox" id="ae-impassable"> Impassable</label>'
      +'<label><input type="checkbox" id="ae-dungeon" checked> Dungeon</label>'
      +'<label><input type="checkbox" id="ae-civilised"> Civilised</label>'
      +'<label><input type="checkbox" id="ae-outdoor"> Outdoor</label>'
      +'</div>'
      +'<div class="add-form-btns">'
      +'<button class="add-submit-btn" id="btn-submit-element">ADD ELEMENT</button>'
      +'<button class="add-cancel-btn" id="btn-cancel-element">CANCEL</button>'
      +'</div>';
    esec.appendChild(elFormDiv);

    addElBtn.addEventListener('click', function(){
      elFormDiv.classList.toggle('open');
    });
    document.getElementById('btn-cancel-element').addEventListener('click', function(){
      elFormDiv.classList.remove('open');
    });
    wireElementSubmit();
  }
}

function inp(id, val, w) {
  return '<input type="text" data-field="'+id+'" value="'+val.toString().replace(/"/g,'&quot;')+'" style="width:'+w+'px;background:#0c0a06;border:1px solid #2a1808;color:#d4b896;font-family:Cinzel,serif;font-size:13px;padding:4px 6px;">';
}
function numInp(id, val, w) {
  return '<input type="number" data-field="'+id+'" value="'+val+'" min="1" max="20" style="width:'+w+'px;background:#0c0a06;border:1px solid #2a1808;color:#d4b896;font-family:Cinzel,serif;font-size:13px;padding:4px 6px;text-align:center;">';
}
function chk(id, checked, label) {
  return '<label style="display:block;font-family:Cinzel,serif;font-size:12px;color:#9a7850;margin-bottom:3px;cursor:pointer;">'
    +'<input type="checkbox" data-field="'+id+'"'+(checked?' checked':'')
    +' style="margin-right:5px;accent-color:#c8a060;width:13px;height:13px;cursor:pointer;"> '+label+'</label>';
}
function sel(id, val) {
  return '<select data-field="'+id+'" style="background:#0c0a06;border:1px solid #2a1808;color:#d4b896;font-family:Cinzel,serif;font-size:12px;padding:4px 6px;">'
    +'<option value=""'+(val==null||val===''?' selected':'')+'>None</option>'
    +'<option value="light"'+(val==='light'?' selected':'')+'>Light</option>'
    +'<option value="heavy"'+(val==='heavy'?' selected':'')+'>Heavy</option>'
    +'</select>';
}

function buildElRows(tbodyId, elements){
  var tbody = document.getElementById(tbodyId);
  tbody.innerHTML='';
  elements.forEach(function(el){
    var e = Object.assign({}, el, _elEdits[el.id]||{});
    var cats = e.cat||[];
    var tr = document.createElement('tr');
    tr.dataset.elid = e.id;
    // Size: store W and H separately, defaulting H=W if not set
    var szW = Array.isArray(e.sz) ? e.sz[0] : e.sz;
    var szL = Array.isArray(e.sz) ? e.sz[1] : e.sz;

    tr.innerHTML =
      // Name col
      '<td><div class="el-id">'+e.id+'</div>'+inp('name', e.name, 140)+'</td>'
      // W col
      +'<td>'+numInp('szW', szW, 48)+'</td>'
      // H col
      +'<td>'+numInp('szL', szL, 48)+'</td>'
      // Flags col
      +'<td style="white-space:nowrap">'
        +chk('auto', e.auto, 'Auto')
        +chk('searchable', e.searchable, 'Search')
        +chk('impassable', e.impassable, 'Impass')
        +'<div style="margin-top:4px">'+sel('cover', e.cover)+'</div>'
      +'</td>'
      // Settings col
      +'<td style="white-space:nowrap">'
        +'<label style="display:block;font-family:Cinzel,serif;font-size:12px;color:#9a7850;margin-bottom:3px;cursor:pointer;">'
          +'<input type="checkbox" data-field="cat-dungeon"'+(cats.includes('dungeon')?' checked':'')+' style="margin-right:5px;accent-color:#c8a060;width:13px;height:13px;cursor:pointer;"> Dungeon</label>'
        +'<label style="display:block;font-family:Cinzel,serif;font-size:12px;color:#9a7850;margin-bottom:3px;cursor:pointer;">'
          +'<input type="checkbox" data-field="cat-civilised"'+(cats.includes('civilised')?' checked':'')+' style="margin-right:5px;accent-color:#c8a060;width:13px;height:13px;cursor:pointer;"> Civilised</label>'
        +'<label style="display:block;font-family:Cinzel,serif;font-size:12px;color:#9a7850;margin-bottom:3px;cursor:pointer;">'
          +'<input type="checkbox" data-field="cat-outdoor"'+(cats.includes('outdoor')?' checked':'')+' style="margin-right:5px;accent-color:#c8a060;width:13px;height:13px;cursor:pointer;"> Outdoor</label>'
      +'</td>'
      // Rules col - textarea
      +'<td><textarea data-field="special" style="width:100%;min-width:220px;background:#0c0a06;border:1px solid #2a1808;color:#d4b896;font-family:Crimson Text,serif;font-size:14px;padding:6px 8px;resize:vertical;min-height:54px;line-height:1.5;">'+e.special+'</textarea></td>'
      +'<td><button class="el-delete-btn" data-elid="'+e.id+'">✕</button></td>';
    tbody.appendChild(tr);
    // Wire delete
    var delBtn = tr.querySelector('.el-delete-btn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var eid = this.dataset.elid;
        if(!confirm('Delete element "'+eid+'"?')) return;
        var idx = ELEMENT_DB.findIndex(function(e){return e.id===eid;});
        if(idx >= 0){ ELEMENT_DB.splice(idx,1); buildElementsTable(); }
      });
    }
  });
}

function saveTileEdits(){
  var saved=0;
  document.querySelectorAll('.tile-card[data-tileid]').forEach(function(card){
    var id=card.dataset.tileid;
    var tile=TILE_DB.find(function(t){return t.id===id;});
    if(!tile) return;
    var g=function(f){ return card.querySelector('[data-tfield="'+f+'"]'); };
    var nameEl=g('name'), themeEl=g('theme'), catEl=g('cat'),
        specEl=g('special'), furnEl=g('furniture');
    if(!nameEl) return; // panel not rendered
    tile.name       = nameEl.value;
    tile.theme      = themeEl ? themeEl.value : tile.theme;
    tile.cat        = catEl   ? catEl.value   : tile.cat;
    tile.special    = specEl  ? specEl.value||null : tile.special;
    tile.furniture  = furnEl  ? furnEl.value||null : tile.furniture;
    tile.isBossRoom = !!(g('isBossRoom')||{}).checked;
    tile.isStart    = !!(g('isStart')||{}).checked;
    tile.isDead     = !!(g('isDead')||{}).checked;
    tile.isMain     = !!(g('isMain')||{}).checked;
    tile.isEnchanted= !!(g('isEnchanted')||{}).checked;
    saved++;
  });
  return saved;
}

function saveAllElements(){
  var saved=0;
  ELEMENT_DB.forEach(function(el){
    var tr=document.querySelector('tr[data-elid="'+el.id+'"]');
    if(!tr) return;
    var g=function(f){ var n=tr.querySelector('[data-field="'+f+'"]'); return n||null; };
    var szW=parseInt((g('szW')||{}).value)||el.sz;
    var szL=parseInt((g('szL')||{}).value)||szW;
    var cats=[];
    if(g('cat-dungeon')   && g('cat-dungeon').checked)   cats.push('dungeon');
    if(g('cat-civilised') && g('cat-civilised').checked) cats.push('civilised');
    if(g('cat-outdoor')   && g('cat-outdoor').checked)   cats.push('outdoor');
    var update={
      name:       (g('name')||{value:el.name}).value,
      sz:         szW===szL ? szW : [szW,szL],
      auto:       !!(g('auto')||{}).checked,
      searchable: !!(g('searchable')||{}).checked,
      impassable: !!(g('impassable')||{}).checked,
      cover:      (g('cover')||{value:''}).value||null,
      cat:        cats,
      special:    (g('special')||{value:el.special}).value,
    };
    Object.assign(el, update);
    _elEdits[el.id]=update;
    saved++;
  });
  // Flash feedback
  var tSaved=saveTileEdits();
  var btn=document.getElementById('el-save-all-btn');
  if(btn){ var msg='SAVED '+(saved+tSaved)+' ENTRIES'; btn.textContent=msg; btn.style.borderColor='#60a860'; btn.style.color='#60a860';
    setTimeout(function(){ btn.textContent='SAVE ALL CHANGES'; btn.style.borderColor=''; btn.style.color=''; },2000); }
}

function saveElEdit(id){
  // kept for compatibility — just save all
  saveAllElements();
  // Close edit row
  var row = document.getElementById('el-edit-'+id);
  if(row) row.classList.remove('open');
  console.log('Updated element:', id, update);
}
