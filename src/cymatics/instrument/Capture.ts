export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function startCapture(canvas: HTMLCanvasElement, onEnd: (blob: Blob | null) => void) {
  if (typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') return null;
  const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/mp4']
    .find((mime) => MediaRecorder.isTypeSupported(mime));
  if (!mimeType) return null;
  const stream = canvas.captureStream(24);
  const release = () => stream.getTracks().forEach((track) => track.stop());
  try {
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
    const chunks: Blob[] = [];
    let save = true;
    let failed = false;
    const stop = () => { if (recorder.state !== 'inactive') recorder.stop(); };
    const timer = window.setTimeout(stop, 30000);
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = () => { failed = true; stop(); };
    recorder.onstop = () => {
      window.clearTimeout(timer);
      release();
      if (save) onEnd(chunks.length && !failed ? new Blob(chunks, { type: mimeType }) : null);
    };
    try {
      recorder.start(400);
    } catch (error) {
      window.clearTimeout(timer);
      throw error;
    }
    return { stop, discard: () => { save = false; stop(); } };
  } catch {
    release();
    return null;
  }
}
