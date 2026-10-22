export const sourceClaim = {
  title: 'The copper-sphere proposal',
  description: 'A third-party transcript of a 2013 Bashar session proposes comparing a thin hollow copper sphere at two ends of a flat table, then applying the destination spectrum. A later timestamped transcript discusses nickel-copper and explicitly acknowledges the room, table and excitation as variables. Neither provides verified measurements or a physical frequency-to-destination law. The solid sphere here is a separate reference model requested for comparison.',
  url: 'https://www.superphysics.org/research/other/alien/essassani/transmissions/2013/2013-06-01b/',
  status: 'Source claim; no verified transport result',
  coverage: 'Bashar Index commit 457dc2f: 131 text files searched, including 75 digests and 684 catalogue records; no raw transcript corpus. One related video caption retrieval succeeded. The exact follow-up video is removed; its third-party transcript remains accessible. See the downloadable provenance audit.'
};

export const hypotheses = [
  {
    id: 'H0', title: 'Translation in a matched environment', status: 'Established model consequence',
    prediction: 'An ideal isolated sphere with unchanged material, geometry and temperature has the same intrinsic elastic modes at A and B.',
    control: 'Use the same portable support, specimen orientation, temperature and acquisition settings; move the sensor with the specimen. Include A-to-A handling repetitions.',
    falsifier: 'A reproducible residual beyond the preregistered uncertainty rejects this matched model for that apparatus. It does not identify a new cause by itself.'
  },
  {
    id: 'H1', title: 'The support changes the coupled modes', status: 'Simulated, physically motivated reduction',
    prediction: 'A contact spring coupled to a spatially varying table mode changes the coupled eigenfrequencies as the sphere moves.',
    control: 'Compare zero coupling, near-node and near-antinode positions; repeat with the same sphere suspended or on the same portable support.',
    falsifier: 'Measured shifts that do not follow independently calibrated support changes challenge this two-mode model. A real table needs more modes.'
  },
  {
    id: 'H2', title: 'Temperature can imitate a location effect', status: 'Derived sensitivity; specimen calibration required',
    prediction: 'Temperature changes elastic stiffness and dimensions. For the mass-conserving model, Δf/f ≈ (βE + α)ΔT/2 when Poisson ratio stays constant.',
    control: 'Record specimen and ambient temperature, alternate A/B order, and estimate the temperature coefficient in a separate calibration.',
    falsifier: 'A residual persists after temperature matching and lies outside propagated uncertainty. Reference copper constants are not a calibration of your specimen.'
  },
  {
    id: 'H3', title: 'A different readout can change the spectrum', status: 'Observation-model consequence',
    prediction: 'A fixed laser line of sight changes displacement projection as the specimen moves. The demonstration changes amplitude but leaves its mechanical poles unchanged.',
    control: 'Repeat with a co-moving sensor and equal optical geometry. Record raw signal and a calibrated input reference.',
    falsifier: 'A modelled projection change that moves mathematical poles is an implementation error. Real room interference and mode mixtures require a richer observation model.'
  },
  {
    id: 'H4', title: 'A residual location term', status: 'Open experimental hypothesis',
    prediction: 'A chosen mode may show a repeatable position-associated residual after known covariates are controlled. Define its minimum detectable size before collecting data.',
    control: 'Blind position labels during fitting, randomize order, repeat on another day, rotate and translate the apparatus, and validate on held-out positions.',
    falsifier: 'The residual disappears under controls or fails independent replication. A null result bounds the selected mode and sensitivity; it does not test every possible frequency.'
  },
  {
    id: 'H5', title: 'Does a selected drive cause directed motion?', status: 'Separate proposed experiment; not simulated as a discovery',
    prediction: 'A mechanical or electromagnetic drive can transfer momentum. The stronger source claim requires destination-specific motion beyond ordinary forces and experimental bias.',
    control: 'Preselect destination and stopping tolerance. Compare equal calibrated input, off-target frequencies, sham drive, reversed source direction, table reversal and no-sphere records; monitor tilt, airflow and heating.',
    falsifier: 'Motion follows slope, airflow, source direction, contact asymmetry or ordinary force gradients; or destination selection fails blinded trials. A shifted resonance alone is insufficient evidence.'
  }
];

