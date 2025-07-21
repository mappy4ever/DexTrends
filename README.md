# DexTrends

A comprehensive Pokemon TCG and Pokedex application built with Next.js, featuring real-time card prices, collection management, battle simulator, and extensive Pokemon data.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3001](http://localhost:3001) to see the app.

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Supabase account (for database features)
- Pokemon TCG API key (optional, for enhanced features)

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.5
- **Language**: TypeScript (100% coverage)
- **Styling**: Tailwind CSS
- **State Management**: React Context (UnifiedAppContext)
- **Database**: Supabase
- **Caching**: 3-tier system (Memory → LocalStorage → Supabase)
- **Testing**: Playwright E2E tests
- **Images**: Next.js Image with custom loader

## 📁 Project Structure

```
DexTrends/
├── components/        # React components
├── pages/            # Next.js pages & API routes
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
├── tests/            # Playwright E2E tests
├── public/           # Static assets
├── styles/           # Global styles
└── context/          # React Context providers
```

## 🌟 Key Features

### Pokemon Features
- **Pokedex**: Browse all Pokemon with advanced filtering
- **Pokemon Details**: Stats, moves, abilities, evolution chains
- **Battle Simulator**: Simulate battles between Pokemon
- **Type Effectiveness**: Interactive type matchup calculator
- **Regional Variants**: Support for all regional forms

### TCG Features
- **Card Database**: Browse Pokemon TCG cards
- **Price Tracking**: Real-time card prices and history
- **Collection Manager**: Track your card collection
- **Deck Builder**: Build and manage TCG decks
- **Pack Opening**: Simulate opening booster packs

### Pocket Mode
- **Pokemon TCG Pocket**: Dedicated mode for mobile TCG
- **Expansion Browser**: View all Pocket expansions
- **Deck Builder**: Build decks for Pocket format

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Pokemon TCG API (optional)
NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY=your_api_key

# CDN for images (optional)
NEXT_PUBLIC_CDN_URL=your_cdn_url
```

### Important Configuration Notes

- **React Strict Mode**: Enabled for better error detection
- **Image Optimization**: Uses custom loader to avoid Vercel quotas
- **Large Images**: Scraped images (635MB) should be moved to CDN (see `IMAGE_MIGRATION_PLAN.md`)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Debug tests
npm run test:debug
```

## 📱 Mobile Support

- Fully responsive design
- Touch gestures support
- PWA capabilities
- Optimized for iPhone/iOS

## 🚧 Known Issues

- Large image directory (635MB) - migration to CDN recommended
- React Hook dependency warnings - fixes in progress
- Some TODO items in code - see individual files

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process/auxiliary tool changes

## 📝 Documentation

- Main documentation: `/project-resources/docs/`
- API documentation: `/pages/api/README.md`
- Component documentation: See individual component files
- Testing guide: `/tests/README.md`

## 🔒 Security

- All API routes are protected
- Environment variables for sensitive data
- Input validation on all forms
- XSS protection enabled
- CORS properly configured

## 📈 Performance

- Lighthouse score: Target > 90
- Bundle size: < 700KB
- 3-tier caching system
- Image optimization
- Code splitting

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Pokemon TCG API for card data
- PokeAPI for Pokemon data
- Bulbapedia for additional Pokemon information
- Next.js team for the amazing framework