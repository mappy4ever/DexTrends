/**
 * Haptic Feedback Utility
 *
 * Provides haptic feedback on supported devices (iOS, Android)
 * Falls back gracefully on devices without vibration support.
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

// Vibration patterns in milliseconds
const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  selection: 5,      // Very light tap for selection changes
  success: [10, 30, 10], // Double tap for success
  warning: [30, 50, 30], // Longer pattern for warning
  error: [50, 100, 50, 100], // Distinctive pattern for error
};

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 *
 * @param type - The type of haptic feedback to trigger
 * @returns boolean indicating if the haptic was triggered
 *
 * @example
 * // Simple light tap on button press
 * haptic('light');
 *
 * @example
 * // Success feedback after completing an action
 * haptic('success');
 *
 * @example
 * // Selection change in a picker
 * haptic('selection');
 */
export function haptic(type: HapticType = 'light'): boolean {
  if (!isHapticSupported()) {
    return false;
  }

  try {
    const pattern = HAPTIC_PATTERNS[type];
    return navigator.vibrate(pattern);
  } catch (e) {
    // Silently fail - haptics are an enhancement, not critical
    return false;
  }
}

/**
 * Cancel any ongoing vibration
 */
export function cancelHaptic(): void {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
}

/**
 * React hook for haptic feedback
 * Returns a stable callback that can be used in event handlers
 *
 * @example
 * const triggerHaptic = useHaptic();
 * <button onClick={() => { triggerHaptic('light'); doSomething(); }}>
 */
export function useHaptic() {
  return haptic;
}

/**
 * Create an event handler wrapper that adds haptic feedback
 *
 * @param handler - The original event handler
 * @param type - The haptic feedback type (default: 'light')
 * @returns A new handler that triggers haptic feedback before calling the original
 *
 * @example
 * <button onClick={withHaptic(() => setCount(c => c + 1))}>
 *   Increment
 * </button>
 *
 * @example
 * <button onClick={withHaptic(handleSubmit, 'success')}>
 *   Submit
 * </button>
 */
export function withHaptic<T extends (...args: any[]) => any>(
  handler: T,
  type: HapticType = 'light'
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    haptic(type);
    return handler(...args);
  };
}

/**
 * Utility to add haptic to touch start events
 * Useful for adding to onTouchStart handlers
 *
 * @example
 * <div onTouchStart={hapticTouchStart}>...</div>
 */
export function hapticTouchStart(type: HapticType = 'light'): void {
  haptic(type);
}

export default haptic;