export const protocols = [
  {
    title: '1. Define a measurable question',
    steps: ['Choose one modal family and a frequency band before testing. A point on a table is a measurement location; its response depends on the applied input, boundaries and sensor.', 'Record sphere composition, solid or hollow geometry, radius convention, shell thickness, seam, mass, orientation and temperature. Pure chemistry does not guarantee a homogeneous isotropic elastic specimen.', 'Specify the outcome: fitted pole frequency in Hz, damping, calibrated response and uncertainty. Keep these distinct from the largest FFT bin.'],
    note: 'No finite-band sensor captures an object’s entire physical state or a universal single frequency.'
  },
  {
    title: '2. Build a repeatable measurement chain',
    steps: ['Use the same portable support at A and B for the intrinsic-mode comparison. Run bare-table contact as a separate experiment.', 'Measure surface velocity with a calibrated laser Doppler vibrometer and input with an instrumented source. Include a table-reference channel and temperature logging.', 'Choose sensor bandwidth and anti-alias filtering from the predicted and pilot-measured band. Set sample rate above twice the highest retained frequency with transition-band margin. Ordinary phone audio cannot cover the solid reference’s ultrasonic breathing mode.'],
    note: 'The interactive model uses a unit generalized force and a displacement response in m/N. Real LDV velocity must be converted consistently, or compared as velocity/N.'
  },
  {
    title: '3. Compare positions with controls',
    steps: ['Begin with same-position handling repeats to estimate repeatability. Then acquire balanced A/B order, such as ABBA blocks, with randomized block order.', 'Use an illustrative pilot of twelve ABBA blocks, with randomized block direction, to estimate variance; determine the main trial count from the smallest effect of interest and measured noise.', 'Repeat with co-moving sensor geometry, object rotation, swapped supports, thermal equilibrium and a second day. Save raw waveforms, input reference, metadata and exclusions.'],
    note: 'There is no ideal frictionless table in this design. Air bearings, suspension and contact all add forces, noise or boundary conditions that must be characterized.'
  },
  {
    title: '4. Fit, quantify, and try to disprove',
    steps: ['Use calibrated frequency-response estimates or ring-down fitting, check coherence where applicable, and fit the same preselected mode at both positions.', 'Propagate temperature, timebase, fitting, support and repeatability uncertainty. FFT spacing 1/T is not the entire error bar; zero padding does not add information.', 'Publish the paired difference with an uncertainty interval, the raw-data path and all controls. If a residual remains, replicate it before assigning a new mechanism.'],
    note: 'All curves on this page are simulated. No physical A/B measurement or directed-motion result has been produced.'
  }
];

export const tools = [
  {name:'Browser model + Node tests',purpose:'Executed two-mode solver, sphere breathing models and exportable simulations.',url:'./code/package.json',limitation:'A reduced model with chosen support properties; not a full finite-element reconstruction.'},
  {name:'SciPy',purpose:'Independent spherical-Bessel roots, shell determinant, eigenvalues and numerical reference fixtures.',url:'https://docs.scipy.org/doc/scipy/reference/',limitation:'Executed reference code is supplied; agreement checks numerical implementation, not the actual specimen.'},
  {name:'pyFRF + SciPy',purpose:'Executed complex response and averaged coherence checks, including a duplicate-input identifiability counterexample.',url:'./research/tool-integration.md',limitation:'Synthetic fixtures only. A single-record coherence of one can be misleading; a perfect fit can still be rank deficient.'},
  {name:'scikit-fem',purpose:'Executed elastic radial weak-form solver with five mesh refinements and three checked radial modes.',url:'./code/reference/tool-bench.py',limitation:'A one-dimensional radial reduction with 3D strain energy; not a full sphere mode spectrum or anisotropic FEM model.'},
  {name:'pyuff',purpose:'Executed ASCII/binary UFF58 response-data roundtrips with explicit units and frequency-axis checks.',url:'./research/tool-integration.md',limitation:'Pinned release needs a fresh-file adapter to avoid reproduced binary truncation. Irregular-axis precision and resource handling still need review.'},
  {name:'Gmsh + DOLFINx',purpose:'Proposed next-stage 3D mesh and elastic eigenproblem including seam, support and anisotropy.',url:'https://docs.fenicsproject.org/dolfinx/main/python/',limitation:'Documentation inspected, not executed; requires convergence and independently measured material inputs.'},
  {name:'youtube-transcript-api',purpose:'Retrieved available captions for a related interview and documented unavailable video captions.',url:'https://github.com/jdepoix/youtube-transcript-api',limitation:'Captions and third-party transcripts may contain errors; one source video was removed.'},
  {name:'REW',purpose:'Optional low-frequency room-response exploration and microphone calibration.',url:'https://www.roomeqwizard.com/',limitation:'Does not make a phone or audio interface an ultrasonic sphere-mode measurement instrument.'}
];

