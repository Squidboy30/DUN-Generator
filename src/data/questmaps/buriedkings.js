/* Quest map buriedkings — Buried Kings (Mission 3), reconstructed from The Shiang book p.6 using the app's tile art */
var QUESTMAP_BURIEDKINGS = {
 "mapId": "buriedkings",
 "title": "3 \u2014 Buried Kings",
 "source": "The Shiang campaign book (p.6)",
 "gridPx": 50,
 "tiles": [
  {
   "id": "t_ent",
   "tile": "04A_e",
   "x": 0,
   "y": 600,
   "rot": 0,
   "w": 6,
   "h": 2,
   "hidden": false,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_hall",
   "tile": "13A_c",
   "x": 300,
   "y": 500,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_cUp",
   "tile": "21A_e",
   "x": 350.0,
   "y": 200.0,
   "rot": 90,
   "w": 6,
   "h": 2,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_teal",
   "tile": "05A_c",
   "x": 300,
   "y": -100,
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
   "x": 600,
   "y": -100,
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
   "x": 600,
   "y": 500,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_c22",
   "tile": "22A_e",
   "x": 900,
   "y": 600,
   "rot": 0,
   "w": 6,
   "h": 2,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_blood",
   "tile": "15A_c",
   "x": 1200,
   "y": 500,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_g38a",
   "tile": "38A_g",
   "x": 1500,
   "y": 500,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_g38b",
   "tile": "38B_g",
   "x": 1500,
   "y": 200,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_cDn",
   "tile": "33A_e",
   "x": 1250.0,
   "y": 800.0,
   "rot": 90,
   "w": 6,
   "h": 2,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_boss",
   "tile": "01A_a",
   "x": 1100,
   "y": 1100,
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
   "x": 1500,
   "y": 1200,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_i113",
   "tile": "113B_i",
   "x": 1100,
   "y": 1600,
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
   "x": 1400,
   "y": 1600,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_crypt",
   "tile": "14A_c",
   "x": 300,
   "y": 800,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_narrow",
   "tile": "37A_g",
   "x": 300,
   "y": 1100,
   "rot": 0,
   "w": 1,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_cup",
   "tile": "19A_d",
   "x": 0,
   "y": 1100,
   "rot": 0,
   "w": 6,
   "h": 6,
   "hidden": true,
   "stairs": false,
   "level": 0
  },
  {
   "id": "t_g39b",
   "tile": "39B_g",
   "x": 0.0,
   "y": 1400.0,
   "rot": 90,
   "w": 6,
   "h": 2,
   "hidden": true,
   "stairs": false,
   "level": 0
  }
 ],
 "doors": [
  {
   "id": "d_ent_hall",
   "kind": "puertad",
   "x": 300,
   "y": 650.0,
   "rot": 0,
   "hidden": false,
   "reveals": [
    "t_hall",
    "d_hall_cUp",
    "d_hall_cols",
    "d_hall_crypt"
   ]
  },
  {
   "id": "d_hall_cUp",
   "kind": "puerta",
   "x": 400.0,
   "y": 500,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_cUp",
    "d_cUp_teal"
   ]
  },
  {
   "id": "d_cUp_teal",
   "kind": "puerta",
   "x": 400.0,
   "y": 200,
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
   "x": 600,
   "y": 50.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_rune"
   ]
  },
  {
   "id": "d_hall_cols",
   "kind": "puerta",
   "x": 600,
   "y": 650.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_cols",
    "d_cols_c22"
   ]
  },
  {
   "id": "d_cols_c22",
   "kind": "puerta",
   "x": 900,
   "y": 650.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_c22",
    "d_c22_blood"
   ]
  },
  {
   "id": "d_c22_blood",
   "kind": "puerta",
   "x": 1200,
   "y": 650.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_blood",
    "d_blood_g38a",
    "d_blood_cDn"
   ]
  },
  {
   "id": "d_blood_g38a",
   "kind": "puerta",
   "x": 1500,
   "y": 650.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_g38a",
    "d_g38a_g38b"
   ]
  },
  {
   "id": "d_g38a_g38b",
   "kind": "puerta",
   "x": 1650.0,
   "y": 500,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_g38b"
   ]
  },
  {
   "id": "d_blood_cDn",
   "kind": "puerta",
   "x": 1300.0,
   "y": 800,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_cDn",
    "d_cDn_boss"
   ]
  },
  {
   "id": "d_cDn_boss",
   "kind": "puerta",
   "x": 1300.0,
   "y": 1100,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_boss",
    "d_boss_fire",
    "d_boss_i113"
   ]
  },
  {
   "id": "d_boss_fire",
   "kind": "puerta",
   "x": 1500,
   "y": 1350.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_fire"
   ]
  },
  {
   "id": "d_boss_i113",
   "kind": "puerta",
   "x": 1250.0,
   "y": 1600,
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
   "x": 1400,
   "y": 1750.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_i112"
   ]
  },
  {
   "id": "d_hall_crypt",
   "kind": "puerta",
   "x": 450.0,
   "y": 800,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_crypt",
    "d_crypt_narrow"
   ]
  },
  {
   "id": "d_crypt_narrow",
   "kind": "puerta",
   "x": 325.0,
   "y": 1100,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_narrow",
    "d_narrow_cup"
   ]
  },
  {
   "id": "d_narrow_cup",
   "kind": "puerta",
   "x": 300,
   "y": 1250.0,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_cup",
    "d_cup_g39b"
   ]
  },
  {
   "id": "d_cup_g39b",
   "kind": "puerta",
   "x": 50.0,
   "y": 1400,
   "rot": 0,
   "hidden": true,
   "reveals": [
    "t_g39b"
   ]
  }
 ],
 "furniture": [
  {
   "id": "f_Amphoras_teal_0_-10",
   "name": "Amphoras",
   "x": 450.0,
   "y": 0.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_GreatTreasure_rune_0_-15",
   "name": "Great Treasure",
   "x": 750.0,
   "y": -25.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Chest_rune_15_10",
   "name": "Chest",
   "x": 825.0,
   "y": 100.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Columns_cols_-10_-10",
   "name": "Columns",
   "x": 700.0,
   "y": 600.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Statues_blood_-10_10",
   "name": "Statues",
   "x": 1300.0,
   "y": 700.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Statues_blood_10_-10",
   "name": "Statues",
   "x": 1400.0,
   "y": 600.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Chest_g38a_0_0",
   "name": "Chest",
   "x": 1650.0,
   "y": 650.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Throne_boss_-10_10",
   "name": "Throne",
   "x": 1250.0,
   "y": 1400.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Statues_boss_0_-35",
   "name": "Statues",
   "x": 1300.0,
   "y": 1175.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Chest_boss_-25_-10",
   "name": "Chest",
   "x": 1175.0,
   "y": 1300.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Cupboard_cup_0_0",
   "name": "Cupboard",
   "x": 150.0,
   "y": 1250.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Chest_crypt_10_0",
   "name": "Chest",
   "x": 500.0,
   "y": 950.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Crypt_crypt_0_15",
   "name": "Crypt",
   "x": 450.0,
   "y": 1025.0,
   "rot": 0,
   "hidden": true
  },
  {
   "id": "f_Crypt_fire_0_-10",
   "name": "Crypt",
   "x": 1650.0,
   "y": 1300.0,
   "rot": 0,
   "hidden": true
  }
 ],
 "markers": [
  {
   "id": "m_secret3",
   "kind": "white",
   "x": 575.0,
   "y": 50.0,
   "hidden": true
  },
  {
   "id": "m_portcullis1",
   "kind": "white",
   "x": 450.0,
   "y": 775.0,
   "hidden": true
  },
  {
   "id": "m_riddle2",
   "kind": "white",
   "x": 750.0,
   "y": 775.0,
   "hidden": true
  }
 ],
 "entrance": {
  "id": "e_start",
  "x": 0,
  "y": 600,
  "hidden": false
 },
 "goal": {
  "id": "g_boss",
  "x": 1350.0,
  "y": 1350.0,
  "hidden": true
 },
 "leader": {
  "id": "l_boss",
  "x": 1300.0,
  "y": 1350.0,
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
   "text": "Furniture key: 1 Amphoras, 2 Cupboard, 3 Columns, 4 Trapdoor (links to matching trapdoor), 5 Throne, 6 Statues, 7 Chest."
  },
  {
   "text": "Other elements: 1 Portcullis (no cost), 2 Riddle (no cost), 3 Secret Door."
  },
  {
   "text": "Note: tiles 38A/g, 38B/g, 39B/g, 112B/i, 113B/i are not in the app's tile art set yet, so they render as labelled placeholders."
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
