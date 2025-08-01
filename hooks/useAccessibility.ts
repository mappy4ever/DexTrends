import { useContext } from 'react';
import { AccessibilityContext } from '../components/ui/AccessibilityProvider';

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}