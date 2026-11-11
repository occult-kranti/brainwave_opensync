export interface Analysers {
  spectrum: AnalyserNode;
  left: AnalyserNode;
  right: AnalyserNode;
}

export interface Signal {
  hz: number;
  sampleRate: number;
  level: number;
  bands: [number, number, number];
  left: Float32Array<ArrayBuffer>;
  right: Float32Array<ArrayBuffer>;
}

/** A stationary, explicitly synthetic tone model; not a measurement of playback. */
export function makeDemoSignal(hz: number, kind: 'sine' | 'triangle' | 'square' | 'sawtooth'): Signal {
  const sampleRate = 48000;
  const frequency = Number.isFinite(hz) ? Math.max(20, Math.min(1200, hz)) : 440;
  const left = new Float32Array(2048);
  const limit = kind === 'sine' ? 1 : Math.min(15, Math.floor(18000 / frequency));
  for (let harmonic = 1; harmonic <= limit; harmonic++) {
    if (kind !== 'sawtooth' && harmonic % 2 === 0) continue;
    const weight = kind === 'triangle' ? (-1) ** ((harmonic - 1) / 2) / harmonic ** 2 :
      kind === 'sawtooth' ? (-1) ** (harmonic + 1) / harmonic : 1 / harmonic;
    for (let i = 0; i < left.length; i++) left[i] += weight * Math.sin(2 * Math.PI * frequency * harmonic * i / sampleRate);
  }
  for (let i = 0; i < left.length; i++) left[i] = Math.max(-1, Math.min(1, left[i])) * 0.55;
  return { left, right: new Float32Array(left), sampleRate, hz: frequency, level: 0, bands: [0, 0, 0] };
}

export function signalReader() {
  let bins = new Float32Array(0);
  let leftBins = new Float32Array(0);
  let rightBins = new Float32Array(0);
  let left = new Float32Array(0);
  let right = new Float32Array(0);
  let previousHz = 0;
  let level = 0;
  // Interpolate native FFT *power* at a physical frequency, not dB values or
  // array indices. This also handles different left/right FFT resolutions.
  const powerAt = (data: Float32Array, position: number) => {
    const index = Math.floor(position);
    if (index < 0 || index >= data.length) return 0;
    const fraction = position - index;
    const first = Number.isFinite(data[index]) ? 10 ** (data[index] / 10) : 0;
    const second = Number.isFinite(data[index + 1]) ? 10 ** (data[index + 1] / 10) : 0;
    return first + (second - first) * fraction;
  };
  return (nodes: Analysers, response: number): Signal => {
    if (leftBins.length !== nodes.left.frequencyBinCount) leftBins = new Float32Array(nodes.left.frequencyBinCount);
    if (rightBins.length !== nodes.right.frequencyBinCount) rightBins = new Float32Array(nodes.right.frequencyBinCount);
    if (bins.length !== Math.max(leftBins.length, rightBins.length)) bins = new Float32Array(Math.max(leftBins.length, rightBins.length));
    if (left.length !== nodes.left.fftSize) left = new Float32Array(nodes.left.fftSize);
    if (right.length !== nodes.right.fftSize) right = new Float32Array(nodes.right.fftSize);
    nodes.left.getFloatFrequencyData(leftBins);
    nodes.right.getFloatFrequencyData(rightBins);
    nodes.left.getFloatTimeDomainData(left);
    nodes.right.getFloatTimeDomainData(right);
    const sampleRate = nodes.spectrum.context.sampleRate;
    const leftBinHz = sampleRate / nodes.left.fftSize;
    const rightBinHz = sampleRate / nodes.right.fftSize;
    const binHz = Math.min(leftBinHz, rightBinHz);
    const bands: Signal['bands'] = [0, 0, 0];
    let strongest = -66;
    let peakIndex = 0;
    for (let index = 0; index < bins.length; index++) {
      const hz = index * binHz;
      if (hz > 12000 + binHz) break;
      // Averaging channel powers preserves opposite-polarity stereo. Reading
      // the mono spectrum would cancel that signal before the plate sees it.
      const power = (powerAt(leftBins, hz / leftBinHz) + powerAt(rightBins, hz / rightBinHz)) / 2;
      const db = power > 0 ? 10 * Math.log10(power) : -Infinity;
      bins[index] = db;
      if (index === 0 || hz > 12000) continue;
      if (hz >= 20 && hz <= 1200 && db > strongest) {
        strongest = db;
        peakIndex = index;
      }
      const band = hz < 180 ? 0 : hz < 1800 ? 1 : 2;
      bands[band] = Math.max(bands[band], Math.max(0, Math.min(1, (db + 72) / 66)));
    }
    const above = bins[peakIndex + 1];
    const below = bins[peakIndex - 1];
    const curvature = below + above - 2 * strongest;
    const offset = Number.isFinite(curvature) && curvature < 0 ? Math.max(-0.5, Math.min(0.5, (below - above) / (2 * curvature))) : 0;
    const peak = peakIndex ? (peakIndex + offset) * binHz : 0;
    let powerLeft = 0, powerRight = 0;
    // Measure every sample: striding by four can alias e.g. a 12 kHz tone at
    // 48 kHz into apparent silence and trigger a false no-audio warning.
    for (let index = 0; index < left.length; index++) powerLeft += left[index] ** 2;
    for (let index = 0; index < right.length; index++) powerRight += right[index] ** 2;
    const rms = (powerLeft / Math.max(1, left.length) + powerRight / Math.max(1, right.length)) / 2;
    const factor = 0.08 + response * 0.006;
    level += (Math.min(1, 2 * Math.sqrt(rms)) - level) * factor;
    previousHz = peak && previousHz ? previousHz + (peak - previousHz) * factor : peak;
    return { hz: previousHz, sampleRate, level, bands, left, right };
  };
}

