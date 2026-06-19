import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { isBrowser } from '../../internal/isBrowser';

export interface NetworkState {
  /** Whether the browser currently has a network connection. */
  online: boolean;
  /**
   * When `online` last changed during this hook's lifetime. `undefined` until
   * the first transition is observed (the mount value carries no timestamp,
   * since we don't know when it became what it is).
   */
  since?: Date;
}

/**
 * Tracks the browser's online/offline status and re-renders when it flips.
 *
 * - SSR-safe: returns `{ online: defaultOnline }` (default `true`) when there
 *   is no DOM, so it never touches `navigator` on the server and stays
 *   consistent through hydration.
 * - Subscribes to the `online`/`offline` window events and cleans up on
 *   unmount.
 * - The snapshot is referentially stable while the status is unchanged, as
 *   required by `useSyncExternalStore`.
 *
 * @example
 * ```tsx
 * const { online, since } = useNetworkState();
 * if (!online) return <Banner>You are offline.</Banner>;
 * ```
 */
export function useNetworkState(defaultOnline = true): NetworkState {
  // One cached snapshot per hook instance. `getSnapshot` must return a stable
  // reference until the value actually changes, so we reuse the cached object
  // whenever `navigator.onLine` is unchanged and only mint a new one (stamped
  // with `since`) on a real transition.
  const cacheRef = React.useRef<NetworkState | null>(null);

  const getSnapshot = React.useCallback((): NetworkState => {
    if (!isBrowser) {
      return cacheRef.current ?? (cacheRef.current = { online: defaultOnline });
    }
    const online = navigator.onLine;
    const prev = cacheRef.current;
    if (prev && prev.online === online) return prev;
    const next: NetworkState = {
      online,
      since: prev ? new Date() : undefined,
    };
    cacheRef.current = next;
    return next;
  }, [defaultOnline]);

  const getServerSnapshot = React.useCallback(
    (): NetworkState =>
      cacheRef.current ?? (cacheRef.current = { online: defaultOnline }),
    [defaultOnline],
  );

  const subscribe = React.useCallback((onStoreChange: () => void) => {
    if (!isBrowser) return () => {};
    window.addEventListener('online', onStoreChange);
    window.addEventListener('offline', onStoreChange);
    return () => {
      window.removeEventListener('online', onStoreChange);
      window.removeEventListener('offline', onStoreChange);
    };
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
