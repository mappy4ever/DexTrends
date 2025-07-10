// Utility to map scraped images to characters and regions
// Handles inconsistent naming conventions across scraped data

// Helper to normalize character names for matching
const normalizeCharacterName = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .replace(/professor|prof|dr|mr|ms|mrs/g, '') // Remove titles
    .trim();
};

// Map gym leaders to their scraped images
export const getGymLeaderImage = (leaderName, imageNumber = 1) => {
  const normalized = normalizeCharacterName(leaderName);
  
  // Special cases for names that differ in scraped data
  const nameMapping = {
    'ltsurge': 'surge',
    'tatandliza': 'tate',
    'tateliza': 'tate',
    'crasherwake': 'wake',
    'cilan': 'cilan',
    'chili': 'chili', 
    'cress': 'cress',
    'drayden': 'drayden',
    'iris': 'iris'
  };
  
  const mappedName = nameMapping[normalized] || normalized;
  
  // Try different formats
  const possiblePaths = [
    `/images/scraped/gym-leaders/${mappedName}-${imageNumber}.png`,
    `/images/scraped/gym-leaders/${mappedName}-${imageNumber}.jpg`,
    `/images/scraped/gym-leaders/${leaderName.toLowerCase()}-${imageNumber}.png`,
    `/images/scraped/gym-leaders/${leaderName.toLowerCase()}-${imageNumber}.jpg`
  ];
  
  // Return first valid path or fallback
  return possiblePaths[0]; // In production, you'd check if file exists
};

// Map badges to their scraped images
export const getBadgeImage = (badgeName, region = null) => {
  const normalized = badgeName.toLowerCase().replace(/\s+/g, '-');
  const regionNormalized = region ? region.toLowerCase() : null;
  
  // Try different badge naming patterns
  const possiblePaths = [
    `/images/scraped/badges/${normalized}.png`,
    `/images/scraped/badges/${normalized}-badge.png`,
    `/images/scraped/badges/${normalized.replace('-badge', '')}-badge.png`,
    regionNormalized ? `/images/scraped/badges/${regionNormalized}${normalized}.png` : null,
    regionNormalized ? `/images/scraped/badges/${regionNormalized}-${normalized}.png` : null,
    regionNormalized ? `/images/scraped/badges/badges-of-${regionNormalized}-${normalized}.jpg` : null,
    regionNormalized ? `/images/scraped/badges/svbadge-${normalized.replace('-badge', '')}.png` : null,
    regionNormalized === 'galar' ? `/images/scraped/badges/galar${normalized.replace('-badge', '')}-badge.png` : null
  ].filter(Boolean);
  
  return possiblePaths[0];
};

// Map elite four members to their scraped images
export const getEliteFourImage = (memberName, imageNumber = 1) => {
  const normalized = normalizeCharacterName(memberName);
  
  // Return the first path that should work based on scraped data structure
  return `/images/scraped/elite-four/${normalized}-${imageNumber}.png`;
};

// Map champions to their scraped images  
export const getChampionImage = (championName, imageNumber = 1) => {
  const normalized = normalizeCharacterName(championName);
  
  // Handle special cases - expanded list based on scraped data
  const nameMapping = {
    'blue': 'blue',
    'red': 'red', 
    'steven': 'steven-stone',
    'stevenstone': 'steven-stone',
    'wallace': 'wallace',
    'cynthia': 'cynthia',
    'alder': 'alder',
    'iris': 'iris',
    'diantha': 'diantha',
    'kukui': 'kukui',
    'hau': 'hau',
    'leon': 'leon',
    'geeta': 'geeta',
    'nemona': 'nemona',
    'lance': 'lance'
  };
  
  const mappedName = nameMapping[normalized] || normalized;
  
  // Return the first path that should work based on scraped data structure
  return `/images/scraped/champions/${mappedName}-${imageNumber}.png`;
};

// Map region to its scraped map images
export const getRegionMap = (regionName, variant = 'main') => {
  const normalized = regionName.toLowerCase();
  
  // Special mappings for actual file names
  const regionMappings = {
    'kanto': ['PE_Kanto_Map'],
    'johto': ['JohtoMap'],
    'hoenn': ['Hoenn_ORAS'],
    'sinnoh': ['Sinnoh_BDSP_artwork'],
    'unova': ['Unova_B2W2_alt'],
    'kalos': ['Kalos_alt'],
    'alola': ['Alola_USUM_artwork'],
    'galar': ['Galar_artwork'],
    'paldea': ['Paldea_artwork']
  };
  
  const baseNames = regionMappings[normalized] || [normalized];
  
  // Return the first valid option
  for (const baseName of baseNames) {
    const path = `/images/scraped/maps/${baseName}.png`;
    // In production, we'd check if file exists
    // For now, return the most likely path
    return path;
  }
  
  return `/images/scraped/maps/${normalized}.png`;
};

