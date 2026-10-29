import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Escape the clipped route/workspace stacking context while keeping React state. */
export function OverlayPortal({ children }: { children: ReactNode }) {
  if (typeof document === 'undefined') return null;
  const target = document.getElementById('archive-overlay-root') ?? document.body;
  return createPortal(<div className="experience-shell archive-modal-content" data-spatial-world="true">{children}</div>, target);
}
