# Bashar, physical channels and testable frequency hypotheses

Selected source audit and original OpenSync proposals · 16 October 2026

This dossier accompanies `/bashar-research` and `/frequency-hypotheses` in both editions. It contains 23 source records, 9 attribution audits, 20 typed connections, 3 teaching models, 8 proposed investigations and 8 original Grade D listening recipes. Records about the same interview or upload are not independent confirmations. No physical experiment, clinical result or exhaustive corpus review is claimed.


---

# Bashar media and claim audit

Audit date: 2026-10-16. This is a bounded source audit, not a claim to have watched or read the complete Bashar corpus.

## Repository provenance

The read-only clone of `occult-kranti/bashar-index` was checked at commit `457dc2f2da10399bda2786573b7a77ec3fe34f62`. README, data README, LICENSE, official-channel notes and the digest-generation specification were read. There are 75 digest JSON files. README advertises a catalogue of 684 sessions/events spanning 1984–2027, 56 redrawn diagrams and other derived analysis. Catalogue entries with future dates are not proof of completed recordings. The data README gives 2026-09-11 as its generation date.

The digests are AI summaries produced through a third-party automatic-transcript workflow; they are not source transcripts. The specification requests paraphrased Q&A, approximate word counts, topic percentages and limited quotations from another model processing a transcript-service page. These are multiple derivation layers. Quotes in those files were not copied into this audit. Repository MIT licensing covers code and derived data; the repository explicitly excludes rights to Bashar/Darryl Anka recordings, transcripts and handouts. No substantial repository data or commercial transcript is redistributed here.

The 75 raw digest JSON texts were searched case-insensitively for `levitat`, `anti[ -]?gravit`, `nanopart` and `nanotech`, with zero matches. This is a scoped string-search result, not evidence about everything Bashar has said. A raw `frequency` search matches all files partly because the fixed schema contains a frequency-topic key; that count cannot measure substantive coverage.

## Access and attribution notes

The completed source and claim inventory is recorded in `src/frontier/basharSources.ts`. Only material actually inspected is attributed at that depth. No purchase or account access is implied by a public catalogue listing.

The inventory contains **9 source records, 9 claim cards and 6 connection records**. Source records are retrieval/provenance objects, not nine independent corroborations: the two BatGap pages concern one interview, and the compilation captions and digest concern one upload.

