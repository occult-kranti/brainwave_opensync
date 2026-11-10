import { lazy, Suspense, useCallback } from 'react';
import Instrument from '@/cymatics/instrument/Instrument';
import { useSession } from '@/ui/session/useSession';
import type { Waveform } from '@/cymatics/instrument/scenes';
import { makeTone } from '@/cymatics/instrument/signal';

const PrecisionCymatics = lazy(() => import('./PrecisionCymatics'));
const TONE_ID = 'cymatics:instrument';

export default function Cymatics() {
  const { engineRef, governor, panicked, paused, previewId, running, stopPreview, togglePreview } = useSession();
  const getStudioSignal = useCallback(() => running && !paused && !panicked ? engineRef.current?.analysers() ?? null : null, [engineRef, running, paused, panicked]);
  const playTone = (hz: number, waveform: Waveform) => {
    if (running || panicked) return;
    const samples = makeTone(hz, waveform);
    togglePreview(TONE_ID, () => {
      const gain = Math.min(governor.maxGainDbFs, governor.infantMode ? -40 : -24);
      const started = engineRef.current.playBuffer(samples, samples, 48000, gain, stopPreview);
      if (!started) queueMicrotask(stopPreview);
    });
  };

  return <Instrument
    getStudioSignal={getStudioSignal}
    playTone={playTone}
    stopTone={() => { if (previewId === TONE_ID) stopPreview(); }}
    tonePlaying={previewId === TONE_ID}
    sessionRunning={running}
    panicked={panicked}
    advanced={<Suspense fallback={<p role="status">Loading precision lab…</p>}><PrecisionCymatics /></Suspense>}
  />;
}
