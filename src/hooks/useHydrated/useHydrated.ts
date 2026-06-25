import { useSyncExternalStore } from 'use-sync-external-store/shim';

// The store never changes after mount, so the subscription is a no-op.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns `false` on the server and during the first client render, then `true`
 * once the component has hydrated.
 *
 * Because it is built on `useSyncExternalStore`, the first client render uses
 * the server snapshot (`false`), so it matches the server markup and never
 * triggers a hydration mismatch — then it updates to `true` right after commit.
 * Use it to gate browser-only UI that would otherwise differ between server and
 * client.
 *
 * @example
 * ```tsx
 * const hydrated = useHydrated();
 *
 * // Avoids "text content did not match" by rendering the same thing on both
 * // sides first, then revealing the client-only value after hydration.
 * return <span>{hydrated ? new Date().toLocaleTimeString() : null}</span>;
 * ```
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