| Source | Material actually inspected | Scope |
|---|---|---|
| [Pinned index](https://github.com/occult-kranti/bashar-index/tree/457dc2f2da10399bda2786573b7a77ec3fe34f62) | Provenance files and selected digest passages | Independent derived index; commit dated 2026-09-23 |
| [Sound digest](https://github.com/occult-kranti/bashar-index/blob/457dc2f2da10399bda2786573b7a77ec3fe34f62/data/digests/Rcjd1TkZUMY.json) | Researcher note and Q&A entries 5–6 | Unofficial Divine Insights upload; date and session identity unresolved |
| [Frequency digest](https://github.com/occult-kranti/bashar-index/blob/457dc2f2da10399bda2786573b7a77ec3fe34f62/data/digests/ygzBrMyMAQA.json) | Researcher note and Q&A entry 6 | Unofficial my daily life upload; repository flags a duplicate with conflicting dates |
| [Host transcript](https://batgap.com/darryl-anka-bashar-transcript/) | EEG discussion and location-variable passage | Anka's account of his experience and of Bashar's purported explanation, not experimental validation |
| [Compilation captions](https://www.youtube.com/watch?v=Rcjd1TkZUMY) | Selected public automatic-caption windows below | Partial textual concordance with digest; original session still unresolved |
| [Host interview](https://batgap.com/darryl-anka-bashar/) | Date, original-video link and chapter index | Recording date is **2014-06-14**, not the later publication date seen in some external catalogues |
| [Official Refresher highlights](https://vimeo.com/441207831) | Publisher identity, description, ordering link and Q&A list | Similar title alone does not identify the compilation; no full-session access |
| [Official Continuing Education highlights](https://vimeo.com/204088259) | Publisher description and Q&A list | Publisher gives session date 2015-06-19; antigravity appears as a question, not an inspected answer |
| [The Artifacts listing](https://tv.bashar.org/checkout/new?o=p3073483) | Search-indexed official catalogue description | Direct purchase route redirected; program page supplied navigation only; answers inaccessible |

### Original transcript and video identity

The interview host's transcript is the strongest accessible attribution source. Its chapter index marks the EEG section at **00:14:33**, and the location discussion at **01:29:10**. These are host-provided chapter starts, not exact quote boundaries. The host links video `0zMDMtv5XwY`; selected automatic captions from that same video were also read.

Anka reports an EEG comparison and describes relocation through a location-dependent frequency. These are statements, not independent measurements. The relevant pages supply no raw EEG, operative equation, apparatus or controlled transport result. Ordinary interference motion or acoustic particle trapping would not, by itself, test the relocation account.

### Caption retrieval and inspected windows

Public English original automatic captions were retrieved using `yt-dlp --skip-download --write-auto-subs --sub-langs en-orig --sub-format vtt`. Audio and video were not downloaded or played. Temporary captions were used for inspection only and are excluded from repository/public artifacts. No full third-party transcript is redistributed, and this audit uses paraphrase rather than quoted passages.

| Video | Actual caption text inspected | Result |
|---|---|---|
| `0zMDMtv5XwY` | 00:14:30–00:15:30; 01:30:10–01:31:40 | Agrees with the selected host-transcript passages |
| `Rcjd1TkZUMY` | 01:13:03–01:15:44; 01:17:04–01:18:58; 01:19:15–01:20:04 | Q&A discusses sound layers, instrument combinations and a 1:1.618 ratio; this does not authenticate the session or establish its claims |

The compilation has rolling captions with turn markers but no reliable speaker identification. Some premises are introduced by the questioner and accepted as analogies in the reply; assigning every sentence to Bashar would be misleading. Automatic text renders phi inconsistently. Caption concordance therefore remains a provenance qualification on the two digest-level cards, not an upgrade to authenticated official speech or a physical result. The digest's healing gloss is broader than the narrow ratio passage checked.

Temporary caption file SHA-256 values, for retrieval reproducibility only:

- `0zMDMtv5XwY.en-orig.vtt`: `d54f6a47713705ee76b0b12f8a3cd9b8c973301042123f81cd24ceaceed9e474`
- `Rcjd1TkZUMY.en-orig.vtt`: `f9cb1d0817d2fd75fe77044b1387349b7021195176a1d6f2e0f57f73d130f494`

### Access limits and unverified leads

- Vimeo `204088259` provided its public description, but `yt-dlp` requested login for media extraction. No account, cookie, paywall bypass or purchase was used.
- BasharTV's Refresher and Artifacts program routes returned a navigation shell. The Artifacts search record exposes questions about antigravity/free energy and sound-dependent location. Those questions do not establish the answer or a working device. Its chapter markers were not treated as topic-specific quote timestamps.
- The official Refresher description includes a Planck-time question. It does not corroborate the numerical reality-frame answer in the unrelated, unverified frequency digest.
- The frequency digest's alternative upload IDs are copies, not independent witnesses. Its consciousness-frequency figures lack a defined measured observable in the inspected material.
- No attributable nanoparticle statement was located. The claim card records that research gap; it does not assign the user's proposed connection to Bashar. Keyword absence in these 75 JSON files is not evidence of absence from the entire corpus.

### Boundaries for implementation

Original sound recipes may compare chosen pitches, intervals, levels and listening preferences. They are app designs, not Bashar prescriptions, recreated commercial recordings or verified consciousness effects. A ratio can be translated into an ordinary acoustic comparison without accepting a metaphysical interpretation. Any connection to particle trapping or levitation must name the force, source, coupling and observable separately. Missing attribution cannot be repaired by similarity of vocabulary.

The physical-question and missing-evidence fields are this audit's analysis, not quotations from the sources. No secret access, comprehensive corpus coverage, clinical validation or measured anomalous force is claimed.


---

# Scientific links audit: frequency, particles, materials and energy

Audit date: 16 October 2026. This is a bounded comparison of fourteen decisive sources, with six new retrievals and eight explicitly reused earlier audits. It is not a claim to have read the complete Bashar corpus, all government programs, all patents, or the entire current literature. The source catalog is `src/frontier/scienceSources.ts`; attribution to specific statements is maintained separately in `src/frontier/basharSources.ts`.

## What the comparison establishes

Several requested connections are real engineering subjects: acoustic radiation force, electrically mediated particle patterning, optical trapping, wavefront-shaping materials and harvesting incident electromagnetic energy. They have different state variables and coupling mechanisms. Their existence does not establish a universal frequency that controls matter, location, gravity or consciousness.

The strongest newly identified attribution is the host's [2014 interview transcript](https://batgap.com/darryl-anka-bashar-transcript/), section “How reality and space travel work,” especially the paragraphs where Anka attributes location-as-variable and destination-frequency claims to Bashar. The accompanying attribution audit checks the interview video as well. This science audit directly read the host transcript; it did not independently repeat that video check. The transcript documents a statement. It does not supply a measured transfer function or a laboratory result.

The sentence “frequency changes location” has at least two inequivalent meanings. A driven field can move a potential well through a physical region, exerting force on a coupled particle. The interview instead describes disappearance and reappearance without the intervening trajectory. The first meaning is demonstrated in defined apparatus. It is not a test or confirmation of the second. The missing bridge is a quantitative rule specifying the state, units, coordinate system, actuator, input energy and observations that distinguish relocation from ordinary motion or observation error.

## Mechanisms and the missing bridges

| Proposed link | Supported physical mechanism | Evidence still needed for the broader link |
|---|---|---|
| Sound to nanoparticle positioning | A small-particle radiation-force model; a separate demonstrated hybrid acoustic–electric apparatus | Material properties, geometry, fields and controls showing which force dominates at the proposed size |
| Frequency to spatial location | Relative phase can shift a standing pattern; forces can transport coupled particles | A distinct, predictive frequency-to-coordinate law for claimed discontinuous relocation |
| Metamaterial to unusual field pattern | Geometry and constitutive response alter phase, transmission and reflection | A measured causal link to the particular symbolic geometry or metaphysical claim |
| Resonance to usable electrical output | Energy storage and conversion from a specified input | A complete energy ledger before claiming an additional source |
| Levitation to reduced gravity | Acoustic, electric or magnetic forces can support matter | Measurements distinguishing support forces from a change in gravitational response |
| Quantum nanoparticle experiment to consciousness | Defined optical coupling and a measured mechanical-mode observable | An operational consciousness variable and a separate controlled experiment |
| Video frames to physical discontinuity | Sampling can obscure a continuous trajectory | Independent continuous tracking that excludes timing, occlusion and sampling explanations |

These are proposed logical comparisons, not historical influence claims. No inspected record establishes a research relationship between Bashar, the cited laboratories, NASA, the Navy, CAS or the Russian Science Foundation.

## Mathematical observables versus explanatory claims

For two ideal counterpropagating waves, one possible convention is

\[
p_1=p_0\cos(kx-\omega t),\qquad
p_2=p_0\cos(kx+\omega t+\phi).
\]

Their sum is

\[
p=2p_0\cos(kx+\phi/2)\cos(\omega t+\phi/2).
\]

At fixed wavelength, a relative phase change shifts a given pattern feature by \(\Delta x=-\Delta\phi/(2k)\), modulo the pattern's periodicity. This is our elementary superposition derivation. It describes field geometry; a particle follows only if its force, damping and stability permit. It does not predict teleportation. Changing frequency also changes wavelength through the relevant dispersion relation; changing phase and changing frequency are not interchangeable operations.

The earlier [Gor’kov audit](https://www.mathnet.ru/rus/dan25473) supplies the small-particle force baseline. In its idealized domain, force is obtained from a spatial gradient of an effective potential. Its assumptions must survive any attempted scaling to different particles. An axial equilibrium needs restoring stiffness along that axis; full confinement needs stability in every relevant direction. Zero net force alone can describe an unstable equilibrium.

For a separate classical sphere in a liquid, define radius \(r\), viscosity \(\eta\), temperature \(T\), drag coefficient \(\gamma=6\pi\eta r\), and an independently specified harmonic stiffness \(K\). The [Einstein original](https://jxshix.people.wm.edu/math490-2009/AEinstein-1905-MovBrowniano.pdf) and [Boltzmann-statistics chapter](https://www.feynmanlectures.caltech.edu/I_40.html) support the assumptions from which we use

\[
D=\frac{k_B T}{\gamma},\qquad
\sigma_x^2=\frac{k_B T}{K},\qquad
\tau=\frac{\gamma}{K},\qquad
f_c=\frac{1}{2\pi\tau}.
\]

The last two follow from the overdamped harmonic relaxation equation. They are our model reduction, not equations quoted from the Einstein paper. \(D\) has units m²/s, \(K\) N/m, \(\gamma\) kg/s, and \(f_c\) s⁻¹. This corner frequency describes a response time; it is not automatically an oscillatory resonance or an externally applied control frequency. The classical equilibrium model excludes active flow, nonconservative forcing, appreciable inertia at short time scales, rarefied-gas drag and quantum occupation calculations. It also takes stiffness as input rather than calculating it from an audio label.

A useful energy diagnostic is

\[
R=E_{\rm out}+\Delta E_{\rm stored}-E_{\rm in}.
\]

For a correctly bounded, completely measured system, the expected residual is zero within uncertainty. This is an accounting test, not a device model. Reactive voltage or field amplitude does not measure exported energy. Thermal, radiative and mechanical transfers, stored charge, and measurement offsets must be included. Finding a reproducible residual would justify investigating it; it would not by itself identify a new source or validate the claimant's explanation. [Field momentum](https://www.feynmanlectures.caltech.edu/II_27.html) similarly requires a boundary that includes interacting fields and matter.

Finally, [Shannon's §II](https://fab.cba.mit.edu/classes/S62.12/docs/Shannon_noise.pdf) is about band-limited signal reconstruction. The simulated sampling examples are tests of numerical observation, not tests of a metaphysical frame rate. Its §III coordinates label a mathematical signal space; they are not geographical coordinates of an object.

## New readings and exact scope

| Source | Version and passages inspected | Outcome and access boundary |
|---|---|---|
| [Zhang, Rufo et al., 2021](https://www.nature.com/articles/s41467-021-24101-z) | Publisher full-text HTML, Nature Communications 12, 3844; mechanism, Fig. 2a, equations 1–3, smaller-particle and streaming passages | Selected inert-particle evidence only. The electrical shield is a discriminating control; increased excitation need not improve confinement. Supplementary movies, raw data and other application protocols were not reproduced. |
| [Xie et al., 2016](https://users.rowan.edu/~shenc/paper/Xie2016SR.pdf) | Published university-hosted reprint, Scientific Reports 6, 35437; pp. 1–4, Results and Figs. 1–3 | Pressure maps support wave shaping by non-resonant geometry. This paper does not measure particle levitation. |
| [Hawkes, Katko and Cummer, 2013](https://people.ee.duke.edu/~cummer/reprints/161_Hawkes13_APL_PowerHarvestingMetamaterial.pdf) | Author-hosted published APL 103, 163901, all three pages; input-power definition, apparatus, loading and funding | Generator-powered RF-to-DC conversion; effective aperture matters to the denominator. The Army Research Office MURI acknowledgement is a documented funding connection, not an endorsement of new energy claims. |
| [Einstein, 1905](https://jxshix.people.wm.edu/math490-2009/AEinstein-1905-MovBrowniano.pdf) | German original within a university-hosted bundle; §§3–5, printed pp. 554–560, PDF pp. 8–14, visually inspected | Diffusion coefficient on p. 555 and one-axis displacement on p. 559 verified. The separately advertised English translation was not used. The rest of the bundle was not audited. |
| [Shannon, 1949](https://fab.cba.mit.edu/classes/S62.12/docs/Shannon_noise.pdf) | MIT-hosted original IRE scan; §II theorem 1 and reconstruction, pp. 11–12; §III representation | Mathematical sampling and signal-space argument. The scan begins with the end of another article; its preceding amplifier discussion is not Shannon's evidence. |
| [Feynman et al., volume I chapter 40](https://www.feynmanlectures.caltech.edu/I_40.html) | Caltech author-textbook edition; §§40–1/40–2, equations 40.1–40.3 and conservative-potential discussion | Classical equilibrium baseline. Harmonic variance and relaxation formulas above are explicitly identified reductions. |

Publisher metadata, an author reprint and a university copy of the same paper count as one source family, not independent replications. No code, diagrams or substantial passages from these papers were copied into the application.

## Reused evidence and government scope

Eight cards preserve earlier verified passages instead of implying a fresh full reading: Gor’kov's original four-page paper; Delić's selected author manuscript on optical trapping and mode thermometry; Feynman chapters I.4 and II.27; the NASA report; the Navy patent; the CAS rack account; and the RSF grant record. Their earlier audits remain in the levitation research documents. Their inclusion here adds conceptual comparisons, not new experimental confirmations.

| Public record | What its inspected passages establish | What they do not establish |
|---|---|---|
| [NASA/TM-2004-213082](https://ntrs.nasa.gov/citations/20040070788), May 2004, §§3.1.4/3.2.3 | A historical program review including an RF-confounded test, incomplete NASA replication, and a separately reported private null | A completed NASA replication of that superconducting-gravity apparatus, or a verdict on every possible future proposal |
| [US10144532B2](https://patents.google.com/patent/US10144532B2/en), granted 4 December 2018 | Patent text, drawings, claimed mechanism and stated Navy assignee | Independently reproduced inertia reduction or a verified operational vehicle |
| [CAS-hosted account](https://csu.cas.cn/gb/zyxw/202305/t20230505_6748857.html), published 28 April 2023 | One public electrostatic materials-processing program in orbital microgravity | A national inventory, Earth-based gravity cancellation, or access to unpublished telemetry |
| [RSF 17-19-01527](https://www.rscf.ru/project/17-19-01527/), 2017 award and later recorded outputs | Funder documentation of superconducting magnetic levitation research | Current funding status, a new energy source or independent verification of every listed paper |

The Soviet provenance of Gor’kov's 1961 paper is historical. It cannot be substituted for a current Russian government program. Country labels do not identify a shared mechanism or a link between institutions.

## Falsifiable directions and interpretation of nulls

The companion lab's hypotheses are proposals. No new particle, power or tracking measurements were collected for this audit. Three discriminating directions follow from the comparison:

1. **Field coupling:** an inert-particle pattern should respond to a control that changes its proposed electric coupling while measuring the accompanying mechanical field. The published AENT shield comparison is an example. A null difference would challenge the assumed dominance, subject to the sensitivity and completeness of the control.
2. **Thermal statistics:** a separately calibrated harmonic liquid trap predicts a position variance and a relaxation time. Held-out deviations after accounting for detector blur, drift and walls would refute the simple model in that regime; refitting stiffness to each observed curve would weaken the test.
3. **Observation continuity:** apparent jumps should change predictably with sampling if aliasing is the explanation. Persistence under independent higher-resolution observations would reject that particular artifact explanation, without automatically establishing teleportation.

These are analysis-level proposals, not apparatus build instructions. A positive match to an ordinary model does not confirm an unrelated narrative. A null or inconclusive observation does not prove that every form of a broad claim is impossible.

## Search boundary and unresolved access

This pass began with the existing levitation source inventory and typed provenance records. New searches used exact titles or focused terms for acoustoelectronic nanotweezers, acoustic metamaterial holography, microwave metamaterial harvesting, Einstein's Brownian-motion paper, and Shannon's noise paper. Both available search systems were used; authoritative-source verification was attempted, and selected original documents were opened. Examples of literal queries include `Shannon "Communication in the Presence of Noise" pdf 1949`, `"Shannon" "Communication in the Presence of Noise" filetype:pdf`, and `"Einstein" "Brownian" "1905" pdf translation Cowper`.

Some title searches returned poor matches. Older Stanford, Northeastern, FU Berlin and Sydney PDF links failed in this session. The ComPADRE Einstein entry exposed catalog metadata rather than the needed document. A Duke repository copy presented a bot challenge, so the openly listed author reprint was used. Nature initially produced a redirect error; its public article HTML later resolved and was read. No access restriction was bypassed, and no paywalled full text was represented as read.

The cultural audit's finite repository search found no matching nanoparticle or levitation terms in its pinned AI-digest collection. That is a result about that collection and those terms, not an all-world absence claim. It also located a direct interview statement and official catalog questions. An unanswered catalog question is not evidence that a detailed answer or working device was inspected. No primary experimental bridge from those statements to the cited physics was supplied by the inspected material; this conclusion remains bounded to the records and passages listed here.


---

# Frequency hypotheses and bounded model contracts

These are eight original proposed investigations, built from stated physical models. They are not attributed teachings, completed experiments, frequency prescriptions or efficacy claims. The accompanying calculations implement ordinary channel scales, prescribed classical confinement and equal-wave interference. They do not supply a missing mechanism for an unoperationalized claim about location, gravity, healing or energy generation.

The data live in `src/frontier/hypotheses.ts`; pure calculations and tests live in `src/frontier/models.ts` and `src/frontier/models.test.ts`. Source IDs reference `scienceSources.ts`. No audio, hardware, biological model or external service is involved. Existing levitation and Newton–Tesla models are referenced where useful rather than duplicated.

## Three interactive models

### 1. Equal numerical frequency across different channels

`channelComparison(fHz)` accepts a finite frequency from 1 to 100,000 Hz and returns

$$T=1/f,\qquad \lambda_{sound}=343/f,\qquad \lambda_{EM}=c/f,\qquad E_{photon}=hf.$$

Distances are metres, period is seconds and photon energy is joules. The sound speed is an approximate ideal-air value, not a universal material property. Vacuum light speed $c=299792458\,\mathrm{m/s}$ and Planck constant $h=6.62607015\times10^{-34}\,\mathrm{J\,s}$ use the defining SI values documented by [NIST](https://www.nist.gov/si-redefinition/meet-constants).

The ratio of electromagnetic to acoustic wavelength remains $c/343$ at equal frequency. At 440 Hz the values are approximately 0.779545 m and 681346.495 m. The electromagnetic photon calculation does not describe the energy of a sound session, the number of photons present, an absorbed dose or source power. Medium dispersion, attenuation, source amplitude and coupling remain unspecified. [Feynman volume II, chapter 27](https://www.feynmanlectures.caltech.edu/II_27.html) treats electromagnetic field energy and momentum; it is not evidence that sound and electromagnetism become interchangeable at a common frequency.

`channelComparisonCsv(fHz)` exports one numerical row with units, constants and assumptions.

### 2. Classical distribution and relaxation for prescribed stiffness

The thermal model assumes a positive, conservative harmonic potential in one Cartesian coordinate:

$$U(x)=\frac{\kappa x^2}{2},\quad p(x)=\frac{1}{\sqrt{2\pi}\sigma}\exp\left(-\frac{x^2}{2\sigma^2}\right),\quad \sigma=\sqrt{\frac{k_BT}{\kappa}}.$$

This Gaussian and variance are our reduction of the Boltzmann law in [Feynman volume I, chapter 40, §40–2](https://www.feynmanlectures.caltech.edu/I_40.html). The stiffness $\kappa$ is **supplied**, not inferred from acoustic frequency or shown achievable by any apparatus. A 1D RMS is not a 3D radial distance. At $x=\sigma$, the harmonic potential is $k_BT/2$.

For a spherical particle of radius $a$ in a continuum Newtonian liquid with dynamic viscosity $\eta$,

$$\gamma=6\pi\eta a,\qquad D=\frac{k_BT}{\gamma},\qquad\tau=\frac{\gamma}{\kappa},\qquad f_c=\frac{1}{2\pi\tau}.$$

Here $\gamma$ is drag in N·s/m, $D$ is the **free** Stokes–Einstein diffusion coefficient in m²/s, $\tau$ is overdamped relaxation time in seconds, and $f_c$ is the overdamped corner frequency in Hz. The [original Einstein 1905 scan, §§3–5](https://jxshix.people.wm.edu/math490-2009/AEinstein-1905-MovBrowniano.pdf) supports diffusion and free displacement; the harmonic relaxation formulas are our reduction of $\gamma\dot x+\kappa x=\xi(t)$. The identity $\sigma^2=D\tau$ connects equilibrium variance with these dynamics.

Free one-axis RMS displacement after time $t$ is $\sqrt{2Dt}$; it is not the stationary trapped spread $\sigma$. At equilibrium the ideal overdamped autocorrelation is $\langle x(t)x(0)\rangle=\sigma^2e^{-|t|/\tau}$. Adjacent recorded frames can therefore be correlated and cannot automatically be treated as independent observations.

| Input | Bound | Unit |
|---|---:|---|
| `stiffnessNpm` | $10^{-9}$–$10^{-3}$ | N/m |
| `temperatureK` | 250–350 | K |
| `radiusM` | $25\times10^{-9}$–$5\times10^{-6}$ | m |
| `viscosityPas` | $10^{-4}$–0.1 | Pa·s |

Defaults are $\kappa=10^{-6}$ N/m, $T=300$ K, $a=100$ nm and $\eta=0.001$ Pa·s. They yield approximately $\sigma=64.358$ nm, $D=2.19737\times10^{-12}$ m²/s and $f_c=84.4343$ Hz. These are hypothetical inputs, not material calibration. Viscosity and temperature are independently supplied; a real fluid's viscosity may change with temperature.

Continuum no-slip drag, equilibrium, a harmonic range large enough for the fluctuations, negligible wall effects and an overdamped observation regime are assumptions. The model does not receive particle mass, so it cannot verify the inertial crossover. Small-particle slip, molecular effects, inertia, walls, streaming, nonconservative forcing, aggregation and finite trap depth may require different physics. It computes neither capture nor escape probability and establishes no quantum ground state or gravitational cancellation.

`thermalTrap(input)` returns thermal energy, RMS, drag, diffusion, relaxation time and corner frequency. `buildThermalTrapRows(input,count)` exports a Gaussian over $\pm4\sigma$ with absolute density in m⁻¹, relative density and $U/(k_BT)$. The finite plot retains the full Gaussian normalization: it covers approximately 0.99993666 probability and is not rescaled to contain all probability. `thermalTrapCsv` includes parameters, scalar results and those rows.

### 3. Relative phase and path difference

Two equal-amplitude monochromatic waves have local squared-amplitude ratio

$$\delta=\frac{2\pi\Delta L}{\lambda}+\phi,\qquad R=\frac{|1+e^{i\delta}|^2}{4}=\frac{1+\cos\delta}{2},\qquad\lambda=343/f.$$

The API name `normalizedIntensity` denotes this **local mean-square amplitude ratio**. It is not net acoustic intensity through a surface; an ideal standing wave has zero time-averaged net energy flux while its local squared pressure varies. Normalization is always the equal-source constructive maximum, never each curve's own maximum. At zero path difference, phases 0°, 90° and 180° give 1, 0.5 and 0.

`coherence(input)` accepts frequency 1–100,000 Hz, signed path difference −1–1 m and relative source phase −180–180°. It returns wavelength, combined phase in radians, the squared-amplitude ratio and node spacing $\lambda/2$ **for counterpropagating planar geometry only**. In that geometry $\Delta L=2z+\text{constant}$, so a source-relative phase change translates nodes by

$$\Delta z=-\frac{\lambda\Delta\phi}{4\pi}.$$

Path-difference fringes repeat after $\lambda$, while spatial standing-wave nodes repeat after $\lambda/2$. This relative phase is distinct from the spatial phase used in the existing levitation model's $\cos(kz+\phi)$; the relative phase between two counterpropagating waves enters that cosine with a factor of one half.

`buildCoherenceRows(input,count)` samples the selected path difference plus or minus one wavelength, clipped to −1–1 m. This contains at most two fringes. Its minimum of 17 rows provides at least eight intervals per cycle; a full two-metre plot at high frequency would otherwise create false patterns from undersampling. `coherenceCsv` records the actual plot interval and normalization. Fixed monochromatic phase, equal amplitudes and ideal propagation are assumed; partial coherence, attenuation, boundaries and source imbalance are not fitted.

## Hypothesis matrix

Each record contains variables, model, prediction, setup, controls, observable, falsifier, limitations and source IDs. The proposals below are distinguishable from implementation tests: a mathematical identity can test software, while a physical prediction needs independent measurements and calibration.

| ID | Proposed question | Observable and decisive control |
|---|---|---|
| `frontier-channel-match` | Does a shared frequency specify a shared mechanism? | Wavelength/period scaling under explicitly different propagation speeds; no amplitude or coupling inferred |
| `frontier-relative-phase` | Does relative phase move the ordinary interference pattern as predicted? | Local minima and fixed-normalization pressure statistics; phase inversion and single-source reference |
| `frontier-phase-drift` | Does detuning explain a slowly changing phase pattern? | Relative-phase slope $2\pi\Delta f$; zero detuning and sign reversal |
| `frontier-brownian-stiffness` | Does independent stiffness predict held-out one-axis variance? | Position distribution; source-off, tracking-noise, temperature and relevant electric shielding controls |
| `frontier-brownian-drag` | Does drag change relaxation while preserving equilibrium variance? | Free diffusion, trapped correlation and variance measured separately; independent viscosity and stiffness |
| `frontier-sampling-alias` | Could an acquisition chain manufacture a low-frequency line? | Samples and spectra at documented sample rates; bandwidth limit and rate-change controls |
| `frontier-passive-resonance` | Can a larger passive response be explained by the source/loss budget? | Amplitude, phase, cycle-mean input/loss and transient storage; identified system boundaries |
| `frontier-force-energy-budget` | Is force balance sufficient when scaling toward smaller particles? | Potential relative to $k_BT$, confinement directions and tracked motion; field-off, shielding and streaming controls |

The alias proposal uses our identity for cosine samples at 8,000 samples/s: 7,712 Hz and 288 Hz yield the same sample sequence. It does not render the high-frequency signal or perform an actual acquisition. [Shannon's 1949 paper, §II](https://fab.cba.mit.edu/classes/S62.12/docs/Shannon_noise.pdf) supplies the bandwidth/sampling context. A directly synthesized 288 Hz listening illustration cannot show that aliasing occurred.

The final proposal references the existing small-sphere model and [Gor’kov's original paper record](https://www.mathnet.ru/rus/dan25473). At fixed ideal field and contrast, force, weight and acoustic potential scale with volume. Their force ratio can stay fixed while potential energy relative to thermal energy falls. This is not permission to extrapolate that model beyond its stated radius range. It does not identify an achievable nanoscale trap. Electric and acoustic contributions remain separate mechanisms; shielding can help test which contribution dominates in an appropriate measured setup.

Source IDs agreed with the science catalog are `frontier-gorkov-1961`, `frontier-feynman-fields`, `frontier-feynman-energy`, `frontier-einstein-brownian-1905`, `frontier-feynman-statmech` and `frontier-shannon-1949`. Optional listening preset links are pedagogical compositions; neither these papers nor these hypotheses validate a listening outcome.

## Acceptance tests and limits

All scalar inputs reject nonfinite or out-of-bound values. Row counts are integer-bounded to 600 before array allocation: thermal rows accept 3–600, coherence rows 17–600. CSVs have deterministic settings, units and assumptions. No random samples are generated.

The focused model suite checks:

- inverse wavelength/period and direct photon-energy scaling;
- equipartition, $\sigma^2=D\tau$, corner-frequency units, stiffness/temperature/drag scaling;
- Gaussian symmetry, absolute normalization and finite values at all parameter corners;
- constructive/destructive interference, phase compensation and the factor of two between path difference and spatial position;
- fixed normalization, bounded local fringe resolution, invalid inputs, allocation limits and deterministic CSV output.

Independent arithmetic review reproduced the default outputs, scaling identities, Gaussian integral and phase cases. A reviewer also corrected the Brownian-drag falsifier: a reproducible failure of **either** calibrated variance or relaxation prediction can reject the jointly specified model; failure of both is not required. The persistent focused suite contains 41 passing tests. These checks establish implementation consistency under assumptions, not empirical efficacy or a new physical mechanism.


---

# Independent AI review: Bashar research and frequency hypotheses

Review date: 2026-10-16. This is an independent AI source and reasoning review, not human peer review or a physical replication. It is scoped to the new `src/frontier/` material and the inspected sources below. The existing channeled-source and levitation dossiers set the prior evidence limits. No DSP or existing audio assets were edited by this reviewer.

## First-round findings sent to the implementation team

1. **Attribution gate.** The supplied index contains AI digests, not verified transcripts. The source agent's search, independently repeated on all 75 pinned digest JSON files, found no `levitat`, `anti[ -]?gravit`, `nanopart`, or `nanotech` matches. This bounds that search, not the whole Bashar corpus. Requested levitation/nanoparticle investigations must remain user-proposed questions unless a specifically inspected original supports attribution. Catalogue descriptions, session titles and questions do not establish the answers given in a recording.
2. **A decisive mechanism control.** The inspected 2021 acoustoelectronic nanotweezers paper reports an electrical-shield control with inert polystyrene particles. Patterning disappears in the shielded portion. The authors interpret this as evidence of acoustoelectronic dominance over acoustic radiation force. A sound-only nanoparticle-levitation interpretation fails this control; acoustic and electric variables must remain distinct.
3. **Passive is not source-free.** The inspected passive acoustic hologram paper uses an incident sound field and a transducer. Spatial redistribution of supplied acoustic energy is a mechanism; it does not establish cyclic excess output.
4. **Documented speech has a narrow scope.** The accessible BatGap host transcript supports Anka reporting an EEG comparison and distinguishing an altered-state claim from the reality of Bashar. It contains no raw EEG, calibration, independent statistical analysis, or gravity measurement. It cannot authenticate the older compilation digest or an EEG-to-gravity mechanism. A later passage attributes a location/frequency relocation account to Bashar, but supplies no operational equation or measured field. Moving interference fringes or a force-supported trap does not test instantaneous relocation.

Follow-up question passed to the team: **Which original passage establishes the claimed physical quantity, and what observation would distinguish its proposed mechanism from independently measured electric fields, ordinary support forces, streaming, thermal fluctuations or supplied energy?** For the nanoparticle branch, electrical shielding is a concrete discriminator already present in the literature.

## Independent source checks

| Source actually opened | Inspected locator and finding | Limit retained |
| --- | --- | --- |
| [Pinned Bashar Index](https://github.com/occult-kranti/bashar-index/tree/457dc2f2da10399bda2786573b7a77ec3fe34f62) | Local README, digest specification and `Rcjd1TkZUMY.json`. The workflow makes model summaries from a third-party transcript service; the selected digest itself cautions that its uploader title/date may describe a compilation. | The official refresher page returned only navigation in this review. Similar titles do not establish recording identity. Future catalogue dates do not establish completed events. |
| [BatGap host transcript](https://batgap.com/darryl-anka-bashar-transcript/) | EEG-documentary discussion and “How reality and space travel work” location-variable passage. The transcript has speaker labels but no speech timecodes. | Attribution is to this published host transcript. The reviewer did not independently transcribe the audio. Reported EEG differences do not demonstrate extraterrestrial communication or a physical frequency conversion. |
| [BatGap interview record](https://batgap.com/darryl-anka-bashar/) | Lists recording date 2014-06-14 and chapter starts 00:14:33 (EEG) and 01:29:10 (location). | These are host-supplied chapter locations, not reviewer-verified word timestamps or playback. |
| [Official Continuing Education highlights](https://vimeo.com/204088259) | Bashar Communications description lists session date 2015-06-19 and an antigravity question in its Q&A topics. | Description inspection verifies topic metadata, not the spoken answer or a working mechanism. |
| [Zhang et al., Nature Communications 12, 3844 (2021)](https://www.nature.com/articles/s41467-021-24101-z) | Introduction; working principles; Results, “Nanomanipulation with 1D acoustoelectronic fields,” Fig. 2a. Electrical shielding is a mechanism control; the paper also describes streaming disturbances. | Hybrid actuation cannot be generalized to sound-only trapping. This review concerns inert material examples and supplies no biological manipulation protocol. |
| [Xie et al., arXiv:1607.06014v1](https://arxiv.org/abs/1607.06014) | Abstract and preprint PDF Results/Discussion; published university reprint subsequently checked, including explicit non-resonant labyrinthine cells. | The demonstrated field patterns are not themselves a new levitation experiment. The paper retains an incident acoustic source; proposed applications are not completed results. |
| [Millis, NASA/TM-2004-213082](https://ntrs.nasa.gov/citations/20040070788) | Official record abstract and linked original report opened. The abstract explicitly distinguishes nonviable, follow-up-worthy and unresolved research tasks. | The institutional program is documented; blanket gravity-control success is not. No claim that this reviewer reread every experiment in the report. |
| [US10144532B2](https://patents.google.com/patent/US10144532B2/en) | Patent bibliographic record and description discussion of gyroscope findings and purported inertia reduction. | Patent text documents what is claimed. Navy assignment is not a controlled performance dataset. A patent author's dismissal of null findings is not an independent resolution of those findings. Current legal status is not evaluated here. |
| [Hawkes et al. author reprint](https://people.ee.duke.edu/~cummer/reprints/161_Hawkes13_APL_PowerHarvestingMetamaterial.pdf) | The first repository route was blocked. The author reprint subsequently opened: original pp. 2–3 identify the generator/amplifier, incident-power and effective-aperture accounting, and Army Research Office MURI support. | Externally supplied RF is converted to DC. Funding does not validate an unrelated propulsion claim; efficiency accounting does not demonstrate net energy creation. |

## Caption concordance follow-up

The source agent subsequently retrieved public English automatic captions with `yt-dlp`. This reviewer independently read selected VTT windows from temporary files: host video `0zMDMtv5XwY`, 00:14:30–00:15:30 and 01:30:10–01:31:40; unofficial compilation `Rcjd1TkZUMY`, 01:13:03–01:14:20 and 01:19:15–01:20:04. The host windows are consistent with the inspected published transcript. The compilation windows contain the layered-sound discussion and numerical phi ratio.

This is textual caption concordance, not independent audio transcription, speaker authentication or verified compilation provenance. Rolling captions duplicate text, misrecognize words and do not reliably identify speakers. The opening sound-current framing includes questioner premises; summaries must not assign every turn to Bashar. The first-round access gaps are therefore partly improved, while the older digest-only source status remains appropriate. Full third-party captions are not redistributed in this review.

## Numerical and hypothesis review

The completed `src/frontier/models.ts` was independently read and its actual exports executed with Node type stripping. It implements three bounded teaching models: numerical frequency across distinct propagation channels; classical fluctuations for a prescribed positive harmonic stiffness; and normalized local interference. No mathematical blocker was found in these checks:


| Independent check of actual exports | Result |
| --- | --- |
| 440 Hz channel comparison | Acoustic wavelength 0.779545 m; vacuum electromagnetic wavelength 681346.495 m. |
| Default prescribed thermal trap | One-coordinate RMS 64.358 nm; free diffusion coefficient 2.19737 × 10⁻¹² m²/s; corner frequency 84.4343 Hz. These are equation outputs. |
| Variance identity | `sigma² = D × relaxationTime` agrees to relative error 1.91 × 10⁻¹⁶. |
| Radius doubled at fixed prescribed stiffness | RMS is unchanged; diffusion and corner frequency halve. This explicitly differs from a field-dependent stiffness model. |
| Stiffness doubled | Variance and relaxation time halve. |
| Gaussian density integrated over plotted ±4 sigma | Trapezoidal integral 0.999936642, compared with analytical finite-window mass 0.999936658; no false window renormalization. |
| Interference limits with fixed normalization | Relative source phase 0°, 90°, 180° gives 1, 0.5, 0; half/full path wavelength gives 0/1. The highest-frequency boundary plot remains bounded. |

The source and output metadata retain these distinctions:

- A shared number in hertz is not a measured coupling. Acoustic wavelength uses the selected medium speed; electromagnetic wavelength uses its stated propagation condition. `hf` describes photon energy when applied to electromagnetic radiation, not the energy of an arbitrary audible tone.
- Prescribed stiffness is an input, not a prediction that a particular field can create that trap. A one-dimensional equilibrium RMS displacement is not a three-dimensional radius or a capture probability. Free diffusion and confined equilibrium variance have different time dependence.
- Size scaling of force alone cannot certify a nanoparticle trap. Thermal fluctuations, finite trap depth, streaming, surface effects and validity of continuum approximations can matter. Force balance does not establish three-dimensional stability.
- Local squared wave amplitude is not net standing-wave energy flux. Keep normalization fixed across phase comparisons; interference redistributes energy and does not create it.
- A test needs a prespecified observable, comparison and rejection rule. Simulated agreement with an equation tests software, not the truth of a channeled claim. Fitting each condition separately cannot be the claimed held-out prediction.

## Source-data review

The completed `basharSources.ts` and `scienceSources.ts` were read. Their typed relationships separate documentation, tests, analogy and unsupported bridges. They retain the distinction between official question metadata, host statements, AI summaries and proposed experiments. The independent checks above support the strongest new mechanism contrasts. Prior-audit entries are explicitly marked reused; this reviewer does not claim to have reread every prior original.

One editorial defect was returned and corrected in `scienceSources.ts`: Gor’kov's limitation had referred to a “force minimum”; the final text correctly distinguishes axial force balance or a one-dimensional potential minimum from three-dimensional confinement.

## Hypothesis review

All eight records in `hypotheses.ts` were inspected. They are identified as the application's original proposals, not Bashar teachings or completed experiments. Their controls distinguish numerical identities from physical tests, and their limits preserve the gap between moving a field pattern and instantaneous material relocation. The small-sphere proposal correctly predicts that halving radius lowers both force and weight by eight while weakening the potential relative to thermal energy; radius cancellation in a force ratio does not certify confinement.

One rejection-rule correction was requested and verified in the final `frontier-brownian-drag` text: a reproducible discrepancy in either independently predicted relaxation or variance beyond calibrated uncertainty rejects the jointly specified model. Requiring both predictions to fail would have made the model unnecessarily difficult to falsify.

All 67 source references across claim, connection and hypothesis records resolve to the 23 declared source IDs. This is a referential-integrity check, not 23 independent confirmations: multiple records concern the same interview, upload or scientific framework.

## Release disposition

The attribution and mechanism boundaries above are release requirements, not evidence that a physical anomaly is impossible. The source, numerical-model and hypothesis review is complete. Both requested wording corrections were verified in the final files. No unresolved source or model blocker remains within this review scope. Runtime, accessibility, audio-asset preservation and deployment checks belong to the implementation team. No novel physical effect, physiological benefit, independent laboratory replication or human peer review has been established by this review.


---

## Full claim and connection register

### EEG differences during channeling

Status: documented statement.

**attribution:** Anka reports an EEG comparison for his documentary and explicitly separates altered state from belief in Bashar’s existence.

**physicalQuestion:** Does a repeatable EEG difference survive matched speech, breathing and movement controls?

**ordinaryExplanation:** Task state and recording artifacts are alternative explanations to test.

**missingEvidence:** Raw signals, protocol, artifact rejection, blinded analysis and independent replication.

Sources: bashar-host-interview, bashar-host-chapters

### Relocation by changing a frequency variable

Status: documented statement.

**attribution:** Anka attributes to Bashar relocation by imposing a destination-dependent frequency, without intervening motion.

**physicalQuestion:** What measurable relation maps frequency to position, with what input and coupling?

**ordinaryExplanation:** Moving interference patterns and trapped particles are separate mechanisms; they do not test this account.

**missingEvidence:** An operational equation, apparatus, continuous tracking and controlled replication.

Sources: bashar-host-interview, bashar-host-chapters

### Phi-based sound and metaphysical effects

Status: digest only.

**attribution:** An AI digest links a 1:1.618 interval to consciousness and healing. Unofficial automatic captions corroborate the ratio/theme, not the full healing interpretation.

**physicalQuestion:** Does this interval change a predefined listening outcome under blinded, level-matched comparison?

**ordinaryExplanation:** Pitch, timbre, preference and expectation can change experience.

**missingEvidence:** Authenticated original context and controlled outcome data; no clinical benefit established.

Sources: bashar-sound-digest, bashar-compilation-captions

### Physical, energetic and light layers of sound

Status: digest only.

**attribution:** The digest assigns three layers to sound and special significance to acoustic/electronic combinations; selected unofficial captions broadly agree.

**physicalQuestion:** Which independently measured variable represents each proposed layer?

**ordinaryExplanation:** Combining instruments changes the audible spectrum.

**missingEvidence:** Authenticated original context and a detector or prediction distinguishing the added layers.

Sources: bashar-sound-digest, bashar-compilation-captions

### Numerical consciousness frequencies

Status: digest only.

**attribution:** The digest gives 30,000–50,000 cycles/s for an average state and higher values for other states.

**physicalQuestion:** What oscillates, how is it measured, and how does it couple to audible sound?

**ordinaryExplanation:** A stated frequency needs a specified observable; sharing units with sound supplies no mechanism.

**missingEvidence:** Original passage, calibrated measurement, uncertainty and reproducible state classification.

Sources: bashar-frequency-digest

### Planck-scale reality frames

Status: digest only.

**attribution:** The digest describes a roughly 10^43-per-second reality-frame rate.

**physicalQuestion:** What observation would distinguish discrete frames from ordinary continuous motion?

**ordinaryExplanation:** A frame animation is a representation, not evidence that reality updates at that rate.

**missingEvidence:** Original explanation, dimensional derivation and an independently testable prediction.

Sources: bashar-frequency-digest, bashar-official-refresher

### Antigravity and free-energy catalogue questions

Status: unverified lead.

**attribution:** Official descriptions advertise questions on these topics; the relevant answers were not retrieved.

**physicalQuestion:** Is any eventual claim ordinary force or energy transfer, or a claimed departure?

**ordinaryExplanation:** A question in a programme does not establish what the speaker answered.

**missingEvidence:** Answer transcript, device details, complete input/output accounting and force measurements.

Sources: bashar-official-education, bashar-official-artifacts

### A catalogue question about sound and location

Status: unverified lead.

**attribution:** The Artifacts listing asks whether sound can change an object’s locational variable.

**physicalQuestion:** Does the answer describe acoustic force, or something beyond it?

**ordinaryExplanation:** A sound-driven displacement would need a force model; the question alone supplies none.

**missingEvidence:** The answer and a controlled measurement. The separate interview does not establish a sound mechanism.

Sources: bashar-official-artifacts, bashar-host-interview

### Nanoparticle attribution remains unresolved

Status: unverified lead.

**attribution:** Nanoparticles are a requested research topic; this audit did not locate an attributable Bashar statement about them.

**physicalQuestion:** Can an exact original statement be identified before comparing it with particle-trapping research?

**ordinaryExplanation:** A thematic connection proposed by researchers is not automatically the speaker’s claim.

**missingEvidence:** Original recording or transcript locator. Zero keyword hits in 75 digests are not a corpus-wide absence claim.

Sources: bashar-index-pin

### Pinned index → Sound and frequency summaries

Relationship: **documents**. The repository documents its AI summarization workflow. It does not authenticate every upstream transcript or uploader date.

Sources: bashar-index-pin, bashar-sound-digest, bashar-frequency-digest

### Unofficial Refresher compilation → Official Refresher session

Relationship: **unsupported**. Matching title words do not establish that these recordings contain the same session.

Sources: bashar-sound-digest, bashar-official-refresher

### Phi sound digest → Original pitch-ratio comparison

Relationship: **analogy**. A listening comparison may borrow a ratio as a design choice; it cannot inherit the digest’s metaphysical or healing conclusions.

Sources: bashar-sound-digest

### EEG state difference → Identity of an external source

Relationship: **unsupported**. State differences alone do not identify an external information source.

Sources: bashar-host-interview

### Publisher Q&A topic → A working antigravity or sound device

Relationship: **unsupported**. An advertised question supplies neither an affirmative answer nor experimental performance.

Sources: bashar-official-education, bashar-official-artifacts

### Requested nanoparticle topic → Bashar teaching

Relationship: **unsupported**. No original attribution was located in this bounded audit. General particle research cannot fill that provenance gap.

Sources: bashar-index-pin

### Standing acoustic field → Small-particle restoring force

Relationship: **documents**. Gor’kov derives a material-dependent, time-averaged force under stated small-particle assumptions. A wavelength or audible pitch alone leaves pressure, geometry and contrast unspecified.

Sources: frontier-gorkov-1961

### Acoustoelectronic particle patterns → Electrical-shield control

Relationship: **tests**. In the reported polystyrene comparison, electrical shielding removed patterning. The discriminating result favors the coupled electric mechanism over a pure acoustic-force explanation in that apparatus.

Sources: frontier-acoustoelectronic-2021

### Millimeter levitation demonstration → Nanoparticle control

Relationship: **unsupported**. Reducing size changes the balance among radiation force, drag, streaming and Brownian motion. The inspected nano demonstration uses additional electric coupling; it is not obtained by simply choosing another audible pitch.

Sources: frontier-gorkov-1961, frontier-acoustoelectronic-2021, frontier-einstein-brownian-1905

### Classical harmonic potential → Thermal position spread

Relationship: **tests**. Our model derives variance kBT/K from Boltzmann statistics and liquid diffusion from viscous mobility. Held-out position distributions could test those assumptions; matching a synthetic curve is not experimental validation.

Sources: frontier-feynman-statmech, frontier-einstein-brownian-1905

### Quantum motional cooling → Audio-driven relocation or altered gravity

Relationship: **unsupported**. The optical experiment measures a nanoparticle mode under a defined laser–cavity coupling. It supplies no conversion rule from a headphone tone to location, gravity or a whole-object quantum state.

Sources: frontier-delic-2020, frontier-feynman-fields

### Patterned material geometry → Controlled wavefront

Relationship: **documents**. Xie and colleagues measured pressure patterns produced by geometry-dependent phase delays. Their non-resonant cells are a counterexample to treating every metamaterial result as one universal resonance mechanism.

Sources: frontier-xie-2016

### Symbolic geometry and frequency language → Engineered acoustic hologram

Relationship: **analogy**. Both may use patterned images, but a physical connection needs a specified material, boundary condition, transfer function and measured field. Visual resemblance alone supplies none of those quantities.

Sources: frontier-xie-2016

### Metamaterial RF harvester → External-energy conversion

Relationship: **documents**. The measured DC output is compared with incident RF power supplied by a generator and amplifier. Army support is documented in the paper; it does not turn conversion into energy creation.

Sources: frontier-hawkes-2013, frontier-feynman-energy

### Resonance or ambient harvesting → Net energy creation

Relationship: **unsupported**. A field maximum, high voltage or harvested output is insufficient. A new-energy claim needs repeatable excess beyond all measured inputs, stored-energy changes and uncertainty, followed by independent checks of ordinary explanations.

Sources: frontier-hawkes-2013, frontier-feynman-energy, frontier-feynman-fields

### Chinese and Russian public levitation records → Electric and magnetic support

Relationship: **documents**. The selected Chinese rack and Russian grant name different ordinary mechanisms and operating contexts. Neither record is evidence for a common undisclosed frequency-to-gravity technology.

Sources: frontier-china-rack, frontier-russia-maglev

### Navy-assigned patent → Demonstrated inertia reduction

Relationship: **unsupported**. Ownership and claimed mechanism are documented. The inspected material does not supply a reproducible calibrated performance dataset, and unrelated NASA investigations do not fill that gap.

Sources: frontier-navy-patent, frontier-nasa-bpp

### Sparse sampled motion → Apparent jumps or reversals

Relationship: **tests**. Sampling gives an ordinary way for continuous motion to appear ambiguous. Higher temporal resolution and an independently observed path can discriminate aliasing from a proposed discontinuity.

Sources: frontier-shannon-1949

### Bashar location-as-frequency claim → Phase-controlled particle transport

Relationship: **unsupported**. The 2014 host transcript documents Anka attributing relocation to a changed locational variable. Measured field-driven transport has a coupling, force and continuous trajectory; the claim supplies no tested frequency-to-coordinate law or replacement dynamics.

Sources: bashar-host-interview, frontier-acoustoelectronic-2021, frontier-feynman-fields

### Reality described as successive frames → Sampling theorem

Relationship: **analogy**. The host interview uses a frame metaphor. Shannon describes reconstructing band-limited signals from observations; his signal-space coordinates are mathematical representations, not a claim that matter teleports between physical frames.

Sources: bashar-host-interview, frontier-shannon-1949

## Original listening companions

The presets are app-chosen comparisons, not source-prescribed recipes or hardware control signals. Existing audio assets are preserved. Each new preview is rendered on request by the existing bounded engine path.

### Matched pitch steps — experimental tier

ID: `bashar-study-matched-steps` · Grade D · 6 minutes.

Compare four quiet 90-second tones, 248 → 310 → 372 → 496 Hz, identical in both channels, with the offset-channel version.

Original listening comparison; benefits are unvalidated. The ratios to our 248 Hz reference are 1, 5/4, 3/2 and 2. This is a matched-channel control for an audio comparison, not a claim about personal alignment. The host transcript documents Anka’s reported interpretation; it does not prescribe these pitches or establish a measured consciousness state. This is our listening-study extension, without source endorsement. Starting pitches, durations and digital gains are app choices. Digital gain does not specify calibrated sound pressure.

| Phase | Carrier Hz | Difference Hz | Mode | Seconds | Digital gain dBFS |
|---|---:|---:|---|---:|---:|
| 1 | 248 | 0 | binaural | 90 | -30 |
| 2 | 310 | 0 | binaural | 90 | -30 |
| 3 | 372 | 0 | binaural | 90 | -30 |
| 4 | 496 | 0 | binaural | 90 | -30 |

### Offset pitch steps — experimental tier

ID: `bashar-study-offset-steps` · Grade D · 6 minutes.

The same four left-channel tones and timing, with the right channel 2 Hz higher at every step. Use stereo headphones for channel separation.

Original listening comparison; benefits are unvalidated. Only the right-channel frequency differs from Matched pitch steps: 250, 312, 374 and 498 Hz. Relative phase advances at 2 turns per second; no separate 2 Hz tone is emitted. Neither condition measures a listener’s internal state. The host transcript documents Anka’s reported interpretation; it does not prescribe these pitches or establish a measured consciousness state. This is our listening-study extension, without source endorsement. Starting pitches, durations and digital gains are app choices. Digital gain does not specify calibrated sound pressure.

| Phase | Carrier Hz | Difference Hz | Mode | Seconds | Digital gain dBFS |
|---|---:|---:|---|---:|---:|
| 1 | 248 | 2 | binaural | 90 | -30 |
| 2 | 310 | 2 | binaural | 90 | -30 |
| 3 | 372 | 2 | binaural | 90 | -30 |
| 4 | 496 | 2 | binaural | 90 | -30 |

### Fifth then return — experimental tier

ID: `bashar-study-fifth-return` · Grade D · 6 minutes.

Listen to 372 → 248 → 496 → 248 Hz, 90 seconds per step in both channels. Compare the first return with the octave version.

Original listening comparison; benefits are unvalidated. The first descent is from 3/2 of the 248 Hz root; the second is from twice that root. Only the first pitch differs from Octave then return. Equal digital gain does not guarantee equal perceived loudness. The host transcript documents Anka’s reported interpretation; it does not prescribe these pitches or establish a measured consciousness state. This is our listening-study extension, without source endorsement. Starting pitches, durations and digital gains are app choices. Digital gain does not specify calibrated sound pressure.

| Phase | Carrier Hz | Difference Hz | Mode | Seconds | Digital gain dBFS |
|---|---:|---:|---|---:|---:|
| 1 | 372 | 0 | binaural | 90 | -30 |
| 2 | 248 | 0 | binaural | 90 | -30 |
| 3 | 496 | 0 | binaural | 90 | -30 |
| 4 | 248 | 0 | binaural | 90 | -30 |

### Octave then return — experimental tier

ID: `bashar-study-octave-return` · Grade D · 6 minutes.

Listen to 496 → 248 → 496 → 248 Hz, 90 seconds per step in both channels. Both returns now span a 2:1 interval.

Original listening comparison; benefits are unvalidated. Timing, gain and the final three pitches match Fifth then return; the first pitch changes from 372 to 496 Hz. This holds sequence structure fixed while changing the first interval. The host transcript documents Anka’s reported interpretation; it does not prescribe these pitches or establish a measured consciousness state. This is our listening-study extension, without source endorsement. Starting pitches, durations and digital gains are app choices. Digital gain does not specify calibrated sound pressure.

| Phase | Carrier Hz | Difference Hz | Mode | Seconds | Digital gain dBFS |
|---|---:|---:|---|---:|---:|
| 1 | 496 | 0 | binaural | 90 | -30 |
| 2 | 248 | 0 | binaural | 90 | -30 |
| 3 | 496 | 0 | binaural | 90 | -30 |
| 4 | 248 | 0 | binaural | 90 | -30 |

### Phase drift reference — experimental tier

ID: `frequency-study-phase-reference` · Grade D · 5 minutes.

Five minutes of 312 Hz in both channels. Compare with Phase drift at 1.25 Hz using the same comfortable device setting.

Original listening comparison; benefits are unvalidated. Matched channel frequencies give zero relative phase drift in this ideal signal. The preset schema has no initial-phase parameter. Playback does not measure spatial interference, room pressure or biological coherence. Starting pitches, durations and digital gains are app choices. Digital gain does not specify calibrated sound pressure.

| Phase | Carrier Hz | Difference Hz | Mode | Seconds | Digital gain dBFS |
|---|---:|---:|---|---:|---:|
| 1 | 312 | 0 | binaural | 300 | -30 |

### Phase drift at 1.25 Hz — experimental tier

ID: `frequency-study-phase-drift` · Grade D · 5 minutes.

Five minutes of 312 Hz left and 313.25 Hz right. This changes only the right-channel frequency from the matched reference.

Original listening comparison; benefits are unvalidated. Relative phase changes by 2π × 1.25 × t radians and completes a turn every 0.8 seconds. This is detuning, not a fixed initial-phase offset; no isolated 1.25 Hz tone or measured neural rhythm is produced. Starting pitches, durations and digital gains are app choices. Digital gain does not specify calibrated sound pressure.

| Phase | Carrier Hz | Difference Hz | Mode | Seconds | Digital gain dBFS |
|---|---:|---:|---|---:|---:|
| 1 | 312 | 1.25 | binaural | 300 | -30 |

### Five-hertz spectral separation — experimental tier

ID: `frequency-study-sideband-pair` · Grade D · 5 minutes.

Five minutes of 288 Hz left and 293 Hz right. Compare the fixed 288 Hz reference with a second channel shifted by 5 Hz.

Original listening comparison; benefits are unvalidated. The two lines illustrate the arithmetic distance from a chosen carrier to one upper AM sideband: 293 − 288 = 5 Hz. Actual AM at 5 Hz would also require a lower 283 Hz sideband and a specified amplitude relation. This stereo pair is not AM playback and does not produce a separate 5 Hz signal. Speaker or mono mixing changes the comparison. Starting pitches, durations and digital gains are app choices. Digital gain does not specify calibrated sound pressure.

| Phase | Carrier Hz | Difference Hz | Mode | Seconds | Digital gain dBFS |
|---|---:|---:|---|---:|---:|
| 1 | 288 | 5 | binaural | 300 | -30 |

### Alias arithmetic · audible reference — experimental tier

ID: `frequency-study-alias-proxy` · Grade D · 5 minutes.

Five minutes of a steady 288 Hz tone in both channels. Use it as the carrier control for Five-hertz spectral separation or as an audible reference for the sampling calculation.

Original listening comparison; benefits are unvalidated. For an illustrative 8,000 samples/s clock, a 7,712 Hz sine folds to a 288 Hz magnitude-frequency alias because |7,712 − 8,000| = 288. Its ideal sampled sine has reversed sign relative to a positive-phase 288 Hz sine. This recipe directly synthesizes 288 Hz at the engine rate; it never generates 7,712 Hz or performs that undersampling. The chosen arithmetic does not establish a hidden physical signal. Starting pitches, durations and digital gains are app choices. Digital gain does not specify calibrated sound pressure.

| Phase | Carrier Hz | Difference Hz | Mode | Seconds | Digital gain dBFS |
|---|---:|---:|---|---:|---:|
| 1 | 288 | 0 | binaural | 300 | -30 |

## Source register

### bashar-index-pin: The Bashar Index: pinned research repository

[repository](https://github.com/occult-kranti/bashar-index/tree/457dc2f2da10399bda2786573b7a77ec3fe34f62) · 2026-09-23 commit; inspected 2026-10-16

**locator:** README.md, data/README.md, LICENSE and src/DIGEST_SPEC.md; 75 digest JSON files counted.

**access:** Read-only local clone at exact commit; selected digests inspected, not 75 recordings watched.

**summary:** Independent AI summaries generated through a third-party automatic-transcript workflow. README advertises 684 catalog items, 75 recording digests and 56 redrawn diagrams.

**limitation:** MIT covers repository code and derived data, not Bashar recordings or transcripts. Catalogue dates extend through 2027 and do not establish that future events occurred. A digest is not a verified transcript.

### bashar-sound-digest: AI digest: sound layers and phi intervals

[repository](https://github.com/occult-kranti/bashar-index/blob/457dc2f2da10399bda2786573b7a77ec3fe34f62/data/digests/Rcjd1TkZUMY.json) · Digest generated 2026-09-11; recording date unresolved

**locator:** researcher_note and qa_topics entries 5–6; linked YouTube ID Rcjd1TkZUMY.

**access:** Selected JSON passages read; selected YouTube automatic captions also checked. The uploader is Divine Insights, not the official channel.

**summary:** The digest connects phi intervals and layered sound to metaphysical effects.

**limitation:** Its own provenance note warns that the Refresher title and 2025 date may label an older compilation. Caption concordance does not identify an official session or authenticate speaker turns.

### bashar-frequency-digest: AI digest: consciousness frequencies and reality frames

[repository](https://github.com/occult-kranti/bashar-index/blob/457dc2f2da10399bda2786573b7a77ec3fe34f62/data/digests/ygzBrMyMAQA.json) · Digest generated 2026-09-11; recording date unresolved

**locator:** researcher_note and qa_topics entry 6; linked YouTube ID ygzBrMyMAQA.

**access:** Selected JSON passages read; uploader my daily life is unofficial.

**summary:** The digest assigns numerical frequencies to consciousness and a Planck-scale rate to reality frames.

**limitation:** The repository flags a duplicate of p8JC21bFf5M with conflicting uploader dates. These copies are not independent corroboration or verified transcripts.

### bashar-host-interview: Darryl Anka: interview-host transcript

[transcript](https://batgap.com/darryl-anka-bashar-transcript/) · Interview recorded 2014-06-14

**locator:** Interview 236; host chapters 00:14:33 and 01:29:10. YouTube automatic-caption windows checked: 00:14:30–00:15:30 and 01:30:10–01:31:40.

**access:** Selected host transcript and matching automatic captions read. Host video 0zMDMtv5XwY; no full playback claimed.

**summary:** Anka reports an EEG comparison and describes a frequency-based relocation account attributed to Bashar.

**limitation:** Documented speech, not raw EEG, a force experiment, or a verified transport mechanism.

### bashar-compilation-captions: Unofficial compilation: selected automatic captions

[video](https://www.youtube.com/watch?v=Rcjd1TkZUMY) · Uploader date and original session identity unresolved

**locator:** Caption windows 01:13:03–01:15:44, 01:17:04–01:18:58 and 01:19:15–01:20:04.

**access:** Public en-orig automatic captions retrieved with yt-dlp; selected text read, no audio/video playback or transcript republication.

**summary:** Caption passages broadly agree with the digest on layered sound, combined instruments and the 1:1.618 ratio.

**limitation:** Automatic transcription can mishear words or confuse speakers. This is an unofficial upload with unresolved editing and session provenance, not an authenticated official recording.

### bashar-host-chapters: Interview 236: date, original video and chapter index

[official](https://batgap.com/darryl-anka-bashar/) · 2014-06-14 recording date on host page

**locator:** Recording-date line; YouTube chapter index; embedded video ID 0zMDMtv5XwY.

**access:** Host metadata and links read. The source is the interview producer, not Bashar Communications.

**summary:** The host links its transcript to this interview and supplies EEG and location-discussion chapter starts.

**limitation:** The chapter index establishes provenance and navigation; it supplies no independent replication of the guest’s claims.

### bashar-official-refresher: Official Refresher Course highlights description

[video](https://vimeo.com/441207831) · Session date not established from inspected description

**locator:** Bashar Communications owner attribution, ordering link, introductory description and Q&A list.

**access:** Public video description read; no speech transcript or full paid session inspected.

**summary:** The publisher describes a review of the 1–3–5–7–11 teachings and lists a question about Planck time.

**limitation:** A similar title does not authenticate the unofficial Rcjd1TkZUMY compilation. Catalogue questions do not reveal the answers.

### bashar-official-education: Official Continuing Education highlights description

[video](https://vimeo.com/204088259) · 2015-06-19 session date in publisher description

**locator:** Bashar Communications description: session date, Los Angeles location and Q&A topic list.

**access:** Public description read. Caption extraction requested login; no account access attempted.

**summary:** The publisher’s Q&A list includes a question about antigravity physics.

**limitation:** This verifies the advertised topic, not an answer, demonstration, or successful gravity modification.

### bashar-official-artifacts: The Artifacts: official catalogue search record

[official](https://tv.bashar.org/checkout/new?o=p3073483) · Undated listing; retrieved 2026-10-16

**locator:** Search-indexed publisher Q&A list; direct route redirects to a purchase page.

**access:** Search-indexed text inspected. Direct program page returned navigation only; no answer transcript obtained.

**summary:** Advertised questions concern an antigravity/free-energy machine and changing object location through sound.

**limitation:** Questions are not affirmative claims. Search metadata may lag the page. No purchase, full recording, answer or device was examined.

### frontier-gorkov-1961: Gor’kov: forces on a small particle in an acoustic field

[paper](https://www.mathnet.ru/rus/dan25473) · 1961

**locator:** Doklady AN SSSR 140(1), 88–91; original Russian pp. 88–91, especially equations 12–13 on p. 90.

**access:** Reused prior audit: original four-page scan inspected, including equation images. The later English translation was not read.

**summary:** A time-averaged radiation force follows from pressure and fluid-velocity fields, particle volume, density and compressibility contrast. A standing field can supply a restoring force while an external source supplies energy.

**limitation:** Small-particle, ideal-fluid approximation; viscosity, streaming, finite size and scattering can change the answer. Axial force balance or a one-dimensional potential minimum does not establish three-dimensional confinement or reduced gravity. Historical Soviet research is not evidence of a current Russian program.

### frontier-acoustoelectronic-2021: Zhang, Rufo et al.: acoustoelectronic nanotweezers

[paper](https://www.nature.com/articles/s41467-021-24101-z) · 2021-06-22

**locator:** Nature Communications 12, 3844; Results, “Nanomanipulation with 1D acoustoelectronic fields”; Fig. 2a, equations 1–3 and smaller-particle caveats.

**access:** New retrieval: publisher full-text HTML; selected mechanism, inert-particle control, equation and limitation passages read. Supplementary movies and raw data not reproduced.

**summary:** Powered piezoelectric surface waves establish patterned electric fields. Polystyrene patterns disappeared in an electrically shielded region, supporting electric coupling as the dominant mechanism in that comparison.

**limitation:** This is a hybrid acoustic–electric apparatus, not airborne sound alone. Streaming disturbed smaller-particle patterns as excitation increased; the authors allow an electrokinetic contribution for very small quantum dots. Frequency alone does not specify force or material response.

### frontier-delic-2020: Delić et al.: cooling an optically levitated nanoparticle to its motional ground state

[paper](https://arxiv.org/abs/1911.04406) · 2020; author preprint 2019

**locator:** Science 367, 892–895, DOI 10.1126/science.aba3993; author manuscript opening mechanism, sideband thermometry and Figs. 1–2.

**access:** Reused prior audit: selected author-manuscript passages and figures; no independent rerun of thermometry or apparatus.

**summary:** Optical trapping and cavity cooling act on a mechanical mode of a nanoparticle. The reported quantum observable concerns mode occupation under an externally powered laboratory arrangement.

**limitation:** A controlled mechanical mode is not an entire object at zero temperature, a changed mass, or a consciousness measurement. A liquid Brownian-trap illustration does not reproduce this vacuum optomechanical experiment.

### frontier-xie-2016: Xie et al.: acoustic holography with a passive metamaterial phased array

[paper](https://users.rowan.edu/~shenc/paper/Xie2016SR.pdf) · 2016-10-14

**locator:** Scientific Reports 6, 35437, DOI 10.1038/srep35437; published reprint pp. 1–4, Results and Figs. 1–3.

**access:** New retrieval: university-hosted published PDF; selected design, measured pressure maps and model-comparison passages read.

**summary:** Geometry-dependent phase delays reshape sound from a powered source into measured pressure patterns and multiple foci. The paper explicitly describes non-resonant labyrinthine unit cells.

**limitation:** A pressure image is not a particle-levitation measurement. The passive layer redirects incident energy; it does not create energy. Shared pattern geometry does not establish a common mechanism with symbolic diagrams or a universal special frequency.

### frontier-hawkes-2013: Hawkes, Katko and Cummer: microwave metamaterial power harvesting

[paper](https://people.ee.duke.edu/~cummer/reprints/161_Hawkes13_APL_PowerHarvestingMetamaterial.pdf) · 2013-10-14

**locator:** Applied Physics Letters 103, 163901, DOI 10.1063/1.4824473; pp. 1–3, efficiency definition, Fig. 4 apparatus and funding statement.

**access:** New retrieval: author-hosted published three-page PDF read; no circuit reproduction or raw-data reanalysis.

**summary:** A metamaterial rectifier converts externally supplied microwave energy into DC power. The paper identifies a signal generator and amplifier, measures incident power, and states Army Research Office MURI support.

**limitation:** Reported efficiency depends on incident-power accounting, effective aperture and load. It is not an ambient-power guarantee, net energy creation, or evidence that military funding validates unrelated propulsion claims.

### frontier-feynman-fields: Feynman, Leighton and Sands: field energy and field momentum

[book](https://www.feynmanlectures.caltech.edu/II_27.html) · 1964; Caltech online edition

**locator:** The Feynman Lectures on Physics II, chapter 27, especially §§27–2 and 27–6.

**access:** Reused prior audit: selected author-textbook sections on energy flow and momentum. Maxwell’s original papers were not newly read.

**summary:** Electromagnetic fields exchange energy and momentum with matter. Poynting flux and field momentum belong in the accounting when light or radio waves exert force.

**limitation:** Momentum conservation requires the chosen boundary to include sources, supports, radiation and interacting matter. Vacuum photon momentum alone is not a complete force law inside material media, and field support is not gravity cancellation.

### frontier-feynman-energy: Feynman, Leighton and Sands: conservation of energy

[book](https://www.feynmanlectures.caltech.edu/I_04.html) · 1963; Caltech online edition

**locator:** The Feynman Lectures on Physics I, chapter 4, §§4–1 and 4–2; energy accounting and reversible lifting arguments.

**access:** Reused prior audit: selected author-textbook passages; this is a theoretical baseline, not a test of a particular product.

**summary:** Stored energy and energy transferred across the system boundary must be accounted for together. A resonator or harvester can concentrate or convert energy supplied elsewhere.

**limitation:** A balance is meaningful only after electrical, mechanical, thermal, radiative and stored-energy terms are measured with uncertainty. An unexplained residual first establishes an accounting problem, not its proposed cause.

### frontier-einstein-brownian-1905: Einstein: diffusion and displacement of suspended particles

[paper](https://jxshix.people.wm.edu/math490-2009/AEinstein-1905-MovBrowniano.pdf) · 1905; received 1905-05-11

**locator:** Annalen der Physik 17, 549–560; original German scan §§3–5, printed pp. 554–560 (PDF pp. 8–14).

**access:** New retrieval: university-hosted bundle; original German equation and assumption pages visually read. The separately listed Cowper translation was not read.

**summary:** For dilute spheres in a liquid, diffusion relates to temperature and viscous mobility: D = kBT/(6πηr). The one-axis free-displacement variance is 2Dt under the diffusion assumptions.

**limitation:** Continuum drag, equilibrium and sufficiently separated time scales are assumptions. Molecular-size particles, walls, interactions, strong flows and rarefied gas require different treatment. Brownian motion does not reveal a universal particle-control frequency.

### frontier-shannon-1949: Shannon: Communication in the Presence of Noise

[paper](https://fab.cba.mit.edu/classes/S62.12/docs/Shannon_noise.pdf) · 1949-01

**locator:** Proceedings of the IRE 37(1), 10–21; §II, theorem 1 and sinc reconstruction, printed pp. 11–12; §III signal-space meaning.

**access:** New retrieval: MIT-hosted scan of the original article; selected sampling and signal-coordinate passages read. Not a complete review of information theory.

**summary:** Band limitation and sampling determine whether a continuous signal can be reconstructed. Sparse observation can produce ambiguous apparent motion; signal-space coordinates describe a representation of data.

**limitation:** The theorem has mathematical bandwidth and ideal-sampling assumptions. It does not show that physical reality advances in video frames or that changing a signal coordinate relocates matter.

### frontier-nasa-bpp: Millis / NASA: Prospects for Breakthrough Propulsion From Physics

[government](https://ntrs.nasa.gov/citations/20040070788) · 2004-05

**locator:** NASA/TM-2004-213082; body pp. 1–8, especially §§3.1.4 and 3.2.3.

**access:** Reused prior audit: NTRS record and report body read. The report’s cited private replication paper was not separately inspected.

**summary:** A historical NASA review distinguishes speculative investigations, inconclusive tests and null findings. It reports an RF-confounded test and a NASA superconducting-gravity replication left incomplete because hardware exceeded available resources.

**limitation:** The separately reported private null result must not be relabeled as NASA’s completed replication. This report neither validates the proposed effect nor establishes the outcome of every later investigation.

### frontier-navy-patent: Pais / U.S. Navy: US10144532B2 inertial-mass-reduction proposal

[patent](https://patents.google.com/patent/US10144532B2/en) · 2018-12-04 grant; 2016-04-28 filing

**locator:** Original six-page patent: front sheet, Figs. 1–2, description and claims 1–4.

**access:** Reused prior audit: patent text and drawings inspected; no independent operational dataset inspected.

**summary:** The patent documents a Navy-assigned proposal involving powered resonant cavities and claimed changes to local vacuum conditions and inertia.

**limitation:** The document establishes the proposal and stated assignee, not measured performance. A grant, a drawing and references to known physics do not supply independently replicated force, mass-change or energy-balance data.

### frontier-china-rack: CAS / China Manned Space: electrostatic materials-processing rack

[government](https://csu.cas.cn/gb/zyxw/202305/t20230505_6748857.html) · 2023-04-28 publication

**locator:** Chinese official article on the space-station containerless materials experiment rack; electrostatic positioning and sample-processing account.

**access:** Reused prior audit: complete Chinese article read; institutional program narrative, not raw telemetry or a full program audit.

**summary:** The documented system uses electrostatic positioning for containerless materials research in orbital microgravity, alongside sample processing and observation.

**limitation:** One documented program is not a survey of all Chinese work. Orbital microgravity and electric positioning do not demonstrate switched-off gravity, weightless conditions created on Earth, or a connection to channeling claims.

### frontier-russia-maglev: Russian Science Foundation project 17-19-01527: superconducting magnetic levitation

[government](https://www.rscf.ru/project/17-19-01527/) · 2017 award; recorded work through 2020

**locator:** RSF project metadata, application abstract and reported outputs; Rudnev / MEPhI superconducting tape and permanent-magnet systems.

**access:** Reused prior audit: original Russian funder record read. Listed research papers were not all independently audited.

**summary:** The funded research concerns magnetic levitation systems, superconducting materials, bearings, field behavior and losses.

**limitation:** A funder narrative is not an independent reproduction. The recorded award period is not a claim of current funding; magnetic support does not establish anti-gravity or energy creation.

### frontier-feynman-statmech: Feynman, Leighton and Sands: Boltzmann statistics and thermal equilibrium

[book](https://www.feynmanlectures.caltech.edu/I_40.html) · 1963; Caltech online edition

**locator:** The Feynman Lectures on Physics I, chapter 40, §§40–1 and 40–2, equations 40.1–40.3 and conservative-potential discussion.

**access:** New retrieval: selected author-textbook sections read. Harmonic-trap variance is our explicit reduction of the Boltzmann distribution.

**summary:** In classical equilibrium, position probability depends on exp(−U/kBT). For an assumed harmonic potential U = Kx²/2, the resulting one-axis variance is kBT/K.

**limitation:** This assumes a conservative trap and thermal equilibrium. It does not determine stiffness from an audio frequency and does not predict quantum ground-state occupation, active-flow statistics or performance of an unspecified apparatus.
