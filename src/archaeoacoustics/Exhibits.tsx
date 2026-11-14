import { useState } from 'react';
import { Link } from 'react-router';
import { Waves } from 'lucide-react';
import { assetUrl } from '@/lib/assetUrl';
import { CHICHEN_PHOTO } from './photos';
import { DEFAULT_LOOK } from '@/cymatics/instrument/scenes';
import { AIR_SPEED_M_S, frequencyRelations, MODEL_SOURCES, octaveFrequency, rectangularRoomModeHz, rectangularRoomPressureAt, stepEcho, TROPICAL_YEAR_SECONDS, wavelengthComparison } from './models';
import type { TopicId } from './types';

const pretty = (value: number, decimals = 3) => value.toLocaleString('en-US', { maximumFractionDigits: decimals });
const MODE_CHOICES = [
  { label: 'Length', x: 1, y: 0, z: 0 },
  { label: 'Width', x: 0, y: 1, z: 0 },
  { label: 'Height', x: 0, y: 0, z: 1 },
  { label: 'Length + width', x: 1, y: 1, z: 0 },
  { label: 'Length, second order', x: 2, y: 0, z: 0 },
];

function PlateLink({ hz, label, square = false }: { hz: number; label: string; square?: boolean }) {
  const look = { ...DEFAULT_LOOK, hz, shape: square ? 'square' : 'round', view: 'sand' };
  return <Link className="arch-button" to={`/cymatics?${new URLSearchParams({ look: JSON.stringify(look) })}`}><Waves size={16} aria-hidden /> {label}</Link>;
}

function WaveScales() {
  const [frequency, setFrequency] = useState(10);
  const values = [.1, 1, 10, 100].map(wavelengthComparison);
  const wave = wavelengthComparison(frequency);
  const relations = frequencyRelations(.003);
  return <section className="arch-model" aria-labelledby="wave-scales">
    <h2 id="wave-scales">One frequency, different wavelengths</h2>
    <p>The period is 1/f. The wavelength is v/f, where v is the propagation speed. Air uses {AIR_SPEED_M_S} m/s at about 20 °C. The vacuum column uses the SI speed of light.</p>
    <div className="arch-table-wrap"><table><caption>Period and wavelength for four frequencies</caption><thead><tr><th scope="col">Frequency</th><th scope="col">Period (s)</th><th scope="col">Air (m)</th><th scope="col">Vacuum EM (m)</th></tr></thead><tbody>{values.map(row => <tr key={row.frequencyHz}><th scope="row">{row.frequencyHz} Hz</th><td>{pretty(row.periodSeconds)}</td><td>{pretty(row.airMeters)}</td><td>{pretty(row.vacuumMeters)}</td></tr>)}</tbody></table></div>
    <label className="arch-range">Change the frequency ({pretty(frequency)} Hz)<input type="range" min="-1" max="2" step=".01" value={Math.log10(frequency)} aria-valuetext={`${pretty(frequency)} hertz`} onChange={event => setFrequency(10 ** Number(event.target.value))} /></label>
    <p className="arch-readout"><strong>{pretty(wave.periodSeconds, 4)} s</strong> period <strong>{pretty(wave.airMeters)} m</strong> in air <strong>{pretty(wave.vacuumMeters)} m</strong> in vacuum</p>
    <div className="arch-model-notes">
      <p><strong>Rounded solar anchor.</strong> Starting at 3 mHz gives {pretty(relations.perfectFifthHz * 1000)} mHz for a 3:2 fifth and {pretty(relations.fifthHarmonicHz * 1000)} mHz for the fifth harmonic. Both results are arithmetic.</p>
      <p><strong>Year-to-pitch mapping.</strong> One seasonal cycle per {pretty(TROPICAL_YEAR_SECONDS, 2)} seconds, raised 32 octaves, gives {pretty(octaveFrequency(TROPICAL_YEAR_SECONDS, 32), 4)} Hz.</p>
    </div>
    <div className="arch-links"><a href={MODEL_SOURCES.wavelength}>OpenStax wave equation</a><a href={MODEL_SOURCES.metre}>BIPM metre definition</a><a href={MODEL_SOURCES.tropicalYear}>Year length reference</a></div>
  </section>;
}

