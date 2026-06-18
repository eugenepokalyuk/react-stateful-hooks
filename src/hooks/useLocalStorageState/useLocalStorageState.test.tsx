import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { useLocalStorageState } from './useLocalStorageState';

describe('useLocalStorageState', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('returns the default value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorageState('count', 0));
    expect(result.current[0]).toBe(0);
  });

  it('reads an existing value from localStorage on mount', () => {
    window.localStorage.setItem('count', '42');
    const { result } = renderHook(() => useLocalStorageState('count', 0));
    expect(result.current[0]).toBe(42);
  });

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorageState('count', 0));
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(window.localStorage.getItem('count')).toBe('5');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorageState('count', 1));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
    expect(window.localStorage.getItem('count')).toBe('2');
  });

  it('serializes and restores complex objects', () => {
    const { result } = renderHook(() =>
      useLocalStorageState('user', { name: '', tags: [] as string[] }),
    );
    act(() => result.current[1]({ name: 'Eugene', tags: ['a', 'b'] }));
    expect(result.current[0]).toEqual({ name: 'Eugene', tags: ['a', 'b'] });
    expect(window.localStorage.getItem('user')).toBe(
      '{"name":"Eugene","tags":["a","b"]}',
    );
  });

  it('removes the value and resets to the default', () => {
    const { result } = renderHook(() => useLocalStorageState('count', 0));
    act(() => result.current[1](9));
    act(() => result.current[2]());
    expect(result.current[0]).toBe(0);
    expect(window.localStorage.getItem('count')).toBeNull();
  });

  it('falls back to the default on corrupted JSON', () => {
    window.localStorage.setItem('obj', '{not valid json');
    const { result } = renderHook(() =>
      useLocalStorageState('obj', { a: 1 }),
    );
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it('syncs when another tab writes the same key', () => {
    const { result } = renderHook(() => useLocalStorageState('count', 0));
    act(() => {
      // A real cross-tab write updates storage before the event fires.
      window.localStorage.setItem('count', '100');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'count',
          newValue: '100',
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe(100);
  });

  it('ignores storage events for other keys', () => {
    const { result } = renderHook(() => useLocalStorageState('count', 0));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'unrelated',
          newValue: '999',
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe(0);
  });

  it('does not subscribe to storage events when syncTabs is false', () => {
    const { result } = renderHook(() =>
      useLocalStorageState('count', 0, { syncTabs: false }),
    );
    act(() => {
      window.localStorage.setItem('count', '100');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'count',
          newValue: '100',
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe(0);
  });

  it('syncs across hooks in the same tab', () => {
    const a = renderHook(() => useLocalStorageState('shared', 0));
    const b = renderHook(() => useLocalStorageState('shared', 0));

    act(() => a.result.current[1](7));

    expect(a.result.current[0]).toBe(7);
    expect(b.result.current[0]).toBe(7);
  });

  it('re-reads the stored value when the key changes', () => {
    window.localStorage.setItem('k1', '"one"');
    window.localStorage.setItem('k2', '"two"');

    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorageState(key, 'default'),
      { initialProps: { key: 'k1' } },
    );
    expect(result.current[0]).toBe('one');

    rerender({ key: 'k2' });
    expect(result.current[0]).toBe('two');
  });

  it('keeps the value in memory when a write to storage fails', () => {
    // A serializer that throws stands in for quota / private-mode failures:
    // both land in the same write-failure branch.
    const serializer = {
      parse: (raw: string) => JSON.parse(raw) as number,
      stringify: () => {
        throw new Error('QuotaExceeded');
      },
    };

    const { result } = renderHook(() =>
      useLocalStorageState('count', 0, { serializer }),
    );
    act(() => result.current[1](5));

    expect(result.current[0]).toBe(5);
    expect(window.localStorage.getItem('count')).toBeNull();
  });

  it('renders the default on the server without a hydration mismatch', () => {
    window.localStorage.setItem('count', '42');

    function Counter() {
      const [value] = useLocalStorageState('count', 0);
      return <span>{value}</span>;
    }

    expect(renderToString(<Counter />)).toContain('>0<');
  });
});
