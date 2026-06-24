# Contributing

Thanks for your interest in improving **react-stateful-hooks**! This is a small,
focused library — contributions that keep it small, well-typed, and SSR-safe are
very welcome.

## Getting started

```bash
git clone https://github.com/eugenepokalyuk/react-stateful-hooks.git
cd react-stateful-hooks
npm install
```

## Workflow

Run the full check suite before opening a PR — CI runs exactly these:

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm test              # Vitest + Testing Library (jsdom)
npm run test:coverage # coverage thresholds (see vitest.config.ts)
npm run build         # ESM + CJS + .d.ts via Vite library mode
```

## Adding a hook

Each hook lives in its own folder under `src/hooks/<hookName>/`:

```
src/hooks/useExample/
  useExample.ts        # implementation + JSDoc with an @example
  useExample.test.tsx  # co-located tests
  index.ts             # re-export: export { useExample } from './useExample';
```

Then export it from `src/index.ts` (value first, then any public types).

Guidelines:

- **SSR-safe.** Prefer `useSyncExternalStore` for anything that reads browser
  state. Return a stable server snapshot; never touch `window`/`document` during
  render on the server. Guard with the `isBrowser` helper in `src/internal/`.
- **No new runtime dependencies** without discussion — keeping the bundle tiny
  is a feature.
- **Typed.** Public hooks are generic where it helps; export public types from
  `src/index.ts`.
- **Tested.** Cover the happy path, the SSR path, and failure modes (e.g.
  corrupted input, missing APIs).
- **Documented.** Add a JSDoc block with an `@example`, and a section in the
  README plus a row in the "Hooks at a glance" table.

## Commit & PR conventions

- Conventional-commit style messages (`feat:`, `fix:`, `docs:`, `chore:`,
  `refactor:`, `test:`).
- Add an entry under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md).
- Keep PRs focused; one logical change per PR.

## Code style

Formatting is handled by Prettier and import order by ESLint — run `npm run lint`
and apply Prettier (`npx prettier --write .`) before committing.
