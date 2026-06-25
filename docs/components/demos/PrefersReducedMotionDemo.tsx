'use client';

import { usePrefersReducedMotion } from 'react-stateful-hooks';
import { DemoBox } from './DemoBox';

export function PrefersReducedMotionDemo() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <DemoBox hint="Enable “Reduce motion” in your OS accessibility settings to see this flip.">
      <div>
        Reduced motion requested: <strong>{String(reduceMotion)}</strong>
      </div>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'light-dark(#2563eb, #60a5fa)',
          animation: reduceMotion ? 'none' : 'rsh-bounce 1s ease-in-out infinite',
        }}
      />
      <style>{`@keyframes rsh-bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }`}</style>
    </DemoBox>
  );
}
