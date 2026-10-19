/** Design proposals created for this site, not reported experimental discoveries. */
export const devices = [
  {
    id: 'rlc', number: '01', title: 'Resonant transfer', subtitle: 'A source. Two coils. A load.',
    description: 'Explore how coupling, detuning, and load resistance change externally powered transfer between two resonators. Account for every watt in this reduced circuit.',
    channel: 'Electromagnetic · lumped circuit', evidence: 'Established circuit model / proposed instrument',
    formula: 'Zin = Z₁ + (ωM)²/Z₂ · I₂ = −iωM I₁/Z₂ · Pin = Pload + Ploss',
    assumptions: ['Linear series-compensated coils; sinusoidal steady state; RMS voltage and current.', 'Mutual inductance M = k√(L₁L₂); fixed lumped elements and positive dissipation.', 'A real external AC source supplies energy. The power balance is at the model source terminals.'],
    limitations: ['No field solution, coil geometry, eddy currents, saturation, heating, or generator efficiency.', 'The circuit is inspired by resonant engineering, not a reconstruction of Tesla’s atmospheric-transmission patent.', 'Efficiency is conditional on this circuit boundary; it is not wall-plug efficiency.'],
    sourceIds: ['physics-rlc-maxwell-2025', 'tesla-wireless', 'tesla-radiant', 'tesla-colorado', 'meep-adjoint'],
    setup: ['Concept: a driven resonator and separate receiver with a measured resistive load.', 'Record terminal voltage/current phase on both sides, winding resistance, load power, spacing, and temperature.', 'Begin with calibrated low-energy instrumentation; the browser supplies no hardware drive signal or construction rating.', 'Compare coupled and uncoupled states at the same drive, then sweep frequency and report all input and loss channels.'],
    hypotheses: [
      {id:'load-tracking',title:'Load-aware tuning',useCase:'A virtual receiver that retunes when its load changes.',prediction:'The frequency with maximum delivered load power need not coincide with the maximum efficiency or isolated coil resonance.',control:'Use the same RMS source voltage and coupling; compare a fixed-frequency baseline over the same frequency grid.',falsifier:'No improvement beyond measurement uncertainty on an independently sampled sweep, or omitted losses erase the gain.'},
      {id:'coupling-map',title:'Coupling calibration',useCase:'Check a resonator model before planning a coil prototype.',prediction:'At fixed geometry, a fitted coupling should predict a second frequency sweep with a different load.',control:'Fit only one sweep, freeze the elements, keep spacing and alignment fixed, then evaluate a withheld load. Predicting a new spacing would require a separately calibrated coupling-versus-spacing model.',falsifier:'One coupling value cannot predict the withheld complex input impedance at the same geometry within instrument uncertainty.'},
      {id:'energy-ledger',title:'Transient energy ledger',useCase:'Test a claimed excess-energy event without confusing storage with generation.',prediction:'A complete interval balance includes the change in stored electric and magnetic energy as well as dissipation.',control:'Discharge initial storage and measure a source-off baseline. The implemented bench is steady-state; this transient extension is proposed only.',falsifier:'An apparent excess disappears when storage, timing, bandwidth, or omitted input paths are included.'},
    ],
    connections: [
      {from:'Tesla’s tuned circuits',to:'Loaded complex impedance',type:'Mechanism inspiration',note:'The circuit model is modern and narrower than the historical patent.'},
      {from:'Radiant-energy patent',to:'Explicit external input',type:'Source constraint',note:'A collector and capacitor do not imply source-free energy.'},
      {from:'AI evaluator-guided search',to:'Power-balance rejection',type:'Method transfer',note:'A proposed optimum is rejected if it breaks the model’s conservation check.'},
    ],
  },
  {
    id:'array', number:'02', title:'Acoustic focus', subtitle:'Phase turns an array into a lens.',
    description:'Steer an idealized sound field, change the aperture, and watch phase errors weaken coherence. Inspect the full cross-section rather than only the brightest point.',
    channel:'Acoustic · scalar point-source field', evidence:'Established interference model / proposed measurement rig',
    formula:'p̃(r) ∝ Σ exp[i(φⱼ − krⱼ)]/rⱼ · φⱼ = krⱼ,target',
    assumptions:['Identical isotropic point sources in a homogeneous, lossless medium; single-frequency linear superposition.', 'The plotted quantity is pressure squared normalized to the ideal target for the same geometry.', 'A deterministic seeded phase perturbation supports repeatable comparisons.'],
    limitations:['No calibrated pascals, sound-pressure level, radiation force, particle scattering, or thermal dose.', 'A focus is not a stable levitation trap. Stability requires restoring forces and torques in all relevant directions.', 'No real transducer directivity, enclosure reflections, nonlinear acoustics, or absorption.'],
    sourceIds:['physics-marzo-2015','physics-sixdof-2026','jwave','anthropic-quantum-circuits'],
    setup:['Concept: a planar array and scanning pressure probe, with externally powered electronics and an enclosure.', 'Measure amplitude and phase over a three-dimensional grid; this app displays a selected two-dimensional section.', 'Compare continuous-phase target settings with phase quantization and calibration error at fixed source strength.', 'A future trapping experiment would additionally need particle parameters, calibrated force, stability and thermal measurements; it is not implemented here.'],
    hypotheses:[
      {id:'phase-budget',title:'Spend calibration where it matters',useCase:'Choose phase-resolution and calibration tolerances for an array.',prediction:'Across repeated phase-error realizations, calibration is expected to preserve target coherence; an individual error can partly cancel a quantization error.',control:'Keep source amplitudes fixed; compare ideal continuous phases, quantization only, and error plus quantization over a declared seed set. The interactive display shows one seed.',falsifier:'A measured field disagrees with predicted coherence after uncertainty, directivity and reflections are accounted for.'},
      {id:'robust-aperture',title:'Aperture versus ambiguity',useCase:'Trade compact hardware against off-target peaks.',prediction:'A larger aperture can sharpen the target region, while excessive pitch can introduce additional lobes.',control:'Compare full field maps at the same wavelength and target depth; do not renormalize each measured field to its own peak.',falsifier:'The apparent focus improvement is only a plotting normalization effect or produces a stronger undesired lobe.'},
      {id:'trap-extension',title:'From a focus to a trap',useCase:'Plan a future force-aware inverse-design study.',prediction:'A force-aware optimizer may choose a different field from a pressure-maximizing optimizer.',control:'For a specified inert particle, compare all force and torque derivatives and perturbation recovery, not a bright focal image.',falsifier:'The candidate lacks a restoring response in any relevant direction. No force-aware solver is implemented in this release.'},
    ],
    connections:[
      {from:'Newton’s optical observations',to:'Vary geometry; predict a new field',type:'Experimental method',note:'An analogy in method, not a claim that light and sound have identical dynamics.'},
      {from:'Hermetic correspondence',to:'An explicit similarity map',type:'Historical analogy',note:'A mathematical map must state which quantities and boundaries it preserves.'},
      {from:'Quantum-circuit evaluator',to:'Independent acoustic objective',type:'Workflow inspiration',note:'Quantum algorithm results do not supply an acoustic levitation mechanism.'},
    ],
  },
  {
    id:'absorber', number:'03', title:'Vibration absorber', subtitle:'A second oscillator changes the response.',
    description:'Tune an attached spring, mass, and damper to reduce motion of a driven structure. Compare the notch, split peaks, and energy dissipated by each damper.',
    channel:'Mechanical · two degrees of freedom', evidence:'Established linear dynamics / proposed adaptive instrument',
    formula:'[K − ω²M + iωC] X = F · Pin = c₁|ωX₁|² + c₂|ω(X₂−X₁)|²',
    assumptions:['Linear springs and viscous dampers; harmonic steady state; RMS force and displacement.', 'The primary structure has strictly positive damping. Positive masses and stiffnesses define a passive system.', 'The external force source supplies the average dissipated power.'],
    limitations:['No nonlinear stops, actuator delay, friction, changing supports, structural modes, or transient settling.', 'A deep notch at one frequency can coexist with larger response elsewhere.', 'A model search is not a measured optimum, patent novelty opinion, or proof of broadband performance.'],
    sourceIds:['physics-mit-absorber','physics-fast-tmd','newton-opticks','icml-physics-anchored','anthropic-quantum-circuits','mujoco'],
    setup:['Concept: an instrumented primary mass with an attached passive spring-mass-damper module.', 'Measure applied force and both mass motions; compare with the absorber detached at the same drive.', 'Sweep frequency in both directions and repeat at a second force level to test linearity.', 'Inspect internal stroke and dissipated power as well as primary motion; simulation parameters are not component ratings.'],
    hypotheses:[
      {id:'band-tuning',title:'Tune for a band, not one point',useCase:'A vibration absorber for a machine whose speed drifts.',prediction:'A bounded grid search over tuning and damping can lower the worst sampled response across a declared frequency band.',control:'Compare the same unmodified model and use interleaved frequencies excluded from optimization.',falsifier:'The gain fails on withheld points, a denser sweep, or measured mounting and parameter uncertainty.'},
      {id:'stroke-cost',title:'Count the hidden stroke',useCase:'Screen a tuning that appears attractive at the primary mass.',prediction:'A small primary displacement can require appreciable absorber motion and damping power.',control:'Report both displacements and the external input power at the same frequency and force.',falsifier:'The design exceeds stroke or thermal constraints, even if the primary response is reduced.'},
      {id:'drift-detection',title:'Use detuning as a diagnostic',useCase:'A hypothetical indicator of changing stiffness or mounting.',prediction:'A frozen fitted model predicts how a small parameter change moves the response peaks.',control:'Measure held-out frequencies and compare stiffness drift with damping or mass changes.',falsifier:'Several parameter combinations explain the observations equally well; the inference is then not identifiable.'},
    ],
    connections:[
      {from:'Newton’s analysis and synthesis',to:'Fit, freeze, predict, test',type:'Method transfer',note:'Fitting a response is separate from validating an unseen response.'},
      {from:'Resonance engineering',to:'A complete passive energy budget',type:'Shared mathematics',note:'Related oscillator equations do not make electrical and mechanical devices interchangeable.'},
      {from:'Modern operator research',to:'Withheld parameter regimes',type:'Validation constraint',note:'A small residual at training points does not guarantee the correct solution elsewhere.'},
    ],
  },
];
