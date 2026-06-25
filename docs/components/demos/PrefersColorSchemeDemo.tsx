'use client';

import { usePrefersColorScheme } from 'react-stateful-hooks';

import { DemoBox } from './DemoBox';

export function PrefersColorSchemeDemo() {
  const scheme = usePrefersColorScheme();

  return (
    <DemoBox hint="Change your OS / browser appearance setting to see this flip.">
      <div>
        Preferred scheme: <strong>{scheme}</strong> {scheme === 'dark' ? '🌙' : '☀️'}
      </div>
    </DemoBox>
  );
}
