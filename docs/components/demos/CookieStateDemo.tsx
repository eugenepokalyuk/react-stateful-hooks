'use client';

import { useCookieState } from 'react-stateful-hooks';

import { DemoBox, buttonStyle } from './DemoBox';

export function CookieStateDemo() {
  const [count, setCount, reset] = useCookieState('demo:cookie-count', 0, {
    maxAge: 60 * 60 * 24 * 7, // one week
  });

  return (
    <DemoBox hint="Stored in document.cookie — it survives a reload, and because cookies are sent to the server it can be read during SSR (no flash). Peek at DevTools → Application → Cookies">
      <strong style={{ fontSize: '1.5rem' }}>{count}</strong>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={buttonStyle} onClick={() => setCount((c) => c + 1)}>
          {'Increment'}
        </button>

        <button style={buttonStyle} onClick={reset}>
          {'Reset'}
        </button>
      </div>
    </DemoBox>
  );
}
