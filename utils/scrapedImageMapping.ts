/**
 * Comprehensive mapping for scraped trainer images based on actual files
 */

import logger from './logger';

type ImageMapping = Record<string, string[]>;

// Gym Leader image mappings - Using organized folder structure
const gymLeaderImages: ImageMapping = {
  // Kanto
  'Brock': [
    '/images/scraped/gym-leaders/brock-2.png'
  ],
  'Misty': [
    '/images/scraped/gym-leaders/misty-1.png',
    '/images/scraped/gym-leaders/misty-2.png'
  ],
  'Lt. Surge': [
    '/images/scraped/gym-leaders/FireRed_LeafGreen_Lt_Surge.png'
  ],
  'Erika': [
    '/images/scraped/gym-leaders/erika-1.png'
  ],
  'Koga': [
    '/images/scraped/gym-leaders/koga-1.png',
    '/images/scraped/gym-leaders/koga-5.png'
  ],
  'Sabrina': [
    '/images/scraped/gym-leaders/sabrina-1.png'
  ],
  'Blaine': [
    '/images/scraped/gym-leaders/blaine-6.png'
  ],
  'Giovanni': [
    '/images/scraped/gym-leaders/giovanni-2.png'
  ],
  
  // Johto
  'Falkner': [
    '/images/scraped/gym-leaders/falkner-2.png'
  ],
  'Bugsy': [
    '/images/scraped/gym-leaders/bugsy-1.png'
  ],
  'Whitney': [
    '/images/scraped/gym-leaders/whitney-4.png'
  ],
  'Morty': [
    '/images/scraped/gym-leaders/morty-2.png'
  ],
  'Chuck': [
    '/images/scraped/gym-leaders/chuck-1.png',
    '/images/scraped/gym-leaders/chuck-5.png'
  ],
  'Jasmine': [
    '/images/scraped/gym-leaders/jasmine-2.png'
  ],
  'Pryce': [
    '/images/scraped/gym-leaders/pryce-2.png',
    '/images/scraped/gym-leaders/pryce-3.png'
  ],
  'Clair': [
    '/images/scraped/gym-leaders/clair-2.png'
  ],
  'Janine': [
    '/images/scraped/gym-leaders/koga-5.png'
  ],
  
  // Hoenn
  'Roxanne': [
    '/images/scraped/gym-leaders/roxanne-1.png'
  ],
  'Brawly': [
    '/images/scraped/gym-leaders/brawly-1.png'
  ],
  'Wattson': [
    '/images/scraped/gym-leaders/wattson-1.png'
  ],
  'Flannery': [
    '/images/scraped/gym-leaders/flannery-1.png'
  ],
  'Norman': [
    '/images/scraped/gym-leaders/norman-1.png'
  ],
  'Winona': [
    '/images/scraped/gym-leaders/winona-1.png'
  ],
  'Tate': [
    '/images/scraped/gym-leaders/tate.png'
  ],
  'Liza': [
    '/images/scraped/gym-leaders/tate.png'
  ],
  'Tate & Liza': [
    '/images/scraped/gym-leaders/tate.png'
  ],
  'Wallace': [
    '/images/scraped/gym-leaders/wallace-1.png'
  ],
  'Juan': [
    '/images/scraped/gym-leaders/wallace-1.png'
  ],
  
  // Sinnoh
  'Roark': [
    '/images/scraped/gym-leaders/roark-1.png'
  ],
  'Gardenia': [
    '/images/scraped/gym-leaders/gardenia-1.png'
  ],
  'Maylene': [
    '/images/scraped/gym-leaders/maylene-2.png'
  ],
  'Crasher Wake': [
    '/images/scraped/gym-leaders/crasher-wake-2.png'
  ],
  'Fantina': [
    '/images/scraped/gym-leaders/fantina-2.png'
  ],
  'Byron': [
    '/images/scraped/gym-leaders/byron-2.png'
  ],
  'Candice': [
    '/images/scraped/gym-leaders/candice-2.png'
  ],
  'Volkner': [
    '/images/scraped/gym-leaders/volkner-3.png'
  ],
  
  // Unova (use available assets under /images/scraped/gym-leaders)
  'Cilan': [
    '/images/scraped/gym-leaders/cilan-2.png'
  ],
  'Chili': [
    '/images/scraped/gym-leaders/chili-1.png',
    '/images/scraped/gym-leaders/chili-2.png'
  ],
  'Cress': [
    '/images/scraped/gym-leaders/cress-1.png'
  ],
  'Cilan/Chili/Cress': [
    '/images/scraped/gym-leaders/cilan-2.png'
  ],
  'Lenora': [
    '/images/scraped/gym-leaders/lenora-1.png'
  ],
  'Burgh': [
    '/images/scraped/gym-leaders/burgh-1.png'
  ],
  'Elesa': [
    '/images/scraped/gym-leaders/elesa-1.png'
  ],
  'Clay': [
    '/images/scraped/gym-leaders/clay-1.png'
  ],
  'Skyla': [
    '/images/scraped/gym-leaders/skyla-1.png'
  ],
  'Brycen': [
    '/images/scraped/gym-leaders/brycen-1.png'
  ],
  'Drayden': [
    '/images/scraped/gym-leaders/drayden-1.png'
  ],
  'Iris': [
    '/images/scraped/gym-leaders/iris-5.png'
  ],
  'Drayden/Iris': [
    '/images/scraped/gym-leaders/drayden-1.png'
  ],
  'Cheren': [
    '/images/scraped/gym-leaders/cheren-1.png'
  ],
  'Roxie': [
    '/images/scraped/gym-leaders/roxie-1.png'
  ],
  'Marlon': [
    '/images/scraped/gym-leaders/marlon-1.png'
  ],
  
  // Kalos (use available assets under /images/scraped/gym-leaders)
  // Note: If a leader isn't listed here, getGymLeaderImage will fall back to placeholder
  'Grant': [
    '/images/scraped/gym-leaders/grant-1.png'
  ],
  'Viola': [
    '/images/scraped/gym-leaders/viola.png'
  ],
  'Korrina': [
    '/images/scraped/gym-leaders/korrina-1.png'
  ],
  'Ramos': [
    '/images/scraped/gym-leaders/ramos.png'
  ],
  'Clemont': [
    '/images/scraped/gym-leaders/clemont-2.png'
  ],
  'Valerie': [
    '/images/scraped/gym-leaders/valerie.png'
  ],
  'Olympia': [
    '/images/scraped/gym-leaders/olympia-1.png'
  ],
  'Wulfric': [
    '/images/scraped/gym-leaders/wulfric.png'
  ],
  
  // Alola
  'Ilima': [
    '/images/scraped/gym-leaders/Sun_Moon_Ilima.png',
    '/images/scraped/gym-leaders/ilima.png'
  ],
  'Lana': [
    '/images/scraped/gym-leaders/lana-alt1.png',
    '/images/scraped/gym-leaders/Sun_Moon_Lana.png'
  ],
  'Kiawe': [
    '/images/scraped/gym-leaders/kiawe.png',
    '/images/scraped/gym-leaders/Sun_Moon_Kiawe.png'
  ],
  'Mallow': [
    '/images/scraped/gym-leaders/mallow.png',
    '/images/scraped/gym-leaders/Sun_Moon_Mallow.png'
  ],
  'Sophocles': [
    '/images/scraped/gym-leaders-organized/sophocles.png'
  ],
  'Acerola': [
    '/images/scraped/gym-leaders-organized/acerola.png'
  ],
  'Mina': [
    '/images/scraped/gym-leaders-organized/mina.png'
  ],
  'Hapu': [
    '/images/scraped/gym-leaders-organized/hapu.png'
  ],
  
  // Galar (normalized to existing files)
  'Milo': [
    '/images/scraped/gym-leaders/milo-alt2.png'
  ],
  'Nessa': [
    '/images/gym-leader-placeholder.svg'
  ],
  'Kabu': [
    '/images/scraped/gym-leaders/kabu.png'
  ],
  'Bea': [
    '/images/scraped/gym-leaders/bea.png'
  ],
  'Bea/Allister': [
    '/images/scraped/gym-leaders/bea.png'
  ],
  'Allister': [
    '/images/gym-leader-placeholder.svg'
  ],
  'Opal': [
    '/images/scraped/gym-leaders/opal.png'
  ],
  'Gordie': [
    '/images/scraped/gym-leaders/gordie-alt2.png'
  ],
  'Gordie/Melony': [
    '/images/scraped/gym-leaders/gordie-alt2.png'
  ],
  'Melony': [
    '/images/scraped/gym-leaders/melony.png'
  ],
  'Piers': [
    '/images/scraped/gym-leaders/piers.png'
  ],
  'Raihan': [
    '/images/scraped/gym-leaders/raihan-3.png'
  ],
  
  // Paldea (normalized to existing files)
  'Katy': [
    '/images/scraped/gym-leaders/katy-4.png'
  ],
  'Brassius': [
    '/images/scraped/gym-leaders/brassius.png'
  ],
  'Iono': [
    '/images/scraped/gym-leaders/iono-1.png'
  ],
  'Kofu': [
    '/images/scraped/gym-leaders/kofu.png'
  ],
  'Larry': [
    '/images/scraped/gym-leaders/Scarlet_Violet_Larry.png'
  ],
  'Ryme': [
    '/images/scraped/gym-leaders/ryme-alt2.png'
  ],
  'Tulip': [
    '/images/gym-leader-placeholder.svg'
  ],
  'Grusha': [
    '/images/scraped/gym-leaders/grusha.png'
  ]
};

