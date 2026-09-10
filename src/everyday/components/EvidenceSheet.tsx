/**
 * The evidence pill's sheet: exactly four one-line rows (grade + what the
 * evidence supports) and a link to the lab's full grades. Nothing else in
 * the app explains anything.
 */

import { ExternalLink } from 'lucide-react';
import { copy } from '../copy';
import { Sheet } from './Sheet';

const ROWS = [copy.evidence.rows.tones, copy.evidence.rows.noise, copy.evidence.rows.nature, copy.evidence.rows.bowls];

interface EvidenceSheetProps {
  open: boolean;
  onClose: () => void;
}

export function EvidenceSheet({ open, onClose }: EvidenceSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={copy.headings.evidence} testId="evidence-sheet">
      <ul className="ev-ev-list">
        {ROWS.map((r) => (
          <li key={r.label} className="ev-ev-row">
            <span className="ev-ev-grade" data-grade={r.grade[0]}>
              {r.grade}
            </span>
            <span className="ev-ev-label">{r.label}</span>
            <span className="ev-ev-note">{r.note}</span>
          </li>
        ))}
      </ul>
      <div className="ev-sheet-actions">
        <a className="ev-btn ev-btn--ghost" href={`${import.meta.env.BASE_URL}knowledge`} data-testid="evidence-lab-link">
          {copy.evidence.labLink}
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    </Sheet>
  );
}
