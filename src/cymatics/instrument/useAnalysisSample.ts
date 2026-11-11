import { useCallback, useEffect, useRef, useState } from 'react';

const DURATION_MS = 10000;
const MAX_BYTES = 5 * 1024 * 1024;

/** Explicit, bounded audio-only recording for a local analysis report.
 * The caller owns the shared tracks: this hook never stops those tracks.
 */
export function useAnalysisSample(sourceKey: string, onFile: (file: File) => void) {
  const [recording, setRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [status, setStatus] = useState('');
  const current = useRef<(() => void) | null>(null);
  const generation = useRef(0);
  const deliver = useRef(onFile);
  useEffect(() => { deliver.current = onFile; }, [onFile]);

  const clear = useCallback(() => {
    generation.current++;
    current.current?.();
    current.current = null;
  }, []);
  const cancel = useCallback(() => {
    clear();
    setRecording(false);
    setSecondsLeft(0);
    setStatus('Sample cancelled.');
  }, [clear]);

  useEffect(() => {
    const ticket = generation.current;
    queueMicrotask(() => {
      if (ticket === generation.current) {
        setRecording(false);
        setSecondsLeft(0);
        setStatus('');
      }
    });
    return clear;
  }, [sourceKey, clear]);

  const start = useCallback((source: MediaStream | null, label: string) => {
    clear();
    setRecording(false);
    setSecondsLeft(0);
    const tracks = source?.getAudioTracks().filter((track) => track.readyState === 'live') ?? [];
    if (!tracks.length) { setStatus('Connect a shared audio source before sampling.'); return; }
    if (typeof MediaRecorder === 'undefined') { setStatus('Audio sampling is unavailable in this browser. You can analyze a local audio file instead.'); return; }
    const ticket = generation.current;
    const stream = new MediaStream(tracks);
    let recorder: MediaRecorder;
    try {
      const mimeType = typeof MediaRecorder.isTypeSupported === 'function'
        ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((mime) => MediaRecorder.isTypeSupported(mime))
        : undefined;
      recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 128000 });
    } catch {
      setStatus('The browser could not create an audio sample. You can analyze a local file instead.');
      return;
    }
    let chunks: Blob[] = [];
    let bytes = 0;
    let cancelled = false;
    let complete = false;
    let timeout = 0;
    let interval = 0;
    const startedAt = performance.now();
    const relevant = () => ticket === generation.current && !cancelled;
    const detach = () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
      for (const track of tracks) track.removeEventListener('ended', ended);
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      if (ticket === generation.current) current.current = null;
    };
    const discard = () => {
      cancelled = true;
      detach();
      chunks = [];
      if (recorder.state !== 'inactive') { try { recorder.stop(); } catch { /* already stopped */ } }
    };
    const fail = (message: string) => {
      if (!relevant()) return;
      discard();
      setRecording(false);
      setSecondsLeft(0);
      setStatus(message);
    };
    const ended = () => fail('The audio source ended; the unfinished sample was discarded.');
    current.current = discard;
    recorder.ondataavailable = (event) => {
      if (!relevant() || !event.data.size) return;
      bytes += event.data.size;
      if (bytes > MAX_BYTES) { fail('The sample exceeded the local 5 MiB limit and was discarded.'); return; }
      chunks.push(event.data);
    };
    recorder.onerror = () => fail('Audio sampling failed. The unfinished sample was discarded.');
    recorder.onstop = () => {
      if (!relevant()) return;
      const duration = Math.min(10, Math.max(0, (performance.now() - startedAt) / 1000));
      const type = recorder.mimeType || chunks[0]?.type || 'audio/webm';
      const payload = complete && chunks.length ? new Blob(chunks, { type }) : null;
      detach();
      chunks = [];
      setRecording(false);
      setSecondsLeft(0);
      if (!payload?.size) { setStatus('No complete audio sample was produced. Try again or choose a local file.'); return; }
      const safeLabel = label.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'live-audio';
      const extension = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
      const file = new File([payload], `${safeLabel}-sample.${extension}`, { type });
      setStatus(`Captured ${duration.toFixed(1)} seconds locally. Preparing the recording report.`);
      deliver.current(file);
    };
    for (const track of tracks) track.addEventListener('ended', ended);
    try {
      recorder.start(400);
      setRecording(true);
      setSecondsLeft(10);
      setStatus('Recording a local audio sample; nothing is uploaded.');
      interval = window.setInterval(() => {
        if (relevant()) setSecondsLeft(Math.max(0, Math.ceil((DURATION_MS - (performance.now() - startedAt)) / 1000)));
      }, 250);
      timeout = window.setTimeout(() => {
        if (!relevant()) return;
        complete = true;
        try { recorder.stop(); } catch { fail('The browser could not finish the sample.'); }
      }, DURATION_MS);
    } catch {
      fail('The browser could not start audio sampling. Try a local file instead.');
    }
  }, [clear]);

  return { recording, secondsLeft, status, start, cancel };
}