// Elite Four image mappings
const eliteFourImages: ImageMapping = {
  // Kanto Elite Four
  'Lorelei': [
    '/images/scraped/elite-four/lorelei-1.png',
    '/images/scraped/elite-four/FireRed_LeafGreen_Lorelei.png'
  ],
  'Bruno': [
    '/images/scraped/elite-four/bruno-2.png',
    '/images/scraped/elite-four/FireRed_LeafGreen_Bruno.png'
  ],
  'Agatha': [
    '/images/scraped/elite-four/agatha-2.png',
    '/images/scraped/elite-four/FireRed_LeafGreen_Agatha.png'
  ],
  'Lance': [
    '/images/scraped/elite-four/lance-9.png',
    '/images/scraped/elite-four/FireRed_LeafGreen_Lance.png'
  ],
  
  // Johto Elite Four
  'Will': [
    '/images/scraped/elite-four/will-1.png',
    '/images/scraped/elite-four/HeartGold_SoulSilver_Will.png'
  ],
  'Koga': [
    '/images/scraped/gym-leaders/koga-1.png'
  ],
  'Bruno (Johto)': [
    '/images/scraped/elite-four/bruno-2.png',
    '/images/scraped/elite-four/HeartGold_SoulSilver_Bruno.png'
  ],
  'Karen': [
    '/images/scraped/elite-four/karen-1.png',
    '/images/scraped/elite-four/HeartGold_SoulSilver_Karen.png'
  ],
  
  // Hoenn Elite Four
  'Sidney': [
    '/images/scraped/elite-four/sidney-1.png',
    '/images/scraped/elite-four/Omega_Ruby_Alpha_Sapphire_Sidney.png'
  ],
  'Phoebe': [
    '/images/scraped/elite-four/phoebe-1.png',
    '/images/scraped/elite-four/Omega_Ruby_Alpha_Sapphire_Phoebe.png'
  ],
  'Glacia': [
    '/images/scraped/elite-four/glacia-1.png',
    '/images/scraped/elite-four/Omega_Ruby_Alpha_Sapphire_Glacia.png'
  ],
  'Drake': [
    '/images/scraped/elite-four/Omega_Ruby_Alpha_Sapphire_Drake.png',
    '/images/scraped/elite-four/drake.png'
  ],
  
  // Sinnoh Elite Four
  'Aaron': [
    '/images/scraped/elite-four/Diamond_Pearl_Aaron.png',
    '/images/scraped/elite-four/aaron.png'
  ],
  'Bertha': [
    '/images/scraped/elite-four/bertha-5.png',
    '/images/scraped/elite-four/Diamond_Pearl_Bertha.png'
  ],
  'Flint': [
    '/images/scraped/elite-four/Diamond_Pearl_Flint.png',
    '/images/scraped/elite-four/flint.png'
  ],
  'Lucian': [
    '/images/scraped/elite-four/lucian-10.png',
    '/images/scraped/elite-four/Diamond_Pearl_Lucian.png'
  ],
  
  // Unova Elite Four
  'Shauntal': [
    '/images/scraped/elite-four/shauntal-9.png',
    '/images/scraped/elite-four/Black_White_Shauntal.png'
  ],
  'Marshal': [
    '/images/scraped/elite-four/marshal-1.png',
    '/images/scraped/elite-four/Black_White_Marshal.png'
  ],
  'Grimsley': [
    '/images/scraped/elite-four/grimsley-1.png',
    '/images/scraped/elite-four/Black_White_Grimsley.png'
  ],
  'Caitlin': [
    '/images/scraped/elite-four/caitlin-2.png',
    '/images/scraped/elite-four/Black_White_Caitlin.png'
  ],
  
  // Kalos Elite Four
  'Malva': [
    '/images/scraped/elite-four/malva-1.png'
  ],
  'Siebold': [
    '/images/scraped/elite-four/siebold-2.png'
  ],
  'Wikstrom': [
    '/images/scraped/elite-four/wikstrom-1.png',
    '/images/scraped/elite-four/XY_Wikstrom.png'
  ],
  'Drasna': [
    '/images/scraped/elite-four/drasna-1.png',
    '/images/scraped/elite-four/XY_Drasna.png'
  ],
  
  // Alola Elite Four
  'Acerola (Elite Four)': [
    '/images/scraped/elite-four/acerola-1.png',
    '/images/scraped/elite-four/Sun_Moon_Acerola.png'
  ],
  'Molayne': [
    '/images/scraped/elite-four/molayne-9.png',
    '/images/scraped/elite-four/Sun_Moon_Molayne.png'
  ],
  'Kahili': [
    '/images/scraped/elite-four/kahili-1.png',
    '/images/scraped/elite-four/Sun_Moon_Kahili.png'
  ],
  'Hala (Elite Four)': [
    '/images/scraped/elite-four/hala-1.png',
    '/images/scraped/elite-four/Sun_Moon_Hala.png'
  ],
  'Olivia (Elite Four)': [
    '/images/scraped/elite-four/olivia-1.png',
    '/images/scraped/elite-four/Sun_Moon_Olivia.png'
  ],
  'Nanu (Elite Four)': [
    '/images/scraped/elite-four/nanu-1.png',
    '/images/scraped/elite-four/Sun_Moon_Nanu.png'
  ],
  'Hapu': [
    '/images/scraped/elite-four/hapu-1.png',
    '/images/scraped/elite-four/Sun_Moon_Hapu.png'
  ],
  
  // Paldea Elite Four
  'Rika': [
    '/images/scraped/elite-four/rika-1.png',
    '/images/scraped/elite-four/Scarlet_Violet_Rika.png'
  ],
  'Poppy': [
    '/images/scraped/elite-four/poppy-2.png',
    '/images/scraped/elite-four/Scarlet_Violet_Poppy.png'
  ],
  'Larry': [
    '/images/scraped/elite-four/larry-1.png',
    '/images/scraped/elite-four/Scarlet_Violet_Larry.png'
  ],
  'Larry (Flying-type Elite Four)': [
    '/images/scraped/elite-four/larry-1.png',
    '/images/scraped/elite-four/Scarlet_Violet_Larry.png'
  ],
  'Hassel': [
    '/images/scraped/elite-four/hassel-1.png',
    '/images/scraped/elite-four/Scarlet_Violet_Hassel.png'
  ]
};

