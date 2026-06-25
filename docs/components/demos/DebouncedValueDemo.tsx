'use client';

import { useState } from 'react';
import { useDebouncedValue } from 'react-stateful-hooks';

import { DemoBox, inputStyle } from './DemoBox';

export function DebouncedValueDemo() {
  const [value, setValue] = useState('');
  const debounced = useDebouncedValue(value, 400);

  return (
    <DemoBox hint="The debounced value only updates 400 ms after you stop typing">
      <input
        style={inputStyle}
        value={value}
        placeholder="Type quickly…"
        onChange={(e) => setValue(e.target.value)}
      />
      <div style={{ fontSize: '0.9rem' }}>
        <div>
          Live: <code>{value || '∅'}</code>
        </div>

        <div>
          Debounced: <code>{debounced || '∅'}</code>
        </div>
      </div>
    </DemoBox>
  );
}
