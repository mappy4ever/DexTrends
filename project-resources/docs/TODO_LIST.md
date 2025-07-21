# TODO Items in Codebase

This document tracks all TODO comments found in the codebase with implementation suggestions.

## High Priority

### 1. Error Tracking Integration
**File**: `components/ui/PageErrorBoundary.tsx:77`
```typescript
// TODO: Send to error tracking service like Sentry
```
**Implementation**: 
- Sign up for Sentry account
- Install `@sentry/nextjs`
- Add Sentry initialization to `_app.tsx`
- Update error boundary to report errors

### 2. TypeScript Types for Performance Dashboard
**File**: `components/ui/PerformanceDashboard.tsx` (Lines 51, 55, 59)
```typescript
performanceData: any; // TODO: Replace with proper type from performanceMonitor
```
**Implementation**:
```typescript
interface PerformanceData {
  metrics: {
    loadTime: number;
    renderTime: number;
    apiCalls: number;
    cacheHits: number;
  };
  timestamp: Date;
}
```

## Medium Priority

### 3. Mobile Favorites Filter
**File**: `components/mobile/MobileCardGrid.tsx:269`
```typescript
// TODO: Implement favorites filter
```
**Implementation**:
- Add favorites filter option to mobile grid
- Use existing favorites context
- Add filter toggle button

### 4. Region-Specific Scraping
**File**: `scripts/runScraper.js:165`
```typescript
// TODO: Implement region-specific scraping
```
**Implementation**:
- Add region parameter to scraper
- Implement region-specific logic for each scraper type
- Update scraper commands

## Implementation Plan

### Phase 1: TypeScript Types
1. Create proper types for PerformanceDashboard
2. Update component to use typed data
3. Test performance monitoring still works

### Phase 2: Error Tracking
1. Set up Sentry account
2. Install and configure Sentry
3. Update error boundaries
4. Test error reporting

### Phase 3: Mobile Features
1. Implement favorites filter for mobile
2. Add UI controls
3. Test on mobile devices

### Phase 4: Scraping Enhancement
1. Add region support to scrapers
2. Update documentation
3. Test region-specific scraping

## Notes
- All TODOs are non-critical for basic functionality
- Error tracking should be implemented before production launch
- Mobile favorites can be added based on user demand
- Region scraping is enhancement for data completeness