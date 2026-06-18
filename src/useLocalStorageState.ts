import {
  UseStorageStateOptions,
  UseStorageStateReturn,
  useStorageState,
} from './internal/useStorageState';

// Stable reference so `useStorageState`'s callbacks/effects stay stable.
const getLocalStorage = () => window.localStorage;

/**
 * `useState` that persists to `localStorage` and stays in sync across tabs.
 *
 * - SSR-safe: returns `defaultValue` when there is no DOM.
 * - Survives corrupted JSON and storage write failures by falling back to
 *   the default and keeping the in-memory value.
 * - Returns a `removeValue` callback that clears the key and resets to default.
 *
 * @example
 * ```tsx
 * const [theme, setTheme, resetTheme] = useLocalStorageState('theme', 'light');
 * ```
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  options?: UseStorageStateOptions<T>,
): UseStorageStateReturn<T> {
  return useStorageState(getLocalStorage, key, defaultValue, options);
}
