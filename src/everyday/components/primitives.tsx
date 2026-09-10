/**
 * Small touch-first primitives for the everyday screens: chip, radio row,
 * level slider, switch, section. Components only (react-refresh rule);
 * the number/label helpers live in ../format.ts.
 */

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  testId?: string;
  disabled?: boolean;
}

export function Chip({ active, onClick, children, testId, disabled }: ChipProps) {
  return (
    <motion.button
      type="button"
      className="ev-chip"
      aria-pressed={active}
      data-testid={testId}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

interface RadioRowProps {
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
  sub?: string;
  testId?: string;
}

export function RadioRow({ checked, onSelect, children, sub, testId }: RadioRowProps) {
  return (
    <button type="button" role="radio" aria-checked={checked} className="ev-row" data-testid={testId} onClick={onSelect}>
      <span className="ev-row-main">
        <span>{children}</span>
        {sub && <span className="ev-row-sub">{sub}</span>}
      </span>
      {checked && <Check className="ev-check" size={20} aria-hidden="true" />}
    </button>
  );
}

interface RangeProps {
  label: string;
  /** 0…100 */
  value: number;
  onChange: (pct: number) => void;
  testId?: string;
  disabled?: boolean;
}

export function Range({ label, value, onChange, testId, disabled }: RangeProps) {
  return (
    <label className="ev-range-wrap">
      <span className="ev-range-label">
        <span>{label}</span>
        <span className="ev-range-value">{value}%</span>
      </span>
      <input
        type="range"
        className="ev-range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        aria-label={label}
        data-testid={testId}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  testId?: string;
}

export function Switch({ checked, onChange, label, testId }: SwitchProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="ev-switch" data-testid={testId} onClick={() => onChange(!checked)}>
      <span className="ev-switch-knob" aria-hidden="true" />
    </button>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
  testId?: string;
}

export function Section({ title, children, testId }: SectionProps) {
  return (
    <section className="ev-section" aria-label={title} data-testid={testId}>
      <h2 className="ev-h2">{title}</h2>
      {children}
    </section>
  );
}
