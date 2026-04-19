#!/usr/bin/env python3
"""
build.py — assembles all source files into a single offline HTML.
Usage: python3 build.py
Output: build/dun_universalis.html
"""
import re, os

BASE = os.path.dirname(os.path.abspath(__file__))

def read(path): 
    with open(os.path.join(BASE, path)) as f: return f.read()

def strip_block(code, start, end_marker):
    idx=code.find(start)
    if idx<0: return code
    ei=code.find(end_marker,idx)
    if ei<0: return code
    return code[:idx]+code[ei+len(end_marker):]

def strip_func(code, fname):
    idx=code.find(fname)
    if idx<0: return code
    end=code.find('\n}\n',idx)+3
    return code[:idx]+code[end:]

print("Reading source files...")

imgs_js     = read('src/data/images.js')
crops_js    = read('src/data/crops.js')
tiles_js    = read('src/data/tiles.js')
elements_js = read('src/data/elements.js')
shared_js   = read('src/scripts/shared.js')
gen_js      = read('src/scripts/generator.js')
inv_js      = read('src/scripts/inventory.js')
bld_js      = read('src/scripts/builder.js')
gen_css     = read('src/styles/generator.css')
inv_css     = read('src/styles/inventory.css')
bld_css     = read('src/styles/builder.css')
gen_body    = read('src/fragments/generator_body.html')
inv_body    = read('src/fragments/inventory_body.html')

# Builder: replace setTimeout(init) with window._builderInit for deferred execution
bld_js_deferred = bld_js.replace(
    '// Run init after a tick to ensure the DOM is painted\nsetTimeout(init, 100);',
    'if(typeof window!=="undefined") window._builderInit=init;'
)

shared_block = imgs_js + '\n' + crops_js + '\n' + shared_js + '\n' + tiles_js + '\n' + elements_js

builder_html = """<div id="app-builder">
  <div id="bld-header">
    <h1>&#9876; DUNGEON BUILDER</h1>
    <input type="text" id="bld-dungeon-name" placeholder="Dungeon name..." spellcheck="false">
    <span id="bld-tile-count"></span>
    <button class="bld-btn" id="bld-btn-new">+ NEW</button>
    <button class="bld-btn" id="bld-btn-save">&#128190; SAVE</button>
    <button class="bld-btn play" id="bld-btn-play">&#9654; PLAY</button>
    <button class="bld-btn" id="bld-btn-export">EXPORT PNG</button>
    <button class="bld-btn home" onclick="goHome()">&#8962; HOME</button>
  </div>
  <div id="bld-body">
    <div id="bld-sidebar">
      <div id="bld-sidebar-tabs">
        <button class="bld-tab active" data-tab="tiles">TILES</button>
        <button class="bld-tab" data-tab="elements">ELEMENTS</button>
        <button class="bld-tab" data-tab="saved">SAVED</button>
      </div>
      <div class="bld-tab-panel active" id="bld-panel-tiles"><div id="bld-picker-tiles"></div></div>
      <div class="bld-tab-panel" id="bld-panel-elements"><div id="bld-picker-elements"></div></div>
      <div class="bld-tab-panel" id="bld-panel-saved"><div id="bld-saved-list"></div></div>
      <div id="bld-info-panel"><div class="bld-info-empty">Select a tile to place</div></div>
    </div>
    <div id="bld-map-wrap"><canvas id="builder-canvas"></canvas></div>
  </div>
  <div id="bld-log"></div>
</div>"""