function RoomModes() {
  const [length, setLength] = useState(5);
  const [isGiza, setGiza] = useState(false);
  const [order, setOrder] = useState(3);
  const dimensions = isGiza ? { lengthM: 10.47, widthM: 5.24, heightM: 5.84 } : { lengthM: length, widthM: 3, heightM: 2.5 };
  const plane = dimensions.heightM / 4;
  const mode = MODE_CHOICES[order];
  const hz = rectangularRoomModeHz(dimensions, mode);
  const pressure = Array.from({ length: 168 }, (_, index) => {
    const x = index % 21;
    const y = Math.floor(index / 21);
    return rectangularRoomPressureAt(dimensions, mode, { xM: x * dimensions.lengthM / 20, yM: y * dimensions.widthM / 7, zM: plane });
  });
  return <div className="arch-bench">
    <h3>Rectangular chamber</h3>
    <p>An ideal room with rigid walls and uniform air. Use a generic chamber or the King’s Chamber’s approximate dimensions. The Giza example models a sealed rectangular box.</p>
    <label className="arch-select">Geometry <select value={isGiza ? 'giza' : 'generic'} onChange={event => setGiza(event.target.value === 'giza')}><option value="generic">Generic chamber</option><option value="giza">King’s Chamber box · Giza</option></select></label>
    {isGiza ? <p>10.47 × 5.24 × 5.84 m. Historical dimensions are approximate.</p> : <label className="arch-range">Length ({length.toFixed(1)} m)<input type="range" min="1.5" max="12" step=".1" value={length} onChange={event => setLength(Number(event.target.value))} /></label>}
    <label className="arch-select">Mode <select value={order} onChange={event => setOrder(Number(event.target.value))}>{MODE_CHOICES.map((choice, index) => <option key={choice.label} value={index}>{choice.label}</option>)}</select></label>
    <div className="arch-heat" role="img" aria-label="Top-view slice of relative acoustic pressure. Dark patches indicate near-zero pressure. Gold and teal indicate opposite signs.">{pressure.map((value, index) => <span key={index} style={{ backgroundColor: value >= 0 ? `rgba(211,154,91,${Math.abs(value)})` : `rgba(111,204,192,${Math.abs(value)})` }} />)}</div>
    <p className="arch-readout"><strong>{pretty(hz, 2)} Hz</strong> mode <span>Pressure slice at {pretty(plane)} m above the floor</span></p>
    <p className="arch-plot-note">Gold and teal are opposite pressure signs. Dark cells are near zero.</p><div className="arch-links"><a href={MODEL_SOURCES.room}>Room-mode reference</a>{isGiza && <a href="https://gizapyramids.org/pdf_library/petrie_gizeh.pdf">Petrie’s chamber survey</a>}</div>
  </div>;
}

function StairEcho() {
  const [distance, setDistance] = useState(3);
  const arrivals = stepEcho({ runM: .29, riseM: .24, offsetM: distance, sourceHeightM: 1.4, steps: 18 });
  const first = arrivals[0].timeSeconds;
  const last = arrivals[arrivals.length - 1].timeSeconds;
  const rate = arrivals[arrivals.length - 1].spacingHz;
  return <div className="arch-bench">
    <h3>Staircase returns</h3>
    <figure className="arch-photo arch-stairs-photo"><img src={assetUrl(`archaeoacoustics/${CHICHEN_PHOTO.file}`)} alt={CHICHEN_PHOTO.alt} loading="lazy" /><figcaption><a href={CHICHEN_PHOTO.url}>{CHICHEN_PHOTO.credit}</a> · <a href={CHICHEN_PHOTO.licenseUrl}>{CHICHEN_PHOTO.license}</a> · Resized for Open Sync</figcaption></figure>
    <p>One point scatterer per edge with a source and receiver in the same location. The model estimates travel time for 18 steps, each with a 0.29 m run and a 0.24 m rise.</p>
    <label className="arch-range">Horizontal distance to the first edge ({distance.toFixed(1)} m)<input type="range" min="1" max="10" step=".1" value={distance} onChange={event => setDistance(Number(event.target.value))} /></label>
    <div className="arch-arrivals" role="img" aria-label={`Eighteen return arrivals from ${pretty(first * 1000, 1)} to ${pretty(last * 1000, 1)} milliseconds.`}>{arrivals.map(arrival => <span key={arrival.step} style={{ left: `${2 + 96 * arrival.timeSeconds / .1}%` }} />)}</div>
    <div className="arch-axis" aria-hidden="true"><span>0 ms</span><span>50 ms</span><span>100 ms</span></div>
    <p className="arch-readout"><strong>{pretty(first * 1000, 1)}–{pretty(last * 1000, 1)} ms</strong> arrivals <strong>{rate ? pretty(rate, 1) : '—'} Hz</strong> final spacing rate</p>
    <p>The spacing rate is the reciprocal of one arrival gap. Real chirps also depend on diffraction strength, source spectrum, reflection paths, and geometry.</p>
    <div className="arch-links"><a href={MODEL_SOURCES.staircase}>Chichén Itzá diffraction study</a><a href="https://doi.org/10.1121/1.2213570">Bilsen’s repetition-rate model</a></div>
  </div>;
}

function PatternComparison() {
  return <section className="arch-model" aria-labelledby="pattern-comparison">
    <h2 id="pattern-comparison">Keep the tone. Change the plate.</h2>
    <p>Try the same 394 Hz drive on two virtual plates. G4 in 12-tone equal temperament at A4 = 440 Hz is about 391.995 Hz. The proposed 394 Hz match remains a claim about Troia, and the two views hold the tone and rendering style fixed while changing the virtual plate and its boundary model.</p>
    <div className="arch-actions"><PlateLink hz={394} label="394 Hz · round plate" /><PlateLink hz={394} label="394 Hz · square plate" square /></div>
    <p>To test an encoding claim, commit to a plate model, an image-similarity metric, and allowed rotations before looking for a match. Compare the claimed pair with unrelated windows and plates across a fixed frequency grid.</p>
  </section>;
}

export default function Exhibits({ topic }: { topic: TopicId }) {
  if (topic === 'celestial') return <WaveScales />;
  if (topic === 'architecture') return <section className="arch-model"><h2>Model a chamber and a stair echo</h2><div className="arch-benches"><RoomModes /><StairEcho /></div></section>;
  if (topic === 'geometry') return <PatternComparison />;
  return null;
}
