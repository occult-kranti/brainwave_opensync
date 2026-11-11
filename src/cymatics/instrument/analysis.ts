/**
 * Bounded, local measurements of one stereo PCM block. These are signal
 * descriptors, not loudness over a programme, a fundamental-pitch detector,
 * acoustic SPL measurements, or evidence of an effect on a listener.
 */
import { fftInPlace, hannWindow } from '@/dsp/fft';

export interface AnalysisBand {
  label: string;
  lowHz: number;
  highHz: number;
  powerFraction: number;
}

export interface AudioAnalysisFrame {
  sampleRate: number;
  fftSize: number;
  binHz: number;
  durationMs: number;
  sampleCount: number;
  sanitizedSamples: number;
  waveformLeft: Float32Array;
  waveformRight: Float32Array;
  spectrumDb: Float32Array;
  leftSpectrumDb: Float32Array;
  rightSpectrumDb: Float32Array;
  leftRmsDb: number | null;
  rightRmsDb: number | null;
  leftPeakDb: number | null;
  rightPeakDb: number | null;
  rmsDb: number | null;
  peakDb: number | null;
  crestDb: number | null;
  dcLeft: number;
  dcRight: number;
  nearFullScaleFraction: number;
  correlation: number | null;
  /** -1 = left only; +1 = right only; 0 = equal channel power or silence. */
  balance: number;
  midPowerFraction: number;
  sidePowerFraction: number;
  peakHz: number | null;
  peakDbSpectral: number | null;
  /** Nearest equal-tempered note to the strongest spectral peak, not f0. */
  note: string | null;
  cents: number | null;
  centroidHz: number | null;
  spreadHz: number | null;
  rolloff85Hz: number | null;
  flatness: number | null;
  bands: AnalysisBand[];
  peaks: { hz: number; db: number }[];
}

export const ANALYSIS_DB_FLOOR = -120;
const POWER_FLOOR = 10 ** (ANALYSIS_DB_FLOOR / 10);
const OCTAVE_CENTERS = [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000];
const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const windows = new Map<number, Float32Array>();

function amplitudeDb(value: number): number | null {
  return value > 0 ? 20 * Math.log10(value) : null;
}

function powerDb(value: number): number {
  return Math.max(ANALYSIS_DB_FLOOR, 10 * Math.log10(Math.max(POWER_FLOOR, value)));
}

/** One-sided, coherent-gain-corrected Hann FFT amplitude squared. */
function channelSpectrum(samples: Float32Array, fftSize: number): Float64Array {
  const count = samples.length;
  const bins = fftSize / 2 + 1;
  const power = new Float64Array(bins);
  if (!count) return power;
  let window = windows.get(count);
  if (!window) {
    // Only the two real analyser sizes are cached. Arbitrary short test blocks
    // must not grow a long-running page's cache without bound.
    window = hannWindow(count, true);
    if (count === 2048 || count === 4096) windows.set(count, window);
  }
  let mean = 0;
  for (const value of samples) mean += value;
  mean /= count;
  let normalizer = 1;
  for (const value of samples) normalizer = Math.max(normalizer, Math.abs(value));
  const real = new Float32Array(fftSize);
  const imaginary = new Float32Array(fftSize);
  let coherentGain = 0;
  for (let index = 0; index < count; index++) {
    real[index] = ((samples[index] - mean) / normalizer) * window[index];
    coherentGain += window[index];
  }
  if (coherentGain <= 0) return power;
  fftInPlace(real, imaginary, false);
  for (let index = 0; index < bins; index++) {
    const edge = index === 0 || index === bins - 1;
    const scale = (edge ? 1 : 2) * normalizer / coherentGain;
    power[index] = (real[index] ** 2 + imaginary[index] ** 2) * scale ** 2;
  }
  return power;
}

function interpolatedPeak(power: Float64Array, index: number, binHz: number, nyquist: number) {
  const center = powerDb(power[index]);
  const below = powerDb(power[Math.max(0, index - 1)]);
  const above = powerDb(power[Math.min(power.length - 1, index + 1)]);
  const curvature = below + above - 2 * center;
  const offset = index > 0 && index < power.length - 1 && curvature < -1e-9
    ? Math.max(-0.5, Math.min(0.5, 0.5 * (below - above) / curvature)) : 0;
  return {
    hz: Math.max(0, Math.min(nyquist, (index + offset) * binHz)),
    db: center - 0.25 * (below - above) * offset,
  };
}

