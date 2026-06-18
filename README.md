# react-stateful-hooks

[![CI](https://github.com/EugenePokalyuk/react-stateful-hooks/actions/workflows/ci.yml/badge.svg)](https://github.com/EugenePokalyuk/react-stateful-hooks/actions/workflows/ci.yml)
![types](https://img.shields.io/badge/types-included-blue)
![license](https://img.shields.io/badge/license-MIT-green)

A small, **well-typed**, **SSR-safe** collection of React hooks for working with
browser state. Zero runtime dependencies, tree-shakeable, ships ESM + CJS + types.

> The problem: every project re-implements "persist this bit of state to
> `localStorage`" — and most versions break under SSR, crash on corrupted JSON,
> or silently drift out of sync between tabs. This library does it once, correctly.

## Install

```bash
npm install react-stateful-hooks
```

`react >= 17` is a peer dependency.

## `useLocalStorageState`

A drop-in `useState` that **persists to `localStorage`** and **stays in sync
across browser tabs**.

```tsx
import { useLocalStorageState } from 'react-stateful-hooks';

function ThemeToggle() {
  const [theme, setTheme, resetTheme] = useLocalStorageState('theme', 'light');

  return (
    <>
      <button onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
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
    serializer?: { parse(raw: string): T; stringify(value: T): T };
    syncTabs?: boolean; // default: true
  },
);
```

| Return | Description |
| --- | --- |
| `value` | Current value (typed as `T`). |
| `setValue` | Accepts a value **or** an updater `(prev) => next`, like `useState`. |
| `removeValue` | Clears the key from storage and resets state to `defaultValue`. |

### Behaviour worth knowing

- **SSR-safe** — returns `defaultValue` when there is no DOM, so it renders on
  the server without touching `window`.
- **Resilient** — corrupted JSON or a `getItem`/`setItem` failure (quota,
  private mode) falls back to the default and keeps the in-memory value instead
  of throwing.
- **Cross-tab sync** — listens to the `storage` event and updates state when
  another tab writes the same key. Disable with `{ syncTabs: false }`.
- **Custom serialization** — pass a `serializer` to support `Date`, `Map`,
  `BigInt`, or a compact wire format.

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
scroll positions, or any throwaway-per-session state.

```tsx
const [step, setStep] = useSessionStorageState('wizard:step', 0);
```

## `useDebouncedValue`

Returns a debounced copy of a value that only updates after the delay passes
without further changes — rapid updates collapse into a single trailing update.

```tsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebouncedValue(query, 300);

useEffect(() => {
  search(debouncedQuery);
}, [debouncedQuery]);
```

## `useMediaQuery`

Tracks whether a CSS media query matches and re-renders on change. SSR-safe —
returns `defaultState` (default `false`) on the server.

```tsx
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
const isWide = useMediaQuery('(min-width: 1024px)');
```

## Hooks

Built on a shared, tested core so each hook stays small and consistent:

- [x] `useLocalStorageState` — persisted state with cross-tab sync
- [x] `useSessionStorageState` — per-tab persisted state
- [x] `useDebouncedValue` — trailing-edge debounce
- [x] `useMediaQuery` — reactive, SSR-safe media queries

## Development

```bash
npm install
npm test          # Vitest + Testing Library (jsdom)
npm run lint
npm run typecheck
npm run build     # ESM + CJS + .d.ts via Vite library mode
```

## License

[MIT](./LICENSE) © Evgenii Pokalyuk
