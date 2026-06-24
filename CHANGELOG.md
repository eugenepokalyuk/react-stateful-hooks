# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `repository`, `bugs`, and `homepage` fields in `package.json` so npm links
  back to the GitHub project.
- Test coverage via `@vitest/coverage-v8`, exposed through the `test:coverage`
  script with `text`, `html`, and `lcov` reporters and coverage thresholds.
  CI now runs coverage and uploads it to Codecov.
- This changelog.
- `CONTRIBUTING.md`, GitHub issue forms (bug / feature), and a pull-request
  template.
- README: SSR-first positioning, npm/bundle-size/coverage badges, and a
  comparison table vs. `usehooks-ts` and `react-use`.
- More discoverable npm keywords (`ssr-safe`, `hydration`, `nextjs`, `remix`,
  `usesyncexternalstore`, `react-hooks`).

### Fixed

- Corrected the CI badge URL casing (`eugenepokalyuk`) so it renders.

## [0.1.3] - 2026-06-19

### Added

- `usePrefersColorScheme` — tracks `(prefers-color-scheme: dark)` and returns
  `'light' | 'dark'`.
- `usePrefersReducedMotion` — tracks `(prefers-reduced-motion: reduce)`.

## [0.1.2] - 2026-06-19

### Added

- `useNetworkState` — exposes online/offline status and Network Information
  details.
- `useCopyToClipboard` — copies text to the clipboard with success/error state.

## [0.1.1] - 2026-06-18

### Fixed

- All hooks are now SSR-safe via `useSyncExternalStore`, returning a stable
  server snapshot and avoiding hydration mismatches.

## [0.1.0] - 2026-06-18

### Added

- `useLocalStorageState` — `useState` persisted to `localStorage` with cross-tab
  sync, custom serializers, and a `removeValue` reset.
- `useSessionStorageState` — the same engine backed by `sessionStorage`.
- `useDebouncedValue` — returns a trailing-debounced copy of a value.
- `useMediaQuery` — tracks a CSS media query and re-renders on change.

[Unreleased]: https://github.com/eugenepokalyuk/react-stateful-hooks/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/eugenepokalyuk/react-stateful-hooks/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/eugenepokalyuk/react-stateful-hooks/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/eugenepokalyuk/react-stateful-hooks/releases/tag/v0.1.1
[0.1.0]: https://github.com/eugenepokalyuk/react-stateful-hooks/releases/tag/v0.1.0
