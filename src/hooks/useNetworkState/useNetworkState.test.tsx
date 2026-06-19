import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { useNetworkState } from './useNetworkState';

/** Overrides `navigator.onLine` for the duration of a test. */
function setOnLine(value: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value,
  });
}

describe('useNetworkState', () => {
  afterEach(() => {
    setOnLine(true);
  });

  it('returns the current online status on mount with no timestamp', () => {
    setOnLine(true);
    const { result } = renderHook(() => useNetworkState());
    expect(result.current.online).toBe(true);
    expect(result.current.since).toBeUndefined();
  });

  it('reflects an offline navigator on mount', () => {
    setOnLine(false);
    const { result } = renderHook(() => useNetworkState());
    expect(result.current.online).toBe(false);
  });

  it('updates and stamps `since` when the status changes', () => {
    setOnLine(true);
    const { result } = renderHook(() => useNetworkState());
    expect(result.current.online).toBe(true);

    act(() => {
      setOnLine(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.online).toBe(false);
    expect(result.current.since).toBeInstanceOf(Date);

    act(() => {
      setOnLine(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.online).toBe(true);
  });

  it('keeps a stable snapshot reference while the status is unchanged', () => {
    setOnLine(true);
    const { result, rerender } = renderHook(() => useNetworkState());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('renders defaultOnline on the server without touching navigator', () => {
    function Probe() {
      const { online } = useNetworkState(false);
      return <span>{String(online)}</span>;
    }
    expect(renderToString(<Probe />)).toContain('false');
  });
});
