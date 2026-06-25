'use client';

import { useSessionStorageState } from 'react-stateful-hooks';
import { DemoBox, buttonStyle } from './DemoBox';

const steps = ['Account', 'Profile', 'Confirm'];

export function SessionStorageDemo() {
  const [step, setStep] = useSessionStorageState('demo:wizard', 0);

  return (
    <DemoBox hint="The step survives a reload, but resets when you close the tab. A new tab starts fresh.">
      <strong>
        Step {step + 1} / {steps.length}: {steps[step]}
      </strong>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          style={buttonStyle}
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        <button
          style={buttonStyle}
          disabled={step === steps.length - 1}
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
        >
          Next
        </button>
      </div>
    </DemoBox>
  );
}