// Get all available images for a character
export const getAllCharacterImages = (characterName, type = 'gym-leader') => {
  const imageCount = {
    'gym-leader': 10, // Updated based on actual scraped data
    'elite-four': 10,
    'champion': 10
  };
  
  const getImageFunction = {
    'gym-leader': getGymLeaderImage,
    'elite-four': getEliteFourImage,
    'champion': getChampionImage
  };
  
  const images = [];
  const maxImages = imageCount[type] || 5;
  const getImage = getImageFunction[type];
  
  for (let i = 1; i <= maxImages; i++) {
    images.push(getImage(characterName, i));
  }
  
  return images;
};

// Energy type to scraped energy card mapping
export const getEnergyCardImage = (type) => {
  const typeMapping = {
    'fire': 'basicfireenergyobsidianflames230',
    'water': 'basicwaterenergyobsidianflames231',
    'grass': 'basicgrassenergyobsidianflames232',
    'electric': 'basiclightningenergyobsidianflames233',
    'psychic': 'basicpsychicenergyobsidianflames234',
    'fighting': 'basicfightingenergyobsidianflames235',
    'darkness': 'basicdarknessenergyobsidianflames236',
    'metal': 'basicmetalenergyobsidianflames237',
    'fairy': 'basicfairyenergyxykalosstartersetfairyenergy',
    'normal': 'doublecolorlessenergybaseset96',
    'dragon': 'doubledragonenergypokemontradingcardgameclassicenergy'
  };
  
  const cardName = typeMapping[type.toLowerCase()] || typeMapping['normal'];
  return `/images/scraped/energy/${cardName}.jpg`;
};

// Check if image exists (in production, implement actual file checking)
export const imageExists = async (path) => {
  try {
    // In production, make a HEAD request or use fs
    return true; // Placeholder
  } catch {
    return false;
  }
};

// Get best available image with fallback
export const getBestImage = async (paths, fallback = null) => {
  for (const path of paths) {
    if (await imageExists(path)) {
      return path;
    }
  }
  return fallback;
};

// Get game cover art
export const getGameCoverArt = (gameName) => {
  const normalized = gameName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const gameMapping = {
    'red': 'pokemon-red-kanto-boxart',
    'blue': 'pokemon-blue-kanto-boxart',
    'yellow': 'pokemon-yellow-kanto-boxart',
    'gold': 'pokemon-gold-johto-boxart',
    'silver': 'pokemon-silver-johto-boxart',
    'crystal': 'pokemon-crystal-johto-boxart',
    'ruby': 'pokemon-ruby-hoenn-boxart',
    'sapphire': 'pokemon-sapphire-hoenn-boxart',
    'emerald': 'pokemon-emerald-hoenn-boxart',
    'firered': 'pokemon-firered-kanto-boxart',
    'leafgreen': 'pokemon-leafgreen-kanto-boxart',
    'diamond': 'pokemon-diamond-sinnoh-boxart',
    'pearl': 'pokemon-pearl-sinnoh-boxart',
    'platinum': 'pokemon-platinum-sinnoh-boxart',
    'heartgold': 'pokemon-heartgold-johto-boxart',
    'soulsilver': 'pokemon-soulsilver-johto-boxart',
    'black': 'pokemon-black-unova-boxart',
    'white': 'pokemon-white-unova-boxart',
    'black2': 'pokemon-black-2-unova-boxart',
    'white2': 'pokemon-white-2-unova-boxart',
    'x': 'pokemon-x-kalos-boxart',
    'y': 'pokemon-y-kalos-boxart',
    'omegaruby': 'pokemon-omega-ruby-hoenn-boxart',
    'alphasapphire': 'pokemon-alpha-sapphire-hoenn-boxart',
    'sun': 'pokemon-sun-alola-boxart',
    'moon': 'pokemon-moon-alola-boxart',
    'ultrasun': 'pokemon-ultra-sun-alola-boxart',
    'ultramoon': 'pokemon-ultra-moon-alola-boxart',
    'sword': 'pokemon-sword-galar-boxart',
    'shield': 'pokemon-shield-galar-boxart',
    'brilliantdiamond': 'pokemon-brilliant-diamond-sinnoh-boxart',
    'shiningpearl': 'pokemon-shining-pearl-sinnoh-boxart',
    'scarlet': 'pokemon-scarlet-paldea-boxart',
    'violet': 'pokemon-violet-paldea-boxart'
  };
  
  const mappedName = gameMapping[normalized] || normalized;
  
  return [
    `/images/scraped/games/covers/${mappedName}.png`,
    `/images/scraped/games/covers/${mappedName}.jpg`,
    `/images/scraped/games/covers/${gameName.toLowerCase()}.png`
  ];
};

