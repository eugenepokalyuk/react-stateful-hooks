import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { isBrowser } from './isBrowser';
import { Serializer, defaultSerializer } from './serializer';

export interface UseStorageStateOptions<T> {
  /** Custom value <-> string conversion. Defaults to JSON. */
  serializer?: Serializer<T>;
  /**
   * Keep the value in sync when another tab writes to the same key
   * via the `storage` event. Defaults to `true`. Components in the *same*
   * tab always stay in sync regardless of this flag.
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
 * Same-tab broadcast channel. The native `storage` event only fires in *other*
 * documents, so we dispatch this custom event to notify hooks living in the
 * current tab (including the one that triggered the write).
 */
const LOCAL_EVENT = 'react-stateful-hooks:storage';

interface LocalStorageEventDetail {
  key: string;
  storageArea: Storage | null;
}

/**
 * One cached entry per (storage, key). `useSyncExternalStore` requires
 * `getSnapshot` to return a referentially stable value while nothing has
 * changed, so we memoize the parsed value against the raw string last seen.
 * The cache is also what keeps a value alive in memory when a write to storage
 * fails (quota, private mode): we record the raw string actually present in
 * storage, so the in-memory value survives until storage changes externally.
 */
interface CacheEntry {
  raw: string | null;
  value: unknown;
}

const caches = new WeakMap<Storage, Map<string, CacheEntry>>();

function getCache(storage: Storage): Map<string, CacheEntry> {
  let cache = caches.get(storage);
  if (!cache) {
    cache = new Map();
    caches.set(storage, cache);
  }
  return cache;
}

function readRaw(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Shared engine behind {@link useLocalStorageState} and
 * {@link useSessionStorageState}. `getStorage` must be a stable reference so
 * the subscription below does not re-subscribe on every render.
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

  // Hold the latest serializer/default in refs so the snapshot/subscription
  // can read them without listing them as dependencies (and re-subscribing).
  const serializerRef = React.useRef(serializer);
  serializerRef.current = serializer;
  const defaultValueRef = React.useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  const getSnapshot = React.useCallback((): T => {
    if (!isBrowser) return defaultValueRef.current;

    const storage = getStorage();
    const raw = readRaw(storage, key);
    const cache = getCache(storage);
    const cached = cache.get(key);
    if (cached && cached.raw === raw) {
      return cached.value as T;
    }

    let value: T;
    try {
      value =
        raw === null
          ? defaultValueRef.current
          : serializerRef.current.parse(raw);
    } catch {
      // Corrupted JSON — fall back to the default.
      value = defaultValueRef.current;
    }
    cache.set(key, { raw, value });
    return value;
  }, [getStorage, key]);

  const getServerSnapshot = React.useCallback(
    (): T => defaultValueRef.current,
    [],
  );

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (!isBrowser) return () => {};
      const storage = getStorage();

      const handleLocal = (event: Event) => {
        const { detail } = event as CustomEvent<LocalStorageEventDetail>;
        if (detail.storageArea === storage && detail.key === key) {
          onStoreChange();
        }
      };
      const handleStorage = (event: StorageEvent) => {
        if (event.storageArea === storage && event.key === key) {
          onStoreChange();
        }
      };

      window.addEventListener(LOCAL_EVENT, handleLocal);
      if (syncTabs) window.addEventListener('storage', handleStorage);
      return () => {
        window.removeEventListener(LOCAL_EVENT, handleLocal);
        if (syncTabs) window.removeEventListener('storage', handleStorage);
      };
    },
    [getStorage, key, syncTabs],
  );

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Record what is actually in storage now, then wake same-tab subscribers.
  const commit = React.useCallback(
    (storage: Storage, value: T) => {
      getCache(storage).set(key, { raw: readRaw(storage, key), value });
      window.dispatchEvent(
        new CustomEvent<LocalStorageEventDetail>(LOCAL_EVENT, {
          detail: { key, storageArea: storage },
        }),
      );
    },
    [key],
  );

  const setValue = React.useCallback<SetStorageValue<T>>(
    (value) => {
      const prev = getSnapshot();
      const next = value instanceof Function ? value(prev) : value;
      if (!isBrowser) return;
      const storage = getStorage();
      try {
        storage.setItem(key, serializerRef.current.stringify(next));
      } catch {
        // Quota exceeded or private-mode storage — keep the value in memory
        // only; `commit` records the (unchanged) raw so it survives reads.
      }
      commit(storage, next);
    },
    [commit, getSnapshot, getStorage, key],
  );

  const removeValue = React.useCallback(() => {
    if (!isBrowser) return;
    const storage = getStorage();
    try {
      storage.removeItem(key);
    } catch {
      // Ignore — there is nothing meaningful to recover from here.
    }
    commit(storage, defaultValueRef.current);
  }, [commit, getStorage, key]);

  return [state, setValue, removeValue];
}