// New controls motivated by the historical/patent and acquisition audits.
hypotheses.push(
  {id:'H6',title:'The apparent frequency follows the sampler',status:'Executed synthetic control; physical test proposed',prediction:'An unfiltered sampled tone above Nyquist can appear at a lower frequency. Changing sample rate changes its folded frequency without changing the object.',control:'First test the digitizer with an appropriate calibrated electrical reference. For the specimen, keep the same supported analog bandwidth and document each anti-alias filter; never intentionally defeat a hardware protection.',falsifier:'An alleged location shift instead follows the predicted alias when sample rate changes. The browser shows an unfiltered mathematical sampler, not a hardware filter.'},
  {id:'H7',title:'One channel misses a real mode',status:'Executed observation counterexample; scan proposed',prediction:'Changing excitation or readout position can expose a mode whose amplitude was zero or small in the original channel. Its frequency need not be an integer harmonic.',control:'Measure several surface points at fixed location with one calibrated input, unchanged supports and temperature, then return to the first point. Compare common poles across channels.',falsifier:'A proposed common-mode model cannot fit the channels within calibrated uncertainty. A missing peak alone does not prove that the mode is absent.'},
  {id:'H8',title:'Rotation imitates translation',status:'Patent-informed experimental hypothesis',prediction:'Shape errors, anisotropy and changing modal visibility can split or reweight nearby modes. Moving the strongest peak can mean selecting a different member of a multiplet.',control:'Rotate the specimen without translating the support; repeat handling without rotation. Track several neighboring poles and log orientation before the A/B trial.',falsifier:'A claimed location effect follows orientation or vanishes when the same modal family is tracked. Mode splitting is a shape/material diagnostic, not an absolute coordinate.'},
  {id:'H9',title:'The fixture supplies the peak',status:'Instrument-control hypothesis',prediction:'Some peaks belong to the support, source or electronics. A smooth spectrum and high single-record coherence do not establish a specimen mode.',control:'Acquire an empty fixture, an appropriate passive reference, and an independent readout. Use repeated or averaged records and inspect input spectral energy.',falsifier:'The peak persists without the specimen or follows the instrument. The tool bench demonstrates why an unaveraged coherence of one can be misleading.'},
  {id:'H10',title:'Drive strength changes the inferred resonance',status:'Experimental hypothesis; no nonlinear material fit claimed',prediction:'Contact preload, heating and material nonlinearity may change frequencies or damping as drive amplitude changes. The current linear mechanical model predicts no amplitude-dependent pole shift.',control:'Use calibrated low-amplitude trials within instrument and specimen limits; randomize amplitude order, log temperature and return to a baseline after recovery.',falsifier:'A reproducible amplitude-linked shift rejects the linear approximation for that operating range. It does not identify a location mechanism.'},
  {id:'H11',title:'Different material parameters share a spectrum',status:'Exact scaling counterexample within linear elasticity',prediction:'At fixed geometry and boundary conditions, multiplying both elastic stiffness and density by the same positive factor leaves the generalized elastic eigenfrequencies unchanged.',control:'Measure specimen mass, geometry and composition independently. Do not ask a frequency-only inverse fit to infer all three without extra information.',falsifier:'A solver changes these frequencies under common stiffness/density scaling, revealing an implementation or model inconsistency. This counterexample limits inference; it is not a new physical discovery.'}
);

protocols.push(
  {title:'5. Separate modal visibility from a position effect',steps:['Keep the sphere at A and measure several surface points with the same input reference. Save the complex force-to-velocity response, sensor directions and excitation locations.','Rotate the sphere without moving the portable base. Track common poles and near-degenerate groups, not only the largest peak. Repeat the original geometry to quantify handling drift.','Only then translate the complete matched assembly to B. Fit a preselected common-mode model and compare it with models that allow support, orientation and thermal changes.'],note:'A surface scan improves coverage of a chosen band; it does not prove that every possible mode or physical degree of freedom has been captured.'},
  {title:'6. Validate the measurement software',steps:['Use the Capture a spectrum tab to compare exact alias pairs, short and long records, window changes, hidden channels and sampled noise. Its data are synthetic arbitrary sensor units.','Run the published pyFRF, scikit-fem and pyuff benchmark before adapting its code. Preserve package versions, units, rank diagnostics, raw data and any file-format roundtrip errors.','Use the covariance calculator only with justified uncertainty inputs. Its k×u threshold is not automatically a 95% confidence interval, a p-value or a sample-size calculation.'],note:'Normal modes are not generally integer harmonics. See the expanded experiment plan and historical/patent review for the source-to-control mapping.'}
);
