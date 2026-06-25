import { afterEach, describe, expect, it, vi } from 'vitest';

import { getColorSchemeScript } from './getColorSchemeScript';

function run(script: string) {
  // The snippet is an IIFE; evaluate it as the browser would.
  // eslint-disable-next-line no-eval
  (0, eval)(script);
}

function mockMatchMedia(dark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: dark && query.includes('dark'),
    media: query,
  })) as unknown as typeof window.matchMedia;
}

describe('getColorSchemeScript', () => {
  const html = document.documentElement;

  afterEach(() => {
    html.className = '';
    html.removeAttribute('data-theme');
    html.style.colorScheme = '';
    localStorage.clear();
    for (const pair of document.cookie ? document.cookie.split('; ') : []) {
      document.cookie = `${pair.slice(0, pair.indexOf('='))}=; Max-Age=0; Path=/`;
    }
    vi.restoreAllMocks();
  });

  it('applies a stored localStorage choice as a class', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));
    run(getColorSchemeScript());

    expect(html.classList.contains('dark')).toBe(true);
    expect(html.style.colorScheme).toBe('dark');
  });

  it('falls back to the system preference when nothing is stored', () => {
    mockMatchMedia(true);
    run(getColorSchemeScript());
    expect(html.classList.contains('dark')).toBe(true);
  });

  it('uses an explicit defaultScheme over the system preference', () => {
    mockMatchMedia(true);
    run(getColorSchemeScript({ defaultScheme: 'light' }));
    expect(html.classList.contains('light')).toBe(true);
    expect(html.classList.contains('dark')).toBe(false);
  });

  it('reads from a cookie when storage is "cookie"', () => {
    document.cookie = `theme=${encodeURIComponent('"dark"')}; Path=/`;
    run(getColorSchemeScript({ storage: 'cookie' }));
    expect(html.classList.contains('dark')).toBe(true);
  });

  it('writes to a data attribute when configured', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));
    run(getColorSchemeScript({ attribute: 'data-theme' }));
    expect(html.getAttribute('data-theme')).toBe('dark');
    expect(html.classList.contains('dark')).toBe(false);
  });

  it('honours a custom storage key', () => {
    localStorage.setItem('color', JSON.stringify('light'));
    mockMatchMedia(true); // would be dark if the key were ignored
    run(getColorSchemeScript({ key: 'color' }));
    expect(html.classList.contains('light')).toBe(true);
  });

  it('does not throw when storage is empty and matchMedia is missing', () => {
    expect(() => run(getColorSchemeScript())).not.toThrow();
  });
});
