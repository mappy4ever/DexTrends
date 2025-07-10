# Quality of Life (QOL) Enhancements

This directory contains comprehensive Quality of Life improvements for DexTrends, designed to enhance user experience, accessibility, and overall usability.

## 🌟 Features Overview

### 1. Smart Notification System (`NotificationSystem.js`)
- **Toast notifications** with multiple types (success, error, warning, info, loading)
- **Contextual notifications** for specific actions (card added, Pokemon found, price alerts)
- **Smart positioning** and auto-dismissal
- **Action buttons** within notifications
- **Persistent error notifications** with recovery options
- **Global API** accessible from anywhere in the app

**Usage:**
```jsx
import { useNotifications } from '../components/qol/NotificationSystem';

const { notify } = useNotifications();
notify.success('Card added to favorites!');
notify.error('Failed to load data', { persistent: true });
```

### 2. Smart Search Enhancement (`SmartSearchEnhancer.js`)
- **Search suggestions** based on Pokemon names and user history
- **Search history** tracking and display
- **Popular searches** with frequency tracking
- **Keyboard navigation** (arrow keys, enter, escape)
- **Auto-complete** functionality
- **Search analytics** and optimization

**Features:**
- ⭐ Pokemon name suggestions
- 🕒 Recent search history
- 🔥 Popular searches with usage counts
- ⌨️ Full keyboard navigation
- 🔍 Global search shortcuts (Ctrl+K)

### 3. Contextual Help System (`ContextualHelp.js`)
- **Smart tooltips** with configurable positioning and delays
- **Contextual help** panels for each page
- **Help mode** with interactive element explanations
- **Keyboard shortcuts** guide
- **Smart error boundaries** with helpful error messages
- **Progressive disclosure** of help information

**Components:**
- `SmartTooltip` - Enhanced tooltips with smart positioning
- `ContextualHelpProvider` - Page-specific help system
- `SmartErrorBoundary` - User-friendly error handling

### 4. Skeleton Loading System (`SkeletonLoaders.js`)
- **Smart skeleton loaders** for different content types
- **Animated placeholders** to improve perceived performance
- **Responsive skeletons** that adapt to different screen sizes
- **Type-specific loaders** (cards, Pokemon lists, charts, tables)
- **Customizable animation** and styling

**Available Skeletons:**
- `CardSkeleton` - For Pokemon/TCG cards
- `PokemonListSkeleton` - For Pokemon list items
- `CardDetailSkeleton` - For detailed card pages
- `ChartSkeleton` - For data visualizations
- `TableSkeleton` - For tabular data
- `SmartSkeleton` - Auto-selects appropriate skeleton

### 5. Keyboard Shortcuts Manager (`KeyboardShortcuts.js`)
- **Command palette** (Ctrl+K) for quick actions
- **Global shortcuts** for navigation and common actions
- **Context-aware shortcuts** that change based on current page
- **Visual shortcuts guide** (F1 or ?)
- **Smart command search** with fuzzy matching

**Global Shortcuts:**
- `Ctrl+K` - Open command palette
- `Ctrl+Shift+P` - Go to Pokedex
- `Ctrl+Shift+C` - Go to Cards
- `Ctrl+Shift+F` - Go to Favorites
- `Ctrl+Shift+H` - Go to Home
- `Ctrl+Shift+T` - Toggle theme
- `F1` or `?` - Show help

### 6. User Preferences System (`UserPreferences.js`)
- **Comprehensive settings** for appearance, behavior, and accessibility
- **Persistent storage** with localStorage backup
- **Import/export** functionality for preferences
- **Real-time application** of settings
- **Accessibility options** (high contrast, reduced motion, large text)
- **Performance settings** (image optimization, caching, low data mode)

**Preference Categories:**
- **General** - Language, timezone
- **Appearance** - Theme, layout, display options
- **Notifications** - Enable/disable, duration, sound
- **Browsing** - Search behavior, pagination
- **Accessibility** - High contrast, reduced motion, screen reader
- **Performance** - Optimization settings, data usage
- **Privacy** - Analytics, crash reporting
- **Advanced** - Beta features, debug mode

## 🚀 Quick Start

### 1. Import QOL Components
```jsx
import { 
  NotificationProvider,
  SmartSearchEnhancer,
  ContextualHelpProvider,
  KeyboardShortcutsManager,
  SmartSkeleton,
  QOLUtils
} from '../components/qol';
```