/**
 * Read at most 4096 samples per channel; unequal/missing tails are zero-padded.
 * Non-finite PCM values become zero. FFTs average L/R power, so opposite-phase
 * stereo remains visible instead of cancelling in a mono downmix.
 *
 * RMS dBFS = 20 log10(sqrt(mean((L²+R²)/2))). Sample peak dBFS uses the largest
 * absolute sample of either channel. The FFT uses one-sided peak amplitudes
 * with Hann coherent-gain correction: a bin-centered full-scale sine is ~0 dB
 * in its spectral peak and ~-3.01 dBFS RMS. Neither is calibrated dB SPL or LUFS.
 */
export function analyzeFrame(left: Float32Array, right: Float32Array, sampleRate: number): AudioAnalysisFrame {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || sampleRate > 384000) {
    throw new RangeError('Analysis sample rate must be finite, positive and no greater than 384000 Hz.');
  }
  const sampleCount = Math.min(4096, Math.max(left.length, right.length));
  const fftSize = sampleCount > 2048 ? 4096 : 2048;
  const waveformLeft = new Float32Array(sampleCount);
  const waveformRight = new Float32Array(sampleCount);
  let sanitizedSamples = 0;
  let sumL = 0, sumR = 0, energyL = 0, energyR = 0, peakL = 0, peakR = 0;
  let cross = 0, midPower = 0, sidePower = 0, fullScale = 0;
  for (let index = 0; index < sampleCount; index++) {
    const rawL = left[index] ?? 0;
    const rawR = right[index] ?? 0;
    const l = Number.isFinite(rawL) ? rawL : 0;
    const r = Number.isFinite(rawR) ? rawR : 0;
    if (!Number.isFinite(rawL)) sanitizedSamples++;
    if (!Number.isFinite(rawR)) sanitizedSamples++;
    waveformLeft[index] = l;
    waveformRight[index] = r;
    sumL += l; sumR += r;
    energyL += l * l; energyR += r * r; cross += l * r;
    peakL = Math.max(peakL, Math.abs(l)); peakR = Math.max(peakR, Math.abs(r));
    midPower += ((l + r) / 2) ** 2;
    sidePower += ((l - r) / 2) ** 2;
    if (Math.abs(l) >= 0.999) fullScale++;
    if (Math.abs(r) >= 0.999) fullScale++;
  }
  const count = Math.max(1, sampleCount);
  const dcLeft = sumL / count, dcRight = sumR / count;
  const varianceL = Math.max(0, energyL - sumL * sumL / count);
  const varianceR = Math.max(0, energyR - sumR * sumR / count);
  const denominator = Math.sqrt(varianceL) * Math.sqrt(varianceR);
  const correlation = denominator > 1e-20
    ? Math.max(-1, Math.min(1, (cross - sumL * sumR / count) / denominator)) : null;
  const energy = energyL + energyR;
  const stereoEnergy = midPower + sidePower;
  const rmsDb = amplitudeDb(Math.sqrt(energy / (2 * count)));
  const peakDb = amplitudeDb(Math.max(peakL, peakR));
  const leftPower = channelSpectrum(waveformLeft, fftSize);
  const rightPower = channelSpectrum(waveformRight, fftSize);
  const power = new Float64Array(leftPower.length);
  const spectrumDb = new Float32Array(power.length);
  const leftSpectrumDb = new Float32Array(power.length);
  const rightSpectrumDb = new Float32Array(power.length);
  const binHz = sampleRate / fftSize;
  const nyquist = sampleRate / 2;
  let total = 0, weighted = 0, strongest = 0, strongestIndex = 0;
  let logPower = 0, frequencyBins = 0;
  const minimumBin = Math.max(1, Math.ceil(20 / binHz));
  for (let index = 0; index < power.length; index++) {
    power[index] = (leftPower[index] + rightPower[index]) / 2;
    spectrumDb[index] = powerDb(power[index]);
    leftSpectrumDb[index] = powerDb(leftPower[index]);
    rightSpectrumDb[index] = powerDb(rightPower[index]);
    if (index < minimumBin) continue;
    total += power[index];
    weighted += index * binHz * power[index];
    logPower += Math.log(Math.max(POWER_FLOOR, power[index]));
    frequencyBins++;
    if (power[index] > strongest) { strongest = power[index]; strongestIndex = index; }
  }
  const hasSpectrum = total > POWER_FLOOR && strongest > POWER_FLOOR && energy / count > POWER_FLOOR;
  let centroidHz: number | null = null, spreadHz: number | null = null, rolloff85Hz: number | null = null;
  let flatness: number | null = null;
  if (hasSpectrum) {
    centroidHz = weighted / total;
    let spread = 0, cumulative = 0;
    for (let index = minimumBin; index < power.length; index++) {
      spread += (index * binHz - centroidHz) ** 2 * power[index];
      cumulative += power[index];
      if (rolloff85Hz === null && cumulative >= total * 0.85) rolloff85Hz = index * binHz;
    }
    spreadHz = Math.sqrt(spread / total);
    flatness = Math.min(1, Math.exp(logPower / frequencyBins) / (total / frequencyBins));
  }
  const peaks: AudioAnalysisFrame['peaks'] = [];
  if (hasSpectrum) {
    for (let index = minimumBin; index < power.length; index++) {
      if (power[index] < Math.max(POWER_FLOOR, strongest * 1e-6)) continue;
      if (index > 0 && power[index] < power[index - 1]) continue;
      if (index < power.length - 1 && power[index] <= power[index + 1]) continue;
      peaks.push(interpolatedPeak(power, index, binHz, nyquist));
    }
    peaks.sort((a, b) => b.db - a.db);
    peaks.splice(8);
  }
  const mainPeak = hasSpectrum ? interpolatedPeak(power, strongestIndex, binHz, nyquist) : null;
  const midi = mainPeak && mainPeak.hz > 0 ? 69 + 12 * Math.log2(mainPeak.hz / 440) : null;
  const roundedMidi = midi === null ? null : Math.round(midi);
  const note = roundedMidi === null ? null : `${NOTES[((roundedMidi % 12) + 12) % 12]}${Math.floor(roundedMidi / 12) - 1}`;
  const bands: AnalysisBand[] = OCTAVE_CENTERS.filter((center) => center / Math.SQRT2 < nyquist).map((center) => {
    const lowHz = center === OCTAVE_CENTERS[0] ? 20 : center / Math.SQRT2;
    const highHz = Math.min(nyquist, center * Math.SQRT2);
    let bandPower = 0;
    for (let index = minimumBin; index < power.length; index++) {
      const hz = index * binHz;
      if (hz >= lowHz && (hz < highHz || hz === nyquist && highHz === nyquist)) bandPower += power[index];
    }
    const label = center > nyquist ? 'Upper edge' : center >= 1000 ? `${center / 1000}k` : `${center}`;
    return { label, lowHz, highHz, powerFraction: hasSpectrum ? bandPower / total : 0 };
  });
  return {
    sampleRate, fftSize, binHz, durationMs: sampleCount * 1000 / sampleRate, sampleCount, sanitizedSamples,
    waveformLeft, waveformRight, spectrumDb, leftSpectrumDb, rightSpectrumDb,
    leftRmsDb: amplitudeDb(Math.sqrt(energyL / count)), rightRmsDb: amplitudeDb(Math.sqrt(energyR / count)),
    leftPeakDb: amplitudeDb(peakL), rightPeakDb: amplitudeDb(peakR), rmsDb, peakDb,
    crestDb: peakDb === null || rmsDb === null ? null : peakDb - rmsDb,
    dcLeft, dcRight, nearFullScaleFraction: fullScale / (2 * count), correlation,
    balance: energy > 0 ? Math.max(-1, Math.min(1, (energyR - energyL) / energy)) : 0,
    midPowerFraction: stereoEnergy > 0 ? midPower / stereoEnergy : 0,
    sidePowerFraction: stereoEnergy > 0 ? sidePower / stereoEnergy : 0,
    peakHz: mainPeak?.hz ?? null, peakDbSpectral: mainPeak?.db ?? null, note,
    cents: midi === null || roundedMidi === null ? null : 100 * (midi - roundedMidi),
    centroidHz, spreadHz, rolloff85Hz, flatness, bands, peaks,
  };
}