// Champion image mappings (normalized to files we have)
const championImages: ImageMapping = {
  'Blue': ['/images/scraped/champions/blue-1.png'],
  'Red': ['/images/scraped/champions/red-1.png'],
  'Lance (Champion)': ['/images/scraped/champions/lance-1.png'],
  'Lance': ['/images/scraped/champions/lance-1.png'],
  'Steven': ['/images/scraped/champions/steven-1.png'],
  'Wallace (Champion)': ['/images/scraped/champions/wallace-1.png'],
  'Cynthia': ['/images/scraped/champions/cynthia-1.png'],
  'Alder': ['/images/scraped/champions/alder-1.png'],
  'Iris (Champion)': ['/images/scraped/champions/iris-1.png'],
  'Diantha': ['/images/scraped/champions/diantha-1.png'],
  'Kukui': ['/images/scraped/champions/kukui-1.png'],
  'Hau': ['/images/scraped/champions/hau-1.png'],
  'Leon': ['/images/scraped/champions/leon-1.png'],
  'Geeta': ['/images/scraped/champions/geeta-1.png'],
  'Nemona': ['/images/scraped/champions/nemona-1.png']
};

// Badge image mappings
const badgeImages: Record<string, string> = {
  // Kanto badges
  'Boulder Badge': '/images/scraped/badges/boulder-badge.png',
  'Cascade Badge': '/images/scraped/badges/cascade-badge.png',
  'Thunder Badge': '/images/scraped/badges/thunder-badge.png',
  'Rainbow Badge': '/images/scraped/badges/rainbow-badge.png',
  'Soul Badge': '/images/scraped/badges/soul-badge.png',
  'Marsh Badge': '/images/scraped/badges/marsh-badge.png',
  'Volcano Badge': '/images/scraped/badges/volcano-badge.png',
  'Earth Badge': '/images/scraped/badges/earth-badge.png',
  
  // Johto badges
  'Zephyr Badge': '/images/scraped/badges/zephyr-badge.png',
  'Hive Badge': '/images/scraped/badges/hive-badge.png',
  'Plain Badge': '/images/scraped/badges/plain-badge.png',
  'Fog Badge': '/images/scraped/badges/fog-badge.png',
  'Storm Badge': '/images/scraped/badges/storm-badge.png',
  'Mineral Badge': '/images/scraped/badges/mineral-badge.png',
  'Glacier Badge': '/images/scraped/badges/glacier-badge.png',
  'Rising Badge': '/images/scraped/badges/rising-badge.png',
  
  // Hoenn badges
  'Stone Badge': '/images/scraped/badges/stone-badge.png',
  'Knuckle Badge': '/images/scraped/badges/knuckle-badge.png',
  'Dynamo Badge': '/images/scraped/badges/dynamo-badge.png',
  'Heat Badge': '/images/scraped/badges/heat-badge.png',
  'Balance Badge': '/images/scraped/badges/balance-badge.png',
  'Feather Badge': '/images/scraped/badges/feather-badge.png',
  'Mind Badge': '/images/scraped/badges/mind-badge.png',
  'Rain Badge': '/images/scraped/badges/rain-badge.png',
  
  // Sinnoh badges
  'Coal Badge': '/images/scraped/badges/coal-badge.png',
  'Forest Badge': '/images/scraped/badges/forest-badge.png',
  'Cobble Badge': '/images/scraped/badges/cobble-badge.png',
  'Fen Badge': '/images/scraped/badges/fen-badge.png',
  'Relic Badge': '/images/scraped/badges/relic-badge.png',
  'Mine Badge': '/images/scraped/badges/mine-badge.png',
  'Icicle Badge': '/images/scraped/badges/icicle-badge.png',
  'Beacon Badge': '/images/scraped/badges/beacon-badge.png',
  
  // Unova badges
  'Trio Badge': '/images/scraped/badges/trio-badge.png',
  'Basic Badge': '/images/scraped/badges/basic-badge.png',
  'Insect Badge': '/images/scraped/badges/insect-badge.png',
  'Bolt Badge': '/images/scraped/badges/bolt-badge.png',
  'Quake Badge': '/images/scraped/badges/quake-badge.png',
  'Jet Badge': '/images/scraped/badges/jet-badge.png',
  'Freeze Badge': '/images/scraped/badges/freeze-badge.png',
  'Legend Badge': '/images/scraped/badges/legend-badge.png',
  
  // Unova badges (B2W2)
  'Toxic Badge': '/images/scraped/badges/toxic-badge.png',
  'Wave Badge': '/images/scraped/badges/wave-badge.png',
  
  // Kalos badges
  'Bug Badge': '/images/scraped/badges/bug-badge.png',
  'Cliff Badge': '/images/scraped/badges/cliff-badge.png',
  'Rumble Badge': '/images/scraped/badges/rumble-badge.png',
  'Plant Badge': '/images/scraped/badges/plant-badge.png',
  'Voltage Badge': '/images/scraped/badges/voltage-badge.png',
  'Fairy Badge': '/images/scraped/badges/fairy-badge.png',
  'Psychic Badge': '/images/scraped/badges/psychic-badge.png',
  'Iceberg Badge': '/images/scraped/badges/iceberg-badge.png',
  
  // Alola Z-Crystals (instead of badges)
  'Normalium Z': '/images/scraped/badges/normalium-z.png',
  'Waterium Z': '/images/scraped/badges/waterium-z.png',
  'Firium Z': '/images/scraped/badges/firium-z.png',
  'Grassium Z': '/images/scraped/badges/grassium-z.png',
  'Electrium Z': '/images/scraped/badges/electrium-z.png',
  'Ghostium Z': '/images/scraped/badges/ghostium-z.png',
  'Fairium Z': '/images/scraped/badges/fairium-z.png',
  'Groundium Z': '/images/scraped/badges/groundium-z.png',
  
  // Galar badges
  'Grass Badge': '/images/scraped/badges/grass-badge.png',
  'Water Badge': '/images/scraped/badges/water-badge.png',
  'Fire Badge': '/images/scraped/badges/fire-badge.png',
  'Fighting Badge': '/images/scraped/badges/fighting-badge.png',
  'Ghost Badge': '/images/scraped/badges/ghost-badge.png',
  'Fairy Badge (Galar)': '/images/scraped/badges/galarfairy-badge.png',
  'Rock Badge': '/images/scraped/badges/rock-badge.png',
  'Ice Badge': '/images/scraped/badges/ice-badge.png',
  'Dark Badge': '/images/scraped/badges/dark-badge.png',
  'Dragon Badge': '/images/scraped/badges/dragon-badge.png',
  
  // Paldea badges
  'Bug Badge (Paldea)': '/images/scraped/badges/badges-of-paldea-bug-badge.jpg',
  'Grass Badge (Paldea)': '/images/scraped/badges/badges-of-paldea-grass-badge.jpg',
  'Electric Badge': '/images/scraped/badges/svbadge-victoryroad-electric.png',
  'Water Badge (Paldea)': '/images/scraped/badges/badges-of-paldea-water-badge.jpg',
  'Normal Badge': '/images/scraped/badges/svbadge-victoryroad-normal.png',
  'Ghost Badge (Paldea)': '/images/scraped/badges/badges-of-paldea-ghost-badge.jpg',
  'Psychic Badge (Paldea)': '/images/scraped/badges/badges-of-paldea-psychic-badge.jpg',
  'Ice Badge (Paldea)': '/images/scraped/badges/badges-of-paldea-ice-badge.jpg'
};