### 2. Wrap Your App
```jsx
function MyApp({ Component, pageProps }) {
  return (
    <NotificationProvider>
      <ContextualHelpProvider>
        <Component {...pageProps} />
        <KeyboardShortcutsManager />
      </ContextualHelpProvider>
    </NotificationProvider>
  );
}
```

### 3. Use QOL Features
```jsx
// Show notifications
QOLUtils.showSuccess('Operation completed!');

// Use smart search
<SmartSearchEnhancer 
  onSearch={handleSearch}
  placeholder="Search Pokemon or cards..."
/>

// Add loading skeletons
{loading ? (
  <SmartSkeleton type="card-grid" count={12} />
) : (
  <CardGrid cards={cards} />
)}

// Add helpful tooltips
<SmartTooltip content="Click to add to favorites">
  <button onClick={addToFavorites}>❤️</button>
</SmartTooltip>
```

## 🎯 Benefits

### For Users
- **Faster perceived performance** with skeleton loaders
- **Better discoverability** with contextual help and tooltips
- **Improved navigation** with keyboard shortcuts and command palette
- **Personalized experience** with comprehensive preferences
- **Better feedback** with smart notifications
- **Enhanced accessibility** with configurable options

### For Developers
- **Consistent UX patterns** across the application
- **Reduced development time** with reusable components
- **Better error handling** with smart error boundaries
- **Improved maintainability** with centralized QOL logic
- **Enhanced debugging** with preference-based debug modes
- **Better user feedback** with integrated notification system

## 🔧 Configuration

### Notification Configuration
```jsx
// Custom notification types
const customNotification = {
  type: 'CUSTOM',
  title: 'Custom Title',
  message: 'Custom message',
  duration: 5000,
  persistent: false,
  actions: [
    {
      label: 'Action',
      handler: () => console.log('Action clicked')
    }
  ]
};
```

### Search Enhancement Configuration
```jsx
<SmartSearchEnhancer
  placeholder="Search..."
  onSearch={handleSearch}
  enableHistory={true}
  enableSuggestions={true}
  maxHistoryItems={10}
  maxSuggestions={8}
/>
```

### Skeleton Loader Configuration
```jsx
<SmartSkeleton
  type="card-grid"
  count={12}
  showPrice={true}
  animate={true}
  variant="card"
/>
```

## 🎨 Theming and Customization

All QOL components respect the global theme system and can be customized through:

1. **CSS Custom Properties** - Override colors and spacing
2. **Tailwind Classes** - Use utility classes for quick styling
3. **Component Props** - Configure behavior and appearance
4. **User Preferences** - Let users customize their experience

## 📱 Mobile Responsiveness

All QOL components are designed with mobile-first principles:
- **Touch-friendly** interfaces with appropriate touch targets
- **Responsive layouts** that adapt to different screen sizes
- **Performance optimized** for mobile devices
- **Accessibility compliant** with mobile screen readers

## ♿ Accessibility Features

Comprehensive accessibility support including:
- **ARIA labels** and descriptions
- **Keyboard navigation** for all interactive elements
- **High contrast mode** support
- **Reduced motion** options
- **Screen reader optimization**
- **Focus management** for modals and dialogs

## 🔍 Browser Support

QOL components support:
- **Modern browsers** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Graceful degradation** for older browsers
- **Progressive enhancement** for advanced features
- **Polyfill support** where needed

## 📊 Performance Considerations

- **Lazy loading** for non-critical components
- **Code splitting** to reduce initial bundle size
- **Debounced operations** to prevent excessive API calls
- **Optimized re-renders** with React.memo and useMemo
- **Efficient storage** with compressed localStorage

## 🐛 Debugging

Enable debug mode through user preferences or:
```jsx
// Enable debug logging
localStorage.setItem('qol-debug', 'true');

// View component performance
localStorage.setItem('qol-performance', 'true');
```

## 🤝 Contributing

When adding new QOL features:
1. Follow the established patterns and naming conventions
2. Add comprehensive documentation
3. Include accessibility considerations
4. Add mobile responsiveness
5. Consider performance implications
6. Add TypeScript definitions if using TypeScript

## 📝 License

These QOL enhancements are part of the DexTrends project and follow the same licensing terms.