/**
 * Converts a value to and from the string form kept in Web Storage.
 * Override it to support `Date`, `Map`, `BigInt`, or a compact format.
 */
export interface Serializer<T> {
  parse: (raw: string) => T;
  stringify: (value: T) => string;
}

/** JSON-based serializer used when no custom one is provided. */
export const defaultSerializer: Serializer<unknown> = {
  parse: (raw) => JSON.parse(raw) as unknown,
  stringify: (value) => JSON.stringify(value),
};
