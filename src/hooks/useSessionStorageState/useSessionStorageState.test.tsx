import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useSessionStorageState } from './useSessionStorageState';

describe('useSessionStorageState', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('returns the default value when storage is empty', () => {
    const { result } = renderHook(() => useSessionStorageState('k', 'def'));
    expect(result.current[0]).toBe('def');
  });

  it('reads an existing value from sessionStorage on mount', () => {
    window.sessionStorage.setItem('k', '"stored"');
    const { result } = renderHook(() => useSessionStorageState('k', 'def'));
    expect(result.current[0]).toBe('stored');
  });

  it('persists updates to sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorageState('count', 0));
    act(() => result.current[1](7));
    expect(result.current[0]).toBe(7);
    expect(window.sessionStorage.getItem('count')).toBe('7');
  });

  it('removes the value and resets to the default', () => {
    const { result } = renderHook(() => useSessionStorageState('count', 0));
    act(() => result.current[1](3));
    act(() => result.current[2]());
    expect(result.current[0]).toBe(0);
    expect(window.sessionStorage.getItem('count')).toBeNull();
  });

  it('does not write to localStorage', () => {
    const { result } = renderHook(() => useSessionStorageState('count', 0));
    act(() => result.current[1](7));
    expect(window.localStorage.getItem('count')).toBeNull();
  });
});
