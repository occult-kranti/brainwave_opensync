import type { ReactNode } from 'react';
import { Led } from './chips';

/** Research-screen page shell: breadcrumb label, title, lede, status LEDs. */
export function ResearchPage({
  crumb,
  title,
  lede,
  children,
}: {
  crumb: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <div className="atlas-research-page mx-auto w-full max-w-[1440px] px-6 py-8 md:px-10" style={{ color: 'var(--text-1)' }}>
      <header className="mb-8">
        <h1 className="t-display-lg">{title}</h1>
        <p className="t-body mt-3 max-w-3xl" style={{ color: 'var(--text-2)' }}>
          {lede}
        </p>
        <p className="atlas-research-location">{crumb}</p>
      </header>
      {children}
    </div>
  );
}

/**
 * Honesty bar (S11.1 AC): results are shown ONLY with n and CI placeholders;
 * while no data exists the state is explicit — "no data collected yet".
 */
export function HonestyBar({ context }: { context: string }) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-sm px-4 py-3"
      style={{
        background: 'var(--ink-2)',
        border: '1px solid var(--line-1)',
      }}
      role="note"
    >
      <span className="t-label flex items-center gap-2" style={{ color: 'var(--amber)' }}>
        <Led tone="amber" /> HONESTY BAR
      </span>
      <span className="t-body-sm" style={{ color: 'var(--text-2)' }}>
        {context}: no data collected yet — pre-registered.
      </span>
      <span className="font-mono2 text-[11px]" style={{ color: 'var(--text-3)' }}>
        n = —&nbsp;&nbsp;·&nbsp;&nbsp;effect = —&nbsp;&nbsp;·&nbsp;&nbsp;95% CI [—, —]
      </span>
      <span className="t-caption" style={{ color: 'var(--text-3)' }}>
        Results render only as n + confidence interval. Never a bare "works / doesn't".
      </span>
    </div>
  );
}

/** Advisor-ratified claim discipline (registry rule 2 / S12.2). */
export function ClaimDisciplineNote() {
  return (
    <details className="atlas-evidence-disclosure">
      <summary>How to read claims and evidence</summary>
      <p className="t-body-sm mt-2" style={{ color: 'var(--text-2)' }}>
        Claims on this screen are stated as "biases toward" / "is associated with" / "produces a
        measurable stimulus-locked response" — never "induces". Banned as product claims:{' '}
        <span className="font-mono2" style={{ color: 'var(--danger-hi)' }}>
          "CIA-validated" · "Schumann-aligned 432" · "digital drug" · "induces" · "synchronizes" ·
          "attunes"
        </span>
        . Every claim carries an A–D evidence grade; grades apply to the claim, not to Open Sync.
      </p>
    </details>
  );
}

/** Section heading inside research pages. */
export function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-10">
      <div className="hairline-b mb-4 flex flex-wrap items-baseline justify-between gap-2 pb-3">
        <h2 className="t-h2">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Field label + value row used in detail drawers. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <div className="t-label mb-1.5">{label}</div>
      <div className="t-body-sm" style={{ color: 'var(--text-1)' }}>
        {children}
      </div>
    </div>
  );
}

/** Mono key-number readout (design.md §5.3) with unit in text-3. */
export function KeyReadout({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-3 py-2"
      style={{ background: 'var(--ink-1)', border: '1px solid var(--line-1)', borderRadius: 2 }}
    >
      <span className="t-readout-md" style={{ color: 'var(--amber)' }}>
        {value}
      </span>
      <span className="t-caption" style={{ color: 'var(--text-3)' }}>
        {label}
      </span>
    </div>
  );
}
