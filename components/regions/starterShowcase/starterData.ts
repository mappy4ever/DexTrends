import type { StarterData } from './types';

// Comprehensive starter Pokemon data
export const starterData: Record<string, StarterData> = {
  // Kanto Starters
  'Bulbasaur': {
    number: '001',
    types: ['grass', 'poison'],
    species: 'Seed Pokémon',
    height: '0.7 m',
    weight: '6.9 kg',
    abilities: ['Overgrow', 'Chlorophyll (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'For some time after its birth, it grows by gaining nourishment from the seed on its back. The seed slowly grows larger as the Pokémon grows.',
    stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
    evolutions: [
      { name: 'Bulbasaur', level: 1, id: 1, types: ['grass', 'poison'] },
      { name: 'Ivysaur', level: 16, id: 2, types: ['grass', 'poison'] },
      { name: 'Venusaur', level: 32, id: 3, types: ['grass', 'poison'] }
    ],
    megaEvolution: { name: 'Mega Venusaur', types: ['grass', 'poison'] },
    strengths: ['Excellent for beginners', 'Strong against early gyms', 'Good defensive typing', 'Access to status moves'],
    weaknesses: ['Vulnerable to common types', 'Slower than other starters', 'Limited coverage moves early'],
    notableTrainers: ['Red', 'Leaf', 'Professor Oak\'s Lab'],
    signature: 'Frenzy Plant',
    hiddenAbility: 'Chlorophyll - Doubles Speed in sunny weather',
    competitiveRole: 'Tank/Support',
    tier: 'OU (Mega), RU (Regular)',
    funFacts: [
      'Based on a frog/toad with a plant bulb',
      'Number 001 in the National Pokédex',
      'Can survive for days using only the bulb on its back'
    ]
  },
  'Charmander': {
    number: '004',
    types: ['fire'],
    species: 'Lizard Pokémon',
    height: '0.6 m',
    weight: '8.5 kg',
    abilities: ['Blaze', 'Solar Power (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'The flame on its tail indicates Charmander\'s life force. If it is healthy, the flame burns brightly. If the flame goes out, it dies.',
    stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 },
    evolutions: [
      { name: 'Charmander', level: 1, id: 4, types: ['fire'] },
      { name: 'Charmeleon', level: 16, id: 5, types: ['fire'] },
      { name: 'Charizard', level: 36, id: 6, types: ['fire', 'flying'] }
    ],
    megaEvolution: [
      { name: 'Mega Charizard X', types: ['fire', 'dragon'] },
      { name: 'Mega Charizard Y', types: ['fire', 'flying'] }
    ],
    gigantamax: true,
    strengths: ['High offensive potential', 'Two Mega Evolutions', 'Popular and iconic', 'Great movepool'],
    weaknesses: ['Difficult early game', 'Weak to Stealth Rock', 'Common weaknesses'],
    notableTrainers: ['Red', 'Leon', 'Lance', 'Alain'],
    signature: 'Blast Burn',
    hiddenAbility: 'Solar Power - Boosts Sp. Atk in sun but loses HP',
    competitiveRole: 'Special/Physical Sweeper',
    tier: 'OU (Mega), RU (Regular)',
    funFacts: [
      'Most popular starter of all time',
      'Only starter with two Mega Evolutions',
      'Charizard is Flying-type despite being a starter Fire-type'
    ]
  },
  'Squirtle': {
    number: '007',
    types: ['water'],
    species: 'Tiny Turtle Pokémon',
    height: '0.5 m',
    weight: '9.0 kg',
    abilities: ['Torrent', 'Rain Dish (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'When it retracts its long neck into its shell, it squirts out water with vigorous force. It can withdraw into its shell for protection.',
    stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 },
    evolutions: [
      { name: 'Squirtle', level: 1, id: 7, types: ['water'] },
      { name: 'Wartortle', level: 16, id: 8, types: ['water'] },
      { name: 'Blastoise', level: 36, id: 9, types: ['water'] }
    ],
    megaEvolution: { name: 'Mega Blastoise', types: ['water'] },
    gigantamax: true,
    strengths: ['Balanced stats', 'Good defensive capabilities', 'Reliable and consistent', 'Great coverage moves'],
    weaknesses: ['Lower speed tier', 'Predictable moveset', 'Outclassed by other Water-types'],
    notableTrainers: ['Gary Oak', 'Misty (anime)', 'Siebold'],
    signature: 'Hydro Cannon',
    hiddenAbility: 'Rain Dish - Recovers HP in rain',
    competitiveRole: 'Bulky Spinner/Tank',
    tier: 'RU (Mega), NU (Regular)',
    funFacts: [
      'Leader of the Squirtle Squad in anime',
      'Can live for 10,000 years',
      'Its shell hardens after birth'
    ]
  },
  // Johto Starters
  'Chikorita': {
    number: '152',
    types: ['grass'],
    species: 'Leaf Pokémon',
    height: '0.9 m',
    weight: '6.4 kg',
    abilities: ['Overgrow', 'Leaf Guard (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'It uses the leaf on its head to determine the temperature and humidity. It loves to sunbathe and emits a sweet fragrance from its leaf.',
    stats: { hp: 45, attack: 49, defense: 65, spAtk: 49, spDef: 65, speed: 45 },
    evolutions: [
      { name: 'Chikorita', level: 1, id: 152, types: ['grass'] },
      { name: 'Bayleef', level: 16, id: 153, types: ['grass'] },
      { name: 'Meganium', level: 32, id: 154, types: ['grass'] }
    ],
    strengths: ['High defenses', 'Support movepool', 'Aromatherapy access', 'Good for status strategies'],
    weaknesses: ['Poor offensive stats', 'Difficult Johto gyms', 'Limited coverage', 'Outclassed defensively'],
    notableTrainers: ['Casey', 'Lyra', 'Vincent'],
    signature: 'Frenzy Plant',
    hiddenAbility: 'Leaf Guard - Prevents status conditions in sun',
    competitiveRole: 'Cleric/Support',
    tier: 'PU',
    funFacts: [
      'Based on a sauropod dinosaur',
      'Releases a sweet aroma to calm enemies',
      'Most defensive Grass starter'
    ]
  },
  'Cyndaquil': {
    number: '155',
    types: ['fire'],
    species: 'Fire Mouse Pokémon',
    height: '0.5 m',
    weight: '7.9 kg',
    abilities: ['Blaze', 'Flash Fire (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'It flares flames from its back to protect itself. The flames become vigorous if angered. When tired, only smoke comes out.',
    stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 },
    evolutions: [
      { name: 'Cyndaquil', level: 1, id: 155, types: ['fire'] },
      { name: 'Quilava', level: 14, id: 156, types: ['fire'] },
      { name: 'Typhlosion', level: 36, id: 157, types: ['fire'] }
    ],
    regionalForm: { 
      region: 'Hisui', 
      types: ['fire', 'ghost'],
      description: 'Hisuian form gains Ghost-type and a more spiritual appearance'
    },
    strengths: ['Good speed tier', 'Eruption is powerful', 'Simple but effective', 'Flash Fire immunity'],
    weaknesses: ['Shallow movepool', 'Stealth Rock weakness', 'Competition from other Fire-types'],
    notableTrainers: ['Gold', 'Jimmy', 'Ethan'],
    signature: 'Blast Burn',
    hiddenAbility: 'Flash Fire - Powers up Fire moves when hit by one',
    competitiveRole: 'Special Sweeper',
    tier: 'NU',
    funFacts: [
      'Based on an echidna/shrew',
      'Usually timid but becomes fierce in battle',
      'Hisuian form is Fire/Ghost type'
    ]
  },
  'Totodile': {
    number: '158',
    types: ['water'],
    species: 'Big Jaw Pokémon',
    height: '0.6 m',
    weight: '9.5 kg',
    abilities: ['Torrent', 'Sheer Force (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'Despite being small, its jaws are very powerful. It can crush almost anything with its jaws. Be careful of its playful bites!',
    stats: { hp: 50, attack: 65, defense: 64, spAtk: 44, spDef: 48, speed: 43 },
    evolutions: [
      { name: 'Totodile', level: 1, id: 158, types: ['water'] },
      { name: 'Croconaw', level: 18, id: 159, types: ['water'] },
      { name: 'Feraligatr', level: 30, id: 160, types: ['water'] }
    ],
    strengths: ['Physical powerhouse', 'Sheer Force + Life Orb', 'Dragon Dance access', 'Good coverage'],
    weaknesses: ['Slow without setup', 'Special defense lacking', 'Predictable sets'],
    notableTrainers: ['Gold', 'Khoury', 'Marina'],
    signature: 'Hydro Cannon',
    hiddenAbility: 'Sheer Force - Removes added effects but boosts power',
    competitiveRole: 'Physical Setup Sweeper',
    tier: 'RU',
    funFacts: [
      'Based on a crocodile',
      'Has a habit of biting anything',
      'Most popular Johto starter competitively'
    ]
  },
  // Hoenn Starters
  'Treecko': {
    number: '252',
    types: ['grass'],
    species: 'Wood Gecko Pokémon',
    height: '0.5 m',
    weight: '5.0 kg',
    abilities: ['Overgrow', 'Unburden (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'Using its tail like a hook, it hangs from tree branches to sleep. It can climb walls and ceilings with its toe pads.',
    stats: { hp: 40, attack: 45, defense: 35, spAtk: 65, spDef: 55, speed: 70 },
    evolutions: [
      { name: 'Treecko', level: 1, id: 252, types: ['grass'] },
      { name: 'Grovyle', level: 16, id: 253, types: ['grass'] },
      { name: 'Sceptile', level: 36, id: 254, types: ['grass'] }
    ],
    megaEvolution: { name: 'Mega Sceptile', types: ['grass', 'dragon'] },
    strengths: ['Fastest Grass starter', 'Mega gains Dragon-type', 'Good special attacker', 'Unburden strategies'],
    weaknesses: ['Frail defenses', 'Limited physical movepool', '4x Ice weakness (Mega)'],
    notableTrainers: ['Ash', 'Sawyer', 'Brendan'],
    signature: 'Frenzy Plant',
    hiddenAbility: 'Unburden - Doubles Speed when item is consumed',
    competitiveRole: 'Special Sweeper',
    tier: 'NU (Mega), PU (Regular)',
    funFacts: [
      'Based on a leaf-tailed gecko',
      'Only Grass starter to gain Dragon-type',
      'Can regrow its tail if lost'
    ]
  },
  'Torchic': {
    number: '255',
    types: ['fire'],
    species: 'Chick Pokémon',
    height: '0.4 m',
    weight: '2.5 kg',
    abilities: ['Blaze', 'Speed Boost (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'It has a flame sac inside its belly that perpetually burns. It feels warm if hugged. It can launch fireballs of 1,800 degrees F.',
    stats: { hp: 45, attack: 60, defense: 40, spAtk: 70, spDef: 50, speed: 45 },
    evolutions: [
      { name: 'Torchic', level: 1, id: 255, types: ['fire'] },
      { name: 'Combusken', level: 16, id: 256, types: ['fire', 'fighting'] },
      { name: 'Blaziken', level: 36, id: 257, types: ['fire', 'fighting'] }
    ],
    megaEvolution: { name: 'Mega Blaziken', types: ['fire', 'fighting'] },
    strengths: ['Speed Boost ability', 'Fire/Fighting typing', 'Mixed attacker', 'First Fire/Fighting starter'],
    weaknesses: ['Frail early on', 'Common weaknesses', 'Banned from standard play'],
    notableTrainers: ['May', 'Harrison', 'Sapphire'],
    signature: 'Blast Burn',
    hiddenAbility: 'Speed Boost - Raises Speed each turn',
    competitiveRole: 'Physical/Mixed Sweeper',
    tier: 'Uber (Speed Boost), OU (Blaze)',
    funFacts: [
      'Based on a rooster/cockfighting bird',
      'First starter banned to Ubers',
      'Speed Boost makes it unstoppable'
    ]
  },
  'Mudkip': {
    number: '258',
    types: ['water'],
    species: 'Mud Fish Pokémon',
    height: '0.4 m',
    weight: '7.6 kg',
    abilities: ['Torrent', 'Damp (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'Using the fin on its head, it senses the flow of water. It has the strength to heft boulders. Its large tail fin propels it through water.',
    stats: { hp: 50, attack: 70, defense: 50, spAtk: 50, spDef: 50, speed: 40 },
    evolutions: [
      { name: 'Mudkip', level: 1, id: 258, types: ['water'] },
      { name: 'Marshtomp', level: 16, id: 259, types: ['water', 'ground'] },
      { name: 'Swampert', level: 36, id: 260, types: ['water', 'ground'] }
    ],
    megaEvolution: { name: 'Mega Swampert', types: ['water', 'ground'] },
    strengths: ['Only one weakness', 'Great typing', 'Balanced stats', 'Swift Swim (Mega)'],
    weaknesses: ['4x Grass weakness', 'Slow without rain', 'Predictable'],
    notableTrainers: ['Brendan', 'Brock', 'May'],
    signature: 'Hydro Cannon',
    hiddenAbility: 'Damp - Prevents explosion moves',
    competitiveRole: 'Bulky Physical Attacker',
    tier: 'OU (Mega), RU (Regular)',
    funFacts: [
      'Based on mudskippers and axolotls',
      'Internet meme: "So I heard you like Mudkips"',
      'Only weakness is Grass (4x damage)'
    ]
  },
  // Sinnoh Starters
  'Turtwig': {
    number: '387',
    types: ['grass'],
    species: 'Tiny Leaf Pokémon',
    height: '0.4 m',
    weight: '10.2 kg',
    abilities: ['Overgrow', 'Shell Armor (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'The shell on its back is made of soil. It hardens when it drinks water. The leaf on its head wilts if it is thirsty.',
    stats: { hp: 55, attack: 68, defense: 64, spAtk: 45, spDef: 55, speed: 31 },
    evolutions: [
      { name: 'Turtwig', level: 1, id: 387, types: ['grass'] },
      { name: 'Grotle', level: 18, id: 388, types: ['grass'] },
      { name: 'Torterra', level: 32, id: 389, types: ['grass', 'ground'] }
    ],
    strengths: ['Unique Grass/Ground typing', 'High attack and defense', 'Earthquake STAB', 'Shell Armor prevents crits'],
    weaknesses: ['4x Ice weakness', 'Very slow', 'Many common weaknesses'],
    notableTrainers: ['Ash', 'Paul', 'Dawn'],
    signature: 'Frenzy Plant',
    hiddenAbility: 'Shell Armor - Prevents critical hits',
    competitiveRole: 'Physical Tank',
    tier: 'PU',
    funFacts: [
      'Based on World Turtle mythology',
      'Entire ecosystems live on Torterra\'s back',
      'Heaviest Grass-type starter'
    ]
  },
  'Chimchar': {
    number: '390',
    types: ['fire'],
    species: 'Chimp Pokémon',
    height: '0.5 m',
    weight: '6.2 kg',
    abilities: ['Blaze', 'Iron Fist (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'Its fiery rear end is fueled by gas made in its belly. The fire burns weakly when it feels sick. It lives atop craggy mountains.',
    stats: { hp: 44, attack: 58, defense: 44, spAtk: 58, spDef: 44, speed: 61 },
    evolutions: [
      { name: 'Chimchar', level: 1, id: 390, types: ['fire'] },
      { name: 'Monferno', level: 14, id: 391, types: ['fire', 'fighting'] },
      { name: 'Infernape', level: 36, id: 392, types: ['fire', 'fighting'] }
    ],
    strengths: ['Fast mixed attacker', 'Iron Fist boosts punches', 'Great movepool', 'Fire/Fighting coverage'],
    weaknesses: ['Frail defenses', 'Common weaknesses', 'Outclassed by Blaziken'],
    notableTrainers: ['Ash', 'Paul (formerly)', 'Flint'],
    signature: 'Blast Burn',
    hiddenAbility: 'Iron Fist - Powers up punching moves',
    competitiveRole: 'Mixed Sweeper/Lead',
    tier: 'RU',
    funFacts: [
      'Based on Sun Wukong/Journey to the West',
      'Fire on tail extinguishes when sleeping',
      'Paul\'s abandoned Chimchar became Ash\'s ace'
    ]
  },
  'Piplup': {
    number: '393',
    types: ['water'],
    species: 'Penguin Pokémon',
    height: '0.4 m',
    weight: '5.2 kg',
    abilities: ['Torrent', 'Competitive (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'A proud Pokémon that dislikes accepting food from people. Its thick down guards it from cold. It lives along northern shores.',
    stats: { hp: 53, attack: 51, defense: 53, spAtk: 61, spDef: 56, speed: 40 },
    evolutions: [
      { name: 'Piplup', level: 1, id: 393, types: ['water'] },
      { name: 'Prinplup', level: 16, id: 394, types: ['water'] },
      { name: 'Empoleon', level: 36, id: 395, types: ['water', 'steel'] }
    ],
    strengths: ['Unique Water/Steel typing', 'Many resistances', 'Special tank', 'Competitive ability'],
    weaknesses: ['Slow speed', 'Weak to common types', 'Limited recovery'],
    notableTrainers: ['Dawn', 'Barry', 'Kenny'],
    signature: 'Hydro Cannon',
    hiddenAbility: 'Competitive - Raises Sp. Atk when stats lowered',
    competitiveRole: 'Special Tank/Pivot',
    tier: 'RU',
    funFacts: [
      'Based on emperor penguins',
      'Only Water/Steel type Pokémon',
      'Has a crown-like design as Empoleon'
    ]
  },
  // Unova Starters
  'Snivy': {
    number: '495',
    types: ['grass'],
    species: 'Grass Snake Pokémon',
    height: '0.6 m',
    weight: '8.1 kg',
    abilities: ['Overgrow', 'Contrary (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'They photosynthesize by bathing their tails in sunlight. When they are not feeling well, their tails droop.',
    stats: { hp: 45, attack: 45, defense: 55, spAtk: 45, spDef: 55, speed: 63 },
    evolutions: [
      { name: 'Snivy', level: 1, id: 495, types: ['grass'] },
      { name: 'Servine', level: 17, id: 496, types: ['grass'] },
      { name: 'Serperior', level: 36, id: 497, types: ['grass'] }
    ],
    strengths: ['Contrary ability is powerful', 'Fast for a Grass starter', 'Good defensive typing', 'Leaf Storm sweeper'],
    weaknesses: ['Poor offensive stats normally', 'Relies heavily on Contrary', 'Limited movepool'],
    notableTrainers: ['Trip', 'Ash Ketchum'],
    signature: 'Frenzy Plant',
    hiddenAbility: 'Contrary - Reverses stat changes',
    competitiveRole: 'Special Sweeper (Contrary)',
    tier: 'OU (Contrary), PU (Regular)',
    funFacts: [
      'Based on a snake and royalty',
      'Contrary ability makes it top-tier',
      'Most elegant starter design'
    ]
  },
  'Tepig': {
    number: '498',
    types: ['fire'],
    species: 'Fire Pig Pokémon',
    height: '0.5 m',
    weight: '9.9 kg',
    abilities: ['Blaze', 'Thick Fat (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'It can deftly dodge its foe\'s attacks while shooting fireballs from its nose. It roasts berries before it eats them.',
    stats: { hp: 65, attack: 63, defense: 45, spAtk: 45, spDef: 45, speed: 45 },
    evolutions: [
      { name: 'Tepig', level: 1, id: 498, types: ['fire'] },
      { name: 'Pignite', level: 17, id: 499, types: ['fire', 'fighting'] },
      { name: 'Emboar', level: 36, id: 500, types: ['fire', 'fighting'] }
    ],
    strengths: ['Good HP stat', 'Fire/Fighting is powerful', 'Thick Fat ability', 'Strong physical attacker'],
    weaknesses: ['Slow speed', 'Common typing', 'Overshadowed by Blaziken'],
    notableTrainers: ['Bianca', 'Chili'],
    signature: 'Blast Burn',
    hiddenAbility: 'Thick Fat - Resists Fire and Ice moves',
    competitiveRole: 'Physical Attacker',
    tier: 'NU',
    funFacts: [
      'Third Fire/Fighting starter in a row',
      'Based on a pig and Chinese zodiac',
      'Can shoot fire from its nose'
    ]
  },
  'Oshawott': {
    number: '501',
    types: ['water'],
    species: 'Sea Otter Pokémon',
    height: '0.5 m',
    weight: '5.9 kg',
    abilities: ['Torrent', 'Shell Armor (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'The scalchop on its stomach isn\'t just used for battle--it can be used to break open hard berries as well.',
    stats: { hp: 55, attack: 55, defense: 45, spAtk: 63, spDef: 45, speed: 45 },
    evolutions: [
      { name: 'Oshawott', level: 1, id: 501, types: ['water'] },
      { name: 'Dewott', level: 17, id: 502, types: ['water'] },
      { name: 'Samurott', level: 36, id: 503, types: ['water'] }
    ],
    regionalForm: { 
      region: 'Hisui', 
      types: ['water', 'dark'],
      description: 'Hisuian form becomes Water/Dark type with different appearance'
    },
    strengths: ['Shell Armor prevents crits', 'Good special attack', 'Scalchop as weapon', 'Samurai theme'],
    weaknesses: ['Average stats overall', 'Limited coverage', 'Not particularly fast'],
    notableTrainers: ['Ash Ketchum', 'Cameron'],
    signature: 'Hydro Cannon',
    hiddenAbility: 'Shell Armor - Prevents critical hits',
    competitiveRole: 'Mixed Attacker',
    tier: 'PU',
    funFacts: [
      'Uses scalchop as a sword',
      'Becomes a samurai as Samurott',
      'Has a Hisuian regional form'
    ]
  },
  // Kalos Starters
  'Chespin': {
    number: '650',
    types: ['grass'],
    species: 'Spiny Nut Pokémon',
    height: '0.4 m',
    weight: '9.0 kg',
    abilities: ['Overgrow', 'Bulletproof (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'The quills on its head are usually soft. When it flexes them, the points become so hard and sharp that they can pierce rock.',
    stats: { hp: 56, attack: 61, defense: 65, spAtk: 48, spDef: 45, speed: 38 },
    evolutions: [
      { name: 'Chespin', level: 1, id: 650, types: ['grass'] },
      { name: 'Quilladin', level: 16, id: 651, types: ['grass'] },
      { name: 'Chesnaught', level: 36, id: 652, types: ['grass', 'fighting'] }
    ],
    strengths: ['Great defensive typing', 'Spiky Shield signature move', 'Bulletproof ability blocks ball moves', 'Good HP and Defense'],
    weaknesses: ['Slow Speed stat', 'Vulnerable to Flying attacks', 'Limited special attack', 'Many common weaknesses'],
    notableTrainers: ['Calem/Serena', 'Clemont (anime)', 'Mairin'],
    signature: 'Spiky Shield',
    hiddenAbility: 'Bulletproof - Protects from ball and bomb moves',
    competitiveRole: 'Physical Tank',
    tier: 'NU',
    funFacts: [
      'First Grass/Fighting type starter evolution',
      'Based on a hedgehog and knight',
      'Can roll into a ball for protection'
    ]
  },
  'Fennekin': {
    number: '653',
    types: ['fire'],
    species: 'Fox Pokémon',
    height: '0.4 m',
    weight: '9.4 kg',
    abilities: ['Blaze', 'Magician (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'Eating a twig fills it with energy, and its roomy ears give vent to air hotter than 390 degrees Fahrenheit.',
    stats: { hp: 40, attack: 45, defense: 40, spAtk: 62, spDef: 60, speed: 60 },
    evolutions: [
      { name: 'Fennekin', level: 1, id: 653, types: ['fire'] },
      { name: 'Braixen', level: 16, id: 654, types: ['fire'] },
      { name: 'Delphox', level: 36, id: 655, types: ['fire', 'psychic'] }
    ],
    strengths: ['First Fire/Psychic starter', 'Good special attack', 'Magician ability', 'Elegant design'],
    weaknesses: ['Frail defenses', 'Vulnerable to common types', 'Limited physical movepool', 'Slow until fully evolved'],
    notableTrainers: ['Calem/Serena', 'Aria', 'Serena (anime)'],
    signature: 'Mystical Fire',
    hiddenAbility: 'Magician - Steals the held item of a Pokémon it hits',
    competitiveRole: 'Special Sweeper',
    tier: 'NU',
    funFacts: [
      'Based on fennec foxes and witches',
      'First Fire/Psychic type starter evolution',
      'Carries a wand as Braixen and Delphox'
    ]
  },
  'Froakie': {
    number: '656',
    types: ['water'],
    species: 'Bubble Frog Pokémon',
    height: '0.3 m',
    weight: '7.0 kg',
    abilities: ['Torrent', 'Protean (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'It secretes flexible bubbles from its chest and back. The bubbles reduce the damage it would otherwise take when attacked.',
    stats: { hp: 41, attack: 56, defense: 40, spAtk: 62, spDef: 44, speed: 71 },
    evolutions: [
      { name: 'Froakie', level: 1, id: 656, types: ['water'] },
      { name: 'Frogadier', level: 16, id: 657, types: ['water'] },
      { name: 'Greninja', level: 36, id: 658, types: ['water', 'dark'] }
    ],
    strengths: ['Protean ability changes type', 'Fast and versatile', 'Great movepool', 'Popular in competitive'],
    weaknesses: ['Very frail defenses', 'Relies on ability', 'Limited without Protean', 'Prediction-dependent'],
    notableTrainers: ['Ash Ketchum', 'Calem/Serena', 'Sanpei'],
    signature: 'Water Shuriken',
    hiddenAbility: 'Protean - Changes type to match move used',
    competitiveRole: 'Fast Physical/Special Sweeper',
    tier: 'OU (with Protean)',
    funFacts: [
      'Most popular Kalos starter',
      'Greninja became extremely popular in competitive',
      'Has a special Ash-Greninja form'
    ]
  },
  // Alola Starters
  'Rowlet': {
    number: '722',
    types: ['grass', 'flying'],
    species: 'Grass Quill Pokémon',
    height: '0.3 m',
    weight: '1.5 kg',
    abilities: ['Overgrow', 'Long Reach (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'This wary Pokémon uses photosynthesis to store up energy during the day, while becoming active at night. It silently glides through the darkness.',
    stats: { hp: 68, attack: 55, defense: 55, spAtk: 50, spDef: 50, speed: 42 },
    evolutions: [
      { name: 'Rowlet', level: 1, id: 722, types: ['grass', 'flying'] },
      { name: 'Dartrix', level: 17, id: 723, types: ['grass', 'flying'] },
      { name: 'Decidueye', level: 34, id: 724, types: ['grass', 'ghost'] }
    ],
    strengths: ['Unique Grass/Flying typing', 'Becomes Grass/Ghost', 'Long Reach ability', 'Good defensive stats'],
    weaknesses: ['Vulnerable to Ice attacks', 'Many common weaknesses', 'Slow speed stat'],
    notableTrainers: ['Ash Ketchum', 'Professor Kukui'],
    signature: 'Spirit Shackle',
    hiddenAbility: 'Long Reach - Moves do not make contact',
    competitiveRole: 'Physical Attacker',
    tier: 'PU',
    funFacts: [
      'Can rotate its head 180 degrees',
      'Becomes Ghost-type upon final evolution',
      'Based on a barn owl and archer'
    ]
  },
  'Litten': {
    number: '725',
    types: ['fire'],
    species: 'Fire Cat Pokémon',
    height: '0.4 m',
    weight: '4.3 kg',
    abilities: ['Blaze', 'Intimidate (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'While grooming itself, it builds up fur inside its stomach. It sets the fur alight and spits fireballs. The temperature of its fire increases when it\'s not feeling well.',
    stats: { hp: 45, attack: 65, defense: 40, spAtk: 60, spDef: 40, speed: 70 },
    evolutions: [
      { name: 'Litten', level: 1, id: 725, types: ['fire'] },
      { name: 'Torracat', level: 17, id: 726, types: ['fire'] },
      { name: 'Incineroar', level: 34, id: 727, types: ['fire', 'dark'] }
    ],
    strengths: ['Fast for a Fire starter', 'Becomes Fire/Dark', 'Intimidate ability', 'Good attack stat'],
    weaknesses: ['Frail defenses', 'Weak to common types', 'Loses speed upon evolution'],
    notableTrainers: ['Kiawe', 'Professor Kukui'],
    signature: 'Darkest Lariat',
    hiddenAbility: 'Intimidate - Lowers opponent\'s Attack',
    competitiveRole: 'Physical Attacker',
    tier: 'RU',
    funFacts: [
      'Grooms itself constantly',
      'Becomes a wrestler as Incineroar',
      'Popular in VGC doubles format'
    ]
  },
  'Popplio': {
    number: '728',
    types: ['water'],
    species: 'Sea Lion Pokémon',
    height: '0.4 m',
    weight: '7.5 kg',
    abilities: ['Torrent', 'Liquid Voice (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'This Pokémon snorts body fluids from its nose, blowing balloons to smash into foes. It\'s famous for being a hard worker.',
    stats: { hp: 50, attack: 54, defense: 54, spAtk: 66, spDef: 56, speed: 40 },
    evolutions: [
      { name: 'Popplio', level: 1, id: 728, types: ['water'] },
      { name: 'Brionne', level: 17, id: 729, types: ['water'] },
      { name: 'Primarina', level: 34, id: 730, types: ['water', 'fairy'] }
    ],
    strengths: ['Becomes Water/Fairy', 'High special attack', 'Liquid Voice ability', 'Good bulk'],
    weaknesses: ['Very slow', 'Vulnerable to Electric/Grass', 'Limited physical moves'],
    notableTrainers: ['Lana', 'Ida'],
    signature: 'Sparkling Aria',
    hiddenAbility: 'Liquid Voice - Sound moves become Water-type',
    competitiveRole: 'Special Attacker/Support',
    tier: 'RU',
    funFacts: [
      'Creates water balloons from its nose',
      'Becomes a mermaid-like singer',
      'Only Water/Fairy starter evolution'
    ]
  },
  // Galar Starters
  'Grookey': {
    number: '810',
    types: ['grass'],
    species: 'Chimp Pokémon',
    height: '0.3 m',
    weight: '5.0 kg',
    abilities: ['Overgrow', 'Grassy Surge (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'When it uses its special stick to strike up a beat, the sound waves produced carry revitalizing energy to the plants and flowers in the area.',
    stats: { hp: 50, attack: 65, defense: 50, spAtk: 40, spDef: 40, speed: 65 },
    evolutions: [
      { name: 'Grookey', level: 1, id: 810, types: ['grass'] },
      { name: 'Thwackey', level: 16, id: 811, types: ['grass'] },
      { name: 'Rillaboom', level: 35, id: 812, types: ['grass'] }
    ],
    gigantamax: true,
    strengths: ['Grassy Surge ability', 'Priority Grassy Glide', 'High attack stat', 'Drum-based moves'],
    weaknesses: ['Poor special stats', 'Limited coverage', 'Vulnerable to Flying'],
    notableTrainers: ['Leon', 'Goh'],
    signature: 'Drum Beating',
    hiddenAbility: 'Grassy Surge - Sets Grassy Terrain',
    competitiveRole: 'Physical Sweeper',
    tier: 'OU',
    funFacts: [
      'Uses a stick as drumstick',
      'Music-themed evolution line',
      'Top-tier in competitive play'
    ]
  },
  'Scorbunny': {
    number: '813',
    types: ['fire'],
    species: 'Rabbit Pokémon',
    height: '0.3 m',
    weight: '4.5 kg',
    abilities: ['Blaze', 'Libero (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'A warm-up of running around gets fire energy coursing through this Pokémon\'s body. Once that happens, it\'s ready to fight at full power.',
    stats: { hp: 50, attack: 71, defense: 40, spAtk: 40, spDef: 40, speed: 69 },
    evolutions: [
      { name: 'Scorbunny', level: 1, id: 813, types: ['fire'] },
      { name: 'Raboot', level: 16, id: 814, types: ['fire'] },
      { name: 'Cinderace', level: 35, id: 815, types: ['fire'] }
    ],
    gigantamax: true,
    strengths: ['Libero ability like Protean', 'Very fast', 'Court Change utility', 'Soccer-themed moves'],
    weaknesses: ['Frail defenses', 'Relies on ability', 'Limited without Libero'],
    notableTrainers: ['Goh', 'Hop'],
    signature: 'Pyro Ball',
    hiddenAbility: 'Libero - Changes type to match move',
    competitiveRole: 'Fast Physical Sweeper',
    tier: 'OU (Libero)',
    funFacts: [
      'Soccer/football themed',
      'Libero is similar to Protean',
      'Very popular in competitive'
    ]
  },
  'Sobble': {
    number: '816',
    types: ['water'],
    species: 'Water Lizard Pokémon',
    height: '0.3 m',
    weight: '4.0 kg',
    abilities: ['Torrent', 'Sniper (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'When scared, this Pokémon cries. Its tears pack the chemical punch of 100 onions, and attackers won\'t be able to resist weeping.',
    stats: { hp: 50, attack: 40, defense: 40, spAtk: 70, spDef: 40, speed: 70 },
    evolutions: [
      { name: 'Sobble', level: 1, id: 816, types: ['water'] },
      { name: 'Drizzile', level: 16, id: 817, types: ['water'] },
      { name: 'Inteleon', level: 35, id: 818, types: ['water'] }
    ],
    gigantamax: true,
    strengths: ['High special attack', 'Fast speed', 'Sniper ability', 'Spy/sniper theme'],
    weaknesses: ['Very frail', 'Poor physical stats', 'Limited movepool'],
    notableTrainers: ['Victor/Gloria', 'Marnie'],
    signature: 'Snipe Shot',
    hiddenAbility: 'Sniper - Critical hits do more damage',
    competitiveRole: 'Special Sweeper',
    tier: 'RU',
    funFacts: [
      'Spy/secret agent themed',
      'Tears are like onions',
      'Becomes a sniper as Inteleon'
    ]
  },
  // Paldea Starters
  'Sprigatito': {
    number: '906',
    types: ['grass'],
    species: 'Grass Cat Pokémon',
    height: '0.4 m',
    weight: '4.1 kg',
    abilities: ['Overgrow', 'Protean (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'The sweet scent its body gives off mesmerizes those around it. The scent grows stronger when this Pokémon is in the sun.',
    stats: { hp: 40, attack: 61, defense: 54, spAtk: 45, spDef: 45, speed: 65 },
    evolutions: [
      { name: 'Sprigatito', level: 1, id: 906, types: ['grass'] },
      { name: 'Floragato', level: 16, id: 907, types: ['grass'] },
      { name: 'Meowscarada', level: 36, id: 908, types: ['grass', 'dark'] }
    ],
    strengths: ['Protean ability', 'Becomes Grass/Dark', 'Good speed', 'Magician theme'],
    weaknesses: ['Frail early on', 'Relies on ability', 'Limited physical bulk'],
    notableTrainers: ['Nemona', 'Arven'],
    signature: 'Flower Trick',
    hiddenAbility: 'Protean - Changes type to match move',
    competitiveRole: 'Fast Physical Sweeper',
    tier: 'OU (Protean)',
    funFacts: [
      'Magician/performer themed',
      'Has Protean like Greninja',
      'Most popular Paldea starter'
    ]
  },
  'Fuecoco': {
    number: '909',
    types: ['fire'],
    species: 'Fire Croc Pokémon',
    height: '0.4 m',
    weight: '9.8 kg',
    abilities: ['Blaze', 'Unaware (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'It lies on warm rocks and uses the heat absorbed by the square plates on its back to create fire energy.',
    stats: { hp: 67, attack: 45, defense: 59, spAtk: 63, spDef: 40, speed: 36 },
    evolutions: [
      { name: 'Fuecoco', level: 1, id: 909, types: ['fire'] },
      { name: 'Crocalor', level: 16, id: 910, types: ['fire'] },
      { name: 'Skeledirge', level: 36, id: 911, types: ['fire', 'ghost'] }
    ],
    strengths: ['Becomes Fire/Ghost', 'Good bulk', 'Unaware ability', 'Unique typing'],
    weaknesses: ['Very slow', 'Poor physical attack', 'Limited early game'],
    notableTrainers: ['Nemona', 'Director Clavell'],
    signature: 'Torch Song',
    hiddenAbility: 'Unaware - Ignores opponent\'s stat changes',
    competitiveRole: 'Bulky Special Attacker',
    tier: 'RU',
    funFacts: [
      'Based on a crocodile and Day of the Dead',
      'Becomes Fire/Ghost type',
      'Singer/performer theme'
    ]
  },
  'Quaxly': {
    number: '912',
    types: ['water'],
    species: 'Duckling Pokémon',
    height: '0.5 m',
    weight: '6.1 kg',
    abilities: ['Torrent', 'Moxie (HA)'],
    genderRatio: { male: 87.5, female: 12.5 },
    description: 'This Pokémon migrated to Paldea from distant lands long ago. The gel secreted by its feathers repels water and grime.',
    stats: { hp: 55, attack: 65, defense: 45, spAtk: 50, spDef: 45, speed: 50 },
    evolutions: [
      { name: 'Quaxly', level: 1, id: 912, types: ['water'] },
      { name: 'Quaxwell', level: 16, id: 913, types: ['water'] },
      { name: 'Quaquaval', level: 36, id: 914, types: ['water', 'fighting'] }
    ],
    strengths: ['Becomes Water/Fighting', 'Moxie ability', 'Dancer theme', 'Good attack stat'],
    weaknesses: ['Average stats', 'Common weaknesses', 'Not particularly fast'],
    notableTrainers: ['Nemona', 'Penny'],
    signature: 'Aqua Step',
    hiddenAbility: 'Moxie - Raises Attack when knocking out foes',
    competitiveRole: 'Physical Sweeper',
    tier: 'RU',
    funFacts: [
      'Dancing/performer themed',
      'Based on a duck and dancer',
      'Water/Fighting is rare typing'
    ]
  }
};

// Get evolution chain for display
export const getEvolutionChain = (starterName: string) => {
  const data = starterData[starterName];
  return data?.evolutions || [];
};