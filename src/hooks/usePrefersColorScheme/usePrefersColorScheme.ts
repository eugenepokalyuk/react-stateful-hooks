import { useMediaQuery } from '../useMediaQuery';

export type ColorScheme = 'light' | 'dark';

/**
 * Tracks the user's preferred color scheme via
 * `(prefers-color-scheme: dark)` and re-renders when it changes.
 *
 * SSR-safe: returns `defaultScheme` (default `'light'`) on the server, so it
 * never touches `matchMedia` before hydration.
 *
 * @example
 * ```tsx
 * const scheme = usePrefersColorScheme(); // 'light' | 'dark'
 *
 * return <div data-theme={scheme} />;
 * ```
 */
export function usePrefersColorScheme(
  defaultScheme: ColorScheme = 'light',
): ColorScheme {
  const prefersDark = useMediaQuery(
    '(prefers-color-scheme: dark)',
    defaultScheme === 'dark',
  );

  return prefersDark ? 'dark' : 'light';
}
