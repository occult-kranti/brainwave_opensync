import { describe, expect, it } from 'vitest';
import { ANALYSIS_DB_FLOOR, analyzeFrame, exportAnalysisFrame } from '../instrument/analysis';

const RATE = 48000;
const LENGTH = 4096;
function tone(hz: number, amplitude = 0.5, phase = 0, count = LENGTH) {
  return Float32Array.from({ length: count }, (_, index) => amplitude * Math.sin(2 * Math.PI * hz * index / RATE + phase));
}
function seededNoise(count = LENGTH) {
  let seed = 19;
  return Float32Array.from({ length: count }, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed / 2 ** 32 - 0.5) * 0.6;
  });
}
function expectFiniteNumbers(value: unknown) {
  if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
  else if (value && typeof value === 'object') for (const child of Object.values(value)) expectFiniteNumbers(child);
}

describe('bounded stereo audio snapshots', () => {
  it('measures a bin-centered sine with the declared RMS/FFT amplitude conventions', () => {
    const hz = RATE * 40 / LENGTH;
    const data = tone(hz);
    const frame = analyzeFrame(data, data, RATE);
    expect(frame.peakHz).toBeCloseTo(hz, 2);
    expect(frame.leftRmsDb).toBeCloseTo(20 * Math.log10(0.5 / Math.SQRT2), 5);
    expect(frame.rmsDb).toBeCloseTo(frame.leftRmsDb!, 8);
    expect(frame.peakDbSpectral).toBeCloseTo(20 * Math.log10(0.5), 4);
    expect(frame.peakDb).toBeCloseTo(20 * Math.log10(0.5), 4);
    expect(frame.crestDb).toBeCloseTo(20 * Math.log10(Math.SQRT2), 4);
    expect(frame.correlation).toBeCloseTo(1, 8);
    expect(frame.midPowerFraction).toBe(1);
    expect(frame.sidePowerFraction).toBe(0);
  });

  it('interpolates an off-bin spectral peak and labels its nearest note without claiming f0', () => {
    const data = tone(440);
    const frame = analyzeFrame(data, data, RATE);
    expect(frame.peakHz).toBeCloseTo(440, 0);
    expect(frame.note).toBe('A4');
    expect(Math.abs(frame.cents!)).toBeLessThan(2);
    expect(Math.abs(frame.peakDbSpectral! - 20 * Math.log10(0.5))).toBeLessThan(0.3);
  });

  it('preserves opposite-polarity stereo instead of cancelling it in a mono mix', () => {
    const left = tone(440);
    const right = Float32Array.from(left, (value) => -value);
    const frame = analyzeFrame(left, right, RATE);
    const inPhase = analyzeFrame(left, left, RATE);
    expect(frame.correlation).toBeCloseTo(-1, 8);
    expect(frame.sidePowerFraction).toBe(1);
    expect(frame.midPowerFraction).toBe(0);
    expect(frame.rmsDb).toBe(inPhase.rmsDb);
    expect(frame.peakHz).toBe(inPhase.peakHz);
    expect(Array.from(frame.spectrumDb)).toEqual(Array.from(inPhase.spectrumDb));
  });

  it('handles a right-only signal and identifies an undefined correlation', () => {
    const right = tone(RATE * 40 / LENGTH);
    const frame = analyzeFrame(new Float32Array(LENGTH), right, RATE);
    expect(frame.leftRmsDb).toBeNull();
    expect(frame.rightRmsDb).toBeCloseTo(-9.0309, 3);
    expect(frame.rmsDb).toBeCloseTo(-12.0412, 3);
    expect(frame.balance).toBe(1);
    expect(frame.correlation).toBeNull();
    expect(frame.peakDbSpectral).toBeCloseTo(-9.0309, 3);
    expect(frame.peakHz).toBeCloseTo(RATE * 40 / LENGTH, 2);
  });

  it('returns defined zero/nullable silence without NaN or phantom frequency', () => {
    const frame = analyzeFrame(new Float32Array(2048), new Float32Array(2048), RATE);
    expect(frame.rmsDb).toBeNull();
    expect(frame.peakDb).toBeNull();
    expect(frame.crestDb).toBeNull();
    expect(frame.peakHz).toBeNull();
    expect(frame.note).toBeNull();
    expect(frame.flatness).toBeNull();
    expect(frame.correlation).toBeNull();
    expect(frame.peaks).toEqual([]);
    expect(frame.spectrumDb.every((value) => value === ANALYSIS_DB_FLOOR)).toBe(true);
    expect(frame.bands.every((band) => band.powerFraction === 0)).toBe(true);
    expectFiniteNumbers(frame);
  });

  it('does not report a spectral peak or correlation for a DC-only input', () => {
    const frame = analyzeFrame(new Float32Array(LENGTH).fill(0.25), new Float32Array(LENGTH).fill(-0.25), RATE);
    expect(frame.dcLeft).toBe(0.25);
    expect(frame.dcRight).toBe(-0.25);
    expect(frame.peakHz).toBeNull();
    expect(frame.correlation).toBeNull();
    expect(frame.rmsDb).toBeCloseTo(20 * Math.log10(0.25), 8);
  });

  it('removes DC from spectral calculations while retaining it in time-domain levels', () => {
    const data = tone(440);
    const withDc = Float32Array.from(data, (value) => value + 0.2);
    const frame = analyzeFrame(withDc, withDc, RATE);
    expect(frame.dcLeft).toBeCloseTo(0.2, 2);
    expect(frame.peakHz).toBeCloseTo(440, 0);
    expect(frame.peakDb!).toBeGreaterThan(analyzeFrame(data, data, RATE).peakDb!);
  });

  it('counts near-full-scale samples without calling them proven clipping', () => {
    const left = new Float32Array(2048);
    const right = new Float32Array(2048);
    left[0] = 1;
    left[1] = -1.1;
    right[0] = 0.5;
    const frame = analyzeFrame(left, right, RATE);
    expect(frame.nearFullScaleFraction).toBe(2 / 4096);
    expect(frame.peakDb!).toBeGreaterThan(0);
    expect(exportAnalysisFrame(frame).definitions.nearFullScaleFraction).toContain('not proof');
  });

  it('replaces invalid PCM and reports the count', () => {
    const left = tone(440);
    left[0] = NaN; left[1] = Infinity; left[2] = -Infinity;
    const frame = analyzeFrame(left, tone(440), RATE);
    expect(frame.sanitizedSamples).toBe(3);
    expect(frame.waveformLeft[0]).toBe(0);
    expectFiniteNumbers(frame);
  });

  it('keeps finite results for extreme finite Float32 samples', () => {
    const data = tone(440, 3e37);
    const frame = analyzeFrame(data, data, RATE);
    expect(frame.peakHz).toBeCloseTo(440, 0);
    expectFiniteNumbers(frame);
  });

  it('caps allocation and window size for arbitrarily long input blocks', () => {
    const frame = analyzeFrame(tone(440, 0.5, 0, 50000), new Float32Array(80000), RATE);
    expect(frame.sampleCount).toBe(4096);
    expect(frame.fftSize).toBe(4096);
    expect(frame.waveformLeft.length).toBe(4096);
    expect(frame.spectrumDb.length).toBe(2049);
    expect(frame.durationMs).toBeCloseTo(4096 * 1000 / RATE, 8);
  });

  it('zero-pads unequal/missing channels and accepts empty blocks safely', () => {
    const mono = analyzeFrame(tone(440, 0.5, 0, 128), new Float32Array(0), RATE);
    expect(mono.sampleCount).toBe(128);
    expect(mono.balance).toBe(-1);
    expect(mono.rightRmsDb).toBeNull();
    const empty = analyzeFrame(new Float32Array(0), new Float32Array(0), RATE);
    expect(empty.sampleCount).toBe(0);
    expect(empty.durationMs).toBe(0);
    expect(empty.peakHz).toBeNull();
    expectFiniteNumbers(empty);
  });

  it.each([0, -1, Infinity, NaN, 384001])('rejects invalid sample rate %s before allocating', (rate) => {
    expect(() => analyzeFrame(new Float32Array(0), new Float32Array(0), rate)).toThrow(RangeError);
  });

  it('separates dual spectral maxima, assigns energy bands and bounds peaks to Nyquist', () => {
    const a = tone(RATE * 40 / LENGTH, 0.5);
    const b = tone(RATE * 80 / LENGTH, 0.25);
    const data = Float32Array.from(a, (value, index) => value + b[index]);
    const frame = analyzeFrame(data, data, RATE);
    expect(frame.peaks.length).toBeGreaterThanOrEqual(2);
    expect(frame.peaks[0].hz).toBeCloseTo(RATE * 40 / LENGTH, 2);
    expect(frame.peaks[1].hz).toBeCloseTo(RATE * 80 / LENGTH, 2);
    expect(frame.peaks.every((peak) => peak.hz >= 20 && peak.hz <= RATE / 2)).toBe(true);
    expect(frame.peaks.length).toBeLessThanOrEqual(8);
    expect(frame.centroidHz!).toBeGreaterThan(RATE * 40 / LENGTH);
    expect(frame.rolloff85Hz!).toBeGreaterThan(RATE * 40 / LENGTH);
    expect(frame.bands.reduce((sum, band) => sum + band.powerFraction, 0)).toBeCloseTo(1, 8);
  });

  it('finds a low-frequency peak and counts its energy in the partial bottom band', () => {
    const data = Float32Array.from({ length: 4096 }, (_, index) => 0.5 * Math.sin(2 * Math.PI * (44100 / 4096 * 2) * index / 44100));
    const frame = analyzeFrame(data, data, 44100);
    expect(frame.peakHz).toBeCloseTo(44100 / 4096 * 2, 2);
    expect(frame.bands.reduce((sum, band) => sum + band.powerFraction, 0)).toBeCloseTo(1, 8);
  });

  it('distinguishes tonal and broad-noise spectral flatness', () => {
    const sine = tone(RATE * 40 / LENGTH);
    const noise = seededNoise();
    const tonal = analyzeFrame(sine, sine, RATE);
    const broad = analyzeFrame(noise, noise, RATE);
    expect(tonal.flatness!).toBeLessThan(0.01);
    expect(broad.flatness!).toBeGreaterThan(0.3);
    expect(broad.spreadHz!).toBeGreaterThan(tonal.spreadHz!);
  });

  it('exports a finite JSON-safe versioned snapshot with definitions', () => {
    const data = tone(440);
    const frame = analyzeFrame(data, data, RATE);
    const value = exportAnalysisFrame(frame);
    const parsed = JSON.parse(JSON.stringify(value));
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.kind).toBe('cymatics-audio-analysis-snapshot');
    expect(parsed.waveformLeft.length).toBe(frame.sampleCount);
    expect(parsed.spectrumDb.length).toBe(frame.fftSize / 2 + 1);
    expect(parsed.definitions.spectralRange).toContain('not an inferred fundamental');
    expectFiniteNumbers(parsed);
  });
});
