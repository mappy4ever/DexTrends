# Pokemon Type-Based Theming System

## Overview
The Pokemon detail pages now feature dynamic type-based gradients and UI colors that adapt to each Pokemon's type(s) while maintaining the elegant pastel design language.

## Features

### 🎨 Dynamic Backgrounds
- **Single Type Pokemon**: Pure gradients based on the Pokemon's type
- **Dual Type Pokemon**: Blended gradients combining both types
- **Fallback**: Default pokedex gradient for edge cases

### 🌈 Type Color Palettes
Each Pokemon type has a carefully crafted pastel color palette:

- **Fire**: Red-Orange-Amber pastels
- **Water**: Blue-Cyan-Sky pastels  
- **Electric**: Yellow-Amber-Lime pastels
- **Grass**: Green-Emerald-Lime pastels
- **Psychic**: Pink-Purple-Violet pastels
- **Ice**: Cyan-Sky-Blue pastels
- **And 12 more types...**

### 🔧 Dynamic UI Elements
UI components automatically adapt to Pokemon types:
- **Pokemon Number Badge**: Uses type-based colors
- **Back Button**: Type-colored icon and border
- **Favorite Button**: Type-based gradients when active
- **All Borders & Accents**: Match Pokemon's primary type

## Implementation

### 1. Core Gradient System
```javascript
// utils/pokemonTypeGradients.js
export const generateTypeGradient = (types, direction = 'to-br') => {
  // Single type: Pure gradient
  if (types.length === 1) {
    return `bg-gradient-${direction} ${palette.light} ${palette.dark}`;
  }
  
  // Dual type: Blended gradient
  if (types.length === 2) {
    return `bg-gradient-${direction} ${type1Start} ${type2Middle} ${type1End}`;
  }
};
```

### 2. FullBleedWrapper Integration
```jsx
<FullBleedWrapper 
  gradient="pokemon-type" 
  pokemonTypes={pokemon.types}
>
  {content}
</FullBleedWrapper>
```

### 3. Dynamic UI Colors
```javascript
const typeColors = getTypeUIColors(pokemon.types);
// Returns: { accent, button, buttonHover, border, text, bg, glass, ... }
```

## Examples

### Fire Type (Charmander)
- **Background**: Red-Orange-Amber pastel gradient
- **UI Elements**: Red accent colors
- **Feel**: Warm and energetic

### Water Type (Squirtle)  
- **Background**: Blue-Cyan-Sky pastel gradient
- **UI Elements**: Blue accent colors
- **Feel**: Cool and calm

### Dual Type (Grass/Poison)
- **Background**: Blended Green-Purple gradient
- **UI Elements**: Green-based accents (primary type)
- **Feel**: Natural with mysterious undertones

## Technical Benefits

### 🚀 Performance Optimized
- CSS-class based implementation
- No runtime color calculations
- Server-side rendering compatible

### 🎯 Design Consistency
- All colors maintain pastel aesthetic
- Proper contrast for accessibility
- Consistent with overall design language

### 🔧 Maintainable
- Centralized color system
- Easy to add new types
- Automatic cleanup on page transitions

## Usage

The system works automatically on all Pokemon detail pages:
- `/pokedex/4` - Fire type (Charmander)
- `/pokedex/25` - Electric type (Pikachu)  
- `/pokedex/1` - Grass/Poison dual type (Bulbasaur)
- `/pokedex/150` - Psychic type (Mewtwo)

## Future Enhancements

- Extend to other Pokemon-related pages
- Add seasonal theme variations
- Implement shiny Pokemon special gradients
- Add subtle animations based on type