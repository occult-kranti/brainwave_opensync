/**
 * The four intents: a 2×2 card grid when idle, a chip row while a session
 * runs (the active one filled).
 */

import { motion } from 'framer-motion';
import { Bell, Leaf, Moon, Zap } from 'lucide-react';
import { copy } from '../copy';
import { fmtMin } from '../format';
import { INTENTS, type Intent, type IntentId } from '../intents';
import { Chip } from './primitives';

const ICONS: Record<IntentId, typeof Moon> = { sleep: Moon, focus: Zap, relax: Leaf, meditate: Bell };

interface IntentCardsProps {
  onPick: (intent: Intent) => void;
}

export function IntentCards({ onPick }: IntentCardsProps) {
  return (
    <div className="ev-grid" data-testid="intent-cards">
      {INTENTS.map((intent) => {
        const Icon = ICONS[intent.id];
        const c = copy.intents[intent.id];
        return (
          <motion.button key={intent.id} type="button" className="ev-card" data-testid={`intent-${intent.id}`} whileTap={{ scale: 0.97 }} onClick={() => onPick(intent)}>
            <Icon size={26} className="ev-card-icon" aria-hidden="true" />
            <span>
              <span className="ev-card-name">{c.name}</span>
              <span className="ev-card-sub">{c.sub}</span>
            </span>
            <span className="ev-card-chip">{fmtMin(intent.durationMin)}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

interface IntentChipsProps {
  active: IntentId | null;
  onPick: (intent: Intent) => void;
}

export function IntentChips({ active, onPick }: IntentChipsProps) {
  return (
    <div className="ev-chips ev-chips--scroll" data-testid="intent-chips">
      {INTENTS.map((intent) => {
        const Icon = ICONS[intent.id];
        return (
          <Chip key={intent.id} active={active === intent.id} testId={`intent-chip-${intent.id}`} onClick={() => onPick(intent)}>
            <Icon size={16} aria-hidden="true" />
            {copy.intents[intent.id].name}
          </Chip>
        );
      })}
    </div>
  );
}
