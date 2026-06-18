import * as React from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delayMs` has
 * passed without further changes. Each new value resets the timer, so rapid
 * updates collapse into a single trailing update.
 *
 * Useful for search inputs, resize handlers, or any value that drives an
 * expensive effect.
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(query, 300);
 * useEffect(() => { search(debouncedQuery); }, [debouncedQuery]);
 * ```
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
