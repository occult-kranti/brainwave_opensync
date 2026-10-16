import { useState } from 'react';
import { downloadBytes } from '@/ui/audio/renderExport';
import {
  DEFAULT_ACOUSTIC_INPUT, DEFAULT_DIAMAGNETIC_INPUT, DEFAULT_MECHANICAL_INPUT,
  calculateAcousticTrap, buildAcousticRows, acousticCsv, ACOUSTIC_NOTICE,
  calculateDiamagneticBalance, buildDiamagneticRows, diamagneticCsv, DIAMAGNETIC_NOTICE,
  calculateDrivenOscillator, buildMechanicalRows, mechanicalCsv, MECHANICAL_NOTICE,
  LEVITATION_MODEL_SOURCES,
} from './models';
import './benches.css';

function number(value: number) {
  if (value === 0) return '0';
  return Math.abs(value) < 0.001 || Math.abs(value) >= 1e5 ? value.toExponential(3) : Number(value.toPrecision(5)).toString();
}
function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  return <label className="lv-b-slider"><span>{label}<output>{number(value)} {unit}</output></span><input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /></label>;
}
function Metrics({ values }: { values: readonly (readonly [string, string])[] }) {
  return <dl className="lv-b-metrics">{values.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
type Curve = { label: string; color: string; values: number[] };
function Chart({ title, x, curves, xLabel, yLabel, marker }: { title: string; x: number[]; curves: Curve[]; xLabel: string; yLabel: string; marker?: number | null }) {
  const xmin = Math.min(...x), xmax = Math.max(...x);
  const all = curves.flatMap(c => c.values);
  const low = Math.min(0, ...all), high = Math.max(0, ...all);
  const pad = (high - low || 1) * 0.08;
  const ymin = low - pad, ymax = high + pad;
  const px = (v: number) => 74 + (v - xmin) / (xmax - xmin || 1) * 616;
  const py = (v: number) => 248 - (v - ymin) / (ymax - ymin) * 210;
  return <figure className="lv-b-chart"><figcaption>{title}<span className="lv-b-scroll-hint">Swipe or scroll horizontally to inspect the full plot.</span></figcaption><svg viewBox="0 0 720 310" role="img" aria-label={`${title}. Horizontal axis: ${xLabel}. Vertical axis: ${yLabel}. Numerical rows are available in CSV.`}>
    {[0, 1, 2, 3, 4].map(i => { const y = ymin + (ymax - ymin) * i / 4; const xv = xmin + (xmax - xmin) * i / 4; return <g key={i}><line x1="74" x2="690" y1={py(y)} y2={py(y)} stroke="currentColor" opacity=".12" /><text x="66" y={py(y) + 4} textAnchor="end">{number(y)}</text><text x={px(xv)} y="268" textAnchor="middle">{number(xv)}</text></g>; })}
    <line x1="74" x2="690" y1={py(0)} y2={py(0)} stroke="currentColor" opacity=".4" />
    {curves.map(c => <path key={c.label} d={c.values.map((y, i) => `${i ? 'L' : 'M'}${px(x[i]).toFixed(2)},${py(y).toFixed(2)}`).join(' ')} fill="none" stroke={c.color} strokeWidth="2.3" />)}
    {marker != null && marker >= xmin && marker <= xmax && <line x1={px(marker)} x2={px(marker)} y1="38" y2="248" stroke="currentColor" strokeDasharray="5 5" opacity=".7" />}
    <text x="382" y="300" textAnchor="middle">{xLabel}</text><text x="74" y="20">{yLabel}</text>
  </svg><div className="lv-b-legend">{curves.map(c => <span key={c.label}><i style={{ background: c.color }} />{c.label}</span>)}{marker != null && <span>Dashed line: computed restoring position</span>}</div></figure>;
}
function save(csv: string, name: string) { downloadBytes(new TextEncoder().encode(csv), `opensync-levitation-${name}.csv`, 'text/csv;charset=utf-8'); }
const BLUE = '#7bbdff', AMBER = '#f0bd75', GREEN = '#8fd8c4';

export function AcousticBench() {
  const [input, setInput] = useState({ ...DEFAULT_ACOUSTIC_INPUT });
  const [notice, setNotice] = useState('');
  const result = calculateAcousticTrap(input), rows = buildAcousticRows(input);
  const update = (key: keyof typeof input, value: number) => { setInput(v => ({ ...v, [key]: value })); setNotice(''); };
  const status = result.trapStatus === 'stable' ? 'Vertically restoring' : result.trapStatus === 'marginal' ? 'Marginal · zero stiffness' : 'No axial equilibrium';
  return <section className="lv-b-section" aria-label="Acoustic simulation"><header><h2>A force field with a gravity budget.</h2><p>Move through one half-wavelength of an ideal standing wave. A restoring vertical point can exist while the transverse directions remain unconfined.</p></header>
    <div className="lv-b-actions" role="group" aria-label="Acoustic model scenarios"><button onClick={() => setInput({ ...DEFAULT_ACOUSTIC_INPUT })}>Acoustic reference</button><button onClick={() => update('pressurePeakPa', 0)}>No acoustic drive</button><button onClick={() => setInput({ ...DEFAULT_ACOUSTIC_INPUT, pressurePeakPa: 1500, particleCompressibilityPaInv: 2e-5 })}>Negative contrast</button><button onClick={() => update('phaseDeg', 90)}>Spatial phase +90°</button></div>
    <div className="lv-b-controls">
      <Slider label="Acoustic frequency" value={input.frequencyHz} min={20000} max={80000} step={1000} unit="Hz" onChange={v => update('frequencyHz', v)} />
      <Slider label="Virtual peak pressure" value={input.pressurePeakPa} min={0} max={3000} step={10} unit="Pa peak" onChange={v => update('pressurePeakPa', v)} />
      <Slider label="Particle radius" value={input.particleRadiusMm} min={0.05} max={0.2} step={0.005} unit="mm" onChange={v => update('particleRadiusMm', v)} />
      <Slider label="Particle density" value={input.particleDensityKgM3} min={10} max={3000} step={10} unit="kg/m³" onChange={v => update('particleDensityKgM3', v)} />
      <Slider label="Particle compressibility" value={input.particleCompressibilityPaInv} min={0} max={2e-5} step={1e-9} unit="Pa⁻¹" onChange={v => update('particleCompressibilityPaInv', v)} />
      <Slider label="Spatial phase" value={input.phaseDeg} min={-180} max={180} step={1} unit="°" onChange={v => update('phaseDeg', v)} />
    </div>
    <p className="lv-b-result" data-testid="acoustic-trap-status">{status}<span>Local 1D classification only</span></p>
    <Metrics values={[
      ['Wavelength', `${number(result.wavelengthM * 1000)} mm`], ['Size parameter ka', number(result.ka)], ['Acoustic contrast Φ', number(result.contrastFactor)],
      ['Weight / buoyancy', `${number(result.weightN * 1e6)} / ${number(result.buoyancyN * 1e6)} µN`], ['Force ceiling / effective weight', number(result.forceMarginRatio)],
      ['Vertical stiffness', `${number(result.restoringStiffnessNPerM)} N/m`], ['Restoring position', result.stablePositionM == null ? 'None' : `${number(result.stablePositionM * 1000)} mm`],
      ['Force-ceiling equality', result.minimumPressurePeakPa == null ? 'No finite threshold' : `${number(result.minimumPressurePeakPa)} Pa peak (virtual)`],
    ]} />
    <p className="lv-b-notice">{ACOUSTIC_NOTICE}</p><p className="lv-b-equation">F<sub>net</sub> = 3 V k E<sub>ac</sub> Φ sin(2kz + 2φ) − (ρ<sub>p</sub> − ρ<sub>0</sub>) Vg · F = −∂U/∂z</p>
    <Chart title="Pressure amplitude" x={rows.map(r => r.positionM * 1000)} xLabel="Upward position z (mm)" yLabel="Signed peak coefficient (Pa)" curves={[{ label: 'Pressure spatial coefficient', color: BLUE, values: rows.map(r => r.pressureAmplitudePa) }]} />
    <Chart title="Support and net force" x={rows.map(r => r.positionM * 1000)} xLabel="Upward position z (mm)" yLabel="Force (µN)" marker={result.stablePositionM == null ? null : result.stablePositionM * 1000} curves={[{ label: 'Acoustic force', color: BLUE, values: rows.map(r => r.acousticForceN * 1e6) }, { label: 'Net force with buoyancy and gravity', color: AMBER, values: rows.map(r => r.netForceN * 1e6) }]} />
    <Chart title="Potential landscape" x={rows.map(r => r.positionM * 1000)} xLabel="Upward position z (mm)" yLabel="Potential (pJ; arbitrary reference)" marker={result.stablePositionM == null ? null : result.stablePositionM * 1000} curves={[{ label: 'Acoustic potential', color: BLUE, values: rows.map(r => r.acousticPotentialJ * 1e12) }, { label: 'Total with gravity tilt', color: GREEN, values: rows.map(r => r.totalPotentialJ * 1e12) }]} />
    <div className="lv-b-actions"><button onClick={() => { save(acousticCsv(input), 'acoustic'); setNotice('Acoustic CSV downloaded with parameters, units and assumptions.'); }}>Download acoustic CSV</button><a href={LEVITATION_MODEL_SOURCES[0].url} target="_blank" rel="noreferrer">Read the primary derivation ↗</a></div><p role="status">{notice}</p>
  </section>;
}

export function MagneticBench() {
  const [input, setInput] = useState({ ...DEFAULT_DIAMAGNETIC_INPUT });
  const [mechanical, setMechanical] = useState({ ...DEFAULT_MECHANICAL_INPUT });
  const [notice, setNotice] = useState('');
  const result = calculateDiamagneticBalance(input), rows = buildDiamagneticRows(input);
  const motion = calculateDrivenOscillator(mechanical), sweep = buildMechanicalRows(mechanical);
  const update = (key: keyof typeof input, value: number) => setInput(v => ({ ...v, [key]: value }));
  const change = (key: keyof typeof mechanical, value: number) => setMechanical(v => ({ ...v, [key]: value }));
  return <section className="lv-b-section" aria-label="Magnetic and vibration simulations"><header><h2>Separate support from amplification.</h2><p>Compare a local diamagnetic force budget with an externally driven spring. Neither model changes gravity.</p></header>
    <h3>Local diamagnetic budget</h3><div className="lv-b-actions" role="group" aria-label="Magnetic model scenarios"><button onClick={() => setInput({ ...DEFAULT_DIAMAGNETIC_INPUT })}>Magnetic reference</button><button onClick={() => update('fieldSquaredGradientT2PerM', 0)}>Zero vertical gradient</button><button onClick={() => update('fieldSquaredGradientT2PerM', -input.fieldSquaredGradientT2PerM)}>Reverse gradient</button></div>
    <div className="lv-b-controls">
      <Slider label="SI volume susceptibility" value={input.susceptibility} min={-0.0005} max={-1e-7} step={1e-7} unit="dimensionless" onChange={v => update('susceptibility', v)} />
      <Slider label="Magnetic sample density" value={input.densityKgM3} min={100} max={20000} step={100} unit="kg/m³" onChange={v => update('densityKgM3', v)} />
      <Slider label="Magnetic sample radius" value={input.radiusMm} min={0.1} max={10} step={0.1} unit="mm" onChange={v => update('radiusMm', v)} />
      <Slider label="Signed field-squared gradient" value={input.fieldSquaredGradientT2PerM} min={-5000} max={5000} step={10} unit="T²/m" onChange={v => update('fieldSquaredGradientT2PerM', v)} />
    </div><Metrics values={[
      ['Local classification', result.balanceStatus.replaceAll('-', ' ')], ['Magnetic force', `${number(result.magneticForceN * 1e6)} µN`], ['Weight', `${number(result.weightN * 1e6)} µN`], ['Net force', `${number(result.netForceN * 1e6)} µN`], ['Force / weight', number(result.forceWeightRatio)], ['Equality gradient', `${number(result.requiredGradientT2PerM)} T²/m`],
    ]} /><p className="lv-b-notice">{DIAMAGNETIC_NOTICE}</p><p className="lv-b-equation">Fₘ = χV/(2μ₀) · ∂(B²)/∂z · The supplied gradient is twice B∂B/∂z.</p>
    <Chart title="Independent local gradient budgets" x={rows.map(r => r.fieldSquaredGradientT2PerM)} xLabel="Signed ∂(B²)/∂z (T²/m)" yLabel="Force (µN)" curves={[{ label: 'Magnetic force', color: BLUE, values: rows.map(r => r.magneticForceN * 1e6) }, { label: 'Net force', color: AMBER, values: rows.map(r => r.netForceN * 1e6) }]} />
    <div className="lv-b-actions"><button onClick={() => { save(diamagneticCsv(input), 'magnetic'); setNotice('Magnetic CSV downloaded with signed gradients and model limits.'); }}>Download magnetic CSV</button><a href={LEVITATION_MODEL_SOURCES[1].url} target="_blank" rel="noreferrer">Read Berry & Geim ↗</a></div>
    <hr /><h3>Driven vibration and the energy ledger</h3><p>A conventional spring supports the mass. Displacement is measured around its gravitational equilibrium; this is a resonance control, not a levitator.</p>
    <div className="lv-b-actions" role="group" aria-label="Vibration model scenarios"><button onClick={() => setMechanical({ ...DEFAULT_MECHANICAL_INPUT })}>Vibration reference</button><button onClick={() => change('forcePeakN', 0)}>Zero vibration drive</button><button onClick={() => change('dampingRatio', 1)}>Strong damping</button></div>
    <div className="lv-b-controls">
      <Slider label="Oscillator mass" value={mechanical.massGrams} min={1} max={100} step={1} unit="g" onChange={v => change('massGrams', v)} />
      <Slider label="Spring stiffness" value={mechanical.stiffnessNPerM} min={1} max={100} step={1} unit="N/m" onChange={v => change('stiffnessNPerM', v)} />
      <Slider label="Damping ratio" value={mechanical.dampingRatio} min={0.05} max={2} step={0.05} unit="dimensionless" onChange={v => change('dampingRatio', v)} />
      <Slider label="Peak driving force" value={mechanical.forcePeakN} min={0} max={0.05} step={0.001} unit="N" onChange={v => change('forcePeakN', v)} />
      <Slider label="Vibration driving frequency" value={mechanical.frequencyHz} min={0.2} max={100} step={0.1} unit="Hz" onChange={v => change('frequencyHz', v)} />
    </div><Metrics values={[
      ['Natural frequency', `${number(motion.naturalFrequencyHz)} Hz`], ['Displacement maximum', motion.displacementResonanceHz == null ? 'No positive-frequency peak' : `${number(motion.displacementResonanceHz)} Hz`], ['Selected displacement', `${number(motion.displacementPeakM * 1000)} mm peak`], ['Displacement phase', `${number(motion.phaseDeg)}°`], ['Static downward sag', `${number(motion.staticSagM * 1000)} mm`], ['Mean input / loss power', `${number(motion.meanInputPowerW)} / ${number(motion.meanDissipationPowerW)} W`],
    ]} /><p className="lv-b-notice">{MECHANICAL_NOTICE}</p><p className="lv-b-equation">mẍ + bẋ + kx = Fₐ cos(ωt) · ⟨Pᵢₙ⟩ = ⟨Pₗₒₛₛ⟩ = bω²X²/2</p>
    <Chart title="Displacement response to supplied force" x={sweep.map(r => r.frequencyRatio)} xLabel="Driving frequency / natural frequency" yLabel="Displacement peak (mm)" curves={[{ label: 'Driven response', color: GREEN, values: sweep.map(r => r.displacementPeakM * 1000) }]} />
    <div className="lv-b-actions"><button onClick={() => { save(mechanicalCsv(mechanical), 'vibration'); setNotice('Vibration CSV downloaded with input and loss power.'); }}>Download vibration CSV</button><a href={LEVITATION_MODEL_SOURCES[2].url} target="_blank" rel="noreferrer">Inspect the oscillator equation ↗</a></div><p role="status">{notice}</p>
  </section>;
}
