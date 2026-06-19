import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCopyToClipboard } from './useCopyToClipboard';

/** Installs a mock `navigator.clipboard.writeText`. */
function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn(writeText) },
  });
}

/** Removes `navigator.clipboard` to simulate an insecure context. */
function removeClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: undefined,
  });
}

describe('useCopyToClipboard', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    removeClipboard();
  });

  it('copies text and reports success', async () => {
    mockClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopyToClipboard());

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current[0]('hello');
    });

    expect(returned).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
    expect(result.current[1]).toMatchObject({
      value: 'hello',
      error: null,
      copied: true,
    });
  });

  it('resets `copied` to false after the default delay', async () => {
    vi.useFakeTimers();
    mockClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current[0]('hello');
    });
    expect(result.current[1].copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current[1].copied).toBe(false);
    // `value` survives the reset; only the transient flag flips.
    expect(result.current[1].value).toBe('hello');
  });

  it('keeps `copied` true when resetDelay is 0', async () => {
    vi.useFakeTimers();
    mockClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopyToClipboard({ resetDelay: 0 }));

    await act(async () => {
      await result.current[0]('hello');
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current[1].copied).toBe(true);
  });

  it('records an error and returns false when writeText rejects', async () => {
    mockClipboard(() => Promise.reject(new Error('denied')));
    const { result } = renderHook(() => useCopyToClipboard());

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current[0]('hello');
    });

    expect(returned).toBe(false);
    expect(result.current[1].copied).toBe(false);
    expect(result.current[1].error).toBeInstanceOf(Error);
    expect(result.current[1].error?.message).toBe('denied');
  });

  it('returns false when the Clipboard API is unavailable', async () => {
    removeClipboard();
    const { result } = renderHook(() => useCopyToClipboard());

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current[0]('hello');
    });

    expect(returned).toBe(false);
    expect(result.current[1].error).toBeInstanceOf(Error);
  });
});
