/**
 * Bottom sheet: backdrop + slide-up panel, Esc / backdrop / close button
 * dismiss, focus moves inside and returns on close (shared useModalA11y).
 */

import { useId, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useModalA11y } from '@/ui/hooks';
import { copy } from '../copy';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  testId: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, testId, children }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalA11y(open, onClose, ref, ref);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={testId}
          className="ev-backdrop"
          data-testid={`${testId}-backdrop`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-testid={testId}
            className="ev-sheet"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ev-sheet-handle" aria-hidden="true" />
            <div className="ev-sheet-head">
              <h2 id={titleId} className="ev-h2">
                {title}
              </h2>
              <button type="button" className="ev-icon-btn" aria-label={copy.a11y.close} onClick={onClose}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
