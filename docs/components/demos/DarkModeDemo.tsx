'use client';

import {
  useLocalStorageState,
  usePrefersColorScheme,
} from 'react-stateful-hooks';
import { DemoBox, buttonStyle } from './DemoBox';

type Choice = 'light' | 'dark' | 'system';

export function DarkModeDemo() {
  const [choice, setChoice] = useLocalStorageState<Choice>(
    'demo:theme',
    'system',
  );
  const system = usePrefersColorScheme();
  const scheme = choice === 'system' ? system : choice;

  return (
    <DemoBox hint="The choice persists across reloads. Pair it with getColorSchemeScript so the page applies it before first paint — with no flash.">
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {(['light', 'dark', 'system'] as Choice[]).map((c) => (
          <button
            key={c}
            style={{ ...buttonStyle, fontWeight: choice === c ? 700 : 400 }}
            onClick={() => setChoice(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div
        style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #8884',
          background: scheme === 'dark' ? '#111' : '#fff',
          color: scheme === 'dark' ? '#eee' : '#111',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        Effective scheme: <strong>{scheme}</strong>
        {choice === 'system' ? ' (from system)' : ''}
      </div>
    </DemoBox>
  );
}
