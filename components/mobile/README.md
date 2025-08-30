# Mobile Components

This folder contains mobile-specific utilities that provide touch interactions and mobile-only features that cannot be achieved through responsive CSS alone.

## Active Components

These components are currently in use:

- **BottomSheet.tsx** - iOS/Android style bottom sheet overlays
- **MobileLayout.tsx** - Handles safe areas for notched devices
- **PullToRefresh.tsx** - Touch gesture for pull-to-refresh
- **EnhancedSwipeGestures.tsx** - Swipe detection utilities
- **TouchGestures.tsx** - Basic touch interaction helpers
- **VirtualPokemonGrid.tsx** - Virtual scrolling for Pokemon grid

## Usage Philosophy

Most UI should be responsive using Tailwind classes. Only use these components when you need:
- Touch-specific gestures (swipe, pull, pinch)
- Native mobile patterns (bottom sheets, pull to refresh)
- Safe area handling for notched devices
- Virtual scrolling for performance

## Archived Components

Unused legacy mobile components have been moved to `components/_archive/mobile-legacy/`. These were from an earlier attempt at separate mobile/desktop components and are no longer part of the architecture.