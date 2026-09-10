/**
 * About (#/about): version, the one-line promise, credits, source, and the
 * safety notes — each governor advisory as a short summary with a "Read
 * full" disclosure holding the verbatim text (collapsed by default). The
 * only place long text appears in the everyday app.
 */

import { Link } from 'react-router';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { SafetyGovernor, type AdvisoryTexts } from '@/safety/governor';
import { copy } from '../copy';
import { Section } from '../components/primitives';

const TEXTS: AdvisoryTexts = new SafetyGovernor().advisoryTexts();
const NOTE_KEYS: readonly (keyof AdvisoryTexts)[] = ['driving', 'seizure', 'medication', 'crisis'];
const SOURCE_URL = 'https://github.com/occult-kranti/brainwave_opensync';

const VERSION: string = typeof import.meta.env.VITE_APP_VERSION === 'string' ? import.meta.env.VITE_APP_VERSION : '';

export default function About() {
  return (
    <div className="ev-page" data-testid="screen-about">
      <Link to="/settings" className="ev-back" data-testid="about-back" aria-label={copy.tabs.settings}>
        <ChevronLeft size={20} aria-hidden="true" />
        <span>{copy.tabs.settings}</span>
      </Link>
      <h1 className="ev-h1">{copy.headings.about}</h1>
      <div className="ev-list">
        {VERSION && (
          <div className="ev-row" data-testid="about-version">
            <span>{copy.headings.version}</span>
            <span className="ev-muted ev-mono">{VERSION}</span>
          </div>
        )}
        <div className="ev-row">
          <span>{copy.app.tagline}</span>
        </div>
      </div>

      <Section title={copy.headings.credits} testId="section-credits">
        <div className="ev-list">
          {copy.about.credits.map((c) => (
            <div key={c.name} className="ev-credit">
              <span>{c.name}</span>
              <span className="ev-muted">{c.license}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={copy.headings.source} testId="section-source">
        <div className="ev-list">
          <a className="ev-row ev-row--link" href={SOURCE_URL} target="_blank" rel="noreferrer" data-testid="source-link">
            <span className="ev-mono">{copy.about.sourceLink}</span>
            <ExternalLink className="ev-row-icon" size={18} aria-hidden="true" />
          </a>
        </div>
      </Section>

      <Section title={copy.headings.safetyNotes} testId="section-safety">
        <div className="ev-list">
          {NOTE_KEYS.map((k) => (
            <details key={k} className="ev-details" data-testid={`safety-${k}`}>
              <summary>
                <span>{copy.about.safety[k]}</span>
                <span className="ev-details-cta">{copy.about.readFull}</span>
              </summary>
              <p>{TEXTS[k]}</p>
            </details>
          ))}
        </div>
      </Section>
    </div>
  );
}
