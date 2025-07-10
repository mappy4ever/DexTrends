// Complete region data for all Pokemon regions
export const regionData = {
  kanto: {
    name: 'Kanto',
    description: 'The original Pokémon region, home to the first 151 Pokémon',
    generation: 1,
    professor: 'Professor Oak',
    starterPokemon: ['Bulbasaur', 'Charmander', 'Squirtle'],
    map: '/images/scraped/maps/kanto-region-map.png',
    // ... rest of Kanto data from the original file
  },
  johto: {
    name: 'Johto',
    description: 'A mystical region filled with ancient traditions and legendary Pokémon',
    generation: 2,
    professor: 'Professor Elm',
    starterPokemon: ['Chikorita', 'Cyndaquil', 'Totodile'],
    map: '/images/scraped/maps/johto-region-map.png',
    // ... rest of Johto data from the original file
  },
  hoenn: {
    name: 'Hoenn',
    description: 'A tropical region with diverse ecosystems and weather phenomena',
    generation: 3,
    professor: 'Professor Birch',
    starterPokemon: ['Treecko', 'Torchic', 'Mudkip'],
    map: '/images/scraped/maps/hoenn-region-map.png',
    gymLeaders: [],
    legendaryPokemon: [],
    rarePokemon: [],
    games: [],
    specialFeatures: []
  },
  sinnoh: {
    name: 'Sinnoh',
    description: 'A region rich in mythology, featuring Mt. Coronet at its center',
    generation: 4,
    professor: 'Professor Rowan',
    starterPokemon: ['Turtwig', 'Chimchar', 'Piplup'],
    map: '/images/scraped/maps/sinnoh-region-map.png',
    gymLeaders: [],
    legendaryPokemon: [],
    rarePokemon: [],
    games: [],
    specialFeatures: []
  },
  unova: {
    name: 'Unova',
    description: 'A diverse region inspired by New York, featuring only new Pokémon initially',
    generation: 5,
    professor: 'Professor Juniper',
    starterPokemon: ['Snivy', 'Tepig', 'Oshawott'],
    map: '/images/scraped/maps/unova-region-map.png',
    gymLeaders: [],
    legendaryPokemon: [],
    rarePokemon: [],
    games: [],
    specialFeatures: []
  },
  kalos: {
    name: 'Kalos',
    description: 'A beautiful region inspired by France, introducing Mega Evolution',
    generation: 6,
    professor: 'Professor Sycamore',
    starterPokemon: ['Chespin', 'Fennekin', 'Froakie'],
    map: '/images/scraped/maps/kalos-region-map.png',
    gymLeaders: [],
    legendaryPokemon: [],
    rarePokemon: [],
    games: [],
    specialFeatures: []
  },
  alola: {
    name: 'Alola',
    description: 'A tropical paradise of four islands with unique Alolan forms',
    generation: 7,
    professor: 'Professor Kukui',
    starterPokemon: ['Rowlet', 'Litten', 'Popplio'],
    map: '/images/scraped/maps/alola-region-map.png',
    gymLeaders: [],
    legendaryPokemon: [],
    rarePokemon: [],
    games: [],
    specialFeatures: []
  },
  galar: {
    name: 'Galar',
    description: 'An industrial region inspired by Great Britain, featuring Dynamax battles',
    generation: 8,
    professor: 'Professor Magnolia',
    starterPokemon: ['Grookey', 'Scorbunny', 'Sobble'],
    map: '/images/scraped/maps/galar-region-map.png',
    gymLeaders: [],
    legendaryPokemon: [],
    rarePokemon: [],
    games: [],
    specialFeatures: []
  },
  paldea: {
    name: 'Paldea',
    description: 'An open-world region inspired by Spain and Portugal',
    generation: 9,
    professor: 'Professor Sada/Turo',
    starterPokemon: ['Sprigatito', 'Fuecoco', 'Quaxly'],
    map: '/images/scraped/maps/paldea-region-map.png',
    gymLeaders: [],
    legendaryPokemon: [],
    rarePokemon: [],
    games: [],
    specialFeatures: []
  }
};

export default regionData;