# DexTrends UI Components Guide

## Overview

Modern UI components following the DexTrends design language with glass morphism effects, spring animations, and mobile-first approach. All components are built with React, TypeScript, and Framer Motion for smooth, performant animations.

## Installation & Setup

All UI components are already integrated into the DexTrends project. To use them:

```typescript
// Import from the UI directory
import { EnhancedInput, Button, CircularProgress } from '@/components/ui';

// Import hooks
import { useNotifications } from '@/hooks/useNotifications';
```

## Form Components

### EnhancedInput

Interactive input field with focus animations and validation states.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Input label |
| error | boolean | false | Error state |
| helperText | string | - | Helper or error message |
| icon | ReactNode | - | Leading icon |
| ...inputProps | HTMLInputProps | - | All standard input props |

**Usage:**
```tsx
<EnhancedInput
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!!emailError}
  helperText={emailError}
/>
```

**Features:**
- Smooth focus animations with scale and border effects
- Error state with red highlighting
- Helper text support
- Icon support
- Full TypeScript support

### EnhancedSelect

Dropdown select with custom styling and animations.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Select label |
| error | boolean | false | Error state |
| helperText | string | - | Helper or error message |
| placeholder | string | - | Placeholder text |
| ...selectProps | HTMLSelectProps | - | All standard select props |

**Usage:**
```tsx
<EnhancedSelect
  label="Pokemon Type"
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
  placeholder="Choose a type"
>
  <option value="fire">Fire</option>
  <option value="water">Water</option>
  <option value="grass">Grass</option>
</EnhancedSelect>
```

### EnhancedSwitch

Toggle switch with smooth animations and customizable colors.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Switch label |
| checked | boolean | false | Checked state |
| onChange | (checked: boolean) => void | - | Change handler |
| color | string | purple | Accent color |
| disabled | boolean | false | Disabled state |

**Usage:**
```tsx
<EnhancedSwitch
  label="Enable notifications"
  checked={notifications}
  onChange={setNotifications}
  color="blue"
/>
```

### EnhancedTextarea

Auto-expanding textarea with character count and animations.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Textarea label |
| error | boolean | false | Error state |
| helperText | string | - | Helper or error message |
| maxLength | number | - | Maximum characters |
| showCount | boolean | true | Show character count |
| ...textareaProps | HTMLTextareaProps | - | All standard textarea props |

**Usage:**
```tsx
<EnhancedTextarea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  maxLength={500}
  rows={4}
  placeholder="Describe your Pokemon team..."
/>
```

## Progress Indicators

### CircularProgress

Circular progress indicator with optional percentage display.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | - | Progress value (0-100) |
| size | number | 60 | Diameter in pixels |
| strokeWidth | number | 4 | Stroke width |
| showValue | boolean | false | Show percentage |
| color | string | purple | Progress color |
| indeterminate | boolean | false | Indeterminate mode |

**Usage:**
```tsx
// Determinate progress
<CircularProgress value={75} size={80} showValue />

// Indeterminate loading
<CircularProgress indeterminate />
```

### LinearProgress

Linear progress bar with multiple variants.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | - | Progress value (0-100) |
| variant | 'default' \| 'striped' \| 'gradient' | 'default' | Visual variant |
| height | number | 8 | Height in pixels |
| showValue | boolean | false | Show percentage |
| color | string | purple | Progress color |
| indeterminate | boolean | false | Indeterminate mode |
| segments | number[] | - | Multi-segment progress |

**Usage:**
```tsx
// Simple progress
<LinearProgress value={50} showValue />

// Striped variant
<LinearProgress value={75} variant="striped" />

// Multi-segment
<LinearProgress segments={[30, 20, 25]} />
```

### StepProgress

Multi-step progress indicator for wizards and workflows.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| steps | Step[] | - | Array of step objects |
| currentStep | number | 0 | Current step index |
| variant | 'linear' \| 'circular' | 'linear' | Visual variant |
| showLabels | boolean | true | Show step labels |

**Step Object:**
```typescript
interface Step {
  label: string;
  description?: string;
  icon?: ReactNode;
  status?: 'pending' | 'active' | 'completed' | 'error';
}
```

