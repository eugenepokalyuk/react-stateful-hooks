import * as React from 'react';

import { isBrowser } from '../../internal/isBrowser';

export interface CopyToClipboardState {
  /** The last text successfully copied, or `null` before the first success. */
  value: string | null;
  /** The error from the last failed copy, or `null` on success. */
  error: Error | null;
  /**
   * `true` immediately after a successful copy, then automatically reset to
   * `false` after `resetDelay` ms. Drives "Copied!" feedback without manual
   * timers.
   */
  copied: boolean;
}

/** Copies `text` to the clipboard. Resolves `true` on success, `false` otherwise. */
export type CopyToClipboardFn = (text: string) => Promise<boolean>;

export interface UseCopyToClipboardOptions {
  /**
   * Milliseconds before `copied` flips back to `false`. Defaults to `2000`.
   * Pass `0` (or a negative number) to keep `copied` `true` until the next copy.
   */
  resetDelay?: number;
}

export type UseCopyToClipboardReturn = [
  copy: CopyToClipboardFn,
  state: CopyToClipboardState,
];

/**
 * Returns a `copy` function plus the state of the last copy attempt.
 *
 * Uses the async Clipboard API (`navigator.clipboard.writeText`), which
 * requires a secure context (HTTPS or `localhost`). When the API is
 * unavailable — on the server, or in an insecure context — `copy` resolves
 * `false` and records an `error` instead of throwing.
 *
 * @example
 * ```tsx
 * const [copy, { copied }] = useCopyToClipboard();
 * <button onClick={() => copy(url)}>{copied ? 'Copied!' : 'Copy link'}</button>
 * ```
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { resetDelay = 2000 } = options;

  const [state, setState] = React.useState<CopyToClipboardState>({
    value: null,
    error: null,
    copied: false,
  });

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read `resetDelay` lazily so `copy` stays referentially stable even when
  // the caller passes a changing delay.
  const resetDelayRef = React.useRef(resetDelay);
  resetDelayRef.current = resetDelay;

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cancel any pending reset when the component unmounts.
  React.useEffect(() => clearTimer, [clearTimer]);

  const copy = React.useCallback<CopyToClipboardFn>(
    async (text) => {
      clearTimer();
      try {
        if (!isBrowser || !navigator.clipboard) {
          throw new Error(
            'Clipboard API is unavailable (needs a secure context).',
          );
        }
        await navigator.clipboard.writeText(text);
        setState({ value: text, error: null, copied: true });

        const delay = resetDelayRef.current;
        if (delay > 0) {
          timerRef.current = setTimeout(() => {
            timerRef.current = null;
            setState((prev) => ({ ...prev, copied: false }));
          }, delay);
        }
        return true;
      } catch (err) {
        setState({
          value: null,
          error: err instanceof Error ? err : new Error(String(err)),
          copied: false,
        });
        return false;
      }
    },
    [clearTimer],
  );

  return [copy, state];
}
