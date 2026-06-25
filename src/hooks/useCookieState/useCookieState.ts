import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { isBrowser } from '../../internal/isBrowser';
import {
  CookieAttributes,
  deleteCookie,
  readCookie,
  writeCookie,
} from '../../internal/cookies';
import { Serializer, defaultSerializer } from '../../internal/serializer';

export interface UseCookieStateOptions<T> extends CookieAttributes {
  /** Custom value <-> string conversion. Defaults to JSON. */
  serializer?: Serializer<T>;
  /**
   * The raw cookie string read on the server (e.g. from the request headers).
   * Lets the server and the first client render agree, so a value present in
   * the cookie shows up during SSR instead of flashing the default. Omit it and
   * the server falls back to `defaultValue`.
   */
  serverValue?: string | null;
}

/** State updater: a new value or a function of the previous value. */
export type SetCookieValue<T> = (value: T | ((prev: T) => T)) => void;

export type UseCookieStateReturn<T> = [
  value: T,
  setValue: SetCookieValue<T>,
  removeValue: () => void,
];

/**
 * Same-tab broadcast: cookies fire no native change event, so we notify other
 * hooks in this tab ourselves. (Cookies have no cross-tab event at all.)
 */
const COOKIE_EVENT = 'react-stateful-hooks:cookie';

interface CookieEventDetail {
  name: string;
}

/**
 * `getSnapshot` must stay referentially stable while the cookie is unchanged,
 * so we memoize the parsed value against the raw string last seen.
 */
interface CacheEntry {
  raw: string | null;
  value: unknown;
}

const cache = new Map<string, CacheEntry>();

/**
 * A `useState` that persists to `document.cookie`. Unlike `localStorage`,
 * cookies are sent with every request, so the value can be read on the server
 * and passed through `options.serverValue` for a flash-free SSR render.
 *
 * - SSR-safe: built on `useSyncExternalStore`; returns `serverValue` (parsed) or
 *   `defaultValue` on the server, then reads the cookie on the client.
 * - Resilient: a corrupted cookie value falls back to the default.
 * - Same-tab sync: hooks bound to the same cookie name stay in sync. Cookies
 *   have no cross-tab change event, so other tabs update on their next render.
 *
 * @example
 * ```tsx
 * const [theme, setTheme, clearTheme] = useCookieState('theme', 'light', {
 *   maxAge: 60 * 60 * 24 * 365, // one year
 *   serverValue: cookies().get('theme')?.value, // Next.js: flash-free SSR
 * });
 * ```
 */
export function useCookieState<T>(
  name: string,
  defaultValue: T,
  options: UseCookieStateOptions<T> = {},
): UseCookieStateReturn<T> {
  const { serializer = defaultSerializer as Serializer<T>, serverValue } =
    options;

  // Hold the latest serializer/default/attributes in refs so the snapshot and
  // callbacks can read them without re-subscribing on every render.
  const serializerRef = React.useRef(serializer);
  serializerRef.current = serializer;
  const defaultValueRef = React.useRef(defaultValue);
  defaultValueRef.current = defaultValue;
  const attributesRef = React.useRef<CookieAttributes>(options);
  attributesRef.current = options;

  const parse = React.useCallback((raw: string | null): T => {
    if (raw === null) return defaultValueRef.current;
    try {
      return serializerRef.current.parse(raw);
    } catch {
      // Corrupted value — fall back to the default.
      return defaultValueRef.current;
    }
  }, []);

  const getSnapshot = React.useCallback((): T => {
    if (!isBrowser) return defaultValueRef.current;
    const raw = readCookie(name);
    const cached = cache.get(name);
    if (cached && cached.raw === raw) {
      return cached.value as T;
    }
    const value = parse(raw);
    cache.set(name, { raw, value });
    return value;
  }, [name, parse]);

  // Parse the server value once so `getServerSnapshot` is referentially stable.
  const serverSnapshot = React.useMemo(
    () => (serverValue === undefined ? defaultValue : parse(serverValue)),
    // `defaultValue`/`parse` are intentionally read once with the server value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serverValue],
  );
  const getServerSnapshot = React.useCallback(
    () => serverSnapshot,
    [serverSnapshot],
  );

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (!isBrowser) return () => {};
      const handle = (event: Event) => {
        const { detail } = event as CustomEvent<CookieEventDetail>;
        if (detail.name === name) onStoreChange();
      };
      window.addEventListener(COOKIE_EVENT, handle);
      return () => window.removeEventListener(COOKIE_EVENT, handle);
    },
    [name],
  );

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const broadcast = React.useCallback(() => {
    window.dispatchEvent(
      new CustomEvent<CookieEventDetail>(COOKIE_EVENT, { detail: { name } }),
    );
  }, [name]);

  const setValue = React.useCallback<SetCookieValue<T>>(
    (value) => {
      const prev = getSnapshot();
      const next = value instanceof Function ? value(prev) : value;
      if (!isBrowser) return;
      writeCookie(
        name,
        serializerRef.current.stringify(next),
        attributesRef.current,
      );
      cache.set(name, { raw: readCookie(name), value: next });
      broadcast();
    },
    [broadcast, getSnapshot, name],
  );

  const removeValue = React.useCallback(() => {
    if (!isBrowser) return;
    deleteCookie(name, attributesRef.current);
    cache.set(name, { raw: readCookie(name), value: defaultValueRef.current });
    broadcast();
  }, [broadcast, name]);

  return [state, setValue, removeValue];
}
