/* Official missions and quest decks */
var MISSIONS = [
  {
    id: 1,
    name: 'Defeat the Leader',
    icon: '⚔',
    goal: 'Knock out the Quest Leader.',
    setup: 'Choose or randomise the setting (Dungeon, Civilised, or Outdoor). The Quest Leader is the boss in the final room.',
    rules: [
      'The Quest Leader is placed in the Boss Room.',
      'Heroes win when the Quest Leader is knocked out.',
      'The Dark Player wins if all heroes are knocked out before the leader falls.',
    ],
    settings: ['dungeon','civilised','outdoor'],
    allowRandom: true,
  },
  {
    id: 2,
    name: 'Steal the Relic',
    icon: '💎',
    goal: 'Steal the relic from the leader and escape the scenario.',
    setup: 'Choose the setting: Dungeon or Civilised. The Quest Leader holds the relic and is placed in the Boss Room.',
    rules: [
      'To steal the relic, a hero must be adjacent to the Quest Leader and use an action to make an opposed roll: Skilled Hands vs. Perception.',
      'If the hero wins the roll, they take the relic. The hero carrying the relic must then exit the scenario.',
      'The heroes win when the relic-carrying hero leaves the board via the start tile exit.',
      'The Dark Player wins if all heroes are knocked out, or if the turn limit expires.',
      'Time limit: Heroes have 45 turns to steal the relic and escape.',
    ],
    settings: ['dungeon','civilised'],
    allowRandom: true,
    turnLimit: 45,
  },
  // Missions 3–12 will be added here
];

var QUEST_DECKS = {
  '1A': { label:'Level 1–2 · Option A', avgRooms:3, largeRooms:1, corridors:4, boss:1 },
  '1B': { label:'Level 1–2 · Option B', random:8,  boss:1 },
  '3A': { label:'Level 3–4 · Option A', avgRooms:4, largeRooms:2, corridors:4, boss:1 },
  '3B': { label:'Level 3–4 · Option B', random:10, boss:1 },
  '5A': { label:'Level 5–6 · Option A', avgRooms:5, largeRooms:2, corridors:5, boss:1 },
  '5B': { label:'Level 5–6 · Option B', random:12, boss:1 },
};

