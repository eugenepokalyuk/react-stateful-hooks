import { useMediaQuery } from '../useMediaQuery';

/**
 * Tracks whether the user has requested reduced motion via
 * `(prefers-reduced-motion: reduce)` and re-renders when it changes.
 *
 * SSR-safe: returns `defaultValue` (default `false`) on the server, so it never
 * touches `matchMedia` before hydration.
 *
 * @example
 * ```tsx
 * const reduceMotion = usePrefersReducedMotion();
 * <motion.div animate={reduceMotion ? undefined : { x: 100 }} />;
 * ```
 */
export function usePrefersReducedMotion(defaultValue = false): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', defaultValue);
}