/** Snapshot export contains only this explicitly requested, bounded PCM frame. */
export function exportAnalysisFrame(frame: AudioAnalysisFrame) {
  return {
    schemaVersion: 1,
    kind: 'cymatics-audio-analysis-snapshot',
    definitions: {
      levels: 'Sample-window dBFS; silence is null. Not calibrated dB SPL or programme LUFS.',
      spectrum: 'DC-removed one-sided Hann FFT, coherent-gain-corrected peak amplitude; L/R powers averaged without mono cancellation; floor -120 dB.',
      spectralRange: '20 Hz to Nyquist; peak/note describe a spectral maximum, not an inferred fundamental.',
      correlation: 'DC-removed Pearson correlation; undefined when either channel has no AC variance.',
      balance: '(R power - L power) / (L power + R power); -1 left, +1 right.',
      nearFullScaleFraction: 'Fraction of channel samples with absolute amplitude >= 0.999; not proof of upstream clipping.',
      timing: 'A single bounded waveform window; repeated live snapshots are not a continuous recording.',
    },
    ...frame,
    waveformLeft: Array.from(frame.waveformLeft), waveformRight: Array.from(frame.waveformRight),
    spectrumDb: Array.from(frame.spectrumDb), leftSpectrumDb: Array.from(frame.leftSpectrumDb), rightSpectrumDb: Array.from(frame.rightSpectrumDb),
  };
}
