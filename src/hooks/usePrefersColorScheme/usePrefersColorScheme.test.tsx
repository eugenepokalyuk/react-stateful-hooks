import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePrefersColorScheme } from './usePrefersColorScheme';

/** Mocks `matchMedia` for a single query, with a controllable match state. */
function mockMatchMedia(query: string, initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();

  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    get matches() {
      return q === query ? matches : false;
    },
    media: q,
    onchange: null,
    addEventListener: (_type: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_type: string, cb: () => void) => listeners.delete(cb),
    addListener: (cb: () => void) => listeners.add(cb),
    removeListener: (cb: () => void) => listeners.delete(cb),
    dispatchEvent: () => true,
  })) as typeof window.matchMedia;

  return {
    set(next: boolean) {
      matches = next;
      listeners.forEach((cb) => cb());
    },
  };
}

describe('usePrefersColorScheme', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 'dark' when the dark scheme matches", () => {
    mockMatchMedia('(prefers-color-scheme: dark)', true);
    const { result } = renderHook(() => usePrefersColorScheme());
    expect(result.current).toBe('dark');
  });

  it("returns 'light' when the dark scheme does not match", () => {
    mockMatchMedia('(prefers-color-scheme: dark)', false);
    const { result } = renderHook(() => usePrefersColorScheme());
    expect(result.current).toBe('light');
  });

  it('updates when the preference changes', () => {
    const mql = mockMatchMedia('(prefers-color-scheme: dark)', false);
    const { result } = renderHook(() => usePrefersColorScheme());
    expect(result.current).toBe('light');

    act(() => mql.set(true));
    expect(result.current).toBe('dark');
  });

  it('renders defaultScheme on the server without touching matchMedia', () => {
    function Probe() {
      return <span>{usePrefersColorScheme('dark')}</span>;
    }
    expect(renderToString(<Probe />)).toContain('dark');
  });
});
