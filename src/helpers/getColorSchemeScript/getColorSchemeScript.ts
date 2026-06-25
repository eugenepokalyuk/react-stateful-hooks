export interface ColorSchemeScriptOptions {
  /** Storage key the user's choice is saved under. Defaults to `'theme'`. */
  key?: string;
  /** Where the choice is read from. Defaults to `'localStorage'`. */
  storage?: 'localStorage' | 'cookie';
  /**
   * How to apply the scheme to `<html>`. `'class'` toggles a `light`/`dark`
   * class (Tailwind-friendly); any other value is treated as an attribute name,
   * e.g. `'data-theme'`. Defaults to `'class'`.
   */
  attribute?: string;
  /**
   * Used when nothing is stored yet. `'system'` follows the OS preference.
   * Defaults to `'system'`.
   */
  defaultScheme?: 'light' | 'dark' | 'system';
}

/**
 * Returns a tiny, self-contained JS snippet to run **before first paint** so the
 * page renders with the correct color scheme and never flashes the wrong one.
 *
 * Drop it into a blocking inline `<script>` in your document head. It reads the
 * stored choice (written by {@link useLocalStorageState} or
 * {@link useCookieState}), falls back to the OS preference, and sets a class (or
 * attribute) plus `color-scheme` on `<html>`.
 *
 * @example
 * ```tsx
 * // Next.js App Router — app/layout.tsx
 * import { getColorSchemeScript } from 'react-stateful-hooks';
 *
 * <head>
 *   <script dangerouslySetInnerHTML={{ __html: getColorSchemeScript() }} />
 * </head>
 * ```
 */
export function getColorSchemeScript(
  options: ColorSchemeScriptOptions = {},
): string {
  const {
    key = 'theme',
    storage = 'localStorage',
    attribute = 'class',
    defaultScheme = 'system',
  } = options;

  const k = JSON.stringify(key);

  const read =
    storage === 'cookie'
      ? `function(){var c=document.cookie?document.cookie.split('; '):[];` +
        `for(var i=0;i<c.length;i++){var p=c[i],e=p.indexOf('=');` +
        `if(e>-1&&decodeURIComponent(p.slice(0,e))===${k})` +
        `return decodeURIComponent(p.slice(e+1));}return null;}()`
      : `localStorage.getItem(${k})`;

  const fallback =
    defaultScheme === 'light' || defaultScheme === 'dark'
      ? JSON.stringify(defaultScheme)
      : `(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')`;

  const apply =
    attribute === 'class'
      ? `e.classList.remove('light','dark');e.classList.add(s);`
      : `e.setAttribute(${JSON.stringify(attribute)},s);`;

  return (
    `(function(){try{` +
    `var e=document.documentElement,v=${read};` +
    `try{v=JSON.parse(v);}catch(_){}` +
    `var s=(v==='light'||v==='dark')?v:${fallback};` +
    apply +
    `e.style.colorScheme=s;` +
    `}catch(_){}})();`
  );
}
