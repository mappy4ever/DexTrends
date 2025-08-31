# Image Migration Plan

## Current Situation
The `/public/images` directory is 635MB, with 610MB in the `/scraped` subdirectory. This is too large for version control and slows down repository operations.

## Images to Migrate to CDN

### Large Directories (610MB total):
- `/public/images/scraped/games` - 228MB (game covers, screenshots)
- `/public/images/scraped/champions` - 121MB (champion artwork)
- `/public/images/scraped/gym-leaders` - 104MB (gym leader artwork)
- `/public/images/scraped/energy` - 86MB (energy card images)
- `/public/images/scraped/maps` - 26MB (region maps)
- `/public/images/scraped/elite-four` - 20MB (elite four artwork)
- `/public/images/scraped/Professors` - 12MB (professor artwork)
- `/public/images/scraped/badges` - 7.6MB (gym badges)
- `/public/images/scraped/tcg-pocket` - 4.4MB (TCG pocket assets)

### Keep in Repository (25MB):
- `/public/images/PocketBoosterPacks` - 19MB (could consider CDN later)
- `/public/images/pocket-expansions` - 2.3MB (small enough to keep)
- Logo files and placeholders - ~3MB

## Migration Strategy

### Option 1: Cloudinary (Recommended)
```javascript
// Example usage after migration:
const championImage = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/dextrends/scraped/champions/${championName}.png`
```

### Option 2: AWS S3 + CloudFront
```javascript
// Example usage:
const championImage = `https://cdn.dextrends.com/scraped/champions/${championName}.png`
```

### Option 3: Vercel Blob Storage
```javascript
// Example usage:
const championImage = `https://${BLOB_URL}/scraped/champions/${championName}.png`
```

## Implementation Steps

1. **Choose CDN Provider** (Cloudinary recommended for image optimization)
2. **Upload Images** to CDN
3. **Update Image References** in code
4. **Add to .gitignore**: `/public/images/scraped/`
5. **Remove from Git History** (optional, to reduce repo size)

## Code Changes Required

### 1. Create Image URL Helper
```typescript
// utils/imageUrls.ts
export const getScrapedImageUrl = (category: string, filename: string) => {
  const CDN_BASE = process.env.NEXT_PUBLIC_CDN_URL || '';
  return `${CDN_BASE}/scraped/${category}/${filename}`;
};
```

### 2. Update Components
Replace local paths:
```javascript
// Before
<img src="/images/scraped/champions/champion1.png" />

// After
<img src={getScrapedImageUrl('champions', 'champion1.png')} />
```

## Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_CDN_URL=https://your-cdn-url.com
```

## Benefits
- Repository size reduced by 95% (635MB → ~25MB)
- Faster clones and builds
- Better image optimization with CDN
- Easier to update images without code changes