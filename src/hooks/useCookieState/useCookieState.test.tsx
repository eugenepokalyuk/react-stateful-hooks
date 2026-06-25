import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { useCookieState } from './useCookieState';

function clearCookies() {
  for (const pair of document.cookie ? document.cookie.split('; ') : []) {
    const name = pair.slice(0, pair.indexOf('='));
    document.cookie = `${name}=; Max-Age=0; Path=/`;
  }
}

describe('useCookieState', () => {
  afterEach(clearCookies);

  it('returns the default when the cookie is absent', () => {
    const { result } = renderHook(() => useCookieState('missing', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('reads an existing cookie value', () => {
    document.cookie = `theme=${encodeURIComponent('"dark"')}; Path=/`;
    const { result } = renderHook(() => useCookieState('theme', 'light'));
    expect(result.current[0]).toBe('dark');
  });

  it('writes the cookie and updates state', () => {
    const { result } = renderHook(() => useCookieState('count', 0));

    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(document.cookie).toContain(`count=${encodeURIComponent('5')}`);
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useCookieState('count', 1));

    act(() => result.current[1]((prev) => prev + 1));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(3);
  });

  it('removes the cookie and resets to the default', () => {
    const { result } = renderHook(() => useCookieState('token', 'none'));

    act(() => result.current[1]('abc'));
    expect(result.current[0]).toBe('abc');

    act(() => result.current[2]());
    expect(result.current[0]).toBe('none');
    expect(document.cookie).not.toContain('token=abc');
  });

  it('falls back to the default for a corrupted value', () => {
    document.cookie = 'broken=not-json; Path=/';
    const { result } = renderHook(() =>
      useCookieState<{ ok: boolean }>('broken', { ok: true }),
    );
    expect(result.current[0]).toEqual({ ok: true });
  });

  it('keeps hooks for the same cookie in sync within a tab', () => {
    const a = renderHook(() => useCookieState('shared', 0));
    const b = renderHook(() => useCookieState('shared', 0));

    act(() => a.result.current[1](42));
    expect(a.result.current[0]).toBe(42);
    expect(b.result.current[0]).toBe(42);
  });

  it('honours a custom serializer', () => {
    const { result } = renderHook(() =>
      useCookieState('since', new Date(0), {
        serializer: {
          parse: (raw) => new Date(JSON.parse(raw)),
          stringify: (value) => JSON.stringify(value.getTime()),
        },
      }),
    );

    const date = new Date('2020-01-01T00:00:00.000Z');
    act(() => result.current[1](date));
    expect(result.current[0].getTime()).toBe(date.getTime());
  });

  it('renders serverValue on the server for a flash-free SSR', () => {
    function Probe() {
      const [theme] = useCookieState('theme', 'light', {
        serverValue: '"dark"',
      });
      return <span>{theme}</span>;
    }

    expect(renderToString(<Probe />)).toContain('dark');
  });

  it('renders the default on the server without serverValue', () => {
    function Probe() {
      const [theme] = useCookieState('theme', 'light');
      return <span>{theme}</span>;
    }

    expect(renderToString(<Probe />)).toContain('light');
  });

  it('serializes cookie attributes when writing', () => {
    // jsdom's `document.cookie` getter never echoes attributes, so capture the
    // raw string passed to the setter instead.
    let obj: object = document;
    let descriptor: PropertyDescriptor | undefined;
    while (
      obj &&
      !(descriptor = Object.getOwnPropertyDescriptor(obj, 'cookie'))
    ) {
      obj = Object.getPrototypeOf(obj);
    }
    const writes: string[] = [];
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => descriptor!.get!.call(document),
      set: (value: string) => {
        writes.push(value);
        descriptor!.set!.call(document, value);
      },
    });

    try {
      const { result } = renderHook(() =>
        useCookieState('opts', 'x', {
          path: '/app',
          domain: 'example.com',
          maxAge: 3600,
          expires: new Date('2030-01-01T00:00:00.000Z'),
          sameSite: 'none',
        }),
      );
      act(() => result.current[1]('y'));

      const written = writes.at(-1) ?? '';
      expect(written).toContain('Path=/app');
      expect(written).toContain('Domain=example.com');
      expect(written).toContain('Max-Age=3600');
      expect(written).toContain('Expires=');
      expect(written).toContain('SameSite=none');
      expect(written).toContain('Secure'); // implied by SameSite=none
    } finally {
      delete (document as { cookie?: unknown }).cookie;
    }
  });
});
