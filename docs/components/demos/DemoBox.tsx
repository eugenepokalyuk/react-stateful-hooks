import type { CSSProperties, ReactNode } from 'react';

const box: CSSProperties = {
  marginTop: '1rem',
  padding: '1.25rem',
  border: '1px solid var(--nextra-border, #e5e7eb)',
  borderRadius: '0.5rem',
  background: 'light-dark(#fafafa, #111)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const hintStyle: CSSProperties = {
  fontSize: '0.8rem',
  opacity: 0.7,
  margin: 0,
};

export function DemoBox({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div style={box}>
      {children}
      {hint ? <p style={hintStyle}>{hint}</p> : null}
    </div>
  );
}

export const buttonStyle: CSSProperties = {
  padding: '0.4rem 0.9rem',
  borderRadius: '0.4rem',
  border: '1px solid var(--nextra-border, #d1d5db)',
  background: 'light-dark(#fff, #1a1a1a)',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

export const inputStyle: CSSProperties = {
  padding: '0.4rem 0.6rem',
  borderRadius: '0.4rem',
  border: '1px solid var(--nextra-border, #d1d5db)',
  background: 'light-dark(#fff, #1a1a1a)',
  fontSize: '0.9rem',
  width: '100%',
  maxWidth: 320,
};
