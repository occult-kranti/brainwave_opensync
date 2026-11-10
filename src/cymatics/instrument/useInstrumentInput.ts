import { useCallback, useEffect, useRef, useState } from 'react';
import type { Input } from './scenes';
import { connectInput, type Connection } from './signal';

export function useInstrumentInput(panicked: boolean) {
  const connection = useRef<Connection | null>(null);
  const attempt = useRef(0);
  const [status, setStatus] = useState('');
  const [filename, setFilename] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [active, setActive] = useState(false);

  const clear = useCallback(() => {
    attempt.current++;
    connection.current?.close();
    connection.current = null;
  }, []);

  const stop = useCallback(() => {
    clear();
    setActive(false);
    setWaiting(false);
    setFilename('');
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
        setStatus('');
      });
    }
  }, [panicked, clear]);

  const start = useCallback(async (input: Input, file?: File) => {
    stop();
    if (panicked) return;
    const ticket = attempt.current;
    let context: AudioContext | undefined;
    let stream: MediaStream | undefined;
    let url: string | undefined;
    setWaiting(true);
    try {
      context = new AudioContext();
      const resume = context.resume();
      void resume.catch(() => {});
      if (input === 'file' && file) {
        url = URL.createObjectURL(file);
        const element = new Audio(url);
        connection.current = connectInput(context, element, url);
        element.addEventListener('ended', stop, { once: true });
        await Promise.all([resume, element.play()]);
        if (ticket === attempt.current) setFilename(file.name);
      } else {
        if (input === 'mic') {
          if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone input requires a secure browser context.');
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('Tab audio is unavailable in this browser.');
          stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
          if (!stream.getAudioTracks().length) throw new Error('Select a browser tab and enable sharing its audio.');
        }
        await resume;
        if (ticket !== attempt.current) return;
        connection.current = connectInput(context, stream);
        for (const track of stream.getTracks()) track.addEventListener('ended', stop, { once: true });
      }
      if (ticket === attempt.current) setActive(true);
    } catch (error) {
      if (ticket === attempt.current) {
        connection.current?.close();
        connection.current = null;
        setStatus(error instanceof Error ? error.message : 'Unable to start this input.');
      }
    } finally {
      if (!context || connection.current?.nodes.spectrum.context !== context) {
        stream?.getTracks().forEach((track) => track.stop());
        if (url) URL.revokeObjectURL(url);
        if (context && context.state !== 'closed') void context.close().catch(() => {});
      }
      if (ticket === attempt.current) setWaiting(false);
    }
  }, [panicked, stop]);

  return { connection, status, filename, active, waiting, stop, start };
}
