'use client';

import { useMediaQuery } from 'react-stateful-hooks';

import { DemoBox } from './DemoBox';

export function MediaQueryDemo() {
  const isWide = useMediaQuery('(min-width: 768px)');

  return (
    <DemoBox hint="Resize the window across 768 px — the value updates live, with no hydration warning.">
      <div>
        <code>(min-width: 768px)</code> →{' '}
        <strong>{isWide ? 'matches ✅' : 'no match ❌'}</strong>
      </div>
    </DemoBox>
  );
}
