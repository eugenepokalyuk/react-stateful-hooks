'use client';

import { useHydrated } from 'react-stateful-hooks';

import { DemoBox } from './DemoBox';

export function HydratedDemo() {
  const hydrated = useHydrated();

  return (
    <DemoBox hint="On the server and the very first client render this is false; it flips to true right after hydration — with no mismatch warning">
      <div>
        <code>useHydrated()</code> → <strong>{String(hydrated)}</strong>
      </div>

      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        Client-only value:{' '}
        {hydrated ? new Date().toLocaleTimeString() : '— (waiting for hydration)'}
      </div>
    </DemoBox>
  );
}