launcher_js = """var _launched={};
function launchApp(which){
  var home=document.getElementById('home-screen');
  home.classList.add('hidden');
  setTimeout(function(){home.style.display='none';},400);
  ['app-generator','app-inventory','app-builder'].forEach(function(id){
    document.getElementById(id).classList.remove('active');
  });
  document.getElementById('app-'+which).classList.add('active');
  if(!_launched[which]){
    _launched[which]=true;
    var scriptId=which==='generator'?'gen-script':which==='builder'?'bld-script':'inv-script';
    var code=document.getElementById(scriptId).textContent;
    if(which==='generator'){
      var ctrl=document.querySelector('#controls');
      if(ctrl){var bh=document.createElement('button');bh.className='back-home-btn btn';bh.textContent='HOME';bh.onclick=goHome;ctrl.appendChild(bh);}
    } else if(which!=='builder'){
      var bh2=document.createElement('button');bh2.className='back-home-btn';
      bh2.style.cssText='position:fixed;top:14px;right:20px;z-index:1000;';
      bh2.textContent='HOME';bh2.onclick=goHome;document.body.appendChild(bh2);
    }
    var s=document.createElement('script');s.textContent=code;document.body.appendChild(s);
    if(which==='builder'){
      setTimeout(function(){if(window._builderInit)window._builderInit();},100);
    }
  }
}
function goHome(){
  ['app-generator','app-inventory','app-builder'].forEach(function(id){
    document.getElementById(id).classList.remove('active');
  });
  var h=document.getElementById('home-screen');h.style.display='flex';
  setTimeout(function(){h.classList.remove('hidden');},10);
}
document.querySelectorAll('.bld-tab').forEach(function(tab){
  tab.addEventListener('click',function(){
    document.querySelectorAll('.bld-tab').forEach(function(t){t.classList.remove('active');});
    document.querySelectorAll('.bld-tab-panel').forEach(function(p){p.classList.remove('active');});
    tab.classList.add('active');
    var panel=document.getElementById('bld-panel-'+tab.dataset.tab);
    if(panel) panel.classList.add('active');
  });
});"""

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Dungeon Universalis</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box;margin:0;padding:0;}}
#home-screen{{position:fixed;inset:0;background:#0a0806;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:8000;transition:opacity .4s;}}
#home-screen.hidden{{opacity:0;pointer-events:none;}}
.home-title{{font-family:'Cinzel',serif;font-size:32px;color:#c8a060;letter-spacing:5px;margin-bottom:10px;text-align:center;}}
.home-sub{{font-family:'Cinzel',serif;font-size:12px;color:#4a3418;letter-spacing:3px;margin-bottom:64px;text-align:center;}}
.home-options{{display:flex;border:1px solid #3a2818;}}
.home-btn{{font-family:'Cinzel',serif;padding:40px 52px;background:#0e0b07;color:#c8a060;cursor:pointer;transition:all .2s;border:none;display:flex;flex-direction:column;align-items:center;gap:16px;min-width:270px;border-right:1px solid #3a2818;}}
.home-btn:last-child{{border-right:none;}}
.home-btn:hover{{background:#1a1410;}}
.btn-icon{{font-size:48px;transition:transform .2s;}}
.home-btn:hover .btn-icon{{transform:scale(1.08);}}
.btn-label{{font-size:14px;letter-spacing:3px;}}
.btn-desc{{font-size:13px;color:#6b4c2a;font-family:'Crimson Text',serif;font-style:italic;max-width:190px;text-align:center;line-height:1.6;}}
.home-ver{{position:absolute;bottom:18px;font-family:'Cinzel',serif;font-size:10px;color:#2a1c0e;letter-spacing:3px;}}
#app-generator,#app-inventory,#app-builder{{display:none;}}
#app-generator.active,#app-inventory.active{{display:block;}}
#app-builder.active{{display:flex;}}
.back-home-btn{{font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px;padding:5px 12px;border:1px solid #4a3420;background:transparent;color:#6b4c2a;cursor:pointer;transition:all .15s;}}
.back-home-btn:hover{{border-color:#c8a060;color:#c8a060;}}
{gen_css}
{inv_css}
{bld_css}
</style>
</head>
<body>
<div id="home-screen">
  <div class="home-title">&#9876; DUNGEON UNIVERSALIS</div>
  <div class="home-sub">QUEST SYSTEM · TILE CATALOGUE · DUNGEON BUILDER</div>
  <div class="home-options">
    <button class="home-btn" onclick="launchApp('generator')">
      <span class="btn-icon">&#9956;</span><span class="btn-label">DUNGEON GENERATOR</span>
      <span class="btn-desc">Randomly generate quest dungeons with fog of war and missions</span>
    </button>
    <button class="home-btn" onclick="launchApp('inventory')">
      <span class="btn-icon">&#128220;</span><span class="btn-label">TILE INVENTORY</span>
      <span class="btn-desc">Browse all tiles grouped by setting and theme with full images</span>
    </button>
    <button class="home-btn" onclick="launchApp('builder')">
      <span class="btn-icon">&#127959;</span><span class="btn-label">DUNGEON BUILDER</span>
      <span class="btn-desc">Place tiles to design your own dungeon, then play with fog of war</span>
    </button>
  </div>
  <div class="home-ver">DUNGEON UNIVERSALIS · squidboy30/DUN-Generator</div>
</div>
<div id="app-generator">{gen_body}</div>
<div id="app-inventory">{inv_body}</div>
{builder_html}
<script>
{shared_block}
</script>
<script>
{launcher_js}
</script>
<script id="gen-script" type="text/x-deferred">
{gen_js}
</script>
<script id="inv-script" type="text/x-deferred">
{inv_js}
</script>
<script id="bld-script" type="text/x-deferred">
{bld_js_deferred}
</script>
</body>
</html>"""

out_path = os.path.join(BASE, 'build', 'dun_universalis.html')
os.makedirs(os.path.join(BASE, 'build'), exist_ok=True)
with open(out_path, 'w') as f:
    f.write(html)

size = os.path.getsize(out_path)
print(f"Built: build/dun_universalis.html ({size//1024}KB)")
print(f"  b64 images: {html.count('data:image/jpeg;base64')}")
