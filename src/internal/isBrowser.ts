/**
 * `true` when running in an environment that has a DOM and Web Storage.
 * Used to keep every hook safe to call during server-side rendering.
 */
export const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
