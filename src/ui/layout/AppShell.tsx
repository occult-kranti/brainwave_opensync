/**
 * Persistent spatial world with accessible route content above it. The scene
 * survives route changes; sound remains in SessionProvider. Desktop uses one
 * shared navigation, while phones retain the reachable bottom navigation and
 * immediate stop. Scene settings are independent of audio settings.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Info, Pause, Play, MoreHorizontal, X } from "lucide-react";
import { useIsMobile } from "../../hooks/use-mobile";
import { BOTTOM_TAB_ROUTES, ROUTES } from "../../app/routes";
import { GroupedNavigation } from "./GroupedNavigation";
import { fmtClock } from "../session/sessionMath";
import { useSession } from "../session/useSession";
import { DensityToggle, Led } from "../components/primitives";
import { hasOpenModal, useModalA11y } from "../hooks";
import { useSheetScrollLock } from "../useSheetScrollLock";
import {
  MobilePanicButton,
  PanicButton,
  PanicOverlay,
} from "../components/Panic";
import { CommandPalette, PaletteHint } from "../components/CommandPalette";
import { AdvisoryDialog } from "../components/AdvisoryDialog";
import { ShortcutsOverlay } from "../components/ShortcutsOverlay";
import { PwaUpdateChip } from "../components/PwaUpdateChip";
import { matchShortcut } from "../../app/shortcuts";
import { engineLedState } from "../theme";
import { assetUrl } from "@/lib/assetUrl";
import {
  readArchiveTheme,
  saveArchiveTheme,
  type ArchiveTheme,
} from "../archiveTheme";
import "../../pages/archive-theme.css";
import "../../pages/spatial.css";
import "../../pages/resonance.css";
import "../../pages/immersive-world.css";
import "../../pages/mobile-refinements.css";
import { WorkspaceNav } from "./WorkspaceNav";
import { SpatialProvider } from "../visuals/SpatialProvider";
import { ResonantWorld } from "../visuals/ResonantWorld";
import { WorldToolbar } from "../visuals/WorldToolbar";
import { navigationForPath } from "@/app/navigation";

/** Route lists come from the registry (src/app/routes.tsx) — one source of truth. */
const ALL_ROUTES = ROUTES;
/** Primary bottom-bar destinations (phone shell); everything else via MORE. */
const BOTTOM_TABS = BOTTOM_TAB_ROUTES;

/** Bottom bar height (excluding safe-area inset) — also the content padding. */
const BOTTOM_BAR_H = 56;
/** Ordinary navigation stays below modal sheets, which include their own Stop control. */
const BOTTOM_BAR_Z = 100;

/**
 * Global pause/resume chip (status bar; Space hotkey). Phase-coherent: the
 * engine freezes its phase accumulators and continues on resume — no click,
 * no jump. Disabled (not hidden) while idle so the control's location is
 * stable; a no-op until a session starts.
 */
function PauseChip() {
  const { running, paused, togglePause } = useSession();
  return (
    <button
      type="button"
      data-testid="pause-toggle"
      className="chip"
      aria-label={
        paused
          ? "Resume Studio session (Space)"
          : "Pause Studio session (Space)"
      }
      aria-pressed={paused}
      disabled={!running}
      onClick={togglePause}
      title={
        running
          ? paused
            ? "Resume — continues the frozen phase, no click (Space)"
            : "Pause — freezes audio in place, no click (Space)"
          : "Pause (Space) — start a session first"
      }
      style={{
        height: 24,
        padding: "0 8px",
        fontSize: 10,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        opacity: running ? 1 : 0.45,
        cursor: running ? "pointer" : "default",
      }}
    >
      {paused ? (
        <Play size={11} strokeWidth={1.5} />
      ) : (
        <Pause size={11} strokeWidth={1.5} />
      )}
      {paused ? "RESUME" : "PAUSE"}
    </button>
  );
}

