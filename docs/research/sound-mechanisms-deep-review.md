# Sound mechanisms: measurements, causal gaps and counterevidence

Reviewed 2026-10-16. This is a bounded critical reading guide supporting `src/sound-research/mechanisms.ts`, not an exhaustive systematic review, clinical recommendation, or validation of OpenSync presets. The accompanying evidence catalog covers additional 2024–2026 listening studies. Recent publication date does not repair missing controls, uncertain access or an outcome mismatch.

The useful scientific question is which link in a proposed chain has actually been measured. An acoustic construction, sensory response, subjective experience and clinical outcome require different evidence. A positive result at one link cannot substitute for the remaining links. Conversely, a nonsignificant result with wide uncertainty cannot establish that every effect is absent.

## 1. Airborne sound and the ear

The established chain is air-pressure variation → eardrum and middle-ear motion → cochlear mechanics → hair-cell transduction → auditory-nerve signaling. [NIDCD describes this pathway](https://www.nidcd.nih.gov/health/how-do-we-hear). Reaching the auditory system explains hearing; a further claim about repair, mood or illness needs an independently tested causal bridge.

For a linear approximation to delivery,

\[
P(f)=H(f)X(f),\qquad
p_{\mathrm{rms}}=\sqrt{\frac{1}{T}\int_0^T p(t)^2dt}.
\]

`X` is a digital spectrum, `H` is the delivery transfer function, and `P` is pressure at a specified measurement location. The transfer function includes equipment and coupling assumptions. An app does not know it from a volume slider. The conversion

\[
L_p=20\log_{10}(p_{\mathrm{rms}}/p_{\mathrm{ref}})
\]

requires measured pressure and a reference. Digital dBFS describes sample level relative to digital full scale; it cannot be relabeled as acoustic SPL. [NIDCD's hearing-risk explanation](https://www.nidcd.nih.gov/health/noise-induced-hearing-loss) concerns actual exposure, including level and duration. No calibrated exposure estimate is available from these presets.

**Falsifiable delivery claim:** a recorded output agrees with the specified spectrum within a declared measurement tolerance. A reproducible disagreement rejects the delivery claim. Agreement does not test any biological benefit. Frequency agreement alone also fails to identify coupling strength: two systems can share a numerical frequency while interacting negligibly.

## 2. Rhythmic sound and auditory steady-state responses

An amplitude-modulated signal can be written

\[
x(t)=A[1+m\cos(2\pi f_m t)]\cos(2\pi f_c t).
\]

Expanding this identity gives a carrier at `f_c` and sidebands at `f_c ± f_m`. An envelope rate is not necessarily a spectral line at that rate. For two nearby tones, the beating rate is `|f₂−f₁|`. A binaural presentation separates the tones between ears; an acoustic mixture combines them before auditory processing. Neither arithmetic identity contains an equation for a person's mood.

[Orozco Pérez, Dumas and Lehmann (2020)](https://www.eneuro.org/content/7/2/ENEURO.0232-19.2020) measured auditory responses and connectivity patterns, with stronger ASSR for monaural beats and no mood modulation. [López-Caballero and Escera (2017)](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2017.00557/full) reported a small controlled null study for EEG-band power and arousal measures. Differences in neural metric, input and analysis matter when comparing their findings.

One neural observable is phase-locking value:

\[
\mathrm{PLV}=\left|\frac{1}{N}\sum_{k=1}^{N}e^{i(\phi_{\mathrm{EEG},k}-\phi_{\mathrm{stim},k})}\right|.
\]

This requires recorded EEG and stimulus phases. It describes consistency in the chosen observations; repeated evoked responses can also produce consistency. It does not demonstrate a global neural state. Common input, volume conduction, eye and muscle activity, filtering and selective analysis can complicate interpretation. Apparent functional connectivity does not itself establish a directed causal connection.

**Hypothesis and challenge:** a particular acoustic comparison changes a prespecified neural endpoint and independently changes a prespecified behavioral endpoint. Analyze these as separate claims in existing data. A precise behavioral interval excluding a meaningful benefit challenges the behavioral claim even when the neural endpoint changes. It does not erase the neural finding.

## 3. Music, reward, context and autonomic measures

Music contains structured timing, timbre and learned meaning. A useful causal map includes sound → attention/reward/expectation → experience, with possible changes in breathing and cardiac measures. Preference, prior associations and context can affect several nodes. This map is a set of candidates, not an identified universal pathway.

[Ferreri et al. (2019)](https://www.pnas.org/doi/10.1073/pnas.1811878116) used a blinded pharmacological comparison supporting a dopamine contribution to musical pleasure and motivation. [Lunde et al. (2022)](https://www.frontiersin.org/journals/pain-research/articles/10.3389/fpain.2022.734999/full) found that tested antagonists did not abolish music-related analgesia, while expectations related to reported relief. The second result limits a simple transfer from reward findings to a pain mechanism; it does not establish that those signaling systems never contribute.

A difference in changes,

\[
\Delta=\overline{(Y_{post}-Y_{pre})}_{music}
-\overline{(Y_{post}-Y_{pre})}_{control},
\]

is an outcome contrast. Random allocation, missing-data handling and the chosen comparator determine how strongly it supports a causal interpretation. A pre/post improvement without a comparison can reflect time, regression to the mean or expectation.

Similarly,

\[
\mathrm{RMSSD}=\sqrt{\mathrm{mean}[(RR_{i+1}-RR_i)^2]}
\]

describes successive heartbeat-interval variation. Breathing, movement, posture and recording artifacts matter. It is not a direct measurement of a particular nerve or neurotransmitter. Showing that music changes both a rating and HRV does not establish that HRV mediated the rating change.

**Hypothesis and challenge:** in an existing suitable dataset, preference/context variables improve held-out prediction beyond a frequency-only model. If they do not improve prediction with adequate precision and measurement quality, that particular predictive claim weakens. Either result remains a prediction result rather than proof of a biochemical mechanism. The lab must not silently convert correlation into a physiological explanation.

## 4. Closed-loop sleep research and open-loop sound

Closed-loop research estimates a current state from measurements and times an event relative to that estimate. Open-loop sound uses a clock independent of the sleeper's EEG. Copying a sound or repetition rate cannot copy the information supplied by feedback.

For a recorded event, one can assess

\[
e=\mathrm{wrap}(\phi_{EEG}(t_{event})-\phi_{target}).
\]

This is an evaluation of measured timing. Sensor latency, estimator error, event timestamps, state classification and artifacts affect it. No EEG means no observed EEG phase error. An oscillator animation is not a substitute.

[Ngo et al. (2013)](https://pubmed.ncbi.nlm.nih.gov/23583623/) reported enhanced memory. [Henin et al. (2019)](https://www.eneuro.org/content/6/6/ENEURO.0306-19.2019) reported stronger sleep oscillations without memory improvement in two experiments. [Perrault et al.'s cited 2025 preprint](https://www.medrxiv.org/content/10.1101/2025.03.04.25321710v1) likewise separated an acute oscillatory response from absent single-night sleep/memory benefit. The mixed outcome record makes neural response a poor guarantee of behavioral benefit.

**Hypothesis and challenge:** a claimed timing algorithm tracks events within a declared error distribution on held-out archived EEG. Replay can test that engineering claim without delivering sound to anyone. A separate outcome claim requires controlled outcome evidence. Reliable timing or a larger oscillation alone cannot establish improved sleep. A sufficiently precise lack of meaningful benefit rejects the assertion that this intermediate response guarantees that benefit; a wide interval leaves uncertainty.

## 5. Tactile vibration and somatosensory pathways

Contact vibration and airborne audio have distinct physical interfaces. For measured displacement `z(t)`, acceleration is

\[
a(t)=\frac{d^2z(t)}{dt^2}.
\]

The same repetition rate can accompany very different displacement, acceleration, contact force and coupling. A rendered audio waveform establishes none of those body-contact quantities.

Skin mechanoreception is a plausible first link. A proposed later link through perceived body state, attention or expectation needs its own evidence. [Azevedo et al. (2017)](https://www.nature.com/articles/s41598-017-02274-2) studied a product-specific wearable during anticipatory stress. [Lee et al.'s 2025 arXiv version](https://arxiv.org/html/2507.02432v1) includes two smartwatch studies. In its second study, reported physiological and behavioral sleep-onset differences were nonsignificant; the sleep measure was a tapping proxy rather than polysomnography. The full results constrain stronger interpretations of relaxation-related trends.

**Hypothesis and challenge:** two claimed equivalent delivery systems produce equivalent measured mechanical signals within a declared tolerance. Bench disagreement rejects that equivalence without requiring a biological experiment. Even bench agreement would not validate subjective or clinical equivalence. Device-off comparisons may leave perceptibility and expectancy uncontrolled. Weak or noisy null outcomes should be reported as uncertain rather than promoted to success or universal disproof.

## 6. Medical ultrasound and the modality boundary

An ideal homogeneous linear medium satisfies

\[
\frac{\partial^2p}{\partial t^2}=c^2\nabla^2p.
\]

This equation states assumptions about wave propagation. It omits the information needed for a real device's field and does not predict a clinical response. No tissue parameters, target selection, exposure design or treatment calculations are supplied here.

The [FDA record for a specific MR-guided focused-ultrasound system](https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P150038S037) documents a medical device, not general efficacy of sound. A different transducer, coupling path or intended use breaks that evidentiary transfer.

[Kop et al. (2024)](https://elifesciences.org/articles/88762) showed that auditory confounds could account for tested effects attributed to transcranial ultrasound. This is useful counterevidence about mechanism attribution in the tested setting. It neither disproves all ultrasound action nor validates ordinary audible tones.

**Hypothesis and challenge:** the measured effect is specific to a proposed direct ultrasound route. If a matched sound-only control reproduces the effect, that comparison contradicts the claimed specificity. This is a question for critical reading and reanalysis of existing research, not a self-experiment. Medical-device evidence stays attached to the actual device, population and measured outcome.

## Interpreting a result without changing the question

| Observation | What it establishes | What remains untested |
| --- | --- | --- |
| Spectrum agrees with exported samples | The digital construction matches its specification | Pressure at the ear and any biological response |
| Calibrated acoustic measurement | A physical signal at the measurement location | Neural processing and subjective benefit |
| EEG response changes | A specified recorded neural metric differs | Global brain state, causal pathway and useful outcome |
| A rating improves relative to a comparator | A reported outcome difference in that setting | Frequency specificity, durability and clinical recovery |
| A biomarker changes | A measured intermediate endpoint differs | Whether changing that endpoint improves health |
| A device is authorized for an indication | Device-specific regulatory status | Another device, audio preset or intended use |

For a claim of practically useful benefit, define the smallest relevant effect before looking at results. An uncertainty interval that excludes that benefit is evidence against that claim. An interval spanning both negligible and useful effects is inconclusive. A p-value above a threshold alone establishes neither equivalence nor absence. Subgroup selection, multiple endpoints and analysis flexibility can create apparent success unless accounted for. A mechanism remains a hypothesis when its decisive intermediate variables were never measured.

The lab's falsifiable propositions are therefore bounded: verify physical delivery; test predictive or timing models on existing data; distinguish separate physiological and experiential endpoints; and inspect appropriate controls. No synthetic physiology, cure score, or preset efficacy is inferred from the displayed mathematics.

## Source access and search limits

Searches covered primary auditory-beat studies, reward and expectancy experiments, sleep feedback studies, tactile-device research and ultrasound auditory confounds, with targeted 2024–2026 searches and negative-result queries. Official NIH/FDA pages provide anatomical or regulatory context. Access was checked on 2026-10-16. This was a targeted review without a preregistered search strategy, complete database export, exhaustive screening or meta-analysis. It cannot support a claim to cover the entire state of the art.

| Source | Access actually checked | Scope retained |
| --- | --- | --- |
| NIDCD hearing and noise pages | Complete public explanatory pages | Hearing pathway; exposure/measurement distinction |
| López-Caballero & Escera 2017 | Publisher full text, methods/results/discussion | Small study; setting-specific null |
| Orozco Pérez et al. 2020 | Indexed full-text methods/results/discussion; continuous eNeuro/PMC access blocked | Auditory response and mood are separate |
| Ferreri et al. 2019 | Indexed full-text methods/results; publisher access intermittent | Music pleasure and motivation; no treatment transfer |
| Lunde et al. 2022 | Publisher full text, methods/results/discussion | Mechanistic counterpoint and expectation association |
| Ngo et al. 2013 | PubMed abstract | Positive reported outcome only; detailed appraisal limited |
| Henin et al. 2019 | Indexed full-text methods/discussion; continuous access blocked | Oscillation/outcome dissociation |
| Perrault et al. 2025 | Abstract and indexed opening sections of medRxiv v1 | Cited version is a preprint; limited appraisal |
| Azevedo et al. 2017 | Indexed full-text methods/discussion; continuous Nature access blocked | Product-specific study; no headphone equivalence |
| Lee et al. 2025 | Complete arXiv v1 HTML, including results and limitations | Cited preprint version; sleep proxy and null results visible |
| Kop et al. 2024 | Indexed full-text results/discussion; continuous eLife access blocked | Auditory confound in the tested comparison |
| FDA P150038/S037 | Official device record | Factual device distinction only |

Indexed full-text sections are more informative than a title or abstract but are not a claim to have read the entire continuous paper, supplements, raw data or every correction. Preprints remain labeled. Commercial-device findings are not treated as independent product validation. No paywall was bypassed, no paid recording was copied, and unavailable material was not silently counted as reviewed.
