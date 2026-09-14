/**
 * Module 6 — Safety Center (design: safety.md). Panic, session limits,
 * WHO-ITU H.870 dose tracking, infant mode, graded medical advisories,
 * crisis resources. Tone: calm; the real risks are boring (loud + long).
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { INFANT_MAX_SESSION_MIN, MAX_SESSION_MIN, MIN_SESSION_CAP_MIN, SafetyGovernor } from '@/safety/governor';
import { Panel, Led, WarningChip, Chip } from '@/ui/components/primitives';
import { PanicButtonLarge } from '@/ui/components/Panic';
import { DoseGauge } from '@/ui/components/DoseGauge';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { InfoPopover } from '@/ui/components/InfoPopover';
import { useSession } from '@/ui/session/useSession';
import { fmtClock } from '@/ui/session/sessionMath';
import { useIsMobile } from '@/hooks/use-mobile';

const ADVISORIES: { title: string; grade: 'A' | 'B' | 'C' | 'D'; body: string; action?: 'iso'; source?: { title: string; url: string } }[] = [
  {
    title: 'EPILEPSY / PHOTOSENSITIVITY',
    grade: 'B',
    body: 'Isochronic pulses and gamma-rate flicker-adjacent audio are a theoretical seizure trigger for a small photosensitive population; human evidence is thin but the precaution is standard. If you have a seizure disorder, avoid isochronic modes and consult a clinician.',
    action: 'iso',
  },
  {
    title: 'TINNITUS / HYPERACUSIS',
    grade: 'C',
    body: 'Low-level broadband noise is used in tinnitus management protocols; beats are not. Start at −40 dBFS. Stop on any discomfort.',
  },
  {
    title: 'PSYCHIATRIC CAUTION',
    grade: 'C',
    body: 'Intense relaxation/dissociative-adjacent protocols (Deep Focus levels) can be destabilizing for some people with psychosis-spectrum or severe trauma conditions. F21+ shows this warning inline.',
  },
  {
    title: 'PACEMAKERS / IMPLANTS',
    grade: 'A',
    body: "Follow your implant manufacturer's guidance for headphones and other magnetic electronics. Headphone magnets can interfere with some implanted devices when held close to them.",
    source: { title: 'American Heart Association: headphones and implanted devices', url: 'https://www.heart.org/en/health-topics/arrhythmia/prevention--treatment-of-arrhythmia/devices-that-may-interfere-with-icds-and-pacemakers' },
  },
  {
    title: 'DRIVING / OPERATING MACHINERY',
    grade: 'B',
    body: "Delta/theta sleep protocols while driving: don't. This is the one advisory that is pure common sense graded as human-evidence-adjacent.",
  },
];

export default function Safety() {
  const s = useSession();
  const gov = useMemo(() => new SafetyGovernor(s.governor), [s.governor]);
  const texts = gov.advisoryTexts();
  const [openAdv, setOpenAdv] = useState<number | null>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [customMin, setCustomMin] = useState('');
  const [customCap, setCustomCap] = useState('');
  // The effective cap: the user's own, tightened to 45 min in infant mode.
  const capMin = s.governor.infantMode ? Math.min(s.governor.maxSessionMin, INFANT_MAX_SESSION_MIN) : s.governor.maxSessionMin;
  const noCap = s.governor.maxSessionMin >= MAX_SESSION_MIN;
  const setCap = (m: number) => {
    s.setGovernor({ maxSessionMin: m });
    confirm(m >= MAX_SESSION_MIN ? 'SESSION CAP OFF' : `SESSION CAP ${fmtClock(m * 60)}${s.running && m < s.limitMin ? ' · TIGHTENS NOW' : ''}`);
  };
  const isMobile = useIsMobile();

  const levelZone = s.volumeDb > -6 ? 'HIGHER OUTPUT' : s.volumeDb > -18 ? 'MID OUTPUT' : 'LOWER OUTPUT';
  const zoneColor = levelZone === 'HIGHER OUTPUT' ? 'var(--danger)' : levelZone === 'MID OUTPUT' ? 'var(--amber)' : 'var(--text-2)';
  const sessionPct = Math.min(100, (s.elapsedSec / (s.limitMin * 60)) * 100);

  const confirm = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ padding: isMobile ? '20px 16px 40px' : '32px 40px 48px', maxWidth: 1440, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
        <h1 className="t-display-lg">Safety Center</h1>
        <p className="t-body text-2" style={{ marginTop: 8 }}>
          Set playback limits and review the listening notes. The app limits digital output; it does not measure sound level at your ear.
        </p>

        {/* Live safety state strip */}
        <div className="flex items-stretch flex-wrap" style={{ margin: '20px 0' }}>
          <div style={{ padding: '0 24px 0 0' }}>
            <div className="t-readout-lg flex items-center gap-2" style={{ color: s.running ? 'var(--teal)' : 'var(--text-3)' }}>
              <Led state={s.running ? 'teal' : 'off'} />
              {s.running ? 'RUNNING' : 'OFF'}
            </div>
            <div className="t-label">ENGINE</div>
          </div>
          <div style={{ padding: isMobile ? '0 16px 8px 0' : '0 24px', borderLeft: isMobile ? 'none' : '1px solid var(--line-1)' }}>
            <div className="t-readout-lg" style={{ color: 'var(--text-1)' }}>
              {s.volumeDb.toFixed(1)}
              <span className="text-3" style={{ fontSize: '0.5em' }}>
                {'\u2009'}dBFS
              </span>{' '}
              <span className="t-label" style={{ color: zoneColor }}>
                {levelZone}
              </span>
            </div>
            <div className="t-label">LEVEL</div>
          </div>
          <div style={{ padding: isMobile ? '0 16px 8px 0' : '0 24px', borderLeft: isMobile ? 'none' : '1px solid var(--line-1)' }}>
            <div className="t-readout-lg" style={{ color: s.dosePercent >= 100 ? 'var(--danger)' : s.dosePercent >= 75 ? 'var(--amber)' : 'var(--teal)' }}>
              {s.dosePercent.toFixed(0)}
              <span className="text-3" style={{ fontSize: '0.5em' }}>
                %
              </span>
            </div>
            <div className="t-label">ESTIMATED DOSE THIS WEEK</div>
          </div>
          <div style={{ padding: isMobile ? '0 16px 8px 0' : '0 24px', borderLeft: isMobile ? 'none' : '1px solid var(--line-1)' }}>
            <div className="t-readout-lg" style={{ color: 'var(--text-1)' }}>
              {fmtClock(s.elapsedSec)}
              <span className="text-3" style={{ fontSize: '0.5em' }}>
                {' '}
                / {fmtClock(s.limitMin * 60)}
              </span>
            </div>
            <div className="t-label">SESSION</div>
            <div style={{ width: 140, height: 2, background: 'var(--ink-4)', marginTop: 4 }}>
              <div style={{ width: `${sessionPct}%`, height: '100%', background: sessionPct >= 80 ? 'var(--danger)' : 'var(--amber)' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* v2: advisory acknowledgment + governor verdict for the current panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="panel"
        data-testid="advisory-panel"
        style={{ marginBottom: 16, padding: isMobile ? 16 : '16px 24px', borderLeft: `2px solid ${s.advisoryAcknowledged ? 'var(--teal)' : 'var(--amber)'}` }}
      >
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', rowGap: 8 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="t-label" style={{ color: 'var(--text-1)' }}>
              FIRST-RUN ADVISORY ·{' '}
              <span style={{ color: s.advisoryAcknowledged ? 'var(--teal-hi)' : 'var(--amber)' }}>
                {s.advisoryAcknowledged ? 'ACKNOWLEDGED ON THIS DEVICE' : 'NOT YET ACKNOWLEDGED'}
              </span>
            </div>
            <p className="t-body-sm text-2" style={{ margin: '4px 0 0' }}>
              Review the listening notes before your first session. Your acknowledgment is saved on this device;
              playback limits are checked each time you start.
            </p>
          </div>
          <button type="button" className="chip" onClick={s.openAdvisory} data-testid="review-advisory">
            REVIEW ADVISORY
          </button>
          <button
            type="button"
            className="chip"
            data-testid="reset-dose"
            onClick={() => {
              s.resetDoseLog();
              confirm('DOSE WEEK RESET — 0%');
            }}
            title="Clear the local 7-day Studio estimate. This does not change past sound exposure."
          >
            RESET DOSE WEEK
          </button>
        </div>
        {!s.authorization.ok && (
          <ul className="t-caption font-mono2" style={{ margin: '10px 0 0', paddingLeft: 16, color: 'var(--danger)' }}>
            {s.authorization.reasons.map((r) => (
              <li key={r}>START WOULD BE REFUSED: {r}</li>
            ))}
          </ul>
        )}
        <div className="t-caption font-mono2" style={{ marginTop: 8, color: 'var(--text-3)' }}>
          SLEEP FADE {s.fadeOutSec === 0 ? 'OFF (hard stop at the limit)' : `${s.fadeOutSec} s before the ${s.limitMin}-minute limit`} · change in Studio
        </div>
      </motion.div>

      <div className="grid gap-4" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)' }}>
        {/* Panic panel — first in mobile order */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 5' }}>
          <Panel title="STOP ALL SOUND" style={{ height: '100%' }}>
            <PanicButtonLarge />
            <p className="t-body-sm text-2" style={{ margin: '16px 0 8px' }}>
              Stops Studio and every preview immediately. Keyboard: <span className="font-mono2">P</span> (show the stopped screen:{' '}
              <span className="font-mono2">Shift+P</span>).
            </p>
            {isMobile && (
              <p className="t-caption text-3" style={{ margin: '0 0 8px' }}>
                On touch devices, Stop all sound stays in the bottom bar.
              </p>
            )}
            <button
              type="button"
              className="chip"
              onClick={() => {
                s.rehearsePanic();
                confirm('STOPPED SCREEN PREVIEW — NO AUDIO');
              }}
            >
              Preview stopped screen
            </button>
            <p className="t-caption text-3" style={{ marginTop: 8 }}>
              This preview opens only while Studio is stopped. Keep sound off closes it without starting audio.
            </p>
          </Panel>
        </motion.div>

        {/* Session limits */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 7' }}>
          <Panel title="SESSION LIMITS">
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <span className="t-label">SESSION LENGTH</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap" style={{ marginBottom: 10 }} data-testid="session-length">
              <span className="t-readout-lg">{fmtClock(s.limitMin * 60)}</span>
              {[30, 60, 90, 120, 180, 240]
                .filter((m) => m <= capMin)
                .map((m) => (
                  <Chip
                    key={m}
                    active={s.limitMin === m}
                    onClick={() => {
                      if (s.running && m > s.limitMin) {
                        // Nothing is queued: the click is simply refused. Say so.
                        confirm('LOOSENING REFUSED WHILE RUNNING — SET IT AFTER STOP');
                        return;
                      }
                      s.setLimitMin(m);
                      if (s.running) confirm(`LIMIT ${fmtClock(s.limitMin * 60)} → ${fmtClock(m * 60)} · APPLIES NOW`);
                    }}
                  >
                    {m}
                  </Chip>
                ))}
              <input
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = parseInt(customMin, 10);
                    if (Number.isFinite(v) && v >= 1 && v <= capMin) s.setLimitMin(v);
                    else confirm(`SESSION LENGTH MUST BE 1–${capMin} MIN`);
                    setCustomMin('');
                  }
                }}
                placeholder="custom min"
                aria-label="Custom session length (minutes)"
                className="font-mono2"
                style={{ width: 100, background: 'var(--ink-3)', border: '1px solid var(--line-1)', borderRadius: 2, color: 'var(--text-1)', padding: '5px 8px', fontSize: 12 }}
              />
            </div>
            <p className="t-caption text-3" style={{ marginBottom: 16 }}>
              Studio ends the session here with a gentle fade-out (30 s by default), not a hard cut (except panic).
              Lengths only tighten live; loosening takes effect next session.
            </p>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <span className="t-label">SESSION CAP</span>
              <InfoPopover featureId="session-cap" label="About the session cap" />
            </div>
            <div className="flex items-center gap-4 flex-wrap" style={{ marginBottom: 10 }} data-testid="session-cap">
              <span className="t-readout-lg" data-testid="session-cap-readout">
                {noCap ? 'NO CAP' : fmtClock(s.governor.maxSessionMin * 60)}
              </span>
              <Chip active={noCap} onClick={() => setCap(MAX_SESSION_MIN)} title="No cap beyond the 24-hour bound">
                OFF
              </Chip>
              {[30, 60, 90, 120, 180, 240, 480].map((m) => (
                <Chip key={m} active={s.governor.maxSessionMin === m} onClick={() => setCap(m)}>
                  {m}
                </Chip>
              ))}
              <input
                value={customCap}
                onChange={(e) => setCustomCap(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = parseInt(customCap, 10);
                    if (Number.isFinite(v) && v >= MIN_SESSION_CAP_MIN && v <= MAX_SESSION_MIN) setCap(v);
                    else confirm(`CAP MUST BE ${MIN_SESSION_CAP_MIN}–${MAX_SESSION_MIN} MIN`);
                    setCustomCap('');
                  }
                }}
                placeholder="custom cap"
                aria-label="Custom session cap (minutes)"
                className="font-mono2"
                style={{ width: 100, background: 'var(--ink-3)', border: '1px solid var(--line-1)', borderRadius: 2, color: 'var(--text-1)', padding: '5px 8px', fontSize: 12 }}
              />
            </div>
            <p className="t-caption text-3" style={{ marginBottom: 20 }}>
              The session length cannot exceed your cap. Lowering the cap applies immediately; raising it applies
              to the next session. Infant mode keeps its 45-minute cap. These settings are saved on this device.
            </p>
            <div className="flex items-start gap-6 flex-wrap">
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                  <span className="t-label">H.870 DOSE MODEL</span>
                  <InfoPopover featureId="dose-gauge" label="About the sound dose gauge" />
                  <GradeBadge
                    grade="A"
                    compact
                    citation={{
                      verdict: 'The grade applies to the cited dose model, not a measurement at your ear.',
                      summary:
                        'ITU-T H.870 / WHO Make Listening Safe, 3 dB exchange rate. Our headphone-level estimate is approximate — flat-response assumption — stated as such.',
                      source: 'ITU-T H.870 (2019); WHO-NMH-NVI-19.4; NIOSH REL 85 dBA / 3 dB',
                    }}
                  />
                </div>
                <div style={isMobile ? { display: 'flex', justifyContent: 'center' } : undefined}>
                  <DoseGauge percent={s.dosePercent} width={280} />
                </div>
                <div className="t-readout-sm text-2" style={{ marginTop: 8 }}>
                  EST. LEVEL {s.volumeDb.toFixed(0)} dBFS ≈ {s.estDbA.toFixed(0)} dBA (headphone est.) · DOSE {s.dosePercent.toFixed(0)}%
                </div>
                <p className="t-caption text-3" style={{ marginTop: 8, maxWidth: 380 }}>
                  This is a model estimate, not a measurement. Headphones and device volume change actual listening
                  level. The log covers Studio sessions; short previews and other audio are not included.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="t-label" style={{ width: 110 }}>QUIET CAP</span>
                  <Chip active={s.governor.maxGainDbFs <= -30} onClick={() => {
                    const enabling = s.governor.maxGainDbFs > -30;
                    s.setGovernor({ maxGainDbFs: enabling ? -30 : -6 });
                    if (enabling && s.volumeDb > -30) s.setVolumeDb(-30);
                    confirm(enabling ? 'OUTPUT CAPPED AT −30 dBFS' : 'CAP BACK TO −6 dBFS');
                  }}>
                    CAP −30 dBFS
                  </Chip>
                  <Led state={s.governor.maxGainDbFs <= -30 ? 'amber' : 'off'} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="t-label" style={{ width: 110 }}>DRIVING ACK</span>
                  <Chip
                    active={s.governor.drivingWarningAcknowledged}
                    onClick={() => {
                      s.setGovernor({ drivingWarningAcknowledged: !s.governor.drivingWarningAcknowledged });
                      confirm(s.governor.drivingWarningAcknowledged ? 'ACK CLEARED' : 'DRIVING WARNING ACKNOWLEDGED');
                    }}
                  >
                    {s.governor.drivingWarningAcknowledged ? 'ACKNOWLEDGED' : 'NOT ACKNOWLEDGED'}
                  </Chip>
                </div>
                <p className="t-caption text-3" style={{ maxWidth: 320 }}>
                  {texts.driving}
                </p>
              </div>
            </div>
          </Panel>
        </motion.div>

        {/* Infant mode */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
          <Panel title="INFANT MODE" right={<Led state={s.governor.infantMode ? 'teal' : 'off'} />}>
            <button
              type="button"
              className={`chip ${s.governor.infantMode ? 'chip-active' : ''}`}
              onClick={() => {
                s.setGovernor({ infantMode: !s.governor.infantMode });
                if (!s.governor.infantMode) {
                  s.setVolumeDb(Math.min(s.volumeDb, -40));
                  s.setLimitMin(20);
                }
                confirm(!s.governor.infantMode ? 'INFANT MODE ON — SET −40 dBFS / 20:00 · CEILING −26 dBFS / 45:00' : 'INFANT MODE OFF');
              }}
            >
              {s.governor.infantMode ? 'ON' : 'OFF'}
            </button>
            <p className="t-body-sm text-2" style={{ margin: '12px 0' }}>
              This mode adds a ≤1 kHz low-pass, caps digital output at −26 dBFS, and limits a session to 45 minutes.
              Turning it on sets the fader to −40 dBFS and the session to 20 minutes. Only Infant presets are shown.
              These controls do not measure or guarantee sound level in the room or at an infant's ear.
            </p>
            <div className="flex gap-2" style={{ marginBottom: 8 }}>
              <GradeBadge grade="D" compact citation={{ verdict: "Grade D as a 'feature'.", summary: 'There is no evidence binaural audio benefits infants, and no safety trials either.', source: 'Hugh et al., Pediatrics 2014 (PMID 24590753)' }} />
              <GradeBadge grade="A" compact citation={{ verdict: 'Grade A as a precaution.', summary: 'All 14 tested infant sleep machines exceeded 50 dBA at 30 cm at max volume; 3 exceeded 85 dBA.', source: 'Hugh et al., Pediatrics 2014; AAP 2023 reaffirmation' }} />
            </div>
            <WarningChip tone="danger">Never put headphones on an infant.</WarningChip>
          </Panel>
        </motion.div>

        {/* Medical advisories */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
          <Panel title="MEDICAL ADVISORIES">
            <div className="flex flex-col">
              {ADVISORIES.map((a, i) => (
                <div key={a.title} style={{ borderTop: i > 0 ? '1px solid var(--line-1)' : 'none', padding: '10px 0' }}>
                  <button
                    type="button"
                    className="flex items-center gap-2 w-full"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setOpenAdv(openAdv === i ? null : i)}
                  >
                    <GradeBadge grade={a.grade} compact />
                    <span className="t-label" style={{ flex: 1, textAlign: 'left' }}>
                      {a.title}
                    </span>
                    <span className="text-3">{openAdv === i ? '▾' : '▸'}</span>
                  </button>
                  {openAdv === i && (
                    <div style={{ marginTop: 8 }}>
                      <p className="t-body-sm text-2">{a.body}</p>
                      {a.source && <a className="t-body-sm" href={a.source.url} target="_blank" rel="noreferrer">{a.source.title}</a>}
                      {a.action === 'iso' && (
                        <button type="button" className="chip" style={{ marginTop: 8 }} onClick={() => { s.setMode('binaural'); confirm('STUDIO SET TO BINAURAL'); }}>
                          Switch Studio to binaural
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="t-caption text-3" style={{ marginTop: 12 }}>
              {texts.seizure}
            </p>
            <p className="t-caption text-3" style={{ marginTop: 8 }}>
              {texts.medication}
            </p>
          </Panel>
        </motion.div>

        {/* Crisis strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
          <Panel title="IF SOMETHING FEELS WRONG">
            <p className="t-body-sm text-2" style={{ marginBottom: 12 }}>
              If audio playback ever coincides with dizziness, visual disturbance, chest symptoms, or a panic response:
              stop playback. This app cannot assess symptoms or tell you their cause.
            </p>
            <div className="t-readout-md" style={{ color: 'var(--amber)', marginBottom: 4 }}>
              US — call/text 988
            </div>
            <p className="t-caption text-3" style={{ marginBottom: 12 }}>
              {texts.crisis}
            </p>
            <p className="t-body-sm text-2">
              If you experience a first seizure, sudden hearing loss, or severe tinnitus onset: that is a doctor visit,
              not a settings change.
            </p>
            <p className="t-caption text-3" style={{ marginTop: 12 }}>
              These resources are general information; Open Sync is not a medical device and makes no therapeutic
              claims.
            </p>
          </Panel>
        </motion.div>
      </div>

      {/* confirmation toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="t-readout-sm"
          style={{
            position: 'fixed',
            bottom: isMobile ? 88 : 24,
            right: isMobile ? 16 : 24,
            left: isMobile ? 16 : undefined,
            background: 'var(--ink-3)',
            border: '1px solid var(--line-2)',
            borderRadius: 2,
            padding: '8px 14px',
            color: 'var(--text-1)',
            zIndex: 80,
          }}
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}
