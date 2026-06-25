import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { useHydrated } from './useHydrated';

describe('useHydrated', () => {
  it('returns true once mounted on the client', () => {
    const { result } = renderHook(() => useHydrated());
    expect(result.current).toBe(true);
  });

  it('renders false on the server', () => {
    function Probe() {
      return <span>{String(useHydrated())}</span>;
    }

    expect(renderToString(<Probe />)).toContain('false');
  });
});
