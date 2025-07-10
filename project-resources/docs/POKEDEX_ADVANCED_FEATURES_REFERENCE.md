# Pokédex Advanced Features Reference

This file contains all the advanced functionality that needs to be restored to the Pokédex page, organized by category.

## Missing Core Features

### 1. Advanced State Management
```javascript
// Missing state variables that need to be restored:
const [allPokemon, setAllPokemon] = useState([]);
const [loadingProgress, setLoadingProgress] = useState(0);
const [searchTerm, setSearchTerm] = useState("");
const [selectedType, setSelectedType] = useState("");
const [selectedGeneration, setSelectedGeneration] = useState("");
const [selectedCategory, setSelectedCategory] = useState("");
const [selectedStage, setSelectedStage] = useState("");
const [sortBy, setSortBy] = useState("id");
const [visibleCount, setVisibleCount] = useState(48);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

// New states for search-triggered filtering
const [pendingSearchTerm, setPendingSearchTerm] = useState("");
const [pendingTypes, setPendingTypes] = useState([]);
const [pendingGeneration, setPendingGeneration] = useState("");
const [pendingCategories, setPendingCategories] = useState([]);
const [pendingStages, setPendingStages] = useState([]);
const [pendingSortBy, setPendingSortBy] = useState("id");
```

### 2. Advanced Pokemon Data Enhancement
```javascript
// Enhanced Pokemon data with additional properties
const enhancePokemonData = (details, speciesData = null) => {
  const generation = getGeneration(details.id);
  const isLegendary = speciesData?.is_legendary || false;
  const isMythical = speciesData?.is_mythical || false;
  const isUltraBeast = speciesData?.genera?.some(g => g.genus.toLowerCase().includes('ultra beast')) || false;
  
  // Determine evolution stage based on evolution chain position
  let stage = 1; // Default to first stage
  if (details.name.includes('-mega') || details.name.includes('-gmax')) {
    stage = 'mega';
  } else if (isLegendary || isMythical) {
    stage = 'legendary';
  }
  
  return {
    id: details.id,
    name: details.name,
    types: details.types.map(t => t.type.name),
    sprite: details.sprites?.other?.["official-artwork"]?.front_default || details.sprites?.front_default,
    height: details.height,
    weight: details.weight,
    generation,
    isLegendary,
    isMythical,
    isUltraBeast,
    stage,
    baseStats: details.stats.reduce((acc, stat) => acc + stat.base_stat, 0),
  };
};
```

### 3. Batch Pokemon Loading (1010 Pokemon)
```javascript
// Load all Pokemon progressively with enhanced data
const fetchPokemonBatch = async (start, count) => {
  try {
    const promises = [];
    for (let i = start; i < start + count && i <= 1010; i++) {
      promises.push(
        fetchData(`https://pokeapi.co/api/v2/pokemon/${i}`)
          .then(async details => {
            try {
              const speciesData = await fetchData(details.species.url);
              return enhancePokemonData(details, speciesData);
            } catch {
              return enhancePokemonData(details);
            }
          })
          .catch(err => {
            return {
              id: i,
              name: `pokemon-${i}`,
              types: [],
              sprite: "/dextrendslogo.png",
              height: 0,
              weight: 0,
              generation: getGeneration(i),
              isLegendary: false,
              isMythical: false,
              isUltraBeast: false,
              stage: 1,
              baseStats: 0,
            };
          })
      );
    }
    return Promise.all(promises);
  } catch (err) {
    return [];
  }
};

