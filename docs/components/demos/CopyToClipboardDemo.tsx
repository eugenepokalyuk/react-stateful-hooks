'use client';

import { useCopyToClipboard } from 'react-stateful-hooks';

import { DemoBox, buttonStyle } from './DemoBox';

export function CopyToClipboardDemo() {
  const [copy, { copied, error }] = useCopyToClipboard();

  const text = 'npm install react-stateful-hooks';

  return (
    <DemoBox hint='The "Copied!" label resets itself after 2 s — no manual timer needed'>
      <code>{text}</code>

      <div>
        <button style={buttonStyle} onClick={() => copy(text)}>
          {copied ? 'Copied! ✅' : 'Copy'}
        </button>
      </div>

      {error ? (
        <div style={{ color: 'crimson', fontSize: '0.85rem' }}>
          Clipboard unavailable (needs a secure context).
        </div>
      ) : null}
    </DemoBox>
  );
}
