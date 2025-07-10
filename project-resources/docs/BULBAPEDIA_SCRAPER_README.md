# 🔧 DexTrends Bulbapedia Scraper

A comprehensive scraping system that downloads Pokemon data and images from Bulbapedia for local storage, eliminating external dependencies and improving user experience.

## 🎯 Why This Scraper?

- **No External Redirects**: Keep users on your site instead of redirecting to Bulbapedia
- **Reliable Images**: Download and store images locally to prevent broken image links
- **Faster Loading**: Local data loads faster than API calls
- **Offline Capability**: Your site works even if Bulbapedia is down
- **Better UX**: Consistent experience without external dependencies

## 🏗️ System Architecture

### Core Components

```
utils/scrapers/
├── scraperConfig.js      # Configuration for all scrapers
├── scraperUtils.js       # Core utilities (downloading, parsing, etc.)
├── gymLeaderScraper.js   # Gym leader data scraper
├── gameScraper.js        # Pokemon game data scraper
└── localDataLoader.js    # React hooks for loading local data

scripts/
└── runScraper.js         # CLI tool for running scrapers

public/
├── data/scraped/         # Scraped JSON data
└── images/scraped/       # Downloaded images
```

### Data Storage Structure

```
public/
├── data/scraped/
│   ├── gym-leaders/
│   │   ├── all-gym-leaders.json
│   │   ├── kanto-gym-leaders.json
│   │   ├── johto-gym-leaders.json
│   │   └── ...
│   ├── games/
│   │   └── all-games.json
│   └── cache/            # Temporary cache files
└── images/scraped/
    ├── gym-leaders/      # Gym leader images
    ├── games/           # Game cover art and logos
    ├── pokemon/         # Pokemon artwork
    └── badges/          # Gym badges
```

## 🚀 Quick Start

### 1. Setup Directories

```bash
node scripts/runScraper.js setup
```

### 2. Scrape Gym Leaders

```bash
# Scrape all gym leaders
node scripts/runScraper.js gym-leaders

# Scrape specific region only
node scripts/runScraper.js gym-leaders --region kanto
```

### 3. Scrape Games

```bash
node scripts/runScraper.js games
```

### 4. Scrape Everything

```bash
node scripts/runScraper.js all
```

## 📋 CLI Commands

### Basic Commands

| Command | Description |
|---------|------------|
| `setup` | Create required directories |
| `gym-leaders` | Scrape all gym leader data and images |
| `games` | Scrape Pokemon game data and images |
| `all` | Scrape everything (gym-leaders + games) |
| `help` | Show help information |

### Options

| Option | Description |
|--------|------------|
| `--region [region]` | Only scrape specific region (gym-leaders only) |
| `--cache` | Use cached data when available |
| `--no-images` | Skip image downloads |
| `--verbose` | Show detailed logging |

### Examples

```bash
# Setup directories
node scripts/runScraper.js setup

# Scrape only Kanto gym leaders
node scripts/runScraper.js gym-leaders --region kanto

# Scrape games with verbose logging
node scripts/runScraper.js games --verbose

# Scrape everything without downloading images
node scripts/runScraper.js all --no-images
```

## 🎮 Using Scraped Data in React

### Gym Leaders Hook

```javascript
import { useGymLeaders } from '../utils/localDataLoader';

function GymLeadersComponent() {
  // Load all gym leaders
  const { data: allLeaders, loading, error } = useGymLeaders();
  
  // Load specific region
  const { data: kantoLeaders } = useGymLeaders('kanto');
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {allLeaders && (
        <div>
          {Object.entries(allLeaders).map(([region, leaders]) => (
            <div key={region}>
              <h2>{region} Leaders</h2>
              {leaders.map(leader => (
                <div key={leader.id}>
                  <img src={leader.image} alt={leader.name} />
                  <h3>{leader.name}</h3>
                  <p>Type: {leader.type}</p>
                  <p>City: {leader.city}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Games Hook

```javascript
import { useGames } from '../utils/localDataLoader';

function GamesComponent() {
  const { data: games, loading, error } = useGames();
  
  return (
    <div>
      {games.map(game => (
        <div key={game.id}>
          <img src={game.images.cover} alt={game.title} />
          <h3>{game.title}</h3>
          <p>Platform: {game.platform}</p>
          <p>Region: {game.region}</p>
        </div>
      ))}
    </div>
  );
}
```

### Direct Data Loading

```javascript
import { loadDataWithFallback } from '../utils/localDataLoader';

