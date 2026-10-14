/**
 * DetailPopover — generic (i) button that opens a tap/click popover with
 * arbitrary detail content. Same mechanics as InfoPopover (bottom sheet on
 * mobile, anchored panel on desktop, Esc/tap-outside close, focus return),
 * but content is supplied by the caller instead of the feature-docs registry.
 * Exists to keep card surfaces short: title + use case on the card, the rest
 * behind the (i).
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useModalA11y } from '../hooks';
import { GradeBadge } from './GradeBadge';
import type { GradeLetter } from '@/ui/theme';

const POPOVER_Z = 75;
const PANEL_MAX_W = 380;

export function DetailPopover({
  title,
  grade,
  label,
  children,
}: {
  title: string;
  grade?: GradeLetter;
  label?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const isMobile = useIsMobile();
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useModalA11y(open, () => setOpen(false), closeRef);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const measure = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(PANEL_MAX_W, vw - 24);
    const left = Math.max(12, Math.min(rect.left, vw - w - 12));
    const estH = 360;
    const above = rect.bottom + 8 + estH > vh && rect.top - 8 - estH > 12;
    return { left, top: above ? Math.max(12, rect.top - 8 - estH) : rect.bottom + 8 };
  }, []);

  useEffect(() => {
    if (!open || isMobile) return;
    const onResize = () => setPos(measure());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, isMobile, measure]);

  return (
    <span ref={rootRef} style={{ display: 'inline-flex' }}>
      <button
        ref={triggerRef}
        type="button"
        data-testid="detail-popover-trigger"
        aria-expanded={open}
        aria-label={label ?? `Details: ${title}`}
        title={label ?? `Details: ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => {
            if (!v && !isMobile) setPos(measure());
            return !v;
          });
        }}
        className="font-mono2"
        style={{
          minWidth: 40, minHeight: 40, margin: -9, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, fontStyle: 'italic',
            border: `1px solid ${open ? 'var(--amber)' : 'var(--line-2)'}`,
            color: open ? 'var(--amber)' : 'var(--text-2)',
            background: open ? 'rgba(217,164,65,0.08)' : 'transparent',
          }}
        >
          i
        </span>
      </button>

      {open && isMobile && (
        <div
          data-testid="detail-popover-backdrop"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: POPOVER_Z - 1, background: 'rgba(11,12,13,0.55)' }}
        />
      )}

      {open && (
        <div
          role="dialog"
          aria-label={title}
          data-testid="detail-popover-panel"
          style={
            isMobile
              ? {
                  position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: POPOVER_Z,
                  maxHeight: '72vh', overflowY: 'auto', background: 'var(--ink-3)',
                  borderTop: '1px solid var(--line-2)', borderRadius: '8px 8px 0 0',
                  boxShadow: '0 -12px 32px rgba(0,0,0,0.5)', padding: '16px 16px 24px',
                }
              : {
                  position: 'fixed', left: pos?.left ?? 12, top: pos?.top ?? 96, zIndex: POPOVER_Z,
                  width: `min(${PANEL_MAX_W}px, calc(100vw - 24px))`, maxHeight: '72vh', overflowY: 'auto',
                  background: 'var(--ink-3)', border: '1px solid var(--line-2)', borderRadius: 2,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5)', padding: 16,
                  visibility: pos ? 'visible' : 'hidden',
                }
          }
        >
          <div className="flex items-center justify-between gap-3" style={{ marginBottom: 10 }}>
            <span className="t-label" style={{ color: 'var(--text-1)' }}>{title.toUpperCase()}</span>
            <span className="flex items-center gap-2">
              {grade && <GradeBadge grade={grade} compact />}
              <button
                ref={closeRef}
                type="button"
                aria-label="Close details"
                onClick={() => setOpen(false)}
                style={{
                  minWidth: 40, minHeight: 40, margin: -10, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none',
                  color: 'var(--text-3)', cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            </span>
          </div>
          {children}
        </div>
      )}
    </span>
  );
}
