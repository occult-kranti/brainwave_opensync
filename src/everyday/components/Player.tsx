/**
 * The running/paused player: breathing ring, 96 px play/pause, remaining
 * time + end clock, duration chips, volume, quick section toggles, fade and
 * stop. Every control is a thin call into the shared session actions.
 */

import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useSession } from '@/ui/session/useSession';
import { fmtClock } from '@/ui/session/sessionMath';
import { copy } from '../copy';
import {
  BOWLS_DEFAULT_DB,
  NOISE_DEFAULT_DB,
  VOLUME_MAX_DB,
  VOLUME_MIN_DB,
  dbToPct,
  durationChips,
  effectiveCapMin,
  fmtEndsAt,
  fmtMin,
  nextBell,
  pctToDb,
  remainingSec,
  selectedNoise,
} from '../format';
import { bowlSetLayers } from '../intents';
import { useNowSec } from '../useNow';
import { Chip, Range } from './primitives';

const BREATHE = { duration: 4, repeat: Infinity, ease: 'easeInOut' as const };
const STILL = { duration: 0.3 };

interface ToggleProps {
  active: boolean;
  label: string;
  sub?: string;
  testId: string;
  onClick: () => void;
}

function Toggle({ active, label, sub, testId, onClick }: ToggleProps) {
  return (
    <motion.button type="button" className="ev-toggle" aria-pressed={active} data-testid={testId} whileTap={{ scale: 0.97 }} onClick={onClick}>
      <span>{label}</span>
      {sub && <span className="ev-toggle-sub">{sub}</span>}
    </motion.button>
  );
}

export function Player() {
  const s = useSession();
  const nowSec = useNowSec();
  const remaining = remainingSec(s);
  const chips = durationChips(effectiveCapMin(s.governor));
  const noiseColor = selectedNoise(s.noiseDb);
  const anyBowlOn = s.bowls.some((b) => b.on);

  const toggleNoise = () => {
    if (s.noiseOn && noiseColor) {
      s.setNoiseOn(false);
      return;
    }
    if (!noiseColor) s.setNoiseDb('brown', NOISE_DEFAULT_DB);
    s.setNoiseOn(true);
  };
  const toggleNature = () => {
    const on = !s.nature.on;
    s.setNature({ on });
    if (on && !s.layersOn) s.setLayersOn(true);
  };
  const toggleBowls = () => {
    if (s.bowls.length === 0) s.setBowls(bowlSetLayers('himalayan-trio', BOWLS_DEFAULT_DB));
    else s.setBowls(s.bowls.map((b) => ({ ...b, on: !anyBowlOn })));
    if (!anyBowlOn && !s.layersOn) s.setLayersOn(true);
  };

  return (
    <div className="ev-player" data-testid="player" data-paused={s.paused ? 'true' : undefined}>
      <div className="ev-ring-wrap">
        <motion.div className="ev-ring" aria-hidden="true" animate={s.paused ? { scale: 1 } : { scale: [1, 1.08, 1] }} transition={s.paused ? STILL : BREATHE} />
        <motion.button
          type="button"
          className="ev-play"
          data-testid="play-pause"
          aria-label={s.paused ? copy.player.play : copy.player.pause}
          whileTap={{ scale: 0.97 }}
          onClick={s.togglePause}
        >
          {s.paused ? <Play size={40} aria-hidden="true" /> : <Pause size={40} aria-hidden="true" />}
        </motion.button>
      </div>

      <div className="ev-clock" data-testid="remaining" aria-label={copy.player.remaining}>
        {fmtClock(remaining)}
      </div>
      {s.paused ? (
        <span className="ev-paused" data-testid="paused">
          {copy.player.paused}
        </span>
      ) : (
        <div className="ev-ends" data-testid="ends-at">
          {s.fading ? `${copy.player.fading} · ` : ''}
          {copy.player.ends} {fmtEndsAt(nowSec * 1000, remaining)}
        </div>
      )}

      <div className="ev-stack">
        <div className="ev-chips" role="group" aria-label={copy.player.duration} data-testid="duration-chips">
          {chips.map((m) => (
            <Chip key={m} testId={`duration-${m}`} active={s.limitMin === m} disabled={m > s.limitMin} onClick={() => s.setLimitMin(m)}>
              {fmtMin(m)}
            </Chip>
          ))}
        </div>

        <Range label={copy.player.volume} value={dbToPct(s.volumeDb, VOLUME_MIN_DB, VOLUME_MAX_DB)} testId="volume" onChange={(p) => s.setVolumeDb(pctToDb(p, VOLUME_MIN_DB, VOLUME_MAX_DB))} />

        <div className="ev-toggles">
          <Toggle testId="toggle-noise" label={copy.player.noise} active={s.noiseOn && noiseColor !== null} onClick={toggleNoise} />
          <Toggle testId="toggle-nature" label={copy.player.nature} active={s.layersOn && s.nature.on} onClick={toggleNature} />
          <Toggle testId="toggle-bowls" label={copy.player.bowls} active={s.layersOn && anyBowlOn} onClick={toggleBowls} />
          <Toggle
            testId="toggle-bell"
            label={copy.player.bell}
            sub={s.bellEveryMin > 0 ? fmtMin(s.bellEveryMin) : copy.sounds.off}
            active={s.bellEveryMin > 0}
            onClick={() => s.setBellEveryMin(nextBell(s.bellEveryMin))}
          />
        </div>

        <div className="ev-actions">
          <motion.button
            type="button"
            className="ev-btn"
            data-testid="fade"
            aria-pressed={s.fading}
            whileTap={{ scale: 0.97 }}
            onClick={() => (s.fading ? s.cancelSleepFade() : s.startSleepFade(30))}
          >
            {s.fading ? copy.player.cancelFade : copy.player.fadeStop}
          </motion.button>
          <motion.button type="button" className="ev-btn ev-btn--danger" data-testid="stop" whileTap={{ scale: 0.97 }} onClick={s.stop}>
            {copy.player.stop}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
