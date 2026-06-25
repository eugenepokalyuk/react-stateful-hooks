/** Attributes applied when writing a cookie. */
export interface CookieAttributes {
  /** Defaults to `'/'`. */
  path?: string;
  domain?: string;
  /** Lifetime in seconds. */
  maxAge?: number;
  expires?: Date;
  /** Defaults to `'lax'`. `'none'` implies `secure`. */
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
}

/** Reads a single cookie by name, or `null` when it is absent. */
export function readCookie(name: string): string | null {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const pair of cookies) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const key = decodeURIComponent(pair.slice(0, eq));
    if (key === name) {
      return decodeURIComponent(pair.slice(eq + 1));
    }
  }
  return null;
}

function serializeAttributes(attributes: CookieAttributes): string {
  const { path = '/', domain, maxAge, expires, sameSite = 'lax' } = attributes;
  let str = `; Path=${path}`;
  if (domain) str += `; Domain=${domain}`;
  if (maxAge !== undefined) str += `; Max-Age=${Math.floor(maxAge)}`;
  if (expires) str += `; Expires=${expires.toUTCString()}`;
  str += `; SameSite=${sameSite}`;
  // SameSite=None is only honoured on secure connections.
  if (attributes.secure || sameSite === 'none') str += '; Secure';
  return str;
}

/** Writes a cookie with the given value and attributes. */
export function writeCookie(
  name: string,
  value: string,
  attributes: CookieAttributes,
): void {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}${serializeAttributes(attributes)}`;
}

/** Deletes a cookie by expiring it, preserving `path`/`domain` so it matches. */
export function deleteCookie(name: string, attributes: CookieAttributes): void {
  writeCookie(name, '', {
    path: attributes.path,
    domain: attributes.domain,
    sameSite: attributes.sameSite,
    secure: attributes.secure,
    maxAge: 0,
  });
}
