import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Pause,
  Play,
  SlidersHorizontal,
  Square,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { PRESETS } from "@/data/presets";
import { presetGuidance } from "@/data/presetGuidance";
import { OVERNIGHT_PRESETS } from "@/data/overnightPractice";
import { useSession } from "@/ui/session/useSession";
import { fmtClock } from "@/ui/session/sessionMath";
import { INFANT_MAX_VOLUME_DB } from "@/ui/session/sessionDefaults";
import { FieldControls } from "@/ui/visuals/FieldControls";
import { useIsMobile } from "@/hooks/use-mobile";
import "./experience.css";

export default function Listen() {
  const s = useSession();
  const isMobile = useIsMobile();
  const [params] = useSearchParams();
  const requested = params.get("preset");
  const handled = useRef<string | null>(null);
  const selected = PRESETS.find((p) => p.id === requested);
  const adultBlocked = Boolean(
    selected && s.governor.infantMode && selected.category !== "Infant",
  );
  useEffect(() => {
    if (
      adultBlocked ||
      !requested ||
      !selected ||
      handled.current === requested
    )
      return;
    handled.current = requested;
    s.stopPreview();
    s.stop();
    s.loadPreset(selected);
  }, [requested, selected, s, adultBlocked]);
  const preset =
    PRESETS.find((p) => p.title === s.presetName) ??
    (s.presetName?.includes(" min audio — experimental tier")
      ? OVERNIGHT_PRESETS.find(
          (p) => p.title.split(" · ")[0] === s.presetName?.split(" · ")[0],
        )
      : undefined);
  const headphones =
    (s.running && s.mode === "binaural" && s.beatHz > 0) ||
    s.phases.some(
      (phase) => (phase.mode ?? s.mode) === "binaural" && phase.beatHz > 0,
    );
  const guidance = preset ? presetGuidance(preset) : null;
  const name = (s.presetName ?? "Your sound space").replace(
    / — experimental tier$/,
    "",
  );
  const remaining = s.running
    ? Math.max(
        0,
        Math.min(s.fadeEndsAtSec ?? Infinity, s.limitMin * 60) - s.elapsedSec,
      )
    : s.limitMin * 60;
  const progress = s.running
    ? Math.min(100, (s.elapsedSec / Math.max(1, s.limitMin * 60)) * 100)
    : 0;
  const state = s.panicked
    ? "All sound stopped"
    : s.running
      ? s.paused
        ? "Paused · take your time"
        : s.fading
          ? "Fading gently to quiet"
          : "Listening"
      : "Ready when you are";
  const visualScene = (
    <div className="listen-art listen-world-window">
          <span className="listen-world-caption">YOUR LISTENING SPACE</span>
          <div className="listen-world-controls">
            <FieldControls allowExpand={false} />
            <Link to="/cymatics" className="sand-launch">
              <Waves size={17} />
              Enter the sand universe
            </Link>
          </div>
        </div>
  );
  const purpose = preset?.purpose ?? "A little space to listen. Your current sound and session settings are ready.";
  return (
    <div className="listen-page">
      <div className="listen-topline">
        <Link to="/presets">
          <ArrowLeft size={16} />
          Explore sounds
        </Link>
        <Link to="/studio">
          <SlidersHorizontal size={16} />
          Customize sound
        </Link>
      </div>
      {adultBlocked && (
        <p role="status" className="listen-notice">
          Infant mode is active. This adult practice has not been loaded.{" "}
          <Link to="/presets">Open the infant collection.</Link>
        </p>
      )}
      {requested && !selected && (
        <p role="status" className="listen-notice">
          That sound could not be found. Your current session is unchanged.{" "}
          <Link to="/presets">Choose another sound.</Link>
        </p>
      )}
      <div className="listening-stage">
        {isMobile ? <details className="listen-scene-options"><summary>Visual scene & geometry</summary>{visualScene}</details> : visualScene}
        <section className="listen-controls" aria-label="Session player">
          <span className="overline" data-testid="listen-state">
            {state}
          </span>
          <h1>{name}</h1>
          {isMobile ? <details className="listen-purpose"><summary>About this listening practice</summary><p className="listen-description">{purpose}</p></details> : <p className="listen-description">{purpose}</p>}
          <div className="listen-meta">
            <span>{s.limitMin} min</span>
            <span>
              {headphones ? "Stereo headphones" : "Speakers or headphones"}
            </span>
            {s.presetGrade && (
              <span>
                Evidence {s.presetGrade}
                {s.presetGrade === "D" ? " · experimental" : ""}
              </span>
            )}
          </div>
          <div className="listen-time">
            <span>{fmtClock(remaining)}</span>
            <span>remaining</span>
          </div>
          <div
            className="listen-progress"
            role="progressbar"
            aria-label="Session progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="listen-transport">
            <button
              className="listen-play"
              disabled={s.panicked}
              onClick={() => (s.running ? s.togglePause() : s.start())}
            >
              {s.running && !s.paused ? (
                <Pause size={21} fill="currentColor" />
              ) : (
                <Play size={21} fill="currentColor" />
              )}
              {s.running
                ? s.paused
                  ? "Resume session"
                  : "Pause session"
                : "Play session"}
            </button>
            <button
              className="listen-stop"
              disabled={!s.running && !s.previewId}
              onClick={() => {
                s.stopPreview();
                s.stop();
              }}
            >
              <Square size={17} />
              Stop
            </button>
          </div>
          <div className="listen-volume">
            <button
              aria-label={s.muted ? "Unmute sound" : "Mute sound"}
              onClick={() => s.setMuted(!s.muted)}
            >
              {s.muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            <label htmlFor="listen-volume">
              Volume
              <input
                id="listen-volume"
                type="range"
                min={-60}
                max={Math.min(
                  -6,
                  s.governor.maxGainDbFs,
                  s.governor.infantMode ? INFANT_MAX_VOLUME_DB : -6,
                )}
                step={1}
                value={s.volumeDb}
                onChange={(e) => s.setVolumeDb(Number(e.target.value))}
              />
            </label>
            <output htmlFor="listen-volume">
              {s.muted ? "Muted" : `${s.volumeDb} dBFS`}
            </output>
          </div>
          <p className="listen-small">
            Start with low device volume. You can pause or stop at any time.
          </p>
          {(s.startBlocked.length > 0 || s.interrupted) && (
            <p role="status" className="listen-notice">
              {s.interrupted
                ? "Playback was interrupted. Resume the session when you are ready."
                : s.startBlocked.join(" ")}{" "}
              <Link to="/safety">Review listening settings</Link>
            </p>
          )}
        </section>
      </div>
      <div className="listen-below">
        {guidance && (
          <details>
            <summary>Practice guide: logic, experience & how to use</summary>
            {s.dirty && <p>You have edited this sound. This guide describes the original preset; check your current settings in Studio.</p>}
            <h3>Why this sound</h3>
            <p>{guidance.logic}</p>
            <h3>What you may notice</h3>
            <p>{guidance.experience}</p>
            <h3>How to use</h3>
            <p>{guidance.howToUse}</p>
            <h3>How often</h3>
            <p>{guidance.howOften}</p>
            <h3>Evidence & limits</h3>
            <p>{guidance.limits}</p>
            {guidance.sources.length > 0 && <ul>{guidance.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>}
          </details>
        )}
        <details>
          <summary>About this sound</summary>
          <p>
            {preset?.rationale ??
              "This is your current Studio mix. Open Customize sound to inspect its frequencies, layers and phase sequence."}
          </p>
          {preset?.citations && (
            <ul>
              {preset.citations.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
          <p>
            {s.dirty
              ? "You have edited this session in Studio. The original preset description may no longer describe every sound setting."
              : "These are original listening designs. No particular mental state or health outcome is guaranteed."}
          </p>
        </details>
        <Link to="/studio">
          Make this sound your own <ArrowUpRight size={18} />
        </Link>
        <Link to="/overnight">
          Set up a night of listening <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}
