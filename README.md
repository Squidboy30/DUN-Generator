# Dungeon Universalis — Digital Tool Suite

A browser-based companion app for the **Dungeon Universalis** board game.

**Live:** https://squidboy30.github.io/DUN-Generator

---

## Modules

| Module | Description |
|---|---|
| **Dungeon Generator** | Randomly generates dungeons with fog of war, missions, encounter decks |
| **Tile Inventory** | Browse all 178+ tiles with images, filter by setting/theme, edit entries |
| **Dungeon Builder** | Place tiles to design custom dungeons, then play them with fog of war |

---

## Project Structure

```
index.html                  ← Home screen (live site entry point)
modules/
  generator.html            ← Generator standalone page
  inventory.html            ← Inventory standalone page
  builder.html              ← Builder standalone page
src/
  data/
    images.js               ← Tile images (base64, ~2.7MB — rarely touched)
    crops.js                ← Image crop coordinates
    tiles.js                ← TILE_DB — all tile definitions
    elements.js             ← ELEMENT_DB — all element definitions
    shared.js               ← tileImgKey, tileImgCache, preload
  scripts/
    generator.js            ← Generator game logic (~84KB)
    inventory.js            ← Inventory logic (~38KB)
    builder.js              ← Dungeon builder logic (~37KB)
  styles/
    base.css                ← Home screen shared styles
    generator.css
    inventory.css
    builder.css
  fragments/
    generator_body.html     ← Generator HTML body (no scripts/styles)
    inventory_body.html     ← Inventory HTML body
tests/
  builder_test.js           ← Builder test suite (13 tests, Node.js)
build/
  dun_universalis.html      ← Offline single-file build (generated)
build.py                    ← Assembles offline single-file build
```

---

## Development

**Edit a module:** Open the relevant file in `src/scripts/`. For the builder, edit `src/scripts/builder.js`.

**Run tests:**
```bash
node tests/builder_test.js
```
All 13 tests must pass before committing.

**Build offline file:**
```bash
python3 build.py
# Output: build/dun_universalis.html
```

**Live site:** Push to `main` branch. GitHub Pages serves `index.html` automatically.

---

## GitHub Pages Setup

1. Go to repo **Settings → Pages**
2. Source: **Deploy from branch**
3. Branch: `main`, folder: `/ (root)`
4. Save — site live at `https://squidboy30.github.io/DUN-Generator`

---

## Backlog

- [ ] Export/import dungeon layouts as JSON (portability between machines)
- [ ] Missions and campaigns feature
- [ ] Connection slot drag (move door along edge by dragging)

---

## Notes

- `src/data/images.js` is large (~2.7MB). Commit it once and avoid touching it in normal dev.
- The offline build (`build.py`) bundles everything into a single HTML file that works with no internet (fonts fall back to system serif).
- `TILE_DB`, `ELEMENT_DB`, `TILE_IMAGES` etc. are declared with `var` (not `const`) so dynamically injected scripts can access them in the offline build.
