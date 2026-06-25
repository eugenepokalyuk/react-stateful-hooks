# react-stateful-hooks

> **SSR-first React hooks for browser state — zero hydration mismatches, built on `useSyncExternalStore`.**

[![npm version](https://img.shields.io/npm/v/react-stateful-hooks.svg)](https://www.npmjs.com/package/react-stateful-hooks)
[![npm downloads](https://img.shields.io/npm/dm/react-stateful-hooks.svg)](https://www.npmjs.com/package/react-stateful-hooks)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-stateful-hooks.svg)](https://bundlephobia.com/package/react-stateful-hooks)
[![CI](https://github.com/eugenepokalyuk/react-stateful-hooks/actions/workflows/ci.yml/badge.svg)](https://github.com/eugenepokalyuk/react-stateful-hooks/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/eugenepokalyuk/react-stateful-hooks/branch/main/graph/badge.svg)](https://codecov.io/gh/eugenepokalyuk/react-stateful-hooks)
![types](https://img.shields.io/badge/types-included-blue)
![license](https://img.shields.io/badge/license-MIT-green)
[![docs](https://img.shields.io/badge/docs-live%20demos-8b5cf6)](https://eugenepokalyuk.github.io/react-stateful-hooks/)

A small, **well-typed**, **SSR-safe** collection of React hooks for browser
state. Every hook is built on React's official `useSyncExternalStore`, so it
renders a stable value on the server and **hydrates without a mismatch** — the
thing most hook libraries get wrong. Tree-shakeable, ~2 kB gzipped, ships
ESM + CJS + types, and its only runtime dependency is the
`use-sync-external-store` shim (for React 17)

> The problem: every project re-implements "persist this bit of state to
> `localStorage`" — and most versions break under SSR, crash on corrupted JSON,
> or silently drift out of sync between tabs. This library does it once, correctly

📖 **[Documentation & live demos →](https://eugenepokalyuk.github.io/react-stateful-hooks/)** — every hook with an interactive example (English / Русский).

## Hooks at a glance

| Hook                                                  | What it does                               |
| ----------------------------------------------------- | ------------------------------------------ |
| [`useLocalStorageState`](#uselocalstoragestate)       | Persisted state with cross-tab sync        |
| [`useSessionStorageState`](#usesessionstoragestate)   | Per-tab persisted state                    |
| [`useDebouncedValue`](#usedebouncedvalue)             | Trailing-edge debounce of a value          |
| [`useMediaQuery`](#usemediaquery)                     | Reactive, SSR-safe CSS media query         |
| [`useNetworkState`](#usenetworkstate)                 | Reactive, SSR-safe online/offline status   |
| [`useCopyToClipboard`](#usecopytoclipboard)           | Copy with auto-resetting "copied" feedback |
| [`usePrefersColorScheme`](#usepreferscolorscheme)     | Reactive `'light' \| 'dark'` preference    |
| [`usePrefersReducedMotion`](#useprefersreducedmotion) | Reactive reduced-motion preference         |
| [`useHydrated`](#usehydrated)                         | `true` after hydration, mismatch-free      |
| [`useCookieState`](#usecookiestate)                   | Cookie-backed state, flash-free under SSR  |

## Why react-stateful-hooks?

The hooks space is crowded — here is where this library is deliberately
different. The focus is correctness under SSR and across tabs, not breadth.

|                                        | react-stateful-hooks  | usehooks-ts |      react-use      |
| -------------------------------------- | :-------------------: | :---------: | :-----------------: |
| SSR-safe via `useSyncExternalStore`    |     ✅ every hook     | ⚠️ partial  | ⚠️ partial / legacy |
| Cross-tab storage sync                 |      ✅ built in      |     ❌      |         ⚠️          |
| Survives corrupted JSON / quota errors |     ✅ falls back     |     ❌      |         ❌          |
| Same-tab sync across components        |          ✅           |     ⚠️      |         ⚠️          |
| Bundle size                            | ~2 kB, tree-shakeable |    small    |        large        |
| Runtime dependencies                   |   1 (official shim)   |      0      |        many         |
| TypeScript-first                       |          ✅           |     ✅      |         ⚠️          |

If you need hundreds of hooks, reach for `react-use`. If you want a handful of
browser-state hooks that behave correctly in Next.js / Remix and across tabs,
this is for you.

## Install

```bash
npm install react-stateful-hooks
```

`react >= 17` is a peer dependency

## `useLocalStorageState`

A drop-in `useState` that **persists to `localStorage`** and **stays in sync
across browser tabs**

```tsx
import { useLocalStorageState } from 'react-stateful-hooks';

function ThemeToggle() {
  const [theme, setTheme, resetTheme] = useLocalStorageState('theme', 'light');

  return (
    <>
      <button
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      >
        Theme: {theme}
      </button>

      <button onClick={resetTheme}>Reset</button>
    </>
  );
}
```

### Signature

```ts
const [value, setValue, removeValue] = useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  options?: {
    serializer?: { parse(raw: string): T; stringify(value: T): string };
    syncTabs?: boolean; // default: true
  },
);
```

| Return        | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| `value`       | Current value (typed as `T`)                                        |
| `setValue`    | Accepts a value **or** an updater `(prev) => next`, like `useState` |
| `removeValue` | Clears the key from storage and resets state to `defaultValue`      |

### Behaviour worth knowing

- **SSR-safe** — built on `useSyncExternalStore`, so it returns `defaultValue`
  on the server and hydrates without a mismatch, then reads storage on the client
- **Resilient** — corrupted JSON or a `getItem`/`setItem` failure (quota,
  private mode) falls back to the default and keeps the in-memory value instead
  of throwing
- **Cross-tab sync** — listens to the `storage` event and updates state when
  another tab writes the same key. Disable with `{ syncTabs: false }`. Hooks in
  the _same_ tab always stay in sync, regardless of this flag
- **Custom serialization** — pass a `serializer` to support `Date`, `Map`,
  `BigInt`, or a compact wire format

```tsx
const [since, setSince] = useLocalStorageState('since', new Date(), {
  serializer: {
    parse: (raw) => new Date(JSON.parse(raw)),
    stringify: (value) => JSON.stringify(value.getTime()),
  },
});
```

## `useSessionStorageState`

Same API and guarantees as `useLocalStorageState`, but backed by
`sessionStorage` (state lives until the tab closes). Ideal for wizard steps,
scroll positions, or any throwaway-per-session state

```tsx
const [step, setStep] = useSessionStorageState('wizard:step', 0);
```

## `useDebouncedValue`

Returns a debounced copy of a value that only updates after the delay passes
without further changes — rapid updates collapse into a single trailing update

```tsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebouncedValue(query, 300);

useEffect(() => {
  search(debouncedQuery);
}, [debouncedQuery]);
```

## `useMediaQuery`

Tracks whether a CSS media query matches and re-renders on change. SSR-safe —
returns `defaultState` (default `false`) on the server

```tsx
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
const isWide = useMediaQuery('(min-width: 1024px)');
```

## `useNetworkState`

Tracks the browser's online/offline status. SSR-safe — returns
`{ online: defaultOnline }` (default `true`) on the server. `since` is the time
of the last status change, or `undefined` until the first transition

```tsx
const { online, since } = useNetworkState();

if (!online) return <Banner>You are offline.</Banner>;
```

```ts
const { online, since } = useNetworkState(defaultOnline?: boolean); // default: true
```

## `useCopyToClipboard`

Returns a `copy` function plus the state of the last copy attempt. Uses the
async Clipboard API (requires a secure context); when it's unavailable, `copy`
resolves `false` and records an `error` instead of throwing. `copied` flips back
to `false` after `resetDelay` ms so "Copied!" feedback needs no manual timer

```tsx
const [copy, { copied }] = useCopyToClipboard();

<button onClick={() => copy(url)}>{copied ? 'Copied!' : 'Copy link'}</button>;
```

```ts
const [copy, { value, error, copied }] = useCopyToClipboard(options?: {
  resetDelay?: number; // ms until `copied` resets; 0 = never. default: 2000
});
```

## `usePrefersColorScheme`

Tracks the user's preferred color scheme via `(prefers-color-scheme: dark)`
SSR-safe — returns `defaultScheme` (default `'light'`) on the server

```tsx
const scheme = usePrefersColorScheme(); // 'light' | 'dark'

return <div data-theme={scheme} />;
```

```ts
const scheme = usePrefersColorScheme(defaultScheme?: 'light' | 'dark'); // default: 'light'
```

## `usePrefersReducedMotion`

Tracks whether the user has requested reduced motion via
`(prefers-reduced-motion: reduce)`. SSR-safe — returns `defaultValue`
(default `false`) on the server

```tsx
const reduceMotion = usePrefersReducedMotion();

<motion.div animate={reduceMotion ? undefined : { x: 100 }} />;
```

## `useHydrated`

Returns `false` on the server and during the first client render, then `true`
once hydrated. Built on `useSyncExternalStore`, so the first client render
matches the server markup — **no hydration mismatch** — then flips to `true`
after commit. Use it to gate browser-only output

```tsx
const hydrated = useHydrated();

// Renders the same thing on both sides first, then the client-only value
return <span>{hydrated ? new Date().toLocaleTimeString() : null}</span>;
```

## `useCookieState`

A `useState` that persists to `document.cookie`. Unlike `localStorage`, cookies
are sent with every request, so the value can be read on the server and passed
via `serverValue` for a **flash-free SSR render** (ideal for theme/locale)

```tsx
const [theme, setTheme, clearTheme] = useCookieState('theme', 'light');
```

### Signature

```ts
const [value, setValue, removeValue] = useCookieState<T>(
  name: string,
  defaultValue: T,
  options?: {
    serializer?: { parse(raw: string): T; stringify(value: T): string };
    serverValue?: string | null; // raw cookie read on the server (SSR)
    path?: string; // default: '/'
    domain?: string;
    maxAge?: number; // seconds
    expires?: Date;
    sameSite?: 'lax' | 'strict' | 'none'; // default: 'lax' ('none' implies secure)
    secure?: boolean;
  },
);
```

- **SSR-safe** — returns `serverValue` (parsed) or `defaultValue` on the server,
  then reads the cookie on the client. In Next.js, pass the request cookie so
  the value renders during SSR instead of flashing the default
- **Resilient** — a corrupted cookie value falls back to the default
- **Same-tab sync** — hooks bound to the same cookie name stay in sync. Cookies
  have no cross-tab change event, so other tabs update on their next render

```tsx
// Next.js (App Router): no flash of the wrong theme on first paint
const [theme, setTheme] = useCookieState('theme', 'light', {
  maxAge: 60 * 60 * 24 * 365,
  serverValue: cookies().get('theme')?.value,
});
```

## `getColorSchemeScript`

A helper (not a hook) that returns a tiny blocking script to run **before first
paint**, so the page never flashes the wrong theme. It reads the stored choice
(from `useLocalStorageState` or `useCookieState`), falls back to the OS
preference, and sets a `light`/`dark` class on `<html>`

```tsx
// Next.js App Router — app/layout.tsx
import { getColorSchemeScript } from 'react-stateful-hooks';

<head>
  <script dangerouslySetInnerHTML={{ __html: getColorSchemeScript() }} />
</head>;
```

```ts
getColorSchemeScript(options?: {
  key?: string; // storage key, default: 'theme'
  storage?: 'localStorage' | 'cookie'; // default: 'localStorage'
  attribute?: string; // 'class' (default) or e.g. 'data-theme'
  defaultScheme?: 'light' | 'dark' | 'system'; // default: 'system'
});
```

See the full **[no-flash dark mode recipe](https://eugenepokalyuk.github.io/react-stateful-hooks/en/guides/no-flash-dark-mode/)**
in the docs.

## Development

```bash
npm install
npm test          # Vitest + Testing Library (jsdom)
npm run lint
npm run typecheck
npm run build     # ESM + CJS + .d.ts via Vite library mode
```

## Contributing

Issues and PRs are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for the
workflow and conventions. Changes are tracked in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE) © Evgenii Pokalyuk