// Game cover art mappings
const gameCoverArt: ImageMapping = {
  'Red': ['/images/scraped/games/covers/red-en-boxart.png', '/images/scraped/games/covers/red-jp-boxart.png'],
  'Blue': ['/images/scraped/games/covers/blue-en-boxart.png', '/images/scraped/games/covers/blue-jp-boxart.png'],
  'Yellow': ['/images/scraped/games/covers/yellow-en-boxart.png', '/images/scraped/games/covers/yellow-jp-boxart.png'],
  'Gold': ['/images/scraped/games/covers/gold-en-boxart.png', '/images/scraped/games/covers/gold-jp-boxart.png'],
  'Silver': ['/images/scraped/games/covers/silver-en-boxart.png', '/images/scraped/games/covers/silver-jp-boxart.png'],
  'Crystal': ['/images/scraped/games/covers/crystal-en-boxart.png', '/images/scraped/games/covers/crystal-jp-boxart.png'],
  'Ruby': ['/images/scraped/games/covers/ruby-en-boxart.png', '/images/scraped/games/covers/ruby-jp-boxart.jpg'],
  'Sapphire': ['/images/scraped/games/covers/sapphire-en-boxart.png', '/images/scraped/games/covers/sapphire-jp-boxart.jpg'],
  'Emerald': ['/images/scraped/games/covers/emerald-en-boxart.jpg', '/images/scraped/games/covers/emerald-jp-boxart.jpg'],
  'FireRed': ['/images/scraped/games/covers/firered-en-boxart.png', '/images/scraped/games/covers/firered-jp-boxart.png'],
  'LeafGreen': ['/images/scraped/games/covers/leafgreen-en-boxart.png', '/images/scraped/games/covers/leafgreen-jp-boxart.png'],
  'Diamond': ['/images/scraped/games/covers/diamond-en-boxart.jpg', '/images/scraped/games/covers/diamond-jp-boxart.jpg'],
  'Pearl': ['/images/scraped/games/covers/pearl-en-boxart.jpg', '/images/scraped/games/covers/pearl-jp-boxart.jpg'],
  'Platinum': ['/images/scraped/games/covers/platinum-en-boxart.png', '/images/scraped/games/covers/platinum-jp-boxart.jpg'],
  'HeartGold': ['/images/scraped/games/covers/heartgold-en-boxart.jpg', '/images/scraped/games/covers/heartgold-jp-boxart.jpg'],
  'SoulSilver': ['/images/scraped/games/covers/soulsilver-en-boxart.jpg', '/images/scraped/games/covers/soulsilver-jp-boxart.jpg'],
  'Black': ['/images/scraped/games/covers/black-en-boxart.png', '/images/scraped/games/covers/black-jp-boxart.png'],
  'White': ['/images/scraped/games/covers/white-en-boxart.png', '/images/scraped/games/covers/white-jp-boxart.png'],
  'Black 2': ['/images/scraped/games/covers/black-2-en-boxart.png', '/images/scraped/games/covers/black-2-jp-boxart.png'],
  'White 2': ['/images/scraped/games/covers/white-2-en-boxart.png', '/images/scraped/games/covers/white-2-jp-boxart.png'],
  'X': ['/images/scraped/games/covers/x-en-boxart.jpg', '/images/scraped/games/covers/x-jp-boxart.jpg'],
  'Y': ['/images/scraped/games/covers/y-en-boxart.jpg', '/images/scraped/games/covers/y-jp-boxart.jpg'],
  'Omega Ruby': ['/images/scraped/games/covers/omega-ruby-en-boxart.jpg', '/images/scraped/games/covers/omega-ruby-jp-boxart.jpg'],
  'Alpha Sapphire': ['/images/scraped/games/covers/alpha-sapphire-en-boxart.png', '/images/scraped/games/covers/alpha-sapphire-jp-boxart.png'],
  'Sun': ['/images/scraped/games/covers/sun-en-boxart.png', '/images/scraped/games/covers/sun-jp-boxart.png'],
  'Moon': ['/images/scraped/games/covers/moon-en-boxart.png', '/images/scraped/games/covers/moon-jp-boxart.png'],
  'Ultra Sun': ['/images/scraped/games/covers/ultra-sun-en-boxart.png', '/images/scraped/games/covers/ultra-sun-jp-boxart.png'],
  'Ultra Moon': ['/images/scraped/games/covers/ultra-moon-en-boxart.png', '/images/scraped/games/covers/ultra-moon-jp-boxart.png'],
  'Sword': ['/images/scraped/games/covers/sword-en-boxart.jpg', '/images/scraped/games/covers/sword-jp-boxart.jpg'],
  'Shield': ['/images/scraped/games/covers/shield-en-boxart.jpg', '/images/scraped/games/covers/shield-jp-boxart.jpg'],
  'Scarlet': ['/images/scraped/games/covers/scarlet-en-boxart.jpg', '/images/scraped/games/covers/scarlet-jp-boxart.jpg'],
  'Violet': ['/images/scraped/games/covers/violet-en-boxart.jpg', '/images/scraped/games/covers/violet-jp-boxart.jpg']
};

