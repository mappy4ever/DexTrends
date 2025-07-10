# Project Resources

This directory contains all project documentation, tests, configuration files, database schemas, and utility scripts organized in a clean structure.

## Structure

### `/config`
Project configuration files:
- `postcss.config.js` - PostCSS configuration (symlinked to root)
- `tailwind.config.js` - Tailwind CSS configuration (symlinked to root)
- `.env.local.example` - Example environment variables

### `/database`
Database schema files:
- `supabase-schema.sql` - Main Supabase database schema
- `supabase-collections-schema.sql` - Collections feature schema
- `supabase-price-history-schema.sql` - Price history tracking schema

### `/docs`
All project documentation:
- **[DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)** - Complete documentation listing
- **Development Guides** - Setup, mobile/iOS development, design system
- **Feature Documentation** - Scrapers, theming, components
- **Quick References** - Common fixes and solutions
- **Historical Records** - Past fixes and reports

### `/logs`
Build and error logs:
- `build.log` - Build output logs
- `typescript-errors-final.log` - TypeScript error logs

### `/examples`
Code examples and integration samples:
- `PerformanceIntegrationExample.js` - Performance monitoring integration example

### `/tests`
All testing-related files:
- `/__mocks__` - Mock implementations for testing (Next.js router mocks)
- `/config` - Test configuration files (vitest, playwright, eslint, etc.)
- `/coverage` - Test coverage reports
- `/scripts` - Test scripts and test runners
- `/reports` - Test reports and results
- `/setup.tsx` - Test setup file

### `/utilities`
Utility scripts and tools:
- `/fix-scripts` - Python scripts for fixing JSX and other code issues
- `requirements.txt` - Python dependencies for utility scripts

## Important Files

### Test Configuration
- `vitest.config.ts` - Vitest test runner configuration
- `playwright.config.ts` - E2E testing configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint configuration
- `commitlint.config.js` - Commit message linting
- `lighthouserc.json` - Lighthouse performance testing
- `.lintstagedrc.json` - Pre-commit linting configuration

### Key Documentation
- `README.md` - Main project README
- `IPHONE_OPTIMIZATION_GUIDE.md` - iOS-specific optimizations
- `BULBAPEDIA_SCRAPER_README.md` - Scraper documentation
- `TESTING_PROTOCOL.md` - Testing guidelines

## Usage

When referencing these files in your project, update paths to:
- Documentation: `./project-resources/docs/[filename]`
- Test configs: `./project-resources/tests/config/[filename]`
- Test scripts: `./project-resources/tests/scripts/[filename]`
- Utilities: `./project-resources/utilities/[folder]/[filename]`