// ════════════════════════════════════════════════════════════════════
// PATCH: Numbered Element Tokens for Dungeon Builder
// Apply these changes to the Dungeon Builder section of your HTML file
// ════════════════════════════════════════════════════════════════════

// ─── 1. ELEMENT DATA MODEL CHANGE ────────────────────────────────────
// In the builder's element placement code, each placed element object
// already has: { id, type, x, y, tileId }
// ADD a `tokenNumber` field when placing an element that is a
// "special element" type (i.e. one that should be numbered).
//
// Define which element types get numbered tokens — add this var:

var NUMBERED_ELEMENT_TYPES = [
  'chest', 'great_treasure', 'magic_portal', 'throne', 'shrine',
  'altar', 'special_statue', 'trapdoor', 'lever', 'grate',
  'tomb', 'bonfire', 'fountain', 'brazier', 'crystal_vein',
  'alembic', 'torture_machine', 'sorcery_table', 'alchemy_table'
  // Add/remove types to match your element catalogue
];

// When an element is placed, assign its token number:
function getNextTokenNumber(elements) {
  var numbered = elements.filter(function(e) {
    return NUMBERED_ELEMENT_TYPES.indexOf(e.type) !== -1 && e.tokenNumber;
  });
  if (!numbered.length) return 1;
  return Math.max.apply(null, numbered.map(function(e){ return e.tokenNumber; })) + 1;
}

// In your placeElement() function, after creating the element object, add:
// if (NUMBERED_ELEMENT_TYPES.indexOf(element.type) !== -1) {
//   element.tokenNumber = getNextTokenNumber(builderState.elements);
// }


// ─── 2. DRAW NUMBERED TOKEN ON CANVAS ────────────────────────────────
// In your drawElements() function (or wherever elements are drawn on
// the canvas), after drawing the element image/shape, add this call:

function drawElementToken(ctx, element, canvasX, canvasY, cellSize) {
  if (!element.tokenNumber) return;

  var radius = Math.max(9, cellSize * 0.18);
  // Position: top-right corner of the element cell
  var cx = canvasX + cellSize - radius - 2;
  var cy = canvasY + radius + 2;

  // White circle background
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#333333';
  ctx.stroke();

  // Black number
  ctx.fillStyle = '#000000';
  ctx.font = 'bold ' + Math.max(10, Math.floor(radius * 1.1)) + 'px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(element.tokenNumber), cx, cy);
  ctx.restore();
}

// Call it in your draw loop after each element is drawn:
// drawElementToken(ctx, element, screenX, screenY, CELL_SIZE);


// ─── 3. ELEMENT LIST PANEL — show token numbers ───────────────────────
// In your element list HTML rendering (sidebar or panel), update the
// entry to show the token badge if present.
// Find where you render each element row and add:

function renderElementListItem(element) {
  var tokenBadge = '';
  if (element.tokenNumber) {
    tokenBadge = '<span style="' +
      'display:inline-flex;align-items:center;justify-content:center;' +
      'width:18px;height:18px;border-radius:50%;' +
      'background:#ffffff;color:#000000;' +
      'font-family:Cinzel,serif;font-size:9px;font-weight:700;' +
      'border:1px solid #888;margin-right:6px;flex-shrink:0;">' +
      element.tokenNumber + '</span>';
  }
  // Return/inject into your existing element row HTML
  return tokenBadge;
}

// ─── 4. EXPORT ELEMENTS DATA ─────────────────────────────────────────
// Your dungeon export (JSON) should already include the elements array.
// The tokenNumber field will be included automatically since it's on
// the element object.
//
// The exported structure for each numbered element will look like:
// {
//   "id": "elem_1234",
//   "type": "chest",
//   "x": 3, "y": 2,
//   "tileId": "tile_5678",
//   "tokenNumber": 1
// }
//
// The Campaign Mission Sheet's Special Elements section can then
// reference: "Token 1: Chest (Tile 5678)" etc.


// ─── 5. RENUMBER TOKENS AFTER DELETE ─────────────────────────────────
// When an element with a tokenNumber is deleted, renumber remaining
// elements of numbered types to keep sequence clean.

function renumberTokens(elements) {
  var counter = 1;
  elements.forEach(function(e) {
    if (NUMBERED_ELEMENT_TYPES.indexOf(e.type) !== -1) {
      e.tokenNumber = counter++;
    }
  });
}

// Call renumberTokens(builderState.elements) after any element deletion.
// Then call draw() to refresh the canvas.


// ════════════════════════════════════════════════════════════════════
// INTEGRATION SUMMARY
// ════════════════════════════════════════════════════════════════════
//
// 1. Add NUMBERED_ELEMENT_TYPES array near your other element constants
// 2. Call getNextTokenNumber() when placing a qualifying element
// 3. Call drawElementToken() inside your draw loop for each element
// 4. Add renderElementListItem() badge to your elements panel
// 5. Call renumberTokens() after any element deletion
//
// The tokenNumber is persisted in the dungeon JSON export, so when a
// dungeon is loaded into a mission, Special Elements are pre-numbered
// and match what's physically placed on the table.
// ════════════════════════════════════════════════════════════════════