const loadAllPokemon = async () => {
  setLoading(true);
  try {
    const totalPokemon = 1010;
    const batchSize = 50;
    let allPokemonData = [];
    
    for (let start = 1; start <= totalPokemon; start += batchSize) {
      const count = Math.min(batchSize, totalPokemon - start + 1);
      const batch = await fetchPokemonBatch(start, count);
      allPokemonData = [...allPokemonData, ...batch];
      
      // Update progress
      const progress = Math.round((start + count - 1) / totalPokemon * 100);
      setLoadingProgress(progress);
      
      // Update allPokemon but only show first 48 initially
      setAllPokemon([...allPokemonData]);
      if (allPokemonData.length <= 48) {
        setPokemon([...allPokemonData]);
      }
      
      // Small delay to prevent API overload
      if (start + batchSize <= totalPokemon) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    setAllPokemon(allPokemonData);
    setPokemon(allPokemonData);
  } catch (err) {
    setError("Failed to load Pokédex data");
  } finally {
    setLoading(false);
  }
};
```

### 4. Advanced Multi-Criteria Filtering
```javascript
// Enhanced filtering with multiple criteria and multi-select support
const filteredPokemon = useMemo(() => {
  const dataToFilter = pokemon;
  
  return dataToFilter.filter(poke => {
    const matchesSearch = poke.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // AND logic for types: Pokemon must have ALL selected types
    const activeTypes = pendingTypes.length > 0 ? pendingTypes : (selectedType ? [selectedType] : []);
    const matchesType = activeTypes.length === 0 || activeTypes.every(type => poke.types.includes(type));
    
    const matchesGeneration = !selectedGeneration || poke.generation === parseInt(selectedGeneration);
    
    // AND logic for categories: Pokemon must match ALL selected categories
    const activeCategories = pendingCategories.length > 0 ? pendingCategories : (selectedCategory ? [selectedCategory] : []);
    let matchesCategory = true;
    if (activeCategories.length > 0) {
      matchesCategory = activeCategories.every(category => {
        if (category === 'legendary') return poke.isLegendary;
        if (category === 'mythical') return poke.isMythical;
        if (category === 'ultra-beast') return poke.isUltraBeast;
        if (category === 'normal') return !poke.isLegendary && !poke.isMythical && !poke.isUltraBeast;
        if (category === 'multi-type') return poke.types.length > 1;
        if (category === 'single-type') return poke.types.length === 1;
        return false;
      });
    }
    
    // AND logic for stages: Pokemon must match ALL selected stages
    const activeStages = pendingStages.length > 0 ? pendingStages : (selectedStage ? [selectedStage] : []);
    let matchesStage = true;
    if (activeStages.length > 0) {
      matchesStage = activeStages.every(stage => {
        if (stage === 'first') return poke.stage === 1;
        if (stage === 'evolved') return poke.stage > 1 && poke.stage !== 'mega' && poke.stage !== 'legendary';
        if (stage === 'mega') return poke.stage === 'mega';
        if (stage === 'legendary') return poke.stage === 'legendary';
        return false;
      });
    }
    
    return matchesSearch && matchesType && matchesGeneration && matchesCategory && matchesStage;
  });
}, [pokemon, searchTerm, selectedType, selectedGeneration, selectedCategory, selectedStage, pendingTypes, pendingCategories, pendingStages]);
```

### 5. Advanced Sorting System
```javascript
// Enhanced sorting and pagination
const sortedAndVisiblePokemon = useMemo(() => {
  let sorted = [...filteredPokemon];
  
  // Apply sorting
  switch (sortBy) {
    case 'id':
      sorted.sort((a, b) => a.id - b.id);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'type':
      sorted.sort((a, b) => a.types[0].localeCompare(b.types[0]));
      break;
    case 'generation':
      sorted.sort((a, b) => a.generation - b.generation);
      break;
    case 'stats':
      sorted.sort((a, b) => b.baseStats - a.baseStats);
      break;
    case 'height':
      sorted.sort((a, b) => b.height - a.height);
      break;
    case 'weight':
      sorted.sort((a, b) => b.weight - a.weight);
      break;
    default:
      break;
  }
  
  return sorted.slice(0, visibleCount);
}, [filteredPokemon, sortBy, visibleCount]);
```

### 6. Infinite Scroll Implementation
```javascript
// Infinite scroll functionality
const loadMoreVisible = useCallback(() => {
  setVisibleCount(prev => Math.min(prev + 48, filteredPokemon.length));
}, [filteredPokemon.length]);

// Infinite scroll effect
useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
      if (visibleCount < filteredPokemon.length && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          loadMoreVisible();
          setIsLoadingMore(false);
        }, 100);
      }
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [visibleCount, filteredPokemon.length, isLoadingMore, loadMoreVisible]);
```

### 7. Filter Management Functions
```javascript
// Handle search trigger
const handleSearch = () => {
  setSearchTerm(pendingSearchTerm);
  setSelectedType(pendingTypes.length === 1 ? pendingTypes[0] : "");
  setSelectedGeneration(pendingGeneration);
  setSelectedCategory(pendingCategories.length === 1 ? pendingCategories[0] : "");
  setSelectedStage(pendingStages.length === 1 ? pendingStages[0] : "");
  setSortBy(pendingSortBy);
  setVisibleCount(48);
};

