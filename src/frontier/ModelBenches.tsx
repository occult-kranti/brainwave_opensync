import { useState } from 'react';
import { Download } from 'lucide-react';
import { downloadBytes } from '@/ui/audio/renderExport';
import {
  channelComparison, channelComparisonCsv, CHANNEL_NOTICE,
  thermalTrap, buildThermalTrapRows, thermalTrapCsv, DEFAULT_THERMAL_TRAP, THERMAL_NOTICE,
  coherence, buildCoherenceRows, coherenceCsv, DEFAULT_COHERENCE, COHERENCE_NOTICE,
} from './models';
import './benches.css';

function format(value: number) {
  if (value === 0) return '0';
  return Math.abs(value) < .001 || Math.abs(value) >= 100000 ? value.toExponential(3) : Number(value.toPrecision(5)).toString();
}

function Slider({ label, value, min, max, step, unit, displayValue, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; displayValue?: string; onChange: (value: number) => void }) {
  return <label className="fb-slider"><span>{label}<output>{displayValue ?? format(value)} {unit}</output></span><input type="range" aria-label={label} aria-valuetext={`${displayValue ?? format(value)} ${unit}`} min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} /></label>;
}

function Metrics({ values }: { values: readonly (readonly [string, string])[] }) {
  return <dl className="fb-metrics">{values.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

function Plot({ title, rows, xLabel, yLabel, marker }: { title: string; rows: readonly { x: number; y: number }[]; xLabel: string; yLabel: string; marker?: number }) {
  const xmin = rows[0].x, xmax = rows[rows.length - 1].x;
  const ymax = Math.max(...rows.map(row => row.y), 1e-30) * 1.05;
  const px = (value: number) => 78 + (value - xmin) / (xmax - xmin) * 570;
  const py = (value: number) => 220 - value / ymax * 172;
  return <figure className="fb-chart"><figcaption>{title}<span>All numerical rows are included in the CSV.</span><span className="fb-scroll-hint">Scroll horizontally to inspect the full plot.</span></figcaption><svg viewBox="0 0 690 280" role="img" aria-label={`${title}; horizontal axis ${xLabel}, vertical axis ${yLabel}`}>
    {[0, .5, 1].map(fraction => <g key={fraction}><line x1="78" x2="648" y1={py(fraction * ymax)} y2={py(fraction * ymax)} className="fb-grid" /><text x="68" y={py(fraction * ymax) + 4} textAnchor="end">{format(fraction * ymax)}</text><text x={px(xmin + fraction * (xmax - xmin))} y="243" textAnchor="middle">{format(xmin + fraction * (xmax - xmin))}</text></g>)}
    <path className="fb-trace" data-testid="frontier-model-curve" d={rows.map((row, index) => `${index ? 'L' : 'M'}${px(row.x).toFixed(3)},${py(row.y).toFixed(3)}`).join(' ')} />
    {marker !== undefined && marker >= xmin && marker <= xmax && <line className="fb-marker" x1={px(marker)} x2={px(marker)} y1="48" y2="220" />}
    <text x="78" y="26">{yLabel}</text><text x="363" y="274" textAnchor="middle">{xLabel}</text>
  </svg></figure>;
}

function ExportButton({ csv, name, onSaved }: { csv: string; name: string; onSaved: () => void }) {
  return <button className="fb-export" type="button" onClick={() => { downloadBytes(new TextEncoder().encode(csv), `opensync-frontier-${name}.csv`, 'text/csv;charset=utf-8'); onSaved(); }}><Download size={14} aria-hidden="true" /> Download {name} CSV</button>;
}

export function ModelBenches() {
  const [bench, setBench] = useState('channels');
  const [frequency, setFrequency] = useState(440);
  const [thermal, setThermal] = useState({ ...DEFAULT_THERMAL_TRAP });
  const [phase, setPhase] = useState({ ...DEFAULT_COHERENCE });
  const [notice, setNotice] = useState('');
  const channels = channelComparison(frequency);
  const trap = thermalTrap(thermal), thermalRows = buildThermalTrapRows(thermal);
  const interference = coherence(phase), coherenceRows = buildCoherenceRows(phase);
  const changeThermal = (key: keyof typeof thermal, value: number) => { setThermal(current => ({ ...current, [key]: value })); setNotice(''); };
  const changePhase = (key: keyof typeof phase, value: number) => { setPhase(current => ({ ...current, [key]: value })); setNotice(''); };
  const saved = () => setNotice('CSV downloaded with the selected inputs, numerical rows, units, and model limits.');
  const wavelengthX = (metres: number) => 78 + (Math.log10(metres) + 3) / 12 * 570;
  return <section className="frontier-benches" aria-label="Frontier mathematical comparisons">
    <div className="fb-tabs" role="group" aria-label="Select comparison model">
      {([['channels', 'Sound and electromagnetic waves'], ['thermal', 'Thermal trap'], ['coherence', 'Phase coherence']] as const).map(([id, label]) => <button type="button" key={id} aria-pressed={bench === id} onClick={() => { setBench(id); setNotice(''); }}>{label}</button>)}
    </div>
    <p className="fb-scope">These numerical models compare physical quantities. They produce no audio, control no hardware, and do not establish biological effects.</p>
    {bench === 'channels' && <div className="fb-panel" aria-label="Propagation channel comparison">
      <h3>One frequency, different propagation channels.</h3><p className="fb-intro">The shared number counts oscillations per second. Wavelength depends on propagation speed; equal frequency does not make sound and electromagnetic radiation the same physical interaction.</p>
      <div className="fb-controls"><Slider label="Comparison frequency" value={frequency} min={1} max={100000} step={1} unit="Hz" onChange={value => { setFrequency(value); setNotice(''); }} /></div>
      <Metrics values={[
        ['Shared period', `${format(channels.periodS)} s`], ['Sound wavelength', `${format(channels.acousticWavelengthM)} m`], ['EM vacuum wavelength', `${format(channels.emVacuumWavelengthM)} m`],
        ['Wavelength ratio, EM / sound', format(channels.emVacuumWavelengthM / channels.acousticWavelengthM)], ['One EM photon: h f', `${format(channels.photonEnergyJ)} J`],
      ]} />
      <figure className="fb-chart"><figcaption>Wavelengths on the same logarithmic length scale<span>Each equal horizontal interval represents the same length ratio.</span><span className="fb-scroll-hint">Scroll horizontally to inspect the full plot.</span></figcaption><svg viewBox="0 0 690 260" role="img" aria-label={`Sound wavelength ${format(channels.acousticWavelengthM)} metres and electromagnetic vacuum wavelength ${format(channels.emVacuumWavelengthM)} metres on one logarithmic axis`}>
        {[-3, 0, 3, 6, 9].map(exponent => <g key={exponent}><line className="fb-grid" x1={wavelengthX(10 ** exponent)} x2={wavelengthX(10 ** exponent)} y1="45" y2="187" /><text x={wavelengthX(10 ** exponent)} y="212" textAnchor="middle">{`10^${exponent}`}</text></g>)}
        <text x="78" y="36">Sound in ideal air</text><line className="fb-trace" x1="78" x2={wavelengthX(channels.acousticWavelengthM)} y1="76" y2="76" /><circle className="fb-point" data-testid="frontier-sound-wavelength" cx={wavelengthX(channels.acousticWavelengthM)} cy="76" r="5" />
        <text x="78" y="126">Electromagnetic wave in vacuum</text><line className="fb-trace fb-secondary" x1="78" x2={wavelengthX(channels.emVacuumWavelengthM)} y1="167" y2="167" /><circle className="fb-point fb-secondary-point" cx={wavelengthX(channels.emVacuumWavelengthM)} cy="167" r="5" />
        <text x="363" y="246" textAnchor="middle">Wavelength (metres) · logarithmic axis</text>
      </svg></figure>
      <p className="fb-equation">λ = v/f · period = 1/f · EM photon energy = hf</p><p className="fb-notice">{CHANNEL_NOTICE}</p><p className="fb-small">Photon energy is shown for the electromagnetic channel. Sound-wave energy requires additional physical information such as amplitude and medium; it is not calculated from frequency alone.</p>
      <ExportButton csv={channelComparisonCsv(frequency)} name="channels" onSaved={saved} />
    </div>}
    {bench === 'thermal' && <div className="fb-panel" aria-label="Classical thermal trap comparison">
      <h3>Classical fluctuations in a harmonic trap.</h3><p className="fb-intro">Compare the equilibrium spread of one trapped coordinate with diffusion and relaxation in a viscous fluid. The trap stiffness is supplied as a model parameter; no trapping device or field is calculated.</p>
      <div className="fb-controls">
        <Slider label="Trap stiffness" value={Math.log10(thermal.stiffnessNpm)} displayValue={format(thermal.stiffnessNpm)} min={-9} max={-3} step={.05} unit="N/m · log scale" onChange={value => changeThermal('stiffnessNpm', Math.min(1e-3, Math.max(1e-9, 10 ** value)))} />
        <Slider label="Bath temperature" value={thermal.temperatureK} min={250} max={350} step={1} unit="K" onChange={value => changeThermal('temperatureK', value)} />
        <Slider label="Particle radius" value={thermal.radiusM * 1e9} min={25} max={5000} step={1} unit="nm" onChange={value => changeThermal('radiusM', value / 1e9)} />
        <Slider label="Dynamic viscosity" value={Math.log10(thermal.viscosityPas)} displayValue={format(thermal.viscosityPas)} min={-4} max={-1} step={.05} unit="Pa·s · log scale" onChange={value => changeThermal('viscosityPas', Math.min(.1, Math.max(1e-4, 10 ** value)))} />
      </div>
      <Metrics values={[
        ['RMS coordinate displacement', `${format(trap.rmsDisplacementM * 1e9)} nm`], ['Free diffusion coefficient', `${format(trap.diffusionM2PerS)} m²/s`], ['Viscous drag coefficient', `${format(trap.dragNsPerM)} N·s/m`],
        ['Corner frequency', `${format(trap.cornerHz)} Hz`], ['Relaxation time', `${format(trap.relaxationTimeS)} s`], ['Thermal energy kBT', `${format(trap.thermalEnergyJ)} J`],
      ]} />
      <Plot title="Equilibrium displacement distribution" rows={thermalRows.map(row => ({ x: row.displacementM * 1e9, y: row.probabilityDensityPerM / 1e9 }))} xLabel="Displacement from equilibrium (nm)" yLabel="Probability density (nm⁻¹)" />
      <p className="fb-small">The displayed window is ±4 RMS displacements. Density is defined over the entire real line and is not renormalized to this cropped window. This is one classical coordinate, not an image or a quantum-state measurement.</p>
      <p className="fb-equation">σ = √(kBT/k) · γ = 6πηa · D = kBT/γ · fᶜ = k/(2πγ)</p><p className="fb-notice">{THERMAL_NOTICE}</p>
      <ExportButton csv={thermalTrapCsv(thermal)} name="thermal" onSaved={saved} />
    </div>}
    {bench === 'coherence' && <div className="fb-panel" aria-label="Normalized phase interference comparison">
      <h3>Path difference and relative phase.</h3><p className="fb-intro">Combine two ideal equal-amplitude coherent acoustic contributions. Their squared sum changes with relative phase even though the frequency remains fixed.</p>
      <div className="fb-controls">
        <Slider label="Coherent acoustic frequency" value={phase.frequencyHz} min={1} max={100000} step={1} unit="Hz" onChange={value => changePhase('frequencyHz', value)} />
        <Slider label="Path difference" value={phase.pathDifferenceM} min={-1} max={1} step={.001} unit="m" onChange={value => changePhase('pathDifferenceM', value)} />
        <Slider label="Additional relative phase" value={phase.phaseDeg} min={-180} max={180} step={1} unit="°" onChange={value => changePhase('phaseDeg', value)} />
      </div>
      <Metrics values={[
        ['Acoustic wavelength', `${format(interference.wavelengthM)} m`], ['Combined phase difference', `${format(interference.phaseDifferenceRad)} rad`], ['Normalized squared amplitude', format(interference.normalizedIntensity)],
        ['Node spacing: counterpropagating case only', `${format(interference.nodeSpacingM)} m`],
      ]} />
      <Plot title="Local path-difference interference" rows={coherenceRows.map(row => ({ x: row.pathDifferenceM, y: row.normalizedIntensity }))} xLabel="Path difference ΔL (m)" yLabel="Squared amplitude / constructive maximum" marker={phase.pathDifferenceM} />
      <p className="fb-small">The plot follows a window within one wavelength of the selected path difference, clipped to −1…1 m. This bounds the displayed cycles and prevents a sparse plot from aliasing high frequencies. The dashed line marks your selected path difference.</p>
      <p className="fb-equation">δ = 2πΔL/λ + φ · normalized squared amplitude = (1 + cos δ)/2</p><p className="fb-notice">{COHERENCE_NOTICE}</p><p className="fb-small">The plotted quantity is not the net energy flux of a standing wave. Node spacing λ/2 applies to the stated counterpropagating geometry and does not follow from an arbitrary pair of paths.</p>
      <ExportButton csv={coherenceCsv(phase)} name="coherence" onSaved={saved} />
    </div>}
    <p className="fb-feedback" role="status" aria-live="polite">{notice}</p>
  </section>;
}
