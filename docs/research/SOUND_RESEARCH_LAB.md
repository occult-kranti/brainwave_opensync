# Sound Research Laboratory

Research cut-off: 16 October 2026. This is a selected, source-led research synthesis and software laboratory. It is not an exhaustive review of world literature or of all government records, and it does not establish the effectiveness of an Open Sync preset.

## What the lab is for

The new `/sound-research` route connects signal construction, mechanical models, biological mechanisms, competing interpretations, historical texts, public program records and original listening comparisons. It is available in both current editions. The archive keeps its spatial environment; master keeps its existing workspace. Neither edition imports the other edition's layout.

The governing question is not whether a number has a reputation. It is which physical stimulus reaches which system, what is measured, what alternative explanation remains, and whether the claimed endpoint follows from those observations.

## Separate the levels of inference

| Level | Observable or model | What it can support | What it cannot establish alone |
| --- | --- | --- | --- |
| Digital signal | Samples, channel spectra, envelope, duration, digital gain | Reproducible acoustic design and numerical identities | Sound pressure at the ear or absorbed energy |
| Acoustic propagation | Wavelength, period, ideal impedance-interface coefficients | Behavior of the explicitly assumed medium and boundary | A person's tissue coupling or a medical exposure |
| Mechanical response | Normalized linear oscillator response and damping sensitivity | Consequences of a specified equation and its parameters | A disease resonance or a healing frequency |
| Auditory biology | Auditory pathway response and measured EEG | A response to the tested stimulus in the tested setting | A desired mental state or a clinical outcome |
| Listening experience | Comfort, preference, self-reported calmness | Personal experience under that comparison | Tissue repair, disease modification or proof of mechanism |
| Clinical evidence | Defined outcomes in a controlled study | A bounded claim for the intervention and population studied | Validation of a different browser-generated sound |
| Cultural and state records | Texts, funding notices, program reports and patents | What was written, funded, investigated or claimed | That the proposed effect happened or generalizes |

A numerical simulation occupies the first three rows. The mechanisms and evidence tabs describe the remaining inferential steps; they do not silently convert the simulation into biological evidence.

## Reproducible calculations

`src/sound-research/model.ts` supplies separate-channel sine waves, a two-tone sum, full-depth sine amplitude modulation, envelope plots, and a dimensionless damped linear oscillator. Its numerical rows and CSVs include parameters and units. Display density and array length are bounded before allocation.

The additional scale model uses wavelength = sound speed / frequency and a lossless, normal-incidence interface with a hypothetical positive impedance ratio. The transmission and reflection coefficients are power fractions. Air and water sound speeds are reference assumptions; there is no tissue selector, measured pressure input or treatment calculator.

All physiological interpretations require evidence outside these equations. A resonance peak can move when a model parameter changes. A signal peak can exist without an equivalent EEG peak. An evoked EEG response can exist without a mood or memory improvement. These distinctions motivate the skeptical questions and their falsifiers.

## Original listening material

The 12 `research-` presets are original experimental compositions. They add steady controls, two stereo differences, shared-channel beating, a slow amplitude pattern, tone-plus-noise textures, bowl models, pitch-sequence comparisons and rain. The catalog contains 151 presets after this addition. New files are rendered through the existing engine; earlier preview WAVs remain unchanged. The manifest stays below the repository's 60 MB budget.

The presets are grade D and Experimental because their outcomes have not been validated. A supporting acoustics citation does not upgrade an original recipe to clinical evidence. Listening titles and details identify the actual composition rather than promising sleep stages, disease treatment or paranormal outcomes.

### Existing rendering distinction

The existing offline `monaural` renderer produces sine amplitude modulation, while live Studio uses a summed tone pair. The new shared-channel and slow-pulse cards disclose both spectra and envelope families. The laboratory's AM preview uses the offline renderer and matches the displayed sine-AM construction. A strict acoustic experiment must use one documented render path consistently. Engine unification is a separate development task; this release does not change legacy output to hide the difference.

## Research and source access

The source modules retain access status: full text, checked indexed sections, abstract, public description, or an inaccessible record. Historical texts have section or edition references. Government records identify country, agency, date and record type; they do not imply the sponsoring institution validated every associated claim. Commercial product records distinguish vendor descriptions from independent evidence and preserve disclosed financial interests and corrections.

The deeper questions are proposals, not discoveries. Each specifies a mathematical prediction, a biological unknown, an alternative or null model, a discriminating control and an observation that could defeat the idea. The four simpler listening proposals remain available as a separate layer. No simulated or invented clinical results are presented as observations.

## Implementation boundaries

The route registry, navigation directory, Guide and preset collection include the new lab. Preview playback goes through the shared session provider with explicit quiet gain, duration bounds, advisory and existing stop controls. Loading remains silent. Preview ownership is cleared when controls change or the page is left. Mathematical sliders never start sound. The archived world renderer remains independent of audio.

The deployment coordinator continues to build master at `/brainwave_opensync/`, the current archive at `/brainwave_opensync/archive/`, and the existing preserved editions. The coordinator reads the archive preset count from its manifest rather than a hard-coded number. The archive changes are not merged wholesale into master.

Verification results and deployment identifiers are recorded in `sound-release-verification.md` when complete.
