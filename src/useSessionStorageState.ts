import {
  UseStorageStateOptions,
  UseStorageStateReturn,
  useStorageState,
} from './internal/useStorageState';

// Stable reference so `useStorageState`'s callbacks/effects stay stable.
const getSessionStorage = () => window.sessionStorage;

/**
 * `useState` that persists to `sessionStorage` (cleared when the tab closes).
 *
 * Shares the engine of {@link useLocalStorageState}: SSR-safe, resilient to
 * corrupted JSON and write failures, custom serializer support, and a
 * `removeValue` callback.
 *
 * Note: `sessionStorage` is scoped to a single tab, so cross-tab `syncTabs`
 * only fires for contexts that share the same session (e.g. `window.open`).
 *
 * @example
 * ```tsx
 * const [step, setStep] = useSessionStorageState('wizard:step', 0);
 * ```
 */
export function useSessionStorageState<T>(
  key: string,
  defaultValue: T,
  options?: UseStorageStateOptions<T>,
): UseStorageStateReturn<T> {
  return useStorageState(getSessionStorage, key, defaultValue, options);
}
