/* Quest map buriedkings — Buried Kings (Mission 3), reconstructed from The Shiang book p.6 using the app's tile art */
var QUESTMAP_BURIEDKINGS = {
 "mapId": "buriedkings",
 "title": "3 \u2014 Buried Kings",
 "source": "The Shiang campaign book (p.6)",
 "gridPx": 50,
 "tiles": [
  {
   "id": "t_teal",
   "tile": "05A_c",
   "x": 900,
   "y": 50,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_rune",
   "tile": "07A_c",
   "x": 1200,
   "y": 50,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_cols",
   "tile": "12A_c",
   "x": 900,
   "y": 350,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_lroom",
   "tile": "14A_c",
   "x": 600,
   "y": 350,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_mid",
   "tile": "13A_c",
   "x": 1200,
   "y": 350,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_blood",
   "tile": "15A_c",
   "x": 1500,
   "y": 350,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_chest7",
   "tile": "38A_g",
   "x": 1800,
   "y": 350,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_ent",
   "tile": "04A_e",
   "x": 300.0,
   "y": 450.0,
   "rot": 90,
   "w": 2,
   "h": 6,
   "hidden": false,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_corrL",
   "tile": "21A_e",
   "x": 650,
   "y": 650,
   "rot": 0,
   "w": 2,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_blroom",
   "tile": "19A_d",
   "x": 600,
   "y": 950,
   "rot": 0,
   "w": 6,
   "h": 4,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_narrow",
   "tile": "37A_g",
   "x": 600.0,
   "y": 1150.0,
   "rot": 90,
   "w": 1,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_downC",
   "tile": "33A_e",
   "x": 1550,
   "y": 650,
   "rot": 0,
   "w": 2,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_boss",
   "tile": "01A_a",
   "x": 1350,
   "y": 950,
   "rot": 0,
   "w": 8,
   "h": 10,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_fire",
   "tile": "06A_c",
   "x": 1750,
   "y": 1000,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_sideB",
   "tile": "38B_g",
   "x": 1800,
   "y": 650,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_corrR",
   "tile": "39B_g",
   "x": 2100,
   "y": 650,
   "rot": 0,
   "w": 2,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_bossC",
   "tile": "22A_e",
   "x": 1450,
   "y": 1450,
   "rot": 0,
   "w": 2,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_i113",
   "tile": "113B_i",
   "x": 1350,
   "y": 1750,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_i112",
   "tile": "112B_i",
   "x": 1650,
   "y": 1750,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  }
 ],
 "doors": [
  {
   "id": "d_ent_lroom",
   "kind": "puertad",
   "x": 600,
   "y": 500.0,
   "rot": 0,
   "hidden": false,
   "reveals": [
    "t_lroom",
    "d_lroom_cols",
    "d_lroom_corrL"
   ]
  },
  {
   "id": "d_lroom_cols",
   "kind": "puerta",
   "x": 900,
   "y": 500.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_cols",
    "d_cols_teal",
    "d_cols_mid"
   ]
  },
  {
   "id": "d_cols_teal",
   "kind": "puerta",
   "x": 1050.0,
   "y": 350,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_teal",
    "d_teal_rune"
   ]
  },
  {
   "id": "d_teal_rune",
   "kind": "puertad",
   "x": 1200,
   "y": 200.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_rune"
   ]
  },
  {
   "id": "d_cols_mid",
   "kind": "puerta",
   "x": 1200,
   "y": 500.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_mid",
    "d_mid_blood"
   ]
  },
  {
   "id": "d_mid_blood",
   "kind": "puerta",
   "x": 1500,
   "y": 500.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_blood",
    "d_blood_chest7",
    "d_blood_downC"
   ]
  },
  {
   "id": "d_blood_chest7",
   "kind": "puerta",
   "x": 1800,
   "y": 500.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_chest7",
    "d_chest7_sideB"
   ]
  },
  {
   "id": "d_chest7_sideB",
   "kind": "puerta",
   "x": 1950.0,
   "y": 650,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_sideB",
    "d_sideB_corrR"
   ]
  },
  {
   "id": "d_sideB_corrR",
   "kind": "puerta",
   "x": 2100,
   "y": 800.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_corrR"
   ]
  },
  {
   "id": "d_blood_downC",
   "kind": "puerta",
   "x": 1600.0,
   "y": 650,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_downC",
    "d_downC_boss"
   ]
  },
  {
   "id": "d_downC_boss",
   "kind": "puerta",
   "x": 1600.0,
   "y": 950,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_boss",
    "d_boss_fire",
    "d_boss_bossC"
   ]
  },
  {
   "id": "d_boss_fire",
   "kind": "puerta",
   "x": 1750,
   "y": 1150.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_fire"
   ]
  },
  {
   "id": "d_boss_bossC",
   "kind": "puerta",
   "x": 1500.0,
   "y": 1450,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_bossC",
    "d_bossC_i113"
   ]
  },
  {
   "id": "d_bossC_i113",
   "kind": "puerta",
   "x": 1500.0,
   "y": 1750,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_i113",
    "d_i113_i112"
   ]
  },
  {
   "id": "d_i113_i112",
   "kind": "puerta",
   "x": 1650,
   "y": 1900.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_i112"
   ]
  },
  {
   "id": "d_lroom_corrL",
   "kind": "puerta",
   "x": 700.0,
   "y": 650,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_corrL",
    "d_corrL_blroom"
   ]
  },
  {
   "id": "d_corrL_blroom",
   "kind": "puerta",
   "x": 700.0,
   "y": 950,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_blroom",
    "d_blroom_narrow"
   ]
  },
  {
   "id": "d_blroom_narrow",
   "kind": "puerta",
   "x": 750.0,
   "y": 1150,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_narrow"
   ]
  }
 ],
 "furniture": [
  {
   "id": "f_Amphoras_teal_0_-15",
   "name": "Amphoras",
   "x": 1050.0,
   "y": 125.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_GreatTreasure_rune_15_-15",
   "name": "Great Treasure",
   "x": 1425.0,
   "y": 125.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Chest_rune_15_10",
   "name": "Chest",
   "x": 1425.0,
   "y": 250.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Columns_cols_-10_-10",
   "name": "Columns",
   "x": 1000.0,
   "y": 450.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Statues_mid_0_10",
   "name": "Statues",
   "x": 1350.0,
   "y": 550.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Statues_blood_0_-10",
   "name": "Statues",
   "x": 1650.0,
   "y": 450.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Chest_chest7_15_0",
   "name": "Chest",
   "x": 2025.0,
   "y": 500.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Throne_boss_-15_15",
   "name": "Throne",
   "x": 1475.0,
   "y": 1275.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Statues_boss_-15_-35",
   "name": "Statues",
   "x": 1475.0,
   "y": 1025.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Chest_boss_-30_-5",
   "name": "Chest",
   "x": 1400.0,
   "y": 1175.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Cupboard_lroom_0_15",
   "name": "Cupboard",
   "x": 750.0,
   "y": 575.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Chest_blroom_15_0",
   "name": "Chest",
   "x": 825.0,
   "y": 1050.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Crypt_blroom_-15_0",
   "name": "Crypt",
   "x": 675.0,
   "y": 1050.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Crypt_fire_0_-15",
   "name": "Crypt",
   "x": 1900.0,
   "y": 1075.0,
   "rot": 0,
   "hidden": true
  }
 ],
 "markers": [
  {
   "id": "m_secret3",
   "kind": "white",
   "x": 1200.0,
   "y": 250.0,
   "hidden": true
  },
  {
   "id": "m_portcullis1",
   "kind": "white",
   "x": 750.0,
   "y": 650.0,
   "hidden": true
  },
  {
   "id": "m_riddle2",
   "kind": "white",
   "x": 900.0,
   "y": 500.0,
   "hidden": true
  }
 ],
 "entrance": {
  "id": "e_start",
  "x": 350.0,
  "y": 500.0,
  "hidden": false
 },
 "goal": {
  "id": "g_boss",
  "x": 1625.0,
  "y": 1200.0,
  "hidden": true
 },
 "leader": {
  "id": "l_boss",
  "x": 1550.0,
  "y": 1200.0,
  "hidden": true
 },
 "notes": [
  {
   "text": "SPECIAL RULE \u2014 Darkness: all sections (including the Main Room) are affected by the 'Darkness' card at no cost."
  },
  {
   "text": "LEADER: Undead Champion with broadsword, shield and chainmail; extra skill 'Aura'."
  },
  {
   "text": "Special elements: a = Crypt, b = Great Treasure."
  },
  {
   "text": "Furniture key: 1 Amphoras, 2 Cupboard, 3 Columns, 4 Trapdoor, 5 Throne, 6 Statues, 7 Chest."
  },
  {
   "text": "Other elements: 1 Portcullis (no cost), 2 Riddle (no cost), 3 Secret Door."
  },
  {
   "text": "Tiles 38A/g, 38B/g, 39B/g, 112B/i, 113B/i have no art in the app tile set yet, so they render as labelled placeholders."
  }
 ],
 "annotations": [],
 "mission": {
  "number": "3",
  "name": "Buried Kings",
  "intro": "The field of barrows rises above the surrounding swamps. Twisted roots underwater make you stumble as you feel the bites of mosquito clouds. Small hills plagued with barrows stand before you \u2014 mostly desecrated tombs of noble families. But you detect a Real burial mound whose lintels, carved with rich filigree, are in perfect state. No one has dared to go in. The corridor is flanked by wooden faces disfigured by pain, and warnings and curses in several languages. You feel the need to continue exploring. You are the fly entering the spider's lair.",
  "objective": "Knock Out the Quest's Leader.",
  "faction": "Creatures of the night.",
  "setup": "Requires the Achievement and Reserve Point counters. Before building the Dark Player Decks, set aside face down one each of the Obstacle cards 'Portcullis', 'Riddle', and 'Darkness'. The Dark Player must spend 10 Reserve Points on the Leader.",
  "conclusion": "Mission accomplished: read narrative nexus T6. Mission failed: read narrative nexus T7. Rewards: +1 XP if achieved on the first attempt; +1 XP if the heroes scored more Achievement points than the Dark Player; +1 XP per hero who survived and was never Knocked Out, if the group discovered at least twice as many sections as starting heroes."
 }
};
