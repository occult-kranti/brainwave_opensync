import { useCallback, useEffect, useRef, useState } from 'react';
import type { Input } from './scenes';
import { connectInput, type Connection } from './signal';

// Picker preferences never guarantee that an OS shares audio. Display capture
// requires video, but the instrument only reads the audio tracks.
function displayOptions(input: 'tab' | 'system'): DisplayMediaStreamOptions {
  return {
    video: { displaySurface: input === 'tab' ? 'browser' : 'monitor' },
    audio: {
      echoCancellation: false, noiseSuppression: false, autoGainControl: false,
      suppressLocalAudioPlayback: false,
    },
    systemAudio: input === 'system' ? 'include' : 'exclude',
    selfBrowserSurface: 'exclude',
    surfaceSwitching: 'include',
  } as DisplayMediaStreamOptions;
}

function inputError(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  if (name === 'NotAllowedError') return 'Sharing was cancelled or denied. Try again and allow audio in the browser picker.';
  if (name === 'NotReadableError') return 'The browser could not read that audio source. Try a YouTube or Spotify web tab, or check your system capture permissions.';
  if (name === 'InvalidStateError') return 'Open this page in a focused browser tab and press Connect again.';
  if (name === 'NotFoundError') return 'No compatible audio input was found. Connect a device or use a browser tab.';
  if (name === 'AbortError') return 'Audio sharing was interrupted. You can connect again.';
  return error instanceof Error ? error.message : 'Unable to start this input.';
}

export function useInstrumentInput(panicked: boolean) {
  const connection = useRef<Connection | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const attempt = useRef(0);
  const [status, setStatus] = useState('');
  const [filename, setFilename] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [muted, setMuted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [active, setActive] = useState(false);
  const [sourceVersion, setSourceVersion] = useState(0);

  const clear = useCallback(() => {
    attempt.current++;
    connection.current = null;
    cleanup.current?.();
    cleanup.current = null;
  }, []);

  const stop = useCallback(() => {
    clear();
    setActive(false);
    setWaiting(false);
    setFilename('');
    setSourceLabel('');
    setMuted(false);
    setStatus('');
  }, [clear]);

  useEffect(() => clear, [clear]);
  useEffect(() => {
    if (panicked) {
      clear();
      queueMicrotask(() => {
        setActive(false);
        setWaiting(false);
        setFilename('');
        setSourceLabel('');
        setMuted(false);
        setStatus('');
      });
    }
  }, [panicked, clear]);

  const start = useCallback(async (input: Input, file?: File) => {
    stop();
    if (panicked) return;
    setSourceVersion((version) => version + 1);
    const ticket = attempt.current;
    let context: AudioContext | undefined;
    let stream: MediaStream | undefined;
    let element: HTMLAudioElement | undefined;
    let url: string | undefined;
    let owned: Connection | undefined;
    let disposed = false;
    const listeners: (() => void)[] = [];
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      listeners.forEach((remove) => remove());
      if (owned) owned.close();
      else {
        stream?.getTracks().forEach((track) => track.stop());
        if (element) { element.pause(); element.removeAttribute('src'); element.load(); }
        if (url) URL.revokeObjectURL(url);
        if (context && context.state !== 'closed') void context.close().catch(() => {});
      }
    };
    cleanup.current = dispose;
    setWaiting(true);
    try {
      if (!['tab', 'system', 'mic', 'file'].includes(input)) throw new Error('Choose a live audio source or an audio file.');
      if (input === 'file' && !file) throw new Error('Choose an audio file first.');
      context = new AudioContext();
      const resume = context.resume();
      void resume.catch(() => {});
      if (input === 'file' && file) {
        url = URL.createObjectURL(file);
        element = new Audio(url);
        owned = connectInput(context, element, url);
        connection.current = owned;
        const ended = () => { if (ticket === attempt.current) { stop(); setStatus('Audio file finished.'); } };
        element.addEventListener('ended', ended);
        listeners.push(() => element?.removeEventListener('ended', ended));
        await Promise.all([resume, element.play()]);
        if (ticket === attempt.current) { setFilename(file.name); setSourceLabel(file.name); }
      } else {
        // Keep the picker in the original button gesture: do not await resume.
        if (input === 'mic') {
          if (!navigator.mediaDevices?.getUserMedia) throw new Error('Audio input requires HTTPS or localhost and a browser with microphone support.');
          stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        } else {
          if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('Audio sharing is unavailable here. Open this page directly over HTTPS in desktop Chrome or Edge, or use an audio input.');
          stream = await navigator.mediaDevices.getDisplayMedia(displayOptions(input as 'tab' | 'system'));
        }
        // A stream returned after Stop belongs to this attempt, never a newer one.
        if (ticket !== attempt.current) { stream.getTracks().forEach((track) => track.stop()); return; }
        if (!stream.getAudioTracks().some((track) => track.readyState === 'live')) {
          throw new Error(input === 'system'
            ? 'No audio shared. Choose an entire screen and enable system audio if offered. Otherwise use YouTube or Spotify Web with the Web tab source, or a loopback audio input.'
            : 'No audio shared. Choose the YouTube or Spotify browser tab and enable Share tab audio. You can try again.');
        }
        await resume;
        if (ticket !== attempt.current) { stream.getTracks().forEach((track) => track.stop()); return; }
        if (stream.getTracks().some((track) => track.readyState === 'ended')) {
          throw new Error('Audio sharing ended before the connection was ready. Connect again to resume.');
        }
        owned = connectInput(context, stream);
        connection.current = owned;
        const tracks = stream.getAudioTracks();
        const updateMute = () => { if (ticket === attempt.current) setMuted(tracks.every((track) => track.muted)); };
        const ended = () => {
          if (ticket !== attempt.current) return;
          stop();
          setStatus('Audio sharing ended. Connect again to resume the live view.');
        };
        for (const track of stream.getTracks()) {
          track.addEventListener('ended', ended);
          listeners.push(() => track.removeEventListener('ended', ended));
          if (track.kind === 'audio') {
            track.addEventListener('mute', updateMute);
            track.addEventListener('unmute', updateMute);
            listeners.push(() => { track.removeEventListener('mute', updateMute); track.removeEventListener('unmute', updateMute); });
          }
        }
        updateMute();
        setSourceLabel(tracks[0]?.label || (input === 'tab' ? 'Shared browser tab' : input === 'system' ? 'Shared laptop audio' : 'Default audio input'));
      }
      if (ticket === attempt.current) setActive(true);
    } catch (error) {
      if (ticket === attempt.current) {
        connection.current = null;
        setStatus(inputError(error));
      }
      dispose();
    } finally {
      if (ticket !== attempt.current) dispose();
      if (ticket === attempt.current) setWaiting(false);
    }
  }, [panicked, stop]);

  return { connection, status, filename, sourceLabel, sourceVersion, muted, active, waiting, stop, start };
}
