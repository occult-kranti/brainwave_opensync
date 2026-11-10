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

export function signalReader() {
  let bins = new Float32Array(0);
  let left = new Float32Array(0);
  let right = new Float32Array(0);
  let previousHz = 0;
  let level = 0;
  return (nodes: Analysers, response: number): Signal => {
    if (bins.length !== nodes.spectrum.frequencyBinCount) bins = new Float32Array(nodes.spectrum.frequencyBinCount);
    if (left.length !== nodes.left.fftSize) left = new Float32Array(nodes.left.fftSize);
    if (right.length !== nodes.right.fftSize) right = new Float32Array(nodes.right.fftSize);
    nodes.spectrum.getFloatFrequencyData(bins);
    nodes.left.getFloatTimeDomainData(left);
    nodes.right.getFloatTimeDomainData(right);
    const binHz = nodes.spectrum.context.sampleRate / nodes.spectrum.fftSize;
    const bands: Signal['bands'] = [0, 0, 0];
    let strongest = -66;
    let peakIndex = 0;
    for (let index = 1; index < bins.length; index++) {
      const hz = index * binHz;
      if (hz > 12000) break;
      const db = bins[index];
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
    let rms = 0;
    for (let index = 0; index < left.length; index += 4) rms += left[index] ** 2;
    const factor = 0.08 + response * 0.006;
    level += (Math.min(1, 2 * Math.sqrt(rms / Math.ceil(left.length / 4))) - level) * factor;
    previousHz = peak && previousHz ? previousHz + (peak - previousHz) * factor : peak;
    return { hz: previousHz, sampleRate: nodes.spectrum.context.sampleRate, level, bands, left, right };
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
  const source = element ? context.createMediaElementSource(element) : context.createMediaStreamSource(input as MediaStream);
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
  return {
    nodes: { spectrum, left, right }, element, stream,
    close: () => {
      stream?.getTracks().forEach((track) => track.stop());
      if (element) {
        element.pause();
        element.removeAttribute('src');
        element.load();
      }
      if (url) URL.revokeObjectURL(url);
      void context.close();
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
