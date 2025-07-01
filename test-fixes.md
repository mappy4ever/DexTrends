# DexTrends Fixes Test Checklist

## 1. Badge Size Fix for Pocket Cards
- [x] Updated UnifiedCard component to use 'xs' size instead of 'xxs' for pocket card type badges
- Location: `/components/ui/UnifiedCard.js` line 377

## 2. Card Layout Optimization
- [x] Added set tag support to normalized card data (shows abbreviated set codes)
- [x] Updated set display to show compact tags instead of full set names
- [x] Removed artist information from card display (unless explicitly requested via showArtist prop)
- Location: `/components/ui/UnifiedCard.js` lines 135, 166, 345-359, 401

## 3. Highest Value Cards Click Fix
- [x] Changed div with onClick to proper button element for better accessibility and event handling
- [x] Removed unnecessary event.stopPropagation() and event.preventDefault()
- [x] Simplified click handler
- Location: `/pages/tcgsets/[setid].js` lines 403-424

## 4. Navigation URL Capitalization Fix
- [x] Renamed TCGSets function to tcgsets to prevent Next.js from capitalizing the route
- Location: `/pages/tcgsets.js` line 21

## Testing Instructions

1. **Badge Size**: Navigate to Pocket Mode and verify type badges are now larger and more readable
2. **Card Layout**: Check any card grid and verify:
   - Set tags show abbreviated codes (e.g., "A1a", "SV1") instead of full names
   - Artist info is not displayed
   - Only essential info (name, type, HP/rarity) is shown
3. **Highest Value Cards**: Go to any TCG set page and click on cards in the "Highest Value Cards" section - they should open the modal correctly
4. **URL Capitalization**: Navigate to TCG Sets page and verify the URL stays as `/tcgsets` not `/TCGSets`