// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import ListeningPresets from '../ListeningPresets';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('Archaeoacoustics preview ownership', () => {
  let mount: HTMLDivElement;
  let root: Root;
  let session: ReturnType<typeof useSession>;
  let onEnded: (() => void) | undefined;

  function Probe() {
    session = useSession();
    return null;
  }

  async function render(showPresets: boolean) {
    await act(async () => root.render(
      <MemoryRouter basename="/brainwave_opensync" initialEntries={['/brainwave_opensync/archaeoacoustics/brainwaves']}>
        <SessionProvider>
          <Probe />
          {showPresets && <ListeningPresets topics={['brainwaves']} />}
        </SessionProvider>
      </MemoryRouter>,
    ));
  }

  function findButton(label: string): HTMLButtonElement {
    const button = [...mount.querySelectorAll('button')].find((element) => element.getAttribute('aria-label') === label);
    if (!button) throw new Error(`Missing button ${label}`);
    return button;
  }

  beforeEach(async () => {
    vi.spyOn(LiveEngine.prototype, 'playBuffer').mockImplementation((_left, _right, _sr, _db, callback) => {
      onEnded = callback;
      return true;
    });
    mount = document.createElement('div');
    document.body.appendChild(mount);
    root = createRoot(mount);
    await render(true);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    mount.remove();
    vi.restoreAllMocks();
  });

  it('switches between bounded previews and honors natural end and Panic', async () => {
    await act(async () => findButton('Play Steady 220 Hz carrier').click());
    expect(session.previewId).toBe('archaeoacoustics:plain-carrier');
    const [samples, , sampleRate, gainDb] = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls[0];
    expect(samples.length).toBe(8 * sampleRate);
    expect(gainDb).toBeLessThanOrEqual(-12);
    await act(async () => onEnded?.());
    expect(session.previewId).toBeNull();
    await act(async () => findButton('Play 220 Hz carrier with 10 Hz modulation').click());
    expect(session.previewId).toBe('archaeoacoustics:carrier-10hz');
    await act(async () => session.panic());
    expect(session.previewId).toBeNull();
    expect(findButton('Play Steady 220 Hz carrier').disabled).toBe(true);
  });

  it('releases only its own preview when the chapter unmounts', async () => {
    await act(async () => findButton('Play Steady 220 Hz carrier').click());
    await render(false);
    expect(session.previewId).toBeNull();

    await render(true);
    await act(async () => findButton('Play Steady 220 Hz carrier').click());
    await act(async () => session.previewTone('different-feature', 330, 1));
    await render(false);
    expect(session.previewId).toBe('different-feature');
  });

  it('clears rejected playback on browsers without audio', async () => {
    vi.mocked(LiveEngine.prototype.playBuffer).mockReturnValue(false);
    await act(async () => findButton('Play Steady 220 Hz carrier').click());
    expect(session.previewId).toBeNull();
    expect(findButton('Play Steady 220 Hz carrier').disabled).toBe(false);
  });
});