// Clear all filters
const clearAllFilters = () => {
  setPendingSearchTerm("");
  setPendingTypes([]);
  setPendingGeneration("");
  setPendingCategories([]);
  setPendingStages([]);
  setPendingSortBy("id");
  setSearchTerm("");
  setSelectedType("");
  setSelectedGeneration("");
  setSelectedCategory("");
  setSelectedStage("");
  setSortBy("id");
  setVisibleCount(48);
};

// Helper functions for interactive selections
const toggleType = (type) => {
  setPendingTypes(prev => 
    prev.includes(type) 
      ? prev.filter(t => t !== type)
      : [...prev, type]
  );
};

const toggleCategory = (category) => {
  setPendingCategories(prev => 
    prev.includes(category) 
      ? prev.filter(c => c !== category)
      : [...prev, category]
  );
};

const toggleStage = (stage) => {
  setPendingStages(prev => 
    prev.includes(stage) 
      ? prev.filter(s => s !== stage)
      : [...prev, stage]
  );
};
```

### 8. Filter Configuration Arrays
```javascript
// Filter options
const pokemonTypes = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

const generations = [
  { value: "1", label: "Generation I" },
  { value: "2", label: "Generation II" },
  { value: "3", label: "Generation III" },
  { value: "4", label: "Generation IV" },
  { value: "5", label: "Generation V" },
  { value: "6", label: "Generation VI" },
  { value: "7", label: "Generation VII" },
  { value: "8", label: "Generation VIII" },
  { value: "9", label: "Generation IX" }
];

const categories = [
  { value: "legendary", label: "Legendary" },
  { value: "mythical", label: "Mythical" },
  { value: "ultra-beast", label: "Ultra Beast" },
  { value: "normal", label: "Normal Pokémon" },
  { value: "multi-type", label: "Multi-Type" },
  { value: "single-type", label: "Single-Type" }
];

const stages = [
  { value: "first", label: "First Stage" },
  { value: "evolved", label: "Evolved" },
  { value: "mega", label: "Mega Evolution" },
  { value: "legendary", label: "Legendary/Mythical" }
];

const sortOptions = [
  { value: "id", label: "Pokédex Number" },
  { value: "name", label: "Name" },
  { value: "type", label: "Primary Type" },
  { value: "generation", label: "Generation" },
  { value: "stats", label: "Total Base Stats" },
  { value: "height", label: "Height" },
  { value: "weight", label: "Weight" }
];
```

## Components to Avoid (Cause Fast Refresh Issues)
- `AnimationSystem` components (framer-motion based)
- `SidebarLayout` 
- `PremiumComponents`
- `PokemonLoadingScreen`
- `PokemonEmptyState`

## Components That Are Safe to Use
- `TypeBadge` ✅
- Basic React hooks (useState, useEffect, useMemo, useCallback) ✅
- Next.js Image and Router ✅
- Standard HTML/CSS animations ✅

## UI Features to Implement Without Complex Components

### 1. Simple Filter Sidebar (without SidebarLayout)
- Create inline filter controls
- Use dropdowns, checkboxes, and input fields
- Style with Tailwind CSS

### 2. Simple Loading States (without PokemonLoadingScreen)
- Use basic spinner with progress indicator
- Show loading progress for batch operations

### 3. Basic Empty States (without PokemonEmptyState)
- Simple text and clear button for no results

### 4. Basic Animations (without AnimationSystem)
- CSS transitions and transforms
- Hover effects with pure CSS
- No framer-motion dependencies

## Evolution/Individual Pokemon Pages Issue
The user mentioned "evolve is not working" - this likely refers to:
1. Pokemon individual pages not loading (`/pokedex/{id}`)
2. Evolution chain information not displaying
3. Missing navigation between Pokemon

This needs to be investigated and fixed.