// Professor image mappings
const professorImages: ImageMapping = {
  'Professor Oak': [
    '/images/scraped/Professors/Kanto_Oak.png'
  ],
  'Professor Elm': [
    '/images/scraped/Professors/HeartGold_SoulSilver_Professor_Elm.png'
  ],
  'Professor Birch': [
    '/images/scraped/Professors/Omega_Ruby_Alpha_Sapphire_Professor_Birch.png'
  ],
  'Professor Rowan': [
    '/images/scraped/Professors/Rowan_DP.png'
  ],
  'Professor Juniper': [
    '/images/scraped/Professors/Black_White_Juniper.png'
  ],
  'Professor Sycamore': [
    '/images/scraped/Professors/XY_Professor_Sycamore.png'
  ],
  'Professor Kukui': [
    '/images/scraped/Professors/Sun_Moon_Professor_Kukui.png'
  ],
  'Professor Magnolia': [
    '/images/scraped/Professors/Sword_Shield_Professor_Magnolia.png'
  ],
  'Professor Sonia': [
    '/images/scraped/Professors/Sword_Shield_Sonia.png'
  ],
  'Professor Sada': [
    '/images/scraped/Professors/800px-Scarlet_Sada.png'
  ],
  'Professor Turo': [
    '/images/scraped/Professors/Violet_Turo.png'
  ],
  'Professor Burnet': [
    '/images/scraped/Professors/Professor_Burnet.png'
  ]
};