**Usage:**
```tsx
const steps = [
  { label: 'Details', description: 'Basic information' },
  { label: 'Stats', description: 'Configure stats' },
  { label: 'Moves', description: 'Select moves' },
  { label: 'Review', description: 'Confirm selection' }
];

<StepProgress steps={steps} currentStep={2} />
```

## Feedback Components

### Toast System

Non-intrusive notifications with swipe-to-dismiss and progress indicators.

**Hook API:**
```typescript
const {
  toasts,        // Current toasts array
  showToast,     // Show custom toast
  removeToast,   // Remove specific toast
  clearToasts,   // Clear all toasts
  success,       // Show success toast
  error,         // Show error toast
  info,          // Show info toast
  warning,       // Show warning toast
  promise        // Toast for async operations
} = useNotifications();
```

**Usage:**
```tsx
// Simple notifications
success('Pokemon added to team!');
error('Failed to save changes');
info('New update available');
warning('Low battery mode active');

// Custom toast
showToast('Custom message', {
  type: 'info',
  duration: 5000,
  position: 'bottom-center',
  showProgress: true
});

// Async operations
const result = await promise(
  savePokemonTeam(),
  {
    loading: 'Saving team...',
    success: 'Team saved successfully!',
    error: (err) => `Failed: ${err.message}`
  }
);
```

**Features:**
- 6 position options (top/bottom × left/center/right)
- Swipe or drag to dismiss
- Auto-dismiss with visual progress
- Stacking behavior for multiple toasts
- Promise-based API for async operations
- Full TypeScript support

### Context Menu

Right-click or long-press context menus with gesture support.

**Hook API:**
```typescript
const {
  isOpen,
  position,
  items,
  openMenu,
  closeMenu,
  handleLongPress
} = useContextMenu();
```

**Usage:**
```tsx
const menuItems = [
  {
    id: 'copy',
    icon: <FaCopy />,
    label: 'Copy',
    action: () => console.log('Copied!')
  },
  {
    id: 'delete',
    icon: <FaTrash />,
    label: 'Delete',
    action: () => console.log('Deleted!'),
    color: 'text-red-500',
    disabled: !canDelete
  }
];

// For right-click
<div onContextMenu={(e) => {
  e.preventDefault();
  openMenu(e, menuItems);
}}>
  Right-click me
</div>

// For long-press (mobile)
<div {...handleLongPress(event, menuItems, 500)}>
  Long-press me
</div>

// Render the menu
{isOpen && (
  <ContextMenu
    items={items}
    position={position}
    onClose={closeMenu}
    variant="list" // or "radial"
  />
)}
```

## Design System Components

### Button

Unified button component with consistent styling and animations.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'tertiary' | 'primary' | Button style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| isLoading | boolean | false | Loading state |
| leftIcon | ReactNode | - | Icon before text |
| rightIcon | ReactNode | - | Icon after text |
| fullWidth | boolean | false | Full width button |

**Usage:**
```tsx
<Button
  variant="primary"
  size="lg"
  leftIcon={<FaPlus />}
  onClick={handleAdd}
>
  Add Pokemon
</Button>

<Button
  variant="secondary"
  isLoading={saving}
  fullWidth
>
  Save Changes
</Button>
```

### GlassContainer

Glass morphism container with blur effects.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'light' \| 'medium' \| 'dark' \| 'colored' | 'medium' | Glass intensity |
| blur | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Blur amount |
| gradient | boolean | false | Gradient overlay |
| hoverable | boolean | false | Hover effects |

**Usage:**
```tsx
<GlassContainer variant="dark" blur="lg" hoverable>
  <h2>Pokemon Stats</h2>
  <p>Your content here</p>
</GlassContainer>
```

## Animation Components

### Page Transitions

Smooth page transitions with multiple effects.

```tsx
import { PageTransition } from '@/components/ui/animations';

<PageTransition variant="scale" duration={0.3}>
  <YourPageContent />
</PageTransition>
```

### Stagger Container

Stagger children animations for lists.

```tsx
import { StaggerContainer } from '@/components/ui/animations';

<StaggerContainer staggerDelay={0.1}>
  {items.map(item => (
    <motion.div key={item.id}>
      {item.content}
    </motion.div>
  ))}
</StaggerContainer>
```

## Mobile Components

### SwipeToRefresh