/** Compact engine readout (`BIN · 4.00 Hz · 12:00 · DOSE 3%` / `PAUSED · …` / ENGINE OFF). */
function SessionReadout() {
  const {
    running,
    paused,
    fading,
    muted,
    previewId,
    mode,
    beatHz,
    elapsedSec,
    dosePercent,
  } = useSession();
  return (
    <span
      className="t-readout-sm"
      style={{ color: running && !paused ? "var(--text-1)" : "var(--text-3)" }}
    >
      {previewId
        ? "Preview playing"
        : running
          ? `Studio ${paused ? "paused" : fading ? "fading" : "playing"}${muted ? " · muted" : ""} · ${mode.slice(0, 3).toUpperCase()} · ${beatHz.toFixed(2)} Hz · ${fmtClock(elapsedSec)} · DOSE ${dosePercent.toFixed(0)}%`
          : "Studio ready"}
    </span>
  );
}

function useModuleLabel() {
  const location = useLocation();
  const mod = ALL_ROUTES.find((m) =>
    m.path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(m.path),
  );
  return mod ? `OPEN SYNC / ${mod.label}` : "OPEN SYNC";
}

/** Phone status bar (§3.2): session label + compact engine LED only. */
function MobileStatusBar({ onPalette }: { onPalette: () => void }) {
  const { running, paused, fading, muted, previewId } = useSession();
  const label = useModuleLabel();
  return (
    <header
      data-testid="status-bar-mobile"
      className="flex items-center gap-3"
      style={{
        height: 48,
        padding: "0 16px",
        background: "var(--ink-1)",
        borderBottom: "1px solid var(--line-1)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ overflow: "hidden", minWidth: 0 }}>
        <span
          className="t-label"
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        {(previewId || running) && (
          <span className="t-caption text-2">
            {previewId
              ? "Preview playing"
              : `Studio ${paused ? "paused" : fading ? "fading" : "playing"}${muted ? " · muted" : ""}`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2" style={{ marginLeft: "auto" }}>
        <PwaUpdateChip />
        <PaletteHint onOpen={onPalette} />
        <MobilePauseChip />
        <span
          title={
            running
              ? paused
                ? "Session paused"
                : "Engine running"
              : "Engine off"
          }
        >
          <Led state={engineLedState(running, paused)} />
        </span>
      </div>
    </header>
  );
}

/** Single bottom-bar tab (≥56px tall column, icon + micro label). */
function BottomTab({
  path,
  label,
  icon: Icon,
}: {
  path: string;
  label: string;
  icon: typeof Info;
}) {
  return (
    <NavLink
      to={path}
      data-testid={`bottom-tab-${label.toLowerCase()}`}
      style={{ textDecoration: "none", flex: 1, minWidth: 0, display: "flex" }}
    >
      {({ isActive }) => (
        <span
          className="flex flex-col items-center justify-center"
          style={{
            flex: 1,
            minHeight: BOTTOM_BAR_H,
            gap: 3,
            color: isActive ? "var(--amber)" : "var(--text-2)",
            background: isActive ? "var(--ink-2)" : "transparent",
            borderTop: `2px solid ${isActive ? "var(--amber)" : "transparent"}`,
            paddingTop: isActive ? 0 : 2,
          }}
        >
          <Icon size={20} strokeWidth={1.5} />
          <span
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 9,
              letterSpacing: "0.1em",
              lineHeight: "12px",
            }}
          >
            {label}
          </span>
        </span>
      )}
    </NavLink>
  );
}

/**
 * Compact Studio pause control in the phone header. Keeping it out of the
 * bottom navigation leaves room for the primary destinations and Stop all
 * sound. Disabled while Studio is idle; previews do not support pause.
 */
function MobilePauseChip() {
  const { running, paused, togglePause } = useSession();
  return (
    <button
      type="button"
      data-testid="mobile-pause"
      aria-label={paused ? "Resume Studio session" : "Pause Studio session"}
      aria-pressed={paused}
      disabled={!running}
      onClick={togglePause}
      className="flex flex-col items-center justify-center"
      style={{
        width: 48,
        flexShrink: 0,
        minHeight: 40,
        gap: 2,
        border: "none",
        borderLeft: "1px solid var(--line-1)",
        color: paused ? "var(--teal)" : "var(--text-2)",
        background: paused ? "var(--ink-2)" : "transparent",
        opacity: running ? 1 : 0.4,
        cursor: running ? "pointer" : "default",
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 9,
        letterSpacing: "0.1em",
        touchAction: "manipulation",
      }}
    >
      {paused ? (
        <Play size={18} strokeWidth={1.5} />
      ) : (
        <Pause size={18} strokeWidth={1.5} />
      )}
      {paused ? "RESUME" : "PAUSE"}
    </button>
  );
}

/**
 * Phone bottom bar (§3.2): 4 primary tabs + MORE + persistent PANIC segment.
 * Fixed, ≥56px + safe-area inset, z-index 100 (above .grain z-60 and the
 * z-90 PanicOverlay, so panic is never covered).
 */
function BottomBar({
  onMore,
  moreOpen,
}: {
  onMore: () => void;
  moreOpen: boolean;
}) {
  return (
    <nav
      data-testid="mobile-bottom-bar"
      aria-label="Primary"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: BOTTOM_BAR_Z,
        display: "flex",
        alignItems: "stretch",
        height: `calc(${BOTTOM_BAR_H}px + env(safe-area-inset-bottom, 0px))`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "var(--ink-0)",
        borderTop: "1px solid var(--line-1)",
      }}
    >
      {BOTTOM_TABS.map((t) => (
        <BottomTab key={t.path} {...t} />
      ))}
      <button
        type="button"
        data-testid="bottom-tab-more"
        aria-label="More tools and research"
        aria-expanded={moreOpen}
        onClick={onMore}
        className="flex flex-col items-center justify-center"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: BOTTOM_BAR_H,
          gap: 3,
          color: moreOpen ? "var(--amber)" : "var(--text-2)",
          background: moreOpen ? "var(--ink-2)" : "transparent",
          border: "none",
          borderTop: `2px solid ${moreOpen ? "var(--amber)" : "transparent"}`,
          paddingTop: moreOpen ? 0 : 2,
          cursor: "pointer",
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 9,
          letterSpacing: "0.1em",
        }}
      >
        <MoreHorizontal size={20} strokeWidth={1.5} />
        MORE
      </button>
      {/* Panic: fixed-width trailing segment, ≥56px target, always on top. */}
      <div style={{ width: 72, flexShrink: 0, display: "flex" }}>
        <MobilePanicButton />
      </div>
    </nav>
  );
}

/** One large-target (≥48px) drawer row linking to a module. */
function DrawerLink({
  path,
  label,
  icon: Icon,
  onNavigate,
}: {
  path: string;
  label: string;
  icon: typeof Info;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={path}
      onClick={onNavigate}
      style={{ textDecoration: "none", display: "block" }}
    >
      {({ isActive }) => (
        <div
          className="flex items-center gap-3"
          style={{
            minHeight: 48,
            padding: "0 16px",
            background: isActive ? "var(--ink-2)" : "transparent",
            color: isActive ? "var(--amber)" : "var(--text-2)",
            borderLeft: `2px solid ${isActive ? "var(--amber)" : "transparent"}`,
          }}
        >
          <Icon size={20} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <span
            className="t-label"
            style={{ color: isActive ? "var(--amber)" : "var(--text-2)" }}
          >
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

/**
 * MORE drawer (§3.2): tools first, with background reading behind the same
 * disclosure as the desktop rail. Includes every route, plus the session
 * readout and UTC clock that the compact status bar no longer shows. The
 * sheet stops above the bottom bar so PANIC stays reachable while it is open.
 */
function MoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // P0-4: Esc closes, focus moves to the close button, returns to MORE tab.
  useModalA11y(open, onClose, closeRef, dialogRef);
  useSheetScrollLock(open);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="more-backdrop"
            data-testid="more-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 120,
              background: "rgba(11,12,13,0.6)",
            }}
          />
          <motion.div
            ref={dialogRef}
            key="more-sheet"
            data-testid="more-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="More tools and research"
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 121,
              maxHeight: "min(88dvh, 720px)",
              paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
              overscrollBehavior: "contain",
              overflowY: "auto",
              background: "var(--ink-0)",
              borderTop: "1px solid var(--line-1)",
            }}
          >
            <div
              className="flex items-center gap-3"
              style={{
                padding: "12px 16px",
                flexWrap: "wrap",
                borderBottom: "1px solid var(--line-1)",
                position: "sticky",
                top: 0,
                background: "var(--ink-0)",
              }}
            >
              <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                <SessionReadout />
              </div>
              <div
                style={{ marginLeft: "auto", flexShrink: 0 }}
                className="flex items-center gap-3"
              >
                <PanicButton />
                <DensityToggle />
                <button
                  type="button"
                  ref={closeRef}
                  aria-label="Close"
                  onClick={onClose}
                  className="flex items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    background: "none",
                    border: "1px solid var(--line-1)",
                    borderRadius: 2,
                    color: "var(--text-2)",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <nav aria-label="All pages">
              <GroupedNavigation
                idPrefix="drawer"
                renderRoute={(m) => (
                  <DrawerLink key={m.path} {...m} onNavigate={onClose} />
                )}
              />
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SpatialProvider>
      <SpatialShell>{children}</SpatialShell>
    </SpatialProvider>
  );
}

function SpatialShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [theme, setTheme] = useState<ArchiveTheme>(readArchiveTheme);
  useEffect(() => {
    saveArchiveTheme(theme);
    document.documentElement.dataset.archiveTheme = theme;
    return () => {
      delete document.documentElement.dataset.archiveTheme;
    };
  }, [theme]);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    // New destinations start at their heading; changing filters on the same
    // page leaves the reader's position alone.
    const route = ALL_ROUTES.find((item) => item.path === location.pathname);
    document.title = `${route?.label ?? "Open Sync"} · Open Sync`;
    const anchor = location.hash
      ? document.getElementById(location.hash.slice(1))
      : null;
    if (anchor) anchor.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  const {
    panic,
    rehearsePanic,
    running,
    fading,
    togglePause,
    muted,
    setMuted,
    startSleepFade,
    panicked,
    advisoryOpen,
  } = useSession();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  if ((panicked || advisoryOpen) && (moreOpen || paletteOpen || shortcutsOpen)) {
    setMoreOpen(false); setPaletteOpen(false); setShortcutsOpen(false);
  }
  // Close the MORE drawer whenever the route changes (state-adjust-during-
  // render pattern; drawer links also close it on tap directly).
  const [lastPath, setLastPath] = useState(location.pathname);
  if (location.pathname !== lastPath) {
    setLastPath(location.pathname);
    setMoreOpen(false);
  }

  // Global keyboard shortcuts — one handler driven by the registry in
  // src/app/shortcuts.ts (the same table renders the `?` help sheet).
  // Typing contexts are filtered by the registry; Space stays fully inert
  // while idle so it keeps its default scroll behavior.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const hit = matchShortcut(e);
      if (!hit) return;
      // A sheet owns keyboard navigation until dismissed. Safety/transport
      // shortcuts remain available; only another navigation overlay is gated.
      if (hasOpenModal() && (hit.id === "sidebar" || hit.id === "help" || (hit.id === "palette" && !paletteOpen))) {
        e.preventDefault();
        return;
      }
      switch (hit.id) {
        case "palette":
          e.preventDefault();
          setPaletteOpen((v) => !v);
          break;
        case "sidebar":
          setMoreOpen((v) => !v);
          break;
        case "pause":
          if (!running) return;
          e.preventDefault();
          togglePause();
          break;
        case "mute":
          setMuted(!muted);
          break;
        case "fade":
          if (running && !fading) startSleepFade();
          break;
        case "panic":
          panic();
          break;
        case "panic-rehearse":
          rehearsePanic();
          break;
        case "help":
          e.preventDefault();
          setShortcutsOpen((v) => !v);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    running,
    fading,
    muted,
    togglePause,
    setMuted,
    startSleepFade,
    panic,
    rehearsePanic,
    paletteOpen,
  ]);

  return (
    <div
      data-archive-theme={theme}
      data-spatial-world="true"
      data-world-route={
        location.pathname === "/"
          ? "home"
          : location.pathname === "/cymatics"
            ? "cymatics"
            : navigationForPath(location.pathname)?.category === "research" ||
                location.pathname === "/research-hub"
              ? "research"
              : "tools"
      }
      className={`flex experience-shell archive-shell discovery-shell ${location.pathname === "/" ? "archive-home" : location.pathname === "/listen" ? "archive-listen" : ""}`}
      style={{ minHeight: "100vh" }}
    >
      <ResonantWorld route={location.pathname} />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div
        className="flex flex-col archive-workspace"
        style={{ flex: 1, minWidth: 0 }}
      >
        {isMobile ? (
          <MobileStatusBar onPalette={() => setPaletteOpen(true)} />
        ) : (
          <header className="observatory-header">
            <NavLink to="/" className="observatory-brand">
              <img
                src={assetUrl("favicon.svg")}
                alt=""
                width="30"
                height="30"
              />
              <span>
                Open Sync<small>SOUND & GEOMETRY</small>
              </span>
            </NavLink>
            <nav
              aria-label="Main navigation"
              data-testid="observatory-navigation"
            >
              {[
                ["/", "Discover"],
                ["/presets", "Sounds"],
                ["/studio", "Studio"],
                ["/cymatics", "Cymatics"],
                ["/research-hub", "Research"],
              ].map(([path, label]) => (
                <NavLink key={path} to={path} end={path === "/"}>
                  {label}
                </NavLink>
              ))}
              <button
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen(!moreOpen)}
              >
                All tools <MoreHorizontal size={16} />
              </button>
            </nav>
            <div className="observatory-utilities">
              <button
                className="observatory-search"
                data-testid="palette-hint"
                aria-label="Open command palette (Ctrl+K)"
                onClick={() => setPaletteOpen(true)}
              >
                Find <kbd>⌘ K</kbd>
              </button>
              <PwaUpdateChip />
              <PanicButton />
            </div>
          </header>
        )}
        {!isMobile && <WorkspaceNav />}
        {(location.pathname !== "/cymatics" || !isMobile) && (
          <div className="world-context">
            {location.pathname !== "/cymatics" && (
              <WorldToolbar theme={theme} onThemeChange={setTheme} />
            )}
            {!isMobile && (
              <div className="observatory-active" data-testid="status-bar">
                <SessionReadout />
                <PauseChip />
              </div>
            )}
          </div>
        )}

        <main
          id="main"
          tabIndex={-1}
          style={{
            flex: 1,
            background: "transparent",
            // Keep content clear of the fixed bottom bar (§3.2 / AC8).
            paddingBottom: isMobile
              ? `calc(${BOTTOM_BAR_H}px + env(safe-area-inset-bottom, 0px))`
              : 0,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              className="archive-route"
              key={location.pathname}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.15,
                ease: "easeOut",
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {isMobile && (
        <>
          <BottomBar
            onMore={() => setMoreOpen((v) => !v)}
            moreOpen={moreOpen}
          />
        </>
      )}
      <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
      <div id="archive-overlay-root" data-testid="archive-overlay-root" className="archive-modal-portal" />
      <PanicOverlay />
      <AdvisoryDialog />
      <ShortcutsOverlay
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      <CommandPalette
        onShowShortcuts={() => setShortcutsOpen(true)}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onToggleSidebar={isMobile ? undefined : () => setMoreOpen((v) => !v)}
      />
    </div>
  );
}
