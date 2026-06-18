import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useMediaQuery } from './useMediaQuery';

/**
 * jsdom has no `matchMedia`, so we install a controllable mock that lets the
 * test flip the match state and notify subscribed listeners.
 */
function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();

  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: '',
    onchange: null,
    addEventListener: (_type: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_type: string, cb: () => void) => listeners.delete(cb),
    addListener: (cb: () => void) => listeners.add(cb),
    removeListener: (cb: () => void) => listeners.delete(cb),
    dispatchEvent: () => true,
  };

  window.matchMedia = vi
    .fn()
    .mockImplementation(() => mediaQueryList) as typeof window.matchMedia;

  return {
    set(next: boolean) {
      matches = next;
      listeners.forEach((cb) => cb());
    },
  };
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the current match state on mount', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const mql = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);

    act(() => mql.set(true));
    expect(result.current).toBe(true);

    act(() => mql.set(false));
    expect(result.current).toBe(false);
  });

  it('renders defaultState on the server without touching matchMedia', () => {
    function Probe() {
      const isWide = useMediaQuery('(min-width: 1024px)', true);
      return <span>{String(isWide)}</span>;
    }

    // No matchMedia mock installed: the server snapshot must not call it.
    expect(renderToString(<Probe />)).toContain('true');
  });
});
