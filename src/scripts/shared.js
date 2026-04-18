/* Shared: tileImgKey, tileImgCache, preload */
function tileImgKey(tileId){
  const overrides = {
    // Standard mismatches
    '2ac':      '02A_a',
    '2bc':      '02B_a',
    '12ae':     '12A_c',
    // Boss rooms — image file mapping
    '01aa':     '01A_a',
    '01ba':     '01B_a',
    '02aa':     '02A_a',
    '02ba':     '02B_a',
    '31aa':     '31A_a',
    '31ba':     '31B_a',
    '32aa':     '32A_a',
    '32ba':     '32B_a',
    '42af':     '42A_f',
    '43ba':     '43B_a',
    '44aa':     '44A_a',
    '44ba':     '44B_a',
    '68aa':     '68A_a',
    '68ba':     '68B_a',
    '69bc':     '69B_a',
    // Start tile variants
    '42as':     '42A_f',
    'civstart': '51B_e',
    '01ba2':    '01B_a',
    // Other
    '06bc':     '06B_c',
    '51bc':     '51B_e',
    '52bc':     '52B_e',
    '69ab':     '69A_a',
  };
  if(overrides[tileId]) return overrides[tileId];
  const m = tileId.match(/^(\d+)([ab])([a-z])/);
  if(!m) return null;
  const num = m[1].padStart(2,'0');
  return num + m[2].toUpperCase() + '_' + m[3];
}

var tileImgCache = {};
function preloadTileImages(){
  Object.keys(TILE_IMAGES).forEach(function(key){
    var img=new Image(); img.src=TILE_IMAGES[key]; tileImgCache[key]=img;
  });
}
