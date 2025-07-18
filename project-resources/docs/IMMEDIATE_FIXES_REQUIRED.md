# IMMEDIATE FIXES REQUIRED - TypeScript Migration Issues

## Priority 0 - Breaking User Experience

### 1. UnifiedCard Navigation Fix
**File**: `/components/ui/cards/UnifiedCard.tsx`
**Lines**: 415-432, 472-488

**Problem**: Conflicting navigation handlers - Link component on image conflicts with onClick on parent div.

**Fix**:
```typescript
// Option 1: Remove Link wrapper, use router in handleCardClick
import { useRouter } from 'next/router';

const router = useRouter();

const handleCardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  const target = e.target as HTMLElement;
  if (target.closest('button') || target.closest('.magnifier-icon')) return;
  
  if (onCardClick) {
    onCardClick(card);
  } else {
    router.push(normalizedCard.linkPath);
  }
}, [card, onCardClick, normalizedCard.linkPath, router]);

// Remove the Link component wrapper around the image
```

### 2. Pokemon Name Sanitization for API Calls
**File**: `/pages/pokedex/[pokeid].tsx`
**Line**: 257

**Problem**: Special characters in Pokemon names break API calls (Farfetch'd, Mr. Mime, etc.)

**Fix**:
```typescript
// Add before line 257
const sanitizePokemonName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/[':.\s]/g, '-')
    .replace(/--+/g, '-')
    .replace(/-$/, '');
};

// Update line 257
const sanitizedName = sanitizePokemonName(pokemonName);
const tcgCardsData = await fetchTCGCards(sanitizedName);

// Update line 261
const pocketCardsData = await fetchPocketCards(sanitizedName);
```

### 3. Battle Simulator Type Colors
**File**: `/pages/battle-simulator.tsx`
**Lines**: 131-142

**Problem**: Trying to use color hex values as background colors in style attribute

**Fix**:
```typescript
// Replace lines 131-137 with:
{colors.dual ? (
  <div className="absolute inset-0 rounded-full overflow-hidden">
    <div 
      className="absolute inset-0 w-1/2"
      style={{ backgroundColor: colors.color1 }}
    />
    <div 
      className="absolute inset-0 w-1/2 left-1/2"
      style={{ backgroundColor: colors.color2 }}
    />
  </div>
) : (
  <div 
    className="absolute inset-0 rounded-full"
    style={{ backgroundColor: colors.single }}
  />
)}
```

### 4. Add Error Boundaries for Data Fetching
**File**: `/utils/apiutils.ts`

**Problem**: API calls fail silently with no user feedback

**Add to fetchTCGCards and fetchPocketCards**:
```typescript
export const fetchTCGCards = async (pokemonName: string): Promise<TCGCard[]> => {
  try {
    const sanitizedName = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sdk = getPokemonSDK();
    const result = await sdk.card.where({
      q: `name:"${sanitizedName}"`,
      orderBy: '-set.releaseDate'
    });
    return result.data || [];
  } catch (error) {
    console.error(`Failed to fetch TCG cards for ${pokemonName}:`, error);
    // Return empty array instead of throwing
    return [];
  }
};
```

### 5. Evolution Display Data Fetching
**File**: `/components/ui/EnhancedEvolutionDisplay.tsx`
**Line**: 166

**Problem**: Evolution chain building logic incomplete, fails for complex evolutions

**Add error handling**:
```typescript
// After line 166
if (!speciesData.evolution_chain?.url) {
  console.warn('No evolution chain URL found for species');
  setEvolutionData({ chain: [], structure: null });
  return;
}

// Add try-catch around evolution chain fetching
try {
  const evolutionResponse = await fetchData(speciesData.evolution_chain.url);
  // Process evolution data...
} catch (error) {
  console.error('Failed to fetch evolution chain:', error);
  setEvolutionData({ chain: [], structure: null });
}
```

---

## Testing After Fixes

1. **Card Navigation**: Click any card in Pocket mode, TCG sets, or Pokedex - should navigate correctly
2. **Special Pokemon**: Search for "Farfetch'd", "Mr. Mime", "Nidoran♀" - cards should load
3. **Battle Simulator**: Select any Pokemon - type colors should display correctly
4. **Evolution Display**: Check Eevee, Wurmple, Tyrogue - complex evolutions should show
5. **Error States**: Disconnect network and try loading - should show error messages

---

## Quick Validation Commands

```bash
# Type check
npm run typecheck

# Test specific pages
# Visit: http://localhost:3001/pocketmode
# Visit: http://localhost:3001/pokedex/83 (Farfetch'd)
# Visit: http://localhost:3001/battle-simulator
```