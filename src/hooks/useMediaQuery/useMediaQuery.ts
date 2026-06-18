import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { isBrowser } from '../../internal/isBrowser';

/**
 * Tracks whether a CSS media query currently matches, and re-renders when it
 * changes.
 *
 * - SSR-safe: returns `defaultState` (default `false`) when there is no DOM,
 *   so it never touches `window.matchMedia` on the server and stays consistent
 *   through hydration.
 * - Subscribes via `MediaQueryList`'s `change` event and cleans up on unmount.
 *
 * @example
 * ```tsx
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * const isWide = useMediaQuery('(min-width: 1024px)');
 * ```
 */
export function useMediaQuery(query: string, defaultState = false): boolean {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (!isBrowser) return () => {};
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', onStoreChange);
      return () =>
        mediaQueryList.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = React.useCallback(
    () => (isBrowser ? window.matchMedia(query).matches : defaultState),
    [query, defaultState],
  );

  const getServerSnapshot = React.useCallback(
    () => defaultState,
    [defaultState],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
