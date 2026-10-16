# Acoustic levitation: primary-source audit and model boundaries

Audit date: 2026-10-16. This is a selected reading of eight sources, with recent primary research verified through August 2026. It is not a systematic review or a claim to have read every historical work, patent, supplement or dataset. The browser laboratory evaluates an ideal mechanical model. It neither drives an ultrasonic array nor demonstrates physical levitation through ordinary audio playback.

The most useful distinction is between a field calculation, a measured force, and a stable physical trajectory. These are related but different observations. A correct standing-wave plot alone establishes none of the other two. Published experiments support acoustic momentum transfer in particular apparatuses; they do not support gravity cancellation, energy creation or a medical effect.

## Search and access record

Searches used the primary title, DOI and author names for Gor’kov, Settnes–Bruus, TinyLev, Ultraino, direct force measurements, acoustic streaming and Bessel-beam levitation. Publisher and institutional records verified publication identity. Current work was checked with authoritative web searches rather than inheriting dates from older preprints. Repository contents were inspected through GitHub, including an immutable commit and license. Commercial patent text was retained as a disclosure with a different evidence status from an experiment.

| Source and version | What was actually read | What the source contributes |
| --- | --- | --- |
| [Gor’kov, Doklady AN SSSR 140(1), 88–91 (1961)](https://www.mathnet.ru/rus/dan25473) | Original four-page Russian scan; equations 12–13 visually checked on p. 90; qualifications and references. The 1962 English translation was not read. | Ideal-fluid, small-particle radiation potential. Its qualifications include the near-plane-traveling-wave case, where a discarded scattering term becomes important. |
| [Settnes and Bruus, Physical Review E 85, 016327 (2012)](https://doi.org/10.1103/PhysRevE.85.016327) | [Author PDF, arXiv:1110.6037v1](https://arxiv.org/pdf/1110.6037v1): assumptions, derivation, inviscid limit, standing-wave balance. | Viscous boundary-layer corrections. Its liquid-focused thermal omission prevents treating it as a complete thermoviscous air model. |
| [Marzo, Barnes and Drinkwater, TinyLev (2017)](https://doi.org/10.1063/1.4989995) | Publisher text: introduction, design, field/force simulations and reported demonstrations. | A particular opposed-array apparatus. Its geometry and calibrated field cannot be replaced by a frequency label. |
| [Ultraino, IEEE TUFFC 65(1), 102–111 (2018)](https://doi.org/10.1109/TUFFC.2017.2769399) and [repository](https://github.com/asiermarzo/Ultraino) | Journal abstract/metadata; README, license and selected field/potential/force code. Full journal text unavailable in this audit. | Inspectable model implementation and phased-array architecture. No code was executed or copied. |
| [Brown et al., RSI 95, 094901 (2024)](https://doi.org/10.1063/5.0225745) | [Author HTML v1](https://arxiv.org/html/2406.18710v1): equations 1–3, controls, calibration, cavity mapping, secondary forces, modeling and conclusions. Publisher publication identity checked. | Calibrated cantilever measurements distinguish force from pressure. Probe effects and drift require controls. |
| [Stone et al., npj Acoustics 2, 4 (2026)](https://doi.org/10.1038/s44384-025-00040-7) | Final full article: results, limitations, methods, analysis and availability. Linked data not reanalyzed. | Streaming produces additional flow. The 2D model and optical measurement limits leave discrepancies; time samples are not independent replication. |
| [Koroyasu et al., PRL 137, 094001 (2026)](https://doi.org/10.1103/pfkh-4x7j) | Final PDF: results, Discussion and End Matter. Supplementary movies and dataset not reproduced. | High-pressure-core Bessel trapping challenges a universal pressure-node rule. Streaming and weak reflections affect axial behavior; enhanced stability remains partly unexplained. |
| [Hansson, US20240029705A1 (2024)](https://patents.google.com/patent/US20240029705A1/en) | Published application abstract, description for figures 1–3 and claim 1. | Reflector-relative positioning proposal. No legal-status opinion, independent validation or manufacturing permission follows from publication. |

The final publication dates for Brown, Stone and Koroyasu are respectively 2024-09-04, 2026-02-02 and 2026-08-24. A page generation timestamp is not substituted for a paper's publication date. The original Gor’kov paper is Soviet academic research, not evidence of a present Russian government program. Its institutional archive establishes provenance, not a hidden application.

## Reconstructing the ideal 1D model

This algebra is our explicit reduction of the radiation-potential model to a single ideal standing plane wave. It is not a reconstruction of the complete experimental apparatuses above. Let the upward coordinate be \(z\), particle radius \(a\), volume \(V=4\pi a^3/3\), fluid density \(\rho_0\), particle density \(\rho_p\), and sound speed \(c_0\). Define \(k=\omega/c_0\), \(\theta=kz+\phi\), and compressibility \(\kappa_0=1/(\rho_0c_0^2)\).

Choose **peak standing-wave pressure amplitude** \(p_A\), not RMS amplitude and not the amplitude of either constituent traveling wave:

\[
p(z,t)=p_A\cos\theta\cos\omega t,
\qquad v(z,t)=\frac{p_A}{\rho_0c_0}\sin\theta\sin\omega t.
\]

These fields obey the linear momentum equation. Time averaging one cycle supplies the factor \(1/2\) in each squared field. The dimensionless compressibility and density coefficients are

\[
f_\kappa=1-\frac{\kappa_p}{\kappa_0},\qquad
f_\rho=\frac{2(\rho_p-\rho_0)}{2\rho_p+\rho_0},\qquad
\Phi=\frac{f_\kappa}{3}+\frac{f_\rho}{2}.
\]

The potential is

\[
U=V\left[\frac{f_\kappa\langle p^2\rangle}{2\rho_0c_0^2}
-\frac{3\rho_0f_\rho\langle v^2\rangle}{4}\right]
=VE_{ac}\left[f_\kappa\cos^2\theta-\frac32f_\rho\sin^2\theta\right],
\quad E_{ac}=\frac{p_A^2}{4\rho_0c_0^2}.
\]

Differentiating, rather than choosing attractive-looking nodes, gives

\[
F_{ac,z}=-\frac{\partial U}{\partial z}
=3VkE_{ac}\Phi\sin(2\theta).
\]

Brown's equation 2 uses \(f_0=f_\kappa\), \(f_1=f_\rho\), but its named contrast factor is \(f_0+3f_1/2=3\Phi\). Mixing the two conventions creates a factor-of-three error. Gor’kov's original equation 12 has equivalent potential coefficients; notation and publication editions differ.

| Quantity | Dimension check |
| --- | --- |
| \(E_{ac}\) | \(\mathrm{Pa^2}/(\mathrm{kg\,m^{-3}}\,\mathrm{m^2s^{-2}})=\mathrm{Pa}=\mathrm{J\,m^{-3}}\) |
| \(U\) | \(\mathrm{m^3}\,\mathrm{J\,m^{-3}}=\mathrm{J}\) |
| \(F_{ac,z}\) | \(\mathrm{m^3}\,\mathrm{m^{-1}}\,\mathrm{J\,m^{-3}}=\mathrm{N}\) |
| Axial stiffness \(K_z\) | \(\mathrm{N\,m^{-1}}\) |

## Balance is necessary; restoring behavior is another condition

Including hydrostatic buoyancy gives effective weight \(W=(\rho_p-\rho_0)Vg\). With \(A=3VkE_{ac}\Phi\),

\[
F_{tot}=A\sin(2\theta)-W,\qquad
\sin(2\theta_*)=W/A.
\]

For nonzero \(A\), \(|W|\leq|A|\) is the existence condition. A root is locally restoring along the axis only if

\[
K_z=-\left.\frac{\partial F_{tot}}{\partial z}\right|_{z_*}
=-6Vk^2E_{ac}\Phi\cos(2\theta_*)>0.
\]

At the equality \(|W|=|A|\), stiffness is zero. Labeling that boundary as a stable trap would be wrong. For positive contrast without gravity, a pressure node is an axial potential minimum. At the exact node, the radiation force is zero; a nonzero weight therefore requires a displaced equilibrium. Negative contrast exchanges the preferred positions. Zero contrast removes the leading-order force, rather than creating a special levitation frequency.

Near a restoring root, a separate dynamical approximation is \(m\ddot\xi+b\dot\xi+K_z\xi=0\). Without damping, it predicts bounded local oscillation rather than settling. An assumed damping term does not account for every streaming force. An ideal 1D wave has no transverse confinement, so this calculation cannot certify a 3D trap. More generally one needs the full force Jacobian, coupling between axes and the relevant dynamics.

Particle volume cancels from the ideal force-to-weight ratio. This does **not** imply that arbitrary particle sizes levitate equally: the approximation itself fails as scattering, shape, loading and material-response effects change. Equally, varying a digital amplitude does not determine \(p_A\); the speaker, array, geometry and calibration are absent from a digital signal's units.

## Assumptions and useful counterexamples

The model requires a small sphere relative to wavelength, weak acoustic perturbations, an idealized single incident field, negligible higher-order scattering and sufficiently slow particle motion for cycle averaging. The chosen browser cutoff \(ka\leq0.3\) is a conservative interface convention, not a published universal accuracy guarantee. No fixed cutoff validates every material or boundary condition.

Viscous thickness scales as \(\delta=\sqrt{2\nu/\omega}\). An inviscid approximation needs more than small \(ka\): \(\delta/a\), thermal boundary layers, absorption and material behavior matter. The broader [Karlsen–Bruus thermoviscous paper](https://doi.org/10.1103/PhysRevE.92.043010) was located and its abstract/introduction inspected as a follow-up lead; its full derivation was not audited or implemented. Nothing here models biological samples.

Four failure cases keep the interpretation honest:

1. A force-balanced root with the wrong slope is unstable; a pressure plot can hide that distinction.
2. A perfect axial wave may support weight locally while leaving a particle free to escape sideways.
3. Multiple objects scatter sound and alter each other's forces; adding independent point-particle results need not reproduce that interaction.
4. A velocity-gradient term can favor a high-pressure region in another field geometry. The Bessel result does not contradict the restricted 1D derivation; it rejects extending its node rule to all fields.

Radiation force comes from momentum exchange with the driven acoustic field and its surroundings. A stationary supported object has zero mechanical work rate \(\mathbf F\cdot\mathbf v\), but the apparatus can still consume power through dissipation and sound radiation. Static force balance is therefore neither a power-efficiency measurement nor evidence of free energy.

## Newton and the documented historical chain

The relevant Newton connection is methodological. In [De motu corporum in gyrum, late 1684](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00089), the inspected Theorem 2 corollaries and Theorem 3 connect motion with force under specified geometric and temporal assumptions. Our modern adaptation is to infer a force model, calculate consequences, then test those consequences with an independent observable. Newton did not supply this acoustic radiation potential or the modern array mechanism.

Gor’kov's inspected bibliography cites King and Yosioka–Kawasima, and the modern sources identify that scattering lineage. The term “Rayleigh limit” denotes the small-particle approximation here; it does not certify a close reading of Rayleigh's books. This audit does not invent a direct Newton→Tesla→Gor’kov influence chain from shared vocabulary such as force, resonance or vibration. Historical influence needs documentary evidence; mathematical analogy needs an explicit mapping and its limits.

## Three proposed comparisons

These are hypotheses and study designs, not completed experiments or measured results. The implementation exposes their predictions, controls, measurements, falsifiers and limitations separately.

**1. Independent gradient calculation.** Compare the analytic force above with a separately computed finite-difference gradient of the potential. Check numerical convergence, periodicity, zero-pressure and zero-contrast limits, and stiffness classification at the force ceiling. A persistent disagreement rejects the implementation. Agreement establishes mathematical consistency only.

**2. Force and trajectory as separate observables.** Begin with licensed published data. Fit one observable and hold another condition out before fitting. Compare force profiles, equilibrium displacement and restoring stiffness with propagated calibration uncertainty. A later qualified-laboratory study could use an enclosed apparatus, independent force measurement and optical tracking. Probe-present checks, background forces, drift monitoring and independently repeated runs are essential conceptual controls. Systematic held-out errors reject that model in the tested range; a null result retains its uncertainty and detection limit.

**3. Competing explanations for residual error.** Compare radiation-only predictions with models whose airflow and reflection terms are constrained by independent observations. Hold field calibration and test conditions fixed across the comparison. A model that improves only after every condition is refitted has not demonstrated explanatory prediction. Failure to improve within uncertainty leaves the mechanism unresolved rather than proving it absent. This app does not implement a streaming or full reflection solver.

High-output airborne ultrasound requires dedicated apparatus and professional acoustic assessment. These study concepts deliberately specify observables and controls rather than voltages, array-driving sequences or exposure settings. Browser controls remain an educational mathematical interface.

## Repository and reuse audit

Ultraino was inspected at [commit 0d6d1f724f54ae9fdcbcc1e6d3527468f67f0715](https://github.com/asiermarzo/Ultraino/commit/0d6d1f724f54ae9fdcbcc1e6d3527468f67f0715), dated 2025-05-20. The inspected [CalcField.java](https://github.com/asiermarzo/Ultraino/blob/0d6d1f724f54ae9fdcbcc1e6d3527468f67f0715/AcousticFieldSim/src/acousticfield3d/algorithms/CalcField.java) uses complex source summation, a directivity approximation, a pressure/velocity potential and numerical gradients. Its [MIT LICENSE](https://github.com/asiermarzo/Ultraino/blob/0d6d1f724f54ae9fdcbcc1e6d3527468f67f0715/LICENSE) was read. No code, binaries, hardware files or figures were imported; dependency licenses were not audited.

Brown's inspected author version is marked CC BY-NC-SA 4.0; Stone's final article is CC BY-NC-ND 4.0; Koroyasu's final paper is CC BY 4.0. This delivery uses original short factual summaries and independently written algebra, with source links. It reproduces no figures. Stone's published data link is [Figshare 10.6084/m9.figshare.28657484](https://doi.org/10.6084/m9.figshare.28657484); the article's code-availability text still describes a future deposit. Data availability is recorded separately from actual download, execution or reproduction. Those steps remain unperformed.
