'use client';

import { useLocalStorageState } from 'react-stateful-hooks';
import { DemoBox, buttonStyle } from './DemoBox';

export function LocalStorageDemo() {
  const [count, setCount, reset] = useLocalStorageState('demo:count', 0);

  return (
    <DemoBox hint="Open this page in a second tab — both stay in sync, and the value survives a reload.">
      <strong style={{ fontSize: '1.5rem' }}>{count}</strong>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={buttonStyle} onClick={() => setCount((c) => c + 1)}>
          Increment
        </button>
        <button style={buttonStyle} onClick={() => setCount((c) => c - 1)}>
          Decrement
        </button>
        <button style={buttonStyle} onClick={reset}>
          Reset
        </button>
      </div>
    </DemoBox>
  );
}
