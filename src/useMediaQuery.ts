import { useEffect, useState } from 'react';

import { isBrowser } from './internal/isBrowser';

/**
 * Tracks whether a CSS media query currently matches, and re-renders when it
 * changes.
 *
 * - SSR-safe: returns `defaultState` (default `false`) when there is no DOM,
 *   so it never touches `window.matchMedia` on the server.
 * - Subscribes via `MediaQueryList`'s `change` event and cleans up on unmount.
 *
 * @example
 * ```tsx
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * const isWide = useMediaQuery('(min-width: 1024px)');
 * ```
 */
export function useMediaQuery(query: string, defaultState = false): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    isBrowser ? window.matchMedia(query).matches : defaultState,
  );

  useEffect(() => {
    if (!isBrowser) return;

    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);

    // Sync immediately in case the query changed between render and effect.
    handleChange();
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