// Helper functions
export function getGymLeaderImage(name: string, index: number = 1): string {
  const images = gymLeaderImages[name];
  if (!images || images.length === 0) {
    return `/images/gym-leader-placeholder.svg`;
  }
  const actualIndex = Math.min(index - 1, images.length - 1);
  return images[actualIndex];
}

export function getEliteFourImage(name: string, index: number = 1): string {
  const images = eliteFourImages[name];
  if (!images || images.length === 0) {
    return `/images/elite-four-placeholder.svg`;
  }
  const actualIndex = Math.min(index - 1, images.length - 1);
  return images[actualIndex];
}

export function getChampionImage(name: string, index: number = 1): string {
  const images = championImages[name];
  if (!images || images.length === 0) {
    return `/images/champion-placeholder.svg`;
  }
  const actualIndex = Math.min(index - 1, images.length - 1);
  return images[actualIndex];
}

export function getBadgeImage(badgeName: string, region?: string): string {
  return badgeImages[badgeName] || `/images/badge-placeholder.svg`;
}

type MapVariant = 'main' | string;

// Map region to its scraped map images
export const getRegionMap = (regionName: string, variant: MapVariant = 'main'): string => {
  const normalized = regionName.toLowerCase();
  
  // Special mappings for actual file names
  const regionMappings: Record<string, string> = {
    'kanto': '/images/scraped/maps/PE_Kanto_Map.png',
    'johto': '/images/scraped/maps/JohtoMap.png',
    'hoenn': '/images/scraped/maps/Hoenn_ORAS.png',
    'sinnoh': '/images/scraped/maps/Sinnoh_BDSP_artwork.png',
    'unova': '/images/scraped/maps/Unova_B2W2_alt.png',
    'kalos': '/images/scraped/maps/Kalos_map.png',
    'alola': '/images/scraped/maps/Alola_USUM_artwork.png',
    'galar': '/images/scraped/maps/Galar_artwork.png',
    'paldea': '/images/scraped/maps/Paldea_artwork.png'
  };
  
  return regionMappings[normalized] || `/images/scraped/maps/${normalized}.png`;
};

// Get game cover art paths
export function getGameCoverArt(gameName: string): string[] {
  const paths = gameCoverArt[gameName];
  if (!paths || paths.length === 0) {
    return ['/images/game-cover-placeholder.svg'];
  }
  return paths;
}

// Get game logo path
export function getGameLogo(gameName: string): string {
  // For now, using the same mapping as cover art
  // Could be expanded to have separate logo mappings if needed
  return getGameCoverArt(gameName)[0];
}

// Get professor image path
export function getProfessorImage(name: string): string {
  const images = professorImages[name];
  if (!images || images.length === 0) {
    // Try to find a fallback with a more generic search
    logger.debug(`Professor image not found for: ${name}`);
    return '/images/professor-placeholder.svg';
  }
  return images[0];
}

// Export all mappings for reference
export {
  gymLeaderImages,
  eliteFourImages,
  championImages,
  badgeImages,
  gameCoverArt,
  professorImages
};