async function loadCustomData() {
  // Load all gym leaders with fallback
  const gymLeaders = await loadDataWithFallback('gymLeaders');
  
  // Load specific region
  const kantoLeaders = await loadDataWithFallback('gymLeaders', 'kanto');
  
  // Load games
  const games = await loadDataWithFallback('games');
  
  return { gymLeaders, kantoLeaders, games };
}
```

## ⚙️ Configuration

### Scraper Targets

Edit `utils/scrapers/scraperConfig.js` to customize what gets scraped:

```javascript
targets: {
  gymLeaders: {
    kanto: {
      pages: ['Brock', 'Misty', 'Lt._Surge', /* ... */]
    }
    // Add more regions
  },
  games: {
    mainSeries: [
      'Pokémon_Red_and_Blue',
      'Pokémon_Gold_and_Silver',
      // Add more games
    ]
  }
}
```

### Storage Paths

```javascript
storage: {
  dataDir: '/public/data/scraped',
  imagesDir: '/public/images/scraped',
  gymLeadersDir: '/public/images/scraped/gym-leaders',
  gamesDir: '/public/images/scraped/games'
}
```

### Scraping Settings

```javascript
settings: {
  requestDelay: 1000,      // 1 second between requests
  retryAttempts: 3,        // Retry failed requests
  timeout: 30000,          // 30 second timeout
  maxFileSize: 5242880     // 5MB max file size
}
```

## 📊 Data Structures

### Gym Leader Data

```javascript
{
  id: 'brock',
  name: 'Brock',
  region: 'kanto',
  city: 'Pewter City',
  type: 'rock',
  badge: 'Boulder Badge',
  image: '/images/scraped/gym-leaders/brock-artwork.png',
  team: [
    {
      name: 'Geodude',
      level: 12,
      type1: 'rock',
      type2: 'ground'
    }
  ],
  quote: 'The best defense is a good offense!',
  description: 'The Gym Leader of Pewter City...',
  generation: 1
}
```

### Game Data

```javascript
{
  id: 'pokemon-red-blue',
  title: 'Pokémon Red and Blue',
  region: 'Kanto',
  platform: 'Game Boy',
  releaseDate: '1996',
  generation: 1,
  images: {
    cover: '/images/scraped/games/pokemon-red-blue-cover.png',
    logo: '/images/scraped/games/pokemon-red-blue-logo.png',
    artwork: ['/images/scraped/games/pokemon-red-blue-artwork-1.png']
  },
  description: 'The games that started it all...',
  features: ['Original 151 Pokémon', 'Turn-based battles']
}
```

## 🔧 Extending the Scraper

### Add New Scrapers

1. Create new scraper in `utils/scrapers/`
2. Follow the pattern from existing scrapers
3. Add configuration to `scraperConfig.js`
4. Update the CLI script

Example Pokemon scraper:

```javascript
// utils/scrapers/pokemonScraper.js
class PokemonScraper {
  async scrapeAllPokemon() {
    // Implementation
  }
  
  async scrapePokemon(pokemonName) {
    // Implementation
  }
}
```

### Add New Data Loaders

```javascript
// utils/localDataLoader.js
export class PokemonLoader {
  static async loadAll() {
    return await loadLocalData('pokemon', 'all-pokemon.json');
  }
  
  static async loadByGeneration(gen) {
    return await loadLocalData('pokemon', `gen-${gen}-pokemon.json`);
  }
}

export function usePokemon(generation = null) {
  // React hook implementation
}
```

## 🛠️ Troubleshooting

### Common Issues

**Images not loading:**
- Check if images directory exists: `public/images/scraped/`
- Verify image paths in JSON files
- Run scraper with `--verbose` for detailed logs

**Data not found:**
- Ensure you've run the scraper: `node scripts/runScraper.js all`
- Check if JSON files exist in `public/data/scraped/`
- Fallback data will be used if scraped data unavailable

**Rate limiting:**
- Increase `requestDelay` in `scraperConfig.js`
- Use `--cache` option to avoid re-scraping

**Network errors:**
- Check internet connection
- Some Bulbapedia pages might be temporarily unavailable
- Scraper will retry failed requests automatically

### Debug Mode

```bash
# Run with verbose logging
node scripts/runScraper.js gym-leaders --verbose

# Check what data is available
ls -la public/data/scraped/
ls -la public/images/scraped/
```

## 📝 Development Notes

### Adding New Regions

1. Add region to `scraperConfig.js`:
```javascript
targets: {
  gymLeaders: {
    newRegion: {
      pages: ['Leader1', 'Leader2', /* ... */]
    }
  }
}
```

2. Add color theme to `regionData` in gym-leaders page

### Performance Optimization

- **Caching**: Scraped data is cached for 24 hours
- **Rate Limiting**: Built-in delays prevent overwhelming Bulbapedia
- **Chunked Downloads**: Large datasets processed in batches
- **Error Recovery**: Failed requests automatically retried

### Future Enhancements

- [ ] Pokemon species scraper
- [ ] Move descriptions scraper  
- [ ] Ability details scraper
- [ ] Evolution chain scraper
- [ ] Type effectiveness scraper
- [ ] Location data scraper

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your scraper following existing patterns
4. Test thoroughly with `--verbose` flag
5. Submit a pull request

## 📄 License

This scraper is for educational and personal use only. Respect Bulbapedia's terms of service and don't overwhelm their servers.

---

**Made with ❤️ for the Pokemon community**