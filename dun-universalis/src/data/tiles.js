/* Tile catalogue */
var TILE_DB = [
  // ════════════════════════════════════════════════
  // DUNGEON  (underground — dungeon / crypt / sewer / cavern)
  // ════════════════════════════════════════════════

  // ── Start tiles ──
  { id:'24af', name:'Start Tile (Dungeon)', side:'A', sz:[4,2],  cat:'dungeon', theme:'dungeon', type:'corridor', exits:[{type:'double-door',dir:'E'}], special:'Always illuminated. Deploy heroes here.', isStart:true },
  { id:'42as', name:'Iron Cage Room (Start)', side:'A', sz:[3,3],  cat:'dungeon', theme:'dungeon', type:'corridor', exits:[{type:'double-door',dir:'E'}], special:'Always illuminated. Deploy heroes here.', isStart:true },
  { id:'24bf', name:'Start Tile (Sewer)',   side:'B', sz:[4,2],  cat:'dungeon', theme:'sewer',   type:'corridor', exits:[{type:'double-door',dir:'E'}], special:'Always illuminated. Deploy heroes here. Sewer variant.', isStart:true },

  // ── Dungeon corridors ──
  { id:'21ae', name:'Dungeon Corridor 21A', side:'A', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor' },
  { id:'22ae', name:'Crypt Corridor 22A',   side:'A', sz:[6,2], cat:'dungeon', theme:'crypt',   type:'corridor', exits:'std-corridor' },
  { id:'23ae', name:'Riddle Corridor 23A',  side:'A', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor', special:'Riddle. Solve to pass.' },
  { id:'3ae',  name:'Dungeon Corridor 3A',  side:'A', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor' },
  { id:'3be',  name:'Spiderweb Corridor',   side:'B', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor', special:'No encounters. Spiderweb on 5+.' },
  { id:'4ae',  name:'Dungeon Corridor 4A',  side:'A', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor' },
  { id:'4be',  name:'Rocky Corridor',       side:'B', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor', special:'Difficult terrain (rocky).' },
  { id:'29ae', name:'Dungeon Corridor 29A', side:'A', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor' },
  { id:'33ae', name:'Dungeon Corridor 33A', side:'A', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor' },
  { id:'34ae', name:'Dungeon Corridor 34A', side:'A', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor' },
  { id:'34be', name:'Lava Corridor', side:'B', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor', special:'Lava. Lethal terrain.' },
  { id:'37ag', name:'Narrow Corridor 37A', side:'A', sz:[1,6], cat:'dungeon', theme:'crypt', type:'corridor', exits:'std-corridor' },
  { id:'53ae', name:'Broken Bridge',        side:'A', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor', special:'Broken bridge. Agility test to cross or take 1d3 wounds.', isBridge:true },
  { id:'53be', name:'Bridge 53B',          side:'B', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor', special:'Bridge.' },
  { id:'60ae', name:'Cavern Corridor 60A', side:'A', sz:[6,2], cat:'dungeon', theme:'cave',    type:'corridor', exits:'std-corridor' },
  { id:'60be', name:'Corridor 60B',        side:'B', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor' },
  { id:'54ae', name:'Cave Corridor 54A',   side:'A', sz:[6,2], cat:'dungeon', theme:'cave',    type:'corridor', exits:'std-corridor' },
  { id:'54be', name:'Dungeon Corridor 54B', side:'B', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor' },
  { id:'59ae', name:'Cave Floor 59A',      side:'A', sz:[6,2], cat:'dungeon', theme:'cave',    type:'corridor', exits:'std-corridor' },
  { id:'59be', name:'Dungeon Corridor 59B', side:'B', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor' },
  { id:'46be', name:'Cavern Corridor 46B', side:'B', sz:[6,2], cat:'dungeon', theme:'cave',    type:'corridor', exits:'std-corridor', special:'Difficult terrain (roots/rocks).' },
  { id:'90ae', name:'Rainy Corridor 90A',  side:'A', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Raining.' },
  { id:'90be', name:'Canal Street',        side:'B', sz:[6,2], cat:'civilised', theme:'civilised', type:'corridor', exits:'std-corridor', special:'Cobblestone street with canal. Difficult terrain (wet).' , canalWaterSides:['E'] },
  { id:'91ae', name:'Rainy Corridor 91A',  side:'A', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Raining.' },
  { id:'91be', name:'Rainy Corridor 91B',  side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Raining.' },
  { id:'92ae', name:'Stony Path 92A',       side:'A', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Difficult terrain (stones).' },
  { id:'92be', name:'Snow Path 92B',        side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Snow. Difficult terrain.' },
  { id:'93ae', name:'Stony Path 93A',       side:'A', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Difficult terrain (stones).' },
  { id:'93be', name:'Snow Path 93B',        side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Snow. Difficult terrain.' },

  // ── Sewer corridors ──
  { id:'21be', name:'Sewer Corridor 21B',  side:'B', sz:[6,2], cat:'dungeon', theme:'sewer', type:'corridor', exits:'std-corridor', furniture:'std-corridor', special:'Difficult terrain (water)' },
  { id:'22be', name:'Sewer Corridor 22B',  side:'B', sz:[6,2], cat:'dungeon', theme:'sewer', type:'corridor', exits:'std-corridor', furniture:'std-corridor', special:'Difficult terrain (water)' },
  { id:'23be', name:'Sewer Corridor 23B',  side:'B', sz:[6,2], cat:'dungeon', theme:'sewer', type:'corridor', exits:'std-corridor', furniture:'std-corridor', special:'Difficult terrain (water)' },

  // ── Cavern corridors (narrow, _g) ──
  { id:'10ag', name:'Narrow Cavern 10A',  side:'A', sz:[1,6], cat:'dungeon', theme:'cave', type:'corridor', exits:'std-corridor' },
  { id:'10bg', name:'Narrow Cavern 10B',  side:'B', sz:[1,6], cat:'dungeon', theme:'cave', type:'corridor', exits:'std-corridor' },
  { id:'11ag', name:'Narrow Cavern 11A',  side:'A', sz:[1,6], cat:'dungeon', theme:'cave', type:'corridor', exits:'std-corridor' },
  { id:'11bg', name:'Narrow Bridge 11B',  side:'B', sz:[1,6], cat:'dungeon', theme:'cave', type:'corridor', exits:'std-corridor', isBridge:true, special:'Bridge. No lateral exits.' },

  // ── Dungeon rooms ──
  { id:'2ac',   name:'Guard Room',          side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room', special:'+1 Encounter roll.' },
  { id:'5ac',   name:'Stone Chamber',       side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'6bc3',  name:'Dungeon Chamber',     side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'8ac',   name:'Torchlit Chamber',    side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room', special:'Always illuminated.' },
  { id:'12ac',  name:'Storage Room',        side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'12bc',  name:'Fireplace Room',      side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'Fireplace, Chairs' },
  { id:'12ae',  name:'Kitchen',             side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'Kitchen, Fireplace' },
  { id:'15ac',  name:'Dungeon Hall',        side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'15bc',  name:'Pier Room',           side:'B', sz:[6,6], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Wooden pier, Rope posts' },
  { id:'18bc',  name:'Sewer Room 18B',      side:'B', sz:[6,6], cat:'dungeon', theme:'sewer',   type:'room', exits:'std-room', furniture:'std-room', special:'Difficult terrain (water).' },
  { id:'14ac',  name:'Dungeon Room 14A',    side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'14bc',  name:'Courtyard',           side:'B', sz:[6,6], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Well, Planters, Cobblestones' },
  { id:'19ad',  name:'Dungeon Room 19A',    side:'A', sz:[6,4], cat:'dungeon', theme:'dungeon', type:'room', exits:[{type:'single-door',dir:'N'}], furniture:'std-room', special:'Single door only.' },
  { id:'36ac',  name:'Overgrown Room',      side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'36bc',  name:'Vaulted Chamber',     side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'7bc',   name:'Room with Window 7B', side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room', special:'Single door only.' },

  // ── Cavern rooms ──
  { id:'47ac',  name:'Cavern 47A',   side:'A', sz:[6,6], cat:'dungeon', theme:'cave', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'48ac',  name:'Cavern 48A',   side:'A', sz:[6,6], cat:'dungeon', theme:'cave', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'49ac',  name:'Cavern 49A',   side:'A', sz:[6,6], cat:'dungeon', theme:'cave', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'50ac',  name:'Cavern 50A',   side:'A', sz:[6,6], cat:'dungeon', theme:'cave', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'55ac',  name:'Cavern 55A',   side:'A', sz:[6,6], cat:'dungeon', theme:'cave', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'55bc',  name:'Dungeon Chamber 55B', side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'56ac',  name:'Cavern 56A',   side:'A', sz:[6,6], cat:'dungeon', theme:'cave', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'56bc',  name:'Dungeon Chamber 56B', side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'57ac',  name:'Cavern 57A',   side:'A', sz:[6,6], cat:'dungeon', theme:'cave', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'57bc',  name:'Dungeon Chamber 57B', side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'58ac',  name:'Cavern 58A',   side:'A', sz:[6,6], cat:'dungeon', theme:'cave', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'58bc',  name:'Dungeon Chamber 58B', side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },

  // ── Mine rooms ──
  { id:'51ae',  name:'Mine 51A',     side:'A', sz:[6,2], cat:'dungeon', theme:'cave', type:'corridor', exits:'std-corridor', furniture:'std-corridor', special:'Mine shaft.' },
  { id:'51be',  name:'Civilised Corridor 51B', side:'B', sz:[6,2], cat:'civilised', theme:'civilised', type:'corridor', exits:'std-corridor' },
  { id:'52ae',  name:'Mine 52A',     side:'A', sz:[6,2], cat:'dungeon', theme:'cave', type:'corridor', exits:'std-corridor', special:'Mine shaft.' },
  { id:'52be',  name:'Civilised Corridor 52B', side:'B', sz:[6,2], cat:'civilised', theme:'civilised', type:'corridor', exits:'std-corridor' },

  // ── Crypt rooms ──
  { id:'6ac',   name:'The Crypt',       side:'A', sz:[6,6], cat:'dungeon', theme:'crypt', type:'room', exits:'std-room', furniture:'2 sets of amphoras', special:'Always illuminated. No encounters.' },
  { id:'7ac',   name:'Enchanted Room',  side:'A', sz:[6,6], cat:'dungeon', theme:'crypt', type:'room', exits:'std-room', furniture:'std-room', special:'Magic circle. +1 Encounter.', isEnchanted:true },
  { id:'5bc',   name:'Enchanted Room 5B', side:'B', sz:[6,6], cat:'dungeon', theme:'crypt', type:'room', exits:'std-room', furniture:'std-room', special:'Magic circle.', isEnchanted:true },
  { id:'06bc',  name:'Stair Room',      side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:[{type:'single-door',dir:'S'}], furniture:'Stairs', special:'Dead end. Door + stairs. Change level.', isDead:true },

  // ── Ornate dungeon rooms (78–89) ──
  { id:'78ac',  name:'Crypt Chamber 78A', side:'A', sz:[6,6], cat:'dungeon', theme:'crypt', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'78bc',  name:'Canal Section 78B', side:'B', sz:[6,6], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Canal, Walkway' , canalWaterSides:['W', 'E'] },
  { id:'79ac',  name:'Crypt Chamber 79A', side:'A', sz:[6,6], cat:'dungeon', theme:'crypt', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'79bc',  name:'Canal Section 79B', side:'B', sz:[6,6], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Canal, Walkway' , canalWaterSides:['W', 'E'] },
  { id:'80ac',  name:'Palace Room 80A',   side:'A', sz:[6,6], cat:'civilised', altCat:'dungeon', theme:'civilised', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'80bc',  name:'Canal Section 80B', side:'B', sz:[6,6], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Canal, Walkway' , canalWaterSides:['S', 'E'] },
  { id:'81ac',  name:'Palace Room 81A',   side:'A', sz:[6,6], cat:'civilised', altCat:'dungeon', theme:'civilised', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'81bc',  name:'Canal Section 81B', side:'B', sz:[6,6], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Canal, Walkway' , canalWaterSides:['S', 'E'] },
  { id:'82ae',  name:'Ornate Corridor 82A', side:'A', sz:[6,2], cat:'dungeon', theme:'crypt', type:'corridor', exits:'std-corridor' },
  { id:'82be',  name:'Ice Bridge',           side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Ice bridge. Difficult terrain. Slippery.', isWater:true, isBridge:true },
  { id:'83ae',  name:'Riddle Corridor 83A', side:'A', sz:[6,2], cat:'dungeon', theme:'dungeon', type:'corridor', exits:'std-corridor', special:'Riddle. Solve to pass.' },
  { id:'83be',  name:'Desert Path',          side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Difficult terrain (sand).' },
  { id:'84ae',  name:'Civilised Path 84A',   side:'A', sz:[6,2], cat:'civilised', theme:'civilised', type:'corridor', exits:'std-corridor' },
  { id:'84be',  name:'Snow Chasm',            side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Snow chasm. Difficult terrain.' },
  { id:'85ae',  name:'Civilised Path 85A',   side:'A', sz:[6,2], cat:'civilised', theme:'civilised', type:'corridor', exits:'std-corridor' },
  { id:'85be',  name:'Snow Path 85B',         side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Snow. Difficult terrain.' },
  { id:'86ac',  name:'Palace Room 86A',   side:'A', sz:[6,6], cat:'civilised', altCat:'dungeon', theme:'civilised', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'86bc',  name:'Palace Room 86B',   side:'B', sz:[6,6], cat:'civilised', altCat:'dungeon', theme:'civilised', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'87ac',  name:'Palace Room 87A',   side:'A', sz:[6,6], cat:'civilised', altCat:'dungeon', theme:'civilised', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'87bc',  name:'Palace Room 87B',   side:'B', sz:[6,6], cat:'civilised', altCat:'dungeon', theme:'civilised', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'88ac',  name:'Crypt Chamber 88A', side:'A', sz:[6,6], cat:'dungeon', theme:'crypt', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'88bc',  name:'Canal Section 88B', side:'B', sz:[6,6], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Canal, Walkway' , canalWaterSides:['S', 'W', 'E'] },
  { id:'89ac',  name:'Crypt Chamber 89A', side:'A', sz:[6,6], cat:'dungeon', theme:'crypt', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'89bc',  name:'Canal Section 89B', side:'B', sz:[6,6], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Canal, Walkway' , canalWaterSides:['W', 'E'] },

  // ── Special/dead-end dungeon rooms ──
  { id:'13ac',  name:'Open Square',     side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'13bc',  name:'The Chasm',       side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:[{type:'single-door',dir:'S'}], furniture:null, special:'Single door. No encounters. Chasm & Footbridge.', isDead:true },
  { id:'17ac',  name:'Fighting Pit',    side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:[], furniture:null, special:'Dead end. No encounters. Fighting pit hazard.', isDead:true },
  { id:'19bd',  name:'The Cell',        side:'B', sz:[6,4], cat:'dungeon', theme:'dungeon', type:'room', exits:[{type:'single-door',dir:'W'}], furniture:'Dead adventurer', special:'Always illuminated. Dead end.', isDead:true },
  { id:'20bd',  name:'Bedroom',         side:'B', sz:[6,4], cat:'dungeon', theme:'dungeon', type:'room', exits:[], furniture:'Chest, Bed, Cupboard', special:'Dead end. Single door.', isDead:true },
  { id:'20ad',  name:'Small Room 20A',  side:'A', sz:[4,4], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'8bc',   name:'Machinery Room',  side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:[{type:'double-door',dir:'N'}], furniture:'Switch', special:'Dead end. Double door. Rotating door mechanic.', isDead:true },
  { id:'69bc',  name:'Stone Statue Hall', side:'B', sz:[8,10], cat:'dungeon', theme:'crypt',  type:'room', exits:'std-room', furniture:'Stone statues', special:'Boss room.', isBossRoom:true },

  // ── Sewer rooms ──
  { id:'35ac',   name:'Flooded Room',   side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:null, special:'Deep water. Aquatic monster on 2+.', isWater:true },
  { id:'35bc',   name:'Walled Room',    side:'B', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'Barrels, Crates' },
  { id:'17bc',   name:'Sewer Room 17B', side:'B', sz:[6,6], cat:'dungeon', theme:'sewer',   type:'room', exits:'std-room', furniture:'Sewer grate, Pipes', special:'Difficult terrain (water).' },
  { id:'17ac3',  name:'Sewers 17A',     side:'A', sz:[6,6], cat:'dungeon', theme:'sewer', type:'room', exits:'std-room', furniture:'std-room', special:'Difficult terrain (water).' },
  { id:'18ac3',  name:'Room with Window 18A', side:'A', sz:[6,6], cat:'dungeon', theme:'dungeon', type:'room', exits:'std-room', furniture:'std-room', special:'Single door only.' },

  // ── Boss rooms (8×10 DUN squares, isBossRoom:true) ──
  { id:'01aa', name:'Dungeon Hall',      side:'A', sz:[8,10], cat:'dungeon',   theme:'dungeon',  type:'room', exits:'std-room', furniture:'2 Chests', special:'Always illuminated.', isBossRoom:true },
  { id:'02aa', name:'Stone Vault',      side:'A', sz:[8,10], cat:'dungeon',   theme:'dungeon',  type:'room', exits:'std-room', furniture:'2 Chests', special:'Boss room.',          isBossRoom:true },
  { id:'43ba', name:'Burning Hall',     side:'B', sz:[8,10], cat:'dungeon',   theme:'dungeon',  type:'room', exits:'std-room', furniture:null, special:'Boss room. Fire hazard.',   isBossRoom:true },
  { id:'44aa', name:'Throne Room',       side:'A', sz:[8,10], cat:'dungeon',   theme:'dungeon',  type:'room', exits:'std-room', furniture:'Throne, Banners', special:'Boss room. Always illuminated.', isBossRoom:true },
  { id:'44ba', name:'Cavern Vault',      side:'B', sz:[8,10], cat:'dungeon',   theme:'cave',     type:'room', exits:'std-room', furniture:null, special:'Boss room.',                isBossRoom:true },
  { id:'68aa', name:'Winding Stairs',    side:'A', sz:[8,10], cat:'dungeon',   theme:'dungeon',  type:'room', exits:'std-room', furniture:'Spiral staircase', special:'Change level. Single exit only.', isDead:true },
  { id:'68ba', name:'Fighting Pit',      side:'B', sz:[8,10], cat:'civilised', altCat:'dungeon', theme:'dungeon',  type:'room', exits:'std-room', furniture:'Fighting arena, Spectator rails', special:'Boss room. Crowd spectators. No encounters until boss triggered.', isBossRoom:true },
  { id:'01ba', name:'Meadow Lair',      side:'B', sz:[8,10], cat:'outdoor',   theme:'outdoor',  type:'room', exits:'std-room', furniture:null, special:'Boss room.',                isBossRoom:true },
  { id:'02ba', name:'Overgrown Ruins',  side:'B', sz:[8,10], cat:'outdoor',   theme:'outdoor',  type:'room', exits:'std-room', furniture:null, special:'Boss room. Dense growth.',  isBossRoom:true },
  { id:'31aa', name:'Forest Lair',      side:'A', sz:[8,10], cat:'outdoor',   theme:'forest',   type:'room', exits:'std-room', furniture:'Trees, Undergrowth', special:'Boss room.', isBossRoom:true },
  { id:'31ba', name:'Cobblestone Court',side:'B', sz:[8,10], cat:'civilised', theme:'civilised',type:'room', exits:'std-room', furniture:'Market stalls, Well', special:'Boss room. Always illuminated.', isBossRoom:true },
  { id:'32aa', name:'River Crossing',   side:'A', sz:[8,10], cat:'outdoor',   theme:'outdoor',  type:'room', exits:'std-room', furniture:null, special:'Boss room. River. Difficult terrain.', isBossRoom:true, isWater:true },
  { id:'32ba', name:'Wasteland',        side:'B', sz:[8,10], cat:'outdoor',   theme:'outdoor',  type:'room', exits:'std-room', furniture:null, special:'Boss room.',                isBossRoom:true },
  { id:'25ab', name:'Rocky Clearing',   side:'A', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Rocks, Sparse vegetation', special:'+1 Encounter roll.', isMain:true },
  { id:'25bb', name:'River Boat (Large)', side:'B', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Oar, Cargo, Lantern', special:'Boat on water. Difficult terrain.', isBoat:true },
  { id:'26ab', name:'Rocky Clearing 26A', side:'A', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Rocks, Sparse vegetation', special:'+1 Encounter roll.', isMain:true },
  { id:'26bb', name:'River Boat',     side:'B', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Oar, Lantern', special:'Boat on water. Difficult terrain.', isBoat:true },
  { id:'27ab', name:'Wildflower Meadow', side:'A', sz:[4,10], cat:'outdoor', theme:'forest',  type:'room', exits:'std-room', furniture:'Wildflowers, Dense grass', special:'+1 Encounter roll.', isMain:true },
  { id:'27bb', name:'Cobblestone Yard',  side:'B', sz:[4,10], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Stairs, Barrel, Crates', special:'+1 Encounter roll.', isMain:true },
  { id:'28ab', name:'Garden Clearing',  side:'A', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Undergrowth, Flowers', special:'+1 Encounter roll.', isMain:true },
  { id:'28bb', name:'Rocky Wasteland',   side:'B', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Boulders, Skeleton', special:'+1 Encounter roll. Difficult terrain (rocks).', isMain:true },
  { id:'72ab', name:'Snowy Wilderness 72A', side:'A', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Snow-dusted rocks, Bare trees', special:'+1 Encounter roll. Difficult terrain (snow).', isMain:true },
  { id:'72bb', name:'Jungle Ruins',      side:'B', sz:[4,10], cat:'outdoor', theme:'forest',  type:'room', exits:'std-room', furniture:'Overgrown stonework, Vines', special:'+1 Encounter roll. Difficult terrain (undergrowth).', isMain:true },
  { id:'73ab', name:'Snowy Wilderness 73A',  side:'A', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Snow-covered trees, Frozen ground', special:'+1 Encounter roll. Difficult terrain (snow).', isMain:true },
  { id:'73bb', name:'Dragon Skeleton',   side:'B', sz:[4,10], cat:'outdoor', theme:'forest',  type:'room', exits:'std-room', furniture:'Dragon skeleton, Ancient bones', special:'+1 Encounter roll. Difficult terrain (bones/undergrowth).', isMain:true },
  { id:'74ab', name:'Snowy Clearing',    side:'A', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Snow-covered trees, Frozen ground', special:'+1 Encounter roll. Difficult terrain (snow).', isMain:true },
  { id:'74bb', name:'Desert Ruins',      side:'B', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Sand dunes, Boulders', special:'+1 Encounter roll. Difficult terrain (sand).', isMain:true },
  { id:'75ab', name:'Snowy Forest',      side:'A', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Snow-covered trees', special:'+1 Encounter roll. Difficult terrain (snow).', isMain:true },
  { id:'75bb', name:'Desert Expanse',   side:'B', sz:[4,10], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Sand dunes, Rocks', special:'+1 Encounter roll. Difficult terrain (sand).', isMain:true },

  // ════════════════════════════════════════════════
  // CIVILISED  (interiors — taverns, markets, churches, barns)
  // ════════════════════════════════════════════════

  // ── Start tile ──
  { id:'civstart', name:'Start Tile (Civilised)', side:'B', sz:[6,2],  cat:'civilised', theme:'civilised', type:'corridor', exits:[{type:'double-door',dir:'E'}], special:'Always illuminated. Deploy heroes here.', isStart:true },

  // ── Civilised corridors ──
  { id:'45ae', name:'Market Street',        side:'A', sz:[6,2], cat:'civilised', theme:'civilised', type:'corridor', exits:'std-corridor', special:'Market stalls.' },
  { id:'45be', name:'Cavern Passage 45B',   side:'B', sz:[6,2], cat:'dungeon',   theme:'cave',      type:'corridor', exits:'std-corridor' },
  { id:'46ae', name:'Palace Corridor',      side:'A', sz:[6,2], cat:'civilised', altCat:'dungeon', theme:'civilised', type:'corridor', exits:'std-corridor' },

  // ── Civilised rooms ──
  { id:'43aa', name:'Civilised Hall 43A',   side:'A', sz:[10,8], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'std-room', isMain:true },
  { id:'49bc', name:'Barn',                 side:'B', sz:[6,6], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Hay bales, Stalls' },
  { id:'50bc', name:'Church',               side:'B', sz:[6,6], cat:'civilised', theme:'civilised', type:'room', exits:'std-room', furniture:'Altar, Pews', special:'Always illuminated.' },
  { id:'51bc', name:'Civilised Corridor 51B', side:'B', sz:[6,2], cat:'civilised', theme:'civilised', type:'corridor', exits:'std-corridor' },
  { id:'52bc', name:'Civilised Corridor 52B', side:'B', sz:[6,2], cat:'civilised', theme:'civilised', type:'corridor', exits:'std-corridor' },

  // ════════════════════════════════════════════════
  // OUTDOOR  (wilderness — forests, rivers, ruins, snow)
  // ════════════════════════════════════════════════

  // ── Start tile ──
  { id:'01ba2', name:'Outdoor Clearing',     side:'B', sz:[10,8], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Rocks, Sparse vegetation', special:'+1 Encounter roll.', isMain:true },

  // ── Large outdoor rooms (isMain, non-boss) ──
  { id:'29be', name:'Woodland Corridor',  side:'B', sz:[6,2], cat:'outdoor', theme:'forest',  type:'corridor', exits:'std-corridor', special:'Forest. Difficult terrain.' },
  { id:'30ae', name:'Overgrown Path',     side:'A', sz:[6,2], cat:'outdoor', theme:'forest',  type:'corridor', exits:'std-corridor', special:'Dense undergrowth.' },
  { id:'30be', name:'Woodland Corridor',  side:'B', sz:[6,2], cat:'outdoor', theme:'forest',  type:'corridor', exits:'std-corridor' },
  { id:'65ae', name:'Cobblestone Path',   side:'A', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor' },
  { id:'65be', name:'Cobblestone Path B', side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor' },
  { id:'66ae', name:'Rocky Path',         side:'A', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Rocky terrain.' },
  { id:'66be', name:'Rocky Path B',       side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Rocky terrain.' },
  { id:'67ae', name:'Overgrown Path',     side:'A', sz:[6,2], cat:'outdoor', theme:'forest',  type:'corridor', exits:'std-corridor', special:'Dense reeds/grass.' },
  { id:'67be', name:'Civilised Corridor 67B', side:'B', sz:[6,2], cat:'civilised', theme:'civilised', type:'corridor', exits:'std-corridor' },
  { id:'70ae', name:'Forest Path',        side:'A', sz:[6,2], cat:'outdoor', theme:'forest',  type:'corridor', exits:'std-corridor' },
  { id:'70be', name:'Forest Path B',      side:'B', sz:[6,2], cat:'outdoor', theme:'forest',  type:'corridor', exits:'std-corridor' },
  { id:'71ae', name:'Forest Path',        side:'A', sz:[6,2], cat:'outdoor', theme:'forest',  type:'corridor', exits:'std-corridor' },
  { id:'71be', name:'Forest Path B',      side:'B', sz:[6,2], cat:'outdoor', theme:'forest',  type:'corridor', exits:'std-corridor' },
  { id:'76ae', name:'Snow Path 76A',          side:'A', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Snow. Difficult terrain.' },
  { id:'76be', name:'Snow Path 76B',        side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Snow. Difficult terrain.' },
  { id:'77ae', name:'Snow Path 77A',          side:'A', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Snow. Difficult terrain.' },
  { id:'77be', name:'Desert Path 77B',    side:'B', sz:[6,2], cat:'outdoor', theme:'outdoor', type:'corridor', exits:'std-corridor', special:'Difficult terrain (sand).' },

  // ── Outdoor rooms ──
  { id:'47bc', name:'Outdoor Building',  side:'B', sz:[6,6], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'48bc', name:'Palace Entrance',   side:'B', sz:[6,6], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'std-room' },
  { id:'61ac', name:'Campsite',          side:'A', sz:[6,6], cat:'outdoor', theme:'forest',  type:'room', exits:'std-room', furniture:'Campfire, Bedrolls' },
  { id:'61bc', name:'Sewer Chamber',      side:'B', sz:[6,6], cat:'dungeon', theme:'sewer',   type:'room', exits:'std-room', furniture:null, special:'Difficult terrain (water).' },
  { id:'62ac', name:'Garden',            side:'A', sz:[6,6], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Vegetable plots' },
  { id:'62bc', name:'Sewer Chamber 62B', side:'B', sz:[6,6], cat:'dungeon', theme:'sewer',   type:'room', exits:'std-room', furniture:'Sewer grate, Pipes', special:'Difficult terrain (water).' },
  { id:'63ac', name:'Pond',              side:'A', sz:[6,6], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:null, special:'Pond. Difficult terrain (water).', isWater:true },
  { id:'63bc', name:'Sewer Chamber 63B', side:'B', sz:[6,6], cat:'dungeon', theme:'sewer',   type:'room', exits:'std-room', furniture:'Sewer grate, Pipes', special:'Difficult terrain (water).', isWater:true },
  { id:'64ac', name:'Ruins',             side:'A', sz:[6,6], cat:'outdoor', theme:'outdoor', type:'room', exits:'std-room', furniture:'Rubble, Columns' },
  { id:'64bc', name:'Sewer Chamber 64B', side:'B', sz:[6,6], cat:'dungeon', theme:'sewer',   type:'room', exits:'std-room', furniture:'Sewer grate, Pipes', special:'Difficult terrain (water).' },
  { id:'69ab', name:'Jungle Clearing',   side:'A', sz:[4,5], cat:'outdoor', theme:'forest',  type:'room', exits:'std-room', furniture:'Dense vegetation' },

  // ════════════════════════════════════════════════
  // ════════════════════════════════════════════════

  // ════════════════════════════════════════════════
  // ════════════════════════════════════════════════

  // ════════════════════════════════════════════════
  // ════════════════════════════════════════════════

];