Pull-to-refresh functionality for mobile.

```tsx
import { SwipeToRefresh } from '@/components/mobile';

<SwipeToRefresh onRefresh={loadData}>
  <YourContent />
</SwipeToRefresh>
```

### PinchToZoom

Pinch-to-zoom for images and content.

```tsx
import { PinchToZoom } from '@/components/mobile';

<PinchToZoom minScale={0.5} maxScale={3}>
  <img src={pokemonImage} alt="Pokemon" />
</PinchToZoom>
```

### LongPressMenu

Long-press context menus for mobile.

```tsx
import { LongPressMenu } from '@/components/mobile';

<LongPressMenu
  items={menuItems}
  onItemSelect={handleSelect}
  delay={500}
>
  <YourCard />
</LongPressMenu>
```

## Theming & Customization

### Using Contextual Themes

Components can adapt to context-specific themes:

```tsx
import { useContextualTheme } from '@/hooks/useContextualTheme';

const MyComponent = ({ pokemonType }) => {
  const theme = useContextualTheme('pokemon', { pokemonType });
  
  return (
    <Button className={theme.buttons.primaryClass}>
      Themed Button
    </Button>
  );
};
```

### Custom Colors

Most components accept color props that map to Tailwind classes:

```tsx
<CircularProgress color="blue" />
<LinearProgress color="green" />
<EnhancedSwitch color="red" />
```

## Best Practices

### Performance

1. **Use lazy loading for heavy components:**
   ```tsx
   const HeavyModal = dynamic(() => import('./HeavyModal'), {
     loading: () => <Skeleton />
   });
   ```

2. **Memoize expensive calculations:**
   ```tsx
   const expensiveValue = useMemo(() => 
     calculateComplexValue(data), [data]
   );
   ```

3. **Debounce rapid updates:**
   ```tsx
   const debouncedSearch = useDebounce(searchTerm, 300);
   ```

### Accessibility

1. **Always provide labels:**
   ```tsx
   <EnhancedInput
     label="Email"
     aria-label="Email address"
     aria-required="true"
   />
   ```

2. **Keyboard navigation:**
   - All interactive components support keyboard navigation
   - Focus states are clearly visible
   - Tab order follows logical flow

3. **Screen reader support:**
   - Proper ARIA labels and roles
   - Live regions for dynamic updates
   - Descriptive button and link text

### Mobile Optimization

1. **Touch targets:** Minimum 44x44px touch targets
2. **Gesture support:** Swipe, pinch, long-press
3. **Responsive design:** Components adapt to screen size
4. **Performance:** Optimized for mobile devices

## Migration Guide

### From Old Components

```tsx
// Old
<input className="form-input" />

// New
<EnhancedInput label="..." />

// Old
<div className="progress-bar" style={{width: `${progress}%`}} />

// New
<LinearProgress value={progress} />

// Old
alert('Success!');

// New
const { success } = useNotifications();
success('Operation completed!');
```

### Component Mapping

| Old Component | New Component | Notes |
|--------------|---------------|-------|
| `<input>` | `<EnhancedInput>` | Add label prop |
| `<select>` | `<EnhancedSelect>` | Same API |
| `<textarea>` | `<EnhancedTextarea>` | Auto-resize |
| Custom checkbox | `<EnhancedSwitch>` | Boolean state |
| Progress div | `<LinearProgress>` | Animated |
| Loading spinner | `<CircularProgress>` | Indeterminate mode |
| Alert/Modal | Toast system | Non-blocking |

## Troubleshooting

### Common Issues

1. **Components not animating:**
   - Check if Framer Motion is installed
   - Ensure `AnimatePresence` wraps dynamic content
   - Verify reduced motion settings

2. **TypeScript errors:**
   - Import types from component files
   - Use proper event handler types
   - Check prop types in documentation

3. **Styling conflicts:**
   - Components use Tailwind classes
   - Override with `className` prop
   - Check CSS specificity

### Getting Help

- Check component source files for detailed prop types
- Review demo pages for usage examples
- File issues in the project repository

## Future Enhancements

- [ ] Date/Time pickers
- [ ] Advanced data tables
- [ ] Chart components
- [ ] Drag-and-drop utilities
- [ ] Virtual scrolling
- [ ] Advanced animations