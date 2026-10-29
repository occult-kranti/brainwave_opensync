/** Task-first application chrome. Visual experiments live in their own tools. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import { ArrowRight, AudioLines, BookOpen, Home, Menu, Pause, Play, Search, SlidersHorizontal, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ROUTES } from "@/app/routes";
import { navigationForPath } from "@/app/navigation";
import { matchShortcut } from "@/app/shortcuts";
import { GroupedNavigation } from "./GroupedNavigation";
import { WorkspaceNav } from "./WorkspaceNav";
import { useSession } from "../session/useSession";
import { fmtClock } from "../session/sessionMath";
import { hasOpenModal, useModalA11y } from "../hooks";
import { useSheetScrollLock } from "../useSheetScrollLock";
import { MobilePanicButton, PanicButton, PanicOverlay } from "../components/Panic";
import { CommandPalette } from "../components/CommandPalette";
import { AdvisoryDialog } from "../components/AdvisoryDialog";
import { ShortcutsOverlay } from "../components/ShortcutsOverlay";
import { PwaUpdateChip } from "../components/PwaUpdateChip";
import { SpatialProvider } from "../visuals/SpatialProvider";
import "../../pages/archive-theme.css";
import "../../pages/spatial.css";
import "../../pages/resonance.css";
import "../../pages/immersive-world.css";
import "../../pages/mobile-refinements.css";
import "../../pages/listening-atlas.css";
import "./atlas-shell.css";

const PRIMARY = [
  { path: "/", label: "Home", icon: Home, test: "today" },
  { path: "/presets", label: "Sounds", icon: AudioLines, test: "explore" },
  { path: "/studio", label: "Make", icon: SlidersHorizontal, test: "studio" },
  { path: "/research-hub", label: "Research", icon: BookOpen, test: "research" },
];
const BOTTOM_BAR_H = 64;

function Brand() {
  return <NavLink to="/" className="atlas-brand" aria-label="Open Sync home">
    <span className="atlas-brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
    <span>open sync<span className="atlas-brand-period">.</span></span>
  </NavLink>;
}

function SessionReadout() {
  const { running, paused, fading, muted, previewId, elapsedSec } = useSession();
  const text = previewId ? "Preview playing" : running
    ? `Studio ${paused ? "paused" : fading ? "fading" : "playing"}${muted ? " · muted" : ""} · ${fmtClock(elapsedSec)}`
    : "Sound is off";
  return <span className="atlas-readout">{text}</span>;
}

function PauseChip({ mobile = false }: { mobile?: boolean }) {
  const { running, paused, togglePause } = useSession();
  if (!running) return null;
  return <button type="button" className="atlas-pause"
    data-testid={mobile ? "mobile-pause" : "pause-toggle"}
    aria-label={paused ? "Resume Studio session" : "Pause Studio session"}
    aria-pressed={paused} onClick={togglePause}>
    {paused ? <Play size={17} fill="currentColor" /> : <Pause size={17} fill="currentColor" />}
    <span>{paused ? "RESUME" : "PAUSE"}</span>
  </button>;
}

function SessionDock({ mobile, inert }: { mobile: boolean; inert: boolean }) {
  const { running, previewId, presetName } = useSession();
  if (!running && !previewId) return null;
  return <aside className="atlas-session-dock" aria-label="Current sound" inert={inert} data-testid="session-dock">
    <AudioLines size={23} aria-hidden="true" />
    <div className="atlas-session-title"><strong>{previewId ? "Sound preview" : presetName ?? "Your session"}</strong><SessionReadout /></div>
    <PauseChip mobile={mobile} />
    <NavLink to="/listen" className="atlas-player-link">Open player <ArrowRight size={16} /></NavLink>
    {!mobile && <PanicButton />}
  </aside>;
}

function BottomBar({ onMore, moreOpen }: { onMore: () => void; moreOpen: boolean }) {
  return <nav data-testid="mobile-bottom-bar" className="atlas-bottom-nav" aria-label="Primary" style={{ zIndex: 100 }}>
    {PRIMARY.slice(0, 3).map(({ path, label, icon: Icon, test }) =>
      <NavLink key={path} to={path} end={path === "/"} data-testid={`bottom-tab-${test}`}>
        <Icon size={21} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span>
      </NavLink>)}
    <button type="button" data-testid="bottom-tab-more" aria-label="More tools and research"
      aria-controls="site-navigation-dialog" aria-expanded={moreOpen} onClick={onMore}>
      <Menu size={21} strokeWidth={1.7} aria-hidden="true" /><span>Menu</span>
    </button>
    <div className="atlas-mobile-stop"><MobilePanicButton /></div>
  </nav>;
}

function MoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalA11y(open, onClose, closeRef, dialogRef);
  useSheetScrollLock(open);
  if (!open) return null;
  return <div className="atlas-menu-layer">
    <div className="atlas-menu-backdrop" data-testid="more-backdrop" onClick={onClose} />
    <section ref={dialogRef} id="site-navigation-dialog" data-testid="more-drawer"
      className="atlas-menu" role="dialog" aria-modal="true" aria-labelledby="site-navigation-title"
      aria-describedby="site-navigation-description" tabIndex={-1} style={{ zIndex: 121 }}>
      <div className="atlas-menu-sticky"><header className="atlas-menu-header">
        <div><h2 id="site-navigation-title">Find your way.</h2><p id="site-navigation-description">A sound to hear. A tool to try. An idea to follow.</p></div>
        <button type="button" className="atlas-menu-close" ref={closeRef} aria-label="Close" onClick={onClose}><X size={23} /></button>
      </header>
      <div className="atlas-menu-transport"><SessionReadout /><PanicButton /></div></div>
      <NavLink to="/practice-plan" onClick={onClose} className="atlas-practice-link"><span>Build a home practice<small>When to listen, what to repeat, and where to begin.</small></span><ArrowRight size={22} /></NavLink>
      <nav className="atlas-menu-directory" aria-label="All pages">
        <GroupedNavigation idPrefix="drawer" renderRoute={route => {
          const Icon = route.icon;
          return <NavLink to={route.path} key={route.path} end={route.path === "/"} onClick={onClose} className="atlas-menu-route">
            <div><Icon size={19} strokeWidth={1.6} aria-hidden="true" /><span>{navigationForPath(route.path)?.title ?? route.label}</span><ArrowRight size={15} aria-hidden="true" /></div>
          </NavLink>;
        }} />
      </nav>
      <footer className="atlas-menu-footer"><NavLink to="/guide" onClick={onClose}>How to use Open Sync</NavLink><NavLink to="/about" onClick={onClose}>About this project</NavLink></footer>
    </section>
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  // Dedicated Cymatics and field tools retain their own optional scene state.
  return <SpatialProvider><AtlasShell>{children}</AtlasShell></SpatialProvider>;
}

function AtlasShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { panic, rehearsePanic, running, previewId, fading, togglePause, muted, setMuted, startSleepFade, panicked, advisoryOpen } = useSession();
  const route = ROUTES.find(item => item.path === location.pathname);
  const entry = navigationForPath(location.pathname);
  const label = entry?.title ?? route?.label ?? "Open Sync";
  const sectionPath = location.pathname === "/" ? "/" : location.pathname === "/presets" || entry?.category === "practice" ? "/presets" : entry?.category === "create" ? "/studio" : ["analyze", "experiments", "research"].includes(entry?.category ?? "") || location.pathname === "/research-hub" ? "/research-hub" : null;

  useEffect(() => {
    document.documentElement.dataset.design = "listening-atlas";
    delete document.documentElement.dataset.archiveTheme;
    return () => { delete document.documentElement.dataset.design; };
  }, []);
  useEffect(() => {
    document.title = `${label} · Open Sync`;
    const anchor = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (anchor) anchor.scrollIntoView(); else window.scrollTo(0, 0);
  }, [location.pathname, location.hash, label]);

  const focusPath = useRef(location.pathname);
  useEffect(() => {
    if (focusPath.current === location.pathname) return;
    focusPath.current = location.pathname;
    const frame = window.requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  const [lastPath, setLastPath] = useState(location.pathname);
  if (location.pathname !== lastPath) { setLastPath(location.pathname); setMoreOpen(false); }
  if ((panicked || advisoryOpen) && (moreOpen || paletteOpen || shortcutsOpen)) {
    setMoreOpen(false); setPaletteOpen(false); setShortcutsOpen(false);
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const hit = matchShortcut(event); if (!hit) return;
      if (hasOpenModal() && (hit.id === "sidebar" || hit.id === "help" || (hit.id === "palette" && !paletteOpen))) { event.preventDefault(); return; }
      switch (hit.id) {
        case "palette": event.preventDefault(); setPaletteOpen(value => !value); break;
        case "sidebar": event.preventDefault(); setMoreOpen(value => !value); break;
        case "pause": if (running) { event.preventDefault(); togglePause(); } break;
        case "mute": setMuted(!muted); break;
        case "fade": if (running && !fading) startSleepFade(); break;
        case "panic": panic(); break;
        case "panic-rehearse": rehearsePanic(); break;
        case "help": event.preventDefault(); setShortcutsOpen(value => !value); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, fading, muted, togglePause, setMuted, startSleepFade, panic, rehearsePanic, paletteOpen]);

  const showDock = (running || Boolean(previewId)) && location.pathname !== "/listen";
  return <div className={`atlas-shell ${showDock ? "atlas-has-sound" : ""}`}>
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="atlas-workspace archive-workspace" inert={moreOpen}>
      <header className="atlas-header" data-testid={isMobile ? "status-bar-mobile" : "status-bar"}>
        <Brand />
        {!isMobile && <nav className="atlas-primary-nav" aria-label="Main navigation" data-testid="observatory-navigation">
          {PRIMARY.map(item => <NavLink key={item.path} to={item.path} end={item.path === "/"} className={sectionPath === item.path ? "atlas-section-current" : undefined}>{item.label}</NavLink>)}
          <button type="button" aria-controls="site-navigation-dialog" aria-expanded={moreOpen} onClick={() => setMoreOpen(value => !value)}>All pages <Menu size={17} /></button>
        </nav>}
        <div className="atlas-header-actions">
          <button type="button" data-testid="palette-hint" aria-label="Open command palette (Ctrl+K)" className="atlas-search" onClick={() => setPaletteOpen(true)}><Search size={19} /><span>Find anything</span>{!isMobile && <kbd>⌘ K</kbd>}</button>
          <PwaUpdateChip />
          {!isMobile && <PanicButton />}
        </div>
      </header>
      {location.pathname !== "/" && <div className="atlas-page-context"><span>{location.pathname === "/" ? "A place for listening, making, and curiosity." : label}</span><SessionReadout /></div>}
      <WorkspaceNav />
      <main id="main" tabIndex={-1} className="atlas-main" style={{ paddingBottom: isMobile ? `calc(${BOTTOM_BAR_H}px + env(safe-area-inset-bottom, 0px))` : undefined }}>
        <div className="atlas-route archive-route">{children}</div>
      </main>
      <footer className="atlas-site-footer"><NavLink to="/">Open Sync</NavLink><span>Made for your ears. Open to your curiosity.</span><NavLink to="/safety">Listening safely</NavLink><NavLink to="/guide">Guide</NavLink><NavLink to="/about">About</NavLink></footer>
    </div>
    {showDock && <SessionDock mobile={isMobile} inert={moreOpen} />}
    {isMobile && <div inert={moreOpen}><BottomBar moreOpen={moreOpen} onMore={() => setMoreOpen(value => !value)} /></div>}
    <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    <div id="archive-overlay-root" data-testid="archive-overlay-root" className="archive-modal-portal" />
    <PanicOverlay /><AdvisoryDialog />
    <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    <CommandPalette onShowShortcuts={() => setShortcutsOpen(true)} open={paletteOpen} onClose={() => setPaletteOpen(false)} onToggleSidebar={() => setMoreOpen(value => !value)} />
  </div>;
}
