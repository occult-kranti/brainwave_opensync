/**
 * Compact first-run advisory (four icon rows, two buttons). Raised by the
 * session layer when START runs before the one-time acknowledgment;
 * accepting records it and continues into the session the user tapped.
 */

import { motion } from 'framer-motion';
import { Activity, Baby, Car, Headphones } from 'lucide-react';
import { useSession } from '@/ui/session/useSession';
import { copy } from '../copy';
import { Sheet } from './Sheet';

const ROWS = [
  { Icon: Headphones, text: copy.advisory.headphones },
  { Icon: Car, text: copy.advisory.driving },
  { Icon: Activity, text: copy.advisory.seizure },
  { Icon: Baby, text: copy.advisory.infant },
] as const;

export function AdvisorySheet() {
  const s = useSession();
  return (
    <Sheet open={s.advisoryOpen} onClose={s.closeAdvisory} title={copy.headings.beforeStart} testId="advisory-sheet">
      <ul className="ev-adv-list">
        {ROWS.map(({ Icon, text }) => (
          <li key={text} className="ev-adv-row">
            <Icon size={22} aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <div className="ev-sheet-actions">
        <motion.button
          type="button"
          className="ev-btn ev-btn--primary"
          data-testid="advisory-accept"
          whileTap={{ scale: 0.97 }}
          onKeyDown={(e) => {
            // A held Enter on a card must not acknowledge by key repeat.
            if (e.repeat) e.preventDefault();
          }}
          onClick={() => s.acknowledgeAdvisory({ andStart: true })}
        >
          {copy.advisory.accept}
        </motion.button>
        <motion.button type="button" className="ev-btn ev-btn--ghost" data-testid="advisory-dismiss" whileTap={{ scale: 0.97 }} onClick={s.closeAdvisory}>
          {copy.advisory.dismiss}
        </motion.button>
      </div>
    </Sheet>
  );
}