// Get game logo
export const getGameLogo = (gameName) => {
  const normalized = gameName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return [
    `/images/scraped/games/logos/${normalized}-logo.png`,
    `/images/scraped/games/logos/${normalized}.png`,
    `/images/scraped/games/logos/pokemon-${normalized}-logo.png`
  ];
};

// Get type icon
export const getTypeIcon = (type, style = 'sv') => {
  const typeNormalized = type.toLowerCase();
  
  const styleMapping = {
    'sv': 'tp',
    'battrio': 'battrio',
    'tretta': 'tretta',
    'modern': 'tp'
  };
  
  const prefix = styleMapping[style] || 'tp';
  
  return [
    `/images/scraped/type-icons/${prefix}-${typeNormalized}-type-sv.png`,
    `/images/scraped/type-icons/${prefix}-${typeNormalized}-type.png`,
    `/images/scraped/type-icons/battrio-${typeNormalized}-type.png`,
    `/images/scraped/type-icons/${typeNormalized}-type.png`
  ];
};

// Get TCG Pocket icon
export const getTCGPocketIcon = (iconName) => {
  const normalized = iconName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return [
    `/images/scraped/tcg-pocket/icons/tcgp-profile-icon-${normalized}.png`,
    `/images/scraped/tcg-pocket/icons/${normalized}.png`,
    `/images/scraped/tcg-pocket/icons/tcg-pocket-${normalized}.png`
  ];
};

// Get TCG rarity indicator
export const getTCGRarity = (rarity) => {
  const normalized = rarity.toLowerCase();
  
  return `/images/scraped/tcg-pocket/rarity/tcg-pocket-rarity-${normalized}.png`;
};

// Get route or location map
export const getLocationMap = (region, location) => {
  const regionNorm = region.toLowerCase();
  const locationNorm = location.toLowerCase().replace(/\s+/g, '-');
  
  return [
    `/images/scraped/maps/${regionNorm}-${locationNorm}-map.png`,
    `/images/scraped/maps/${regionNorm}-${locationNorm}.png`,
    `/images/scraped/maps/${locationNorm}-map.png`
  ];
};

// Get all gym leader images for a region
export const getRegionGymLeaders = (region) => {
  const gymLeadersByRegion = {
    kanto: ['brock', 'misty', 'surge', 'erika', 'koga', 'sabrina', 'blaine', 'giovanni'],
    johto: ['falkner', 'bugsy', 'whitney', 'morty', 'chuck', 'jasmine', 'pryce', 'clair'],
    hoenn: ['roxanne', 'brawly', 'wattson', 'flannery', 'norman', 'winona', 'tate', 'liza', 'wallace', 'juan'],
    sinnoh: ['roark', 'gardenia', 'fantina', 'maylene', 'wake', 'byron', 'candice', 'volkner'],
    unova: ['cilan', 'chili', 'cress', 'lenora', 'burgh', 'elesa', 'clay', 'skyla', 'brycen', 'drayden', 'iris', 'roxie', 'marlon'],
    kalos: ['viola', 'grant', 'korrina', 'ramos', 'clemont', 'valerie', 'olympia', 'wulfric'],
    alola: [], // No gym leaders, has trial captains instead
    galar: ['milo', 'nessa', 'kabu', 'bea', 'allister', 'opal', 'gordie', 'melony', 'piers', 'raihan'],
    paldea: ['katy', 'brassius', 'iono', 'kofu', 'larry', 'ryme', 'tulip', 'grusha']
  };
  
  const leaders = gymLeadersByRegion[region.toLowerCase()] || [];
  return leaders.map(leader => ({
    name: leader,
    images: getAllCharacterImages(leader, 'gym-leader')
  }));
};

// Check if we have a scraped image for a specific character
export const hasScrapedImage = (characterName, type = 'gym-leader') => {
  // This would need actual file system checking in production
  // For now, return true for known characters
  const knownCharacters = {
    'gym-leader': ['brock', 'misty', 'surge', 'erika', 'koga', 'sabrina', 'blaine', 'giovanni',
                   'falkner', 'bugsy', 'whitney', 'morty', 'chuck', 'jasmine', 'pryce', 'clair',
                   'roxanne', 'brawly', 'wattson', 'flannery', 'norman', 'winona', 'tate', 'liza', 'wallace'],
    'elite-four': ['lorelei', 'bruno', 'agatha', 'lance', 'will', 'karen', 'sidney', 'phoebe', 'glacia', 'drake'],
    'champion': ['blue', 'lance', 'steven', 'wallace', 'cynthia', 'alder', 'iris', 'diantha', 'kukui', 'hau', 'leon', 'geeta']
  };
  
  const normalized = normalizeCharacterName(characterName);
  return knownCharacters[type]?.includes(normalized) || false;
};