import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

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

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when reduced motion is requested', () => {
    mockMatchMedia('(prefers-reduced-motion: reduce)', true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('returns false otherwise', () => {
    mockMatchMedia('(prefers-reduced-motion: reduce)', false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('updates when the preference changes', () => {
    const mql = mockMatchMedia('(prefers-reduced-motion: reduce)', false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => mql.set(true));
    expect(result.current).toBe(true);
  });

  it('renders defaultValue on the server without touching matchMedia', () => {
    function Probe() {
      return <span>{String(usePrefersReducedMotion(true))}</span>;
    }
    expect(renderToString(<Probe />)).toContain('true');
  });
});
