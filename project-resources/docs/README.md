# DexTrends - Pokemon TCG & Pokedex Application

## Overview
DexTrends is a comprehensive Pokemon TCG and Pokedex application with advanced features for tracking cards, prices, and Pokemon data. Built with Next.js, it offers a mobile-first experience with iOS optimization and dynamic Pokemon type theming.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd DexTrends

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Setup
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Key Features

### 🎴 Pokemon TCG
- Card collection tracking
- Price history and trends
- Deck builder (Pocket TCG)
- Set exploration
- Rarity filters

### 📱 Pokedex
- All Pokemon generations
- Advanced search and filters
- Type effectiveness calculator
- Evolution chains
- Regional variants & forms

### 🎮 Interactive Features
- Battle simulator
- Type effectiveness game
- Pokemon region exploration
- Gym leader challenges

### 📱 Mobile Optimized
- iOS-specific optimizations
- Touch gestures
- Offline support (PWA)
- Responsive design

## Project Structure
```
DexTrends/
├── components/        # React components
│   ├── ui/           # UI components (TypeBadge, animations, etc.)
│   ├── regions/      # Region-specific components
│   └── layout/       # Layout components
├── pages/            # Next.js pages
│   ├── api/         # API routes
│   ├── pokemon/     # Pokemon-related pages
│   └── pocketmode/  # TCG Pocket features
├── public/          # Static assets
│   ├── images/      # Images (including scraped)
│   └── data/        # Static data files
├── styles/          # CSS files
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
├── data/            # Data files and constants
└── project-resources/ # Documentation & resources
```

## Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Data Scraping
```bash
npm run scrape:setup        # Setup scraping directories
npm run scrape:gym-leaders  # Scrape gym leader images
npm run scrape:badges       # Scrape badge images
npm run scrape:maps         # Scrape region maps
npm run scrape:all          # Run all scrapers
```

## Key Components

### TypeBadge
Displays Pokemon type with appropriate styling:
```jsx
import { TypeBadge } from "../components/ui/TypeBadge";

<TypeBadge type="fire" size="lg" />
```

### FullBleedWrapper
Provides full-width backgrounds with type-based theming:
```jsx
import { FullBleedWrapper } from "../components/ui/FullBleedWrapper";

<FullBleedWrapper theme="dynamic" pokemonTypes={['water', 'flying']}>
  {/* Content */}
</FullBleedWrapper>
```

### Animation Components
Pre-built animation wrappers:
```jsx
import { FadeIn, SlideUp, CardHover } from "../components/ui/animations";

<FadeIn duration={0.5}>
  <CardHover>
    <Card />
  </CardHover>
</FadeIn>
```

## Documentation

### Core Guides
- [CLAUDE.md](/CLAUDE.md) - AI assistant context and instructions
- [Design System](project-resources/docs/DESIGN_SYSTEM.md) - Complete design guide
- [iOS/Mobile Guide](project-resources/docs/iOS_MOBILE_DEVELOPMENT_GUIDE.md) - Mobile development

### Feature Documentation
- [Bulbapedia Scraper](project-resources/docs/BULBAPEDIA_SCRAPER_README.md) - Image scraping
- [Testing Protocol](project-resources/docs/TESTING_PROTOCOL.md) - Testing guidelines

### Quick References
- [iPhone Optimization](project-resources/docs/IPHONE_OPTIMIZATION_GUIDE.md) - iOS fixes
- [iOS Quick Fixes](project-resources/docs/iOS_Quick_Fixes_Reference.md) - Common solutions

## Technology Stack

### Frontend
- **Next.js 15.3** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend & Data
- **Supabase** - Database & Auth
- **PokeAPI** - Pokemon data
- **TCGPlayer API** - Card prices

### Development
- **TypeScript** - Type safety (partial migration)
- **ESLint** - Code linting
- **Playwright** - E2E testing

## Browser Support
- iOS Safari 15+
- Chrome 90+
- Firefox 88+
- Edge 90+

## Contributing
1. Check existing issues or create new ones
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Run tests and linting
6. Submit a pull request

## Known Issues
- TypeScript migration is partial (JS files are primary)
- Some TSX files exist but are not actively used
- Input zoom on iOS despite font-size fixes

## License
[License information]

---

For detailed development instructions, see [CLAUDE.md](/CLAUDE.md)
