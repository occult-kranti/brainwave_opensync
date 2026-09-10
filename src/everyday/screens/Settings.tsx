/**
 * Settings (#/settings): session cap, sleep fade, infant mode, theme,
 * install, and links to the lab and About. Rails only tighten: the cap and
 * infant mode go through setGovernor, which clamps a running session too.
 */

import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { MAX_SESSION_MIN, MIN_SESSION_CAP_MIN } from '@/safety/governor';
import { useSession } from '@/ui/session/useSession';
import { FADE_OUT_CHOICES } from '@/ui/session/sessionDefaults';
import { copy } from '../copy';
import { CAP_CHIPS, fmtFade, fmtMin } from '../format';
import { THEME_SETTINGS } from '../theme';
import { useEveryday } from '../useEveryday';
import { Chip, Section, Switch } from '../components/primitives';

export default function Settings() {
  const s = useSession();
  const ev = useEveryday();
  const [custom, setCustom] = useState('');

  const cap = s.governor.maxSessionMin;
  const noCap = cap >= MAX_SESSION_MIN;
  const customActive = !noCap && !CAP_CHIPS.includes(cap);

  const commitCustom = () => {
    const v = parseInt(custom, 10);
    if (Number.isFinite(v) && v >= MIN_SESSION_CAP_MIN && v <= MAX_SESSION_MIN) s.setGovernor({ maxSessionMin: v });
    setCustom('');
  };

  return (
    <div className="ev-page" data-testid="screen-settings">
      <h1 className="ev-h1">{copy.tabs.settings}</h1>

      <Section title={copy.headings.sessionCap} testId="section-cap">
        <div className="ev-chips" role="group" aria-label={copy.headings.sessionCap} data-testid="cap-chips">
          <Chip testId="cap-off" active={noCap} onClick={() => s.setGovernor({ maxSessionMin: MAX_SESSION_MIN })}>
            {copy.settings.capOff}
          </Chip>
          {CAP_CHIPS.map((m) => (
            <Chip key={m} testId={`cap-${m}`} active={cap === m} onClick={() => s.setGovernor({ maxSessionMin: m })}>
              {fmtMin(m)}
            </Chip>
          ))}
          <label className="ev-custom" data-active={customActive ? 'true' : 'false'}>
            <span>{customActive ? fmtMin(cap) : copy.settings.custom}</span>
            <input
              className="ev-input"
              type="number"
              inputMode="numeric"
              min={MIN_SESSION_CAP_MIN}
              max={MAX_SESSION_MIN}
              placeholder={copy.settings.customPlaceholder}
              aria-label={`${copy.settings.custom} ${copy.headings.sessionCap.toLowerCase()} (${copy.units.minutes})`}
              data-testid="cap-custom"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onBlur={() => custom && commitCustom()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitCustom();
              }}
            />
          </label>
        </div>
      </Section>

      <Section title={copy.headings.sleepFade} testId="section-fade">
        <div className="ev-chips" role="group" aria-label={copy.headings.sleepFade} data-testid="fade-chips">
          {FADE_OUT_CHOICES.map((c) => (
            <Chip key={c.sec} testId={`fade-${c.sec}`} active={s.fadeOutSec === c.sec} onClick={() => s.setFadeOutSec(c.sec)}>
              {fmtFade(c.sec)}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title={copy.headings.infantMode} testId="section-infant">
        <div className="ev-list">
          <div className="ev-row">
            <span className="ev-row-main">
              <span>{copy.headings.infantMode}</span>
              <span className="ev-row-sub">{copy.settings.infantLine}</span>
            </span>
            <Switch checked={s.governor.infantMode} label={copy.headings.infantMode} testId="infant-mode" onChange={(on) => s.setGovernor({ infantMode: on })} />
          </div>
        </div>
      </Section>

      <Section title={copy.headings.theme} testId="section-theme">
        <div className="ev-chips" role="group" aria-label={copy.headings.theme} data-testid="theme-chips">
          {THEME_SETTINGS.map((t) => (
            <Chip key={t} testId={`theme-${t}`} active={ev.theme === t} onClick={() => ev.setTheme(t)}>
              {copy.settings.theme[t]}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title={copy.headings.install} testId="section-install">
        {ev.canInstall ? (
          <button type="button" className="ev-btn ev-btn--primary" data-testid="install-button" onClick={ev.promptInstall}>
            {copy.settings.installButton}
          </button>
        ) : (
          <p className="ev-line" data-testid="install-hint">
            {copy.settings.installHint}
          </p>
        )}
      </Section>

      <div className="ev-list">
        <a className="ev-row ev-row--link" href={import.meta.env.BASE_URL} data-testid="open-lab">
          <span>{copy.settings.openLab}</span>
          <ExternalLink className="ev-row-icon" size={18} aria-hidden="true" />
        </a>
        <Link className="ev-row ev-row--link" to="/about" data-testid="about-link">
          <span>{copy.settings.about}</span>
          <ChevronRight className="ev-row-icon" size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
