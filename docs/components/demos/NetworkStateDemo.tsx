'use client';

import { useNetworkState } from 'react-stateful-hooks';

import { DemoBox } from './DemoBox';

export function NetworkStateDemo() {
  const { online, since } = useNetworkState();

  return (
    <DemoBox hint="Toggle your network (or DevTools → Offline) to see it react.">
      <div>
        Status: <strong>{online ? 'online ✅' : 'offline ❌'}</strong>
      </div>

      <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
        Last change: {since ? since.toLocaleTimeString() : '— (no change yet)'}
      </div>
    </DemoBox>
  );
}
