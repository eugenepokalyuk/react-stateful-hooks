import { useCallback, useEffect, useRef, useState } from 'react';

import { isBrowser } from './isBrowser';
import { Serializer, defaultSerializer } from './serializer';

export interface UseStorageStateOptions<T> {
  /** Custom value <-> string conversion. Defaults to JSON. */
  serializer?: Serializer<T>;
  /**
   * Keep the value in sync when another tab writes to the same key
   * via the `storage` event. Defaults to `true`.
   */
  syncTabs?: boolean;
}

/** State updater: a new value or a function of the previous value. */
export type SetStorageValue<T> = (value: T | ((prev: T) => T)) => void;

export type UseStorageStateReturn<T> = [
  value: T,
  setValue: SetStorageValue<T>,
  removeValue: () => void,
];

/**
 * Shared engine behind {@link useLocalStorageState} and
 * {@link useSessionStorageState}. `getStorage` must be a stable reference so
 * the effect below does not re-subscribe on every render.
 */
export function useStorageState<T>(
  getStorage: () => Storage,
  key: string,
  defaultValue: T,
  options: UseStorageStateOptions<T> = {},
): UseStorageStateReturn<T> {
  const {
    serializer = defaultSerializer as Serializer<T>,
    syncTabs = true,
  } = options;

  // Hold the latest serializer/default in refs so the storage-event effect
  // can read them without listing them as dependencies (and re-subscribing).
  const serializerRef = useRef(serializer);
  serializerRef.current = serializer;
  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  const readValue = useCallback((): T => {
    if (!isBrowser) return defaultValueRef.current;
    try {
      const raw = getStorage().getItem(key);
      return raw === null
        ? defaultValueRef.current
        : serializerRef.current.parse(raw);
    } catch {
      // Unreadable storage or corrupted JSON — fall back to the default.
      return defaultValueRef.current;
    }
  }, [getStorage, key]);

  const [state, setState] = useState<T>(readValue);

  const setValue = useCallback<SetStorageValue<T>>(
    (value) => {
      setState((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        if (isBrowser) {
          try {
            getStorage().setItem(key, serializerRef.current.stringify(next));
          } catch {
            // Quota exceeded or private-mode storage — keep React state only.
          }
        }
        return next;
      });
    },
    [getStorage, key],
  );

  const removeValue = useCallback(() => {
    if (isBrowser) {
      try {
        getStorage().removeItem(key);
      } catch {
        // Ignore — there is nothing meaningful to recover from here.
      }
    }
    setState(defaultValueRef.current);
  }, [getStorage, key]);

  useEffect(() => {
    if (!isBrowser || !syncTabs) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== getStorage() || event.key !== key) return;
      try {
        setState(
          event.newValue === null
            ? defaultValueRef.current
            : serializerRef.current.parse(event.newValue),
        );
      } catch {
        setState(defaultValueRef.current);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [getStorage, key, syncTabs]);

  return [state, setValue, removeValue];
}