export interface Connection {
  nodes: Analysers;
  element?: HTMLAudioElement;
  stream?: MediaStream;
  close: () => void;
}

export function connectInput(context: AudioContext, input: HTMLAudioElement | MediaStream, url?: string): Connection {
  const element = input instanceof HTMLAudioElement ? input : undefined;
  const stream = input instanceof HTMLAudioElement ? undefined : input;
  const source = element ? context.createMediaElementSource(element) : context.createMediaStreamSource(new MediaStream(stream!.getAudioTracks()));
  const spectrum = context.createAnalyser();
  const stereo = context.createGain();
  stereo.channelCount = 2;
  stereo.channelCountMode = 'explicit';
  const splitter = context.createChannelSplitter(2);
  const left = context.createAnalyser();
  const right = context.createAnalyser();
  const silence = context.createGain();
  spectrum.fftSize = 4096;
  left.fftSize = right.fftSize = 2048;
  silence.gain.value = 0;
  source.connect(spectrum);
  source.connect(stereo);
  stereo.connect(splitter);
  splitter.connect(left, 0);
  splitter.connect(right, 1);
  spectrum.connect(silence);
  left.connect(silence);
  right.connect(silence);
  silence.connect(context.destination);
  let closed = false;
  return {
    nodes: { spectrum, left, right }, element, stream,
    close: () => {
      if (closed) return;
      closed = true;
      for (const node of [source, spectrum, stereo, splitter, left, right, silence]) node.disconnect();
      stream?.getTracks().forEach((track) => track.stop());
      if (element) {
        element.pause();
        element.removeAttribute('src');
        element.load();
      }
      if (url) URL.revokeObjectURL(url);
      if (context.state !== 'closed') void context.close().catch(() => {});
    },
  };
}

// A short, band-limited preview buffer. Audio leaves through the session's
// tracked preview bus so normal Stop, Panic and the infant filter still apply.
export function makeTone(hz: number, kind: 'sine' | 'triangle' | 'square' | 'sawtooth') {
  const sampleRate = 48000;
  const samples = new Float32Array(8 * sampleRate);
  const maxHarmonic = kind === 'sine' ? 1 : Math.min(15, Math.floor(18000 / hz));
  for (let harmonic = 1; harmonic <= maxHarmonic; harmonic++) {
    if (kind !== 'sawtooth' && harmonic % 2 === 0) continue;
    const factor = kind === 'triangle' ? (-1) ** ((harmonic - 1) / 2) / harmonic ** 2 :
      kind === 'sawtooth' ? (-1) ** (harmonic + 1) / harmonic : 1 / harmonic;
    const step = 2 * Math.PI * hz * harmonic / sampleRate;
    for (let index = 0; index < samples.length; index++) samples[index] += factor * Math.sin(index * step);
  }
  for (let index = 0; index < samples.length; index++) {
    const envelope = Math.min(1, index / 1440, (samples.length - 1 - index) / 2880);
    samples[index] = Math.max(-1, Math.min(1, samples[index])) * envelope * 0.55;
  }
  return samples;
}
