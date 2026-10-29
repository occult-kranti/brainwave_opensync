# Independent skeptic: prior-art gate before any next three rounds

Cutoff: 2026-10-29. This is a separate literature/claim gate, not a fourth research round or an implementation acceptance receipt. I searched primary publications independently and did not read another reviewer's prior-art report before writing this verdict. Source depth and retrieval failures are recorded below. “Recent” is not equivalent to “best,” and this selected audit is not an exhaustive SOTA ranking.

**NO-GO for presenting the current source-compensation ambiguity, known-mass oscillator inverse, or constant-gain qualification as new mathematical discoveries.** They follow directly from established spectral analysis and inverse-receptance relations. **GO for retaining the verified teaching/benchmark implementation.** A further research cycle needs a distinct claim, an assumptions-matched classical baseline and an explicit novelty/utility test before experiments begin. This gate does not depend on whether the R3 implementation repairs pass.

## Closest prior art and exact mapping

| Our proposition | Inspected prior source and locator | What the comparison establishes |
| --- | --- | --- |
| Output PSD factors into source PSD and squared transfer | Brincker, *Some Elements of Operational Modal Analysis* (2014), Sec.4, Eq.(16), printed p.3; source-filter discussion, Sec.1 and Fig.1, pp.1–2. [P1] | The scalar form is S_y=abs(H)^2 S_x. Our S2=S1 abs(H1/H2)^2 is immediate algebra in this established relation; compact-band positivity is elementary continuity. A useful counterexample, not an established first theorem. |
| Colored input can be confused with structural modes | Same source, Sec.1; Cara–Juan–Alarcón (2017), publisher abstract. [P1,P5] | Loading-filter and structural poles were already recognized as separable only with additional assumptions/information. The 2017 paper proposes joint records under varying inputs; its full proof was not inspected here. |
| Known-mass complex inverse recovers omega0 and gamma | Kim–Eun (2013), Sec.2.1, Eqs.(2a),(3a), definition immediately after (3b). [P2] | Published H=(K−Omega^2 M+i Omega C)^−1. Put M=m, K=m omega0^2, C=2m gamma: real/imaginary parts of 1/H give exactly our formula. This is direct specialization, not a title similarity. |
| Two-frequency real inverse-response slope separates poles from constant gain | The same prior dynamic-stiffness identity. [P2] | For H_meas=A H, 1/H_meas=(m/A)(omega0^2−omega^2+2i gamma omega). The real slope yields m/A; intercept/slope and imaginary part yield the poles. This is an elementary gain qualification, not a new inverse method. |
| Output-only modal identification can work | Brincker–Zhang–Andersen, COST F3 proceedings (2000), printed pp.274–276, theoretical background and identification algorithm. [P3] | The spectral-matrix decomposition explicitly states white-noise loading, light damping and orthogonality of close modes for its exact case; otherwise the decomposition is approximate. It estimates modal frequency/damping from the extracted component. Thus a universal impossibility claim is false. |
| Unknown-input inverse problems can become identifiable under restrictions | Li–Lee–Bresler, arXiv v2 (2015), Sec.2.2 and Theorems3.1–3.3, printed pp.5,9–10; journal publication 2017. [P4] | Circular blind deconvolution has identifiability up to scaling under specified subspace/sparsity and generic-dictionary assumptions. This is related counterevidence to sweeping impossibility, not a theorem automatically applicable to our PSD or an Earth cavity. |

The spectral covariance relation also contains coherent cross terms; setting cross-source covariance to zero gives the uncorrelated sum. Our phase/cancellation controls make this distinction inspectable but do not discover interference. The prior-art conclusion concerns the mathematical content; it does not claim to identify the earliest wording of every equation or deny the value of the project’s reproducible audit trail.

## Direct counterexample to “output-only identification is always impossible”

This is a logical qualification of our existing formulas, not a newly executed research result. Restrict to a calibrated displacement readout, one stable oscillator, flat unknown positive force PSD, no additive noise and an exact spectrum. Write x=omega^2. Absorb unknown source level, constant gain and mass scale into C>0:

`S_y(omega)=C/[x^2+a x+b]`,

where `a=4 gamma^2−2 omega0^2` and `b=omega0^4`.

Then 1/S_y is a quadratic in x. Its three coefficients, obtainable from an exact open interval or three distinct exact x values, determine their ratios a and b. Positive omega0 and gamma are uniquely recovered as `omega0=b^(1/4)` and `gamma=sqrt(a+2 sqrt(b))/2`. The unrestricted compensation source from R2 generally violates the flat-source restriction. Consequently this restricted identification and R2's exact non-identifiability are consistent.

This argument is not a practical three-sample prescription: finite record noise, leakage, additive sensor noise, unknown coloring, multimode response and ill-conditioning destroy that ideal simplification. A Bayesian prior or regularizer also does not turn a broad non-identifiable likelihood into data-established uniqueness; its constraint must be exposed and checked.

## Recent research and what remains uninspected

- O’Connell–Champneys–Rogers, *A new perspective on Bayesian operational modal analysis*, MSSP236,112949, online26June2025, issue1August2025. Primary publisher/author-repository metadata and indexed abstract discuss output-only uncertainty; the author-PDF retrieval timed out. Treat it as a required contemporary baseline lead, not a reproduced theorem or benchmark. [P6]
- Guan–Zhu–Wu–Xu, *A Bayesian modal identification method considering latent excitation effect based on physics-data fusion model*, MSSP257,114602,1August2026. The indexed primary abstract/introduction describe latent excitation variation, a GP model, joint inference and synthetic/field validation. Direct publisher retrieval returned403. Its exact assumptions, code and reported improvements require full-text audit before claiming to improve on it. [P7]
- Lu–He–Chen–Zheng, *Operational modal parameter identification with colored noise excitation*, CJA34(2),288–300 (2021), DOI10.1016/j.cja.2020.09.006. The indexed publisher abstract claims applicability under specified colored-input conditions; direct body retrieval returned403. This is another counterexample lead to broad impossibility, not an imported guarantee for our arbitrary source class. [P8]

These studies make “add uncertainty,” “handle colored excitation,” or “use multiple records” insufficient novelty statements. A novel result would need a precise, literature-compared residual problem. Current OpenAI announcements provide no inspected theorem that turns these standard constructions into new physics, an energy source, a Schumann anomaly, or a Yang–Mills bridge.

## Kill criteria and next-cycle decision

1. **Kill the novelty claim** if its conclusion follows by scalar specialization or algebra from the PSD or dynamic-stiffness identities above. Preserve it as a benchmark and move to a distinct question.
2. **Kill universal identifiability/impossibility language** if its assumptions omit source class, covariance, calibration, noise, observed channels or modal class. A claim must survive both the compensation counterexample and the restricted output-only example.
3. **Kill a proposed improvement** if it only outperforms a deliberately misspecified peak picker. Compare an assumptions-matched classical fit, relevant output-only method and an uncertainty-aware baseline, using untouched test cases and predeclared metrics.
4. **Kill an Earth-event conclusion** without calibrated station bytes, timestamps, quality control, baseline, uncertainty and nuisance modeling. A fully populated metadata form authenticates none of those contents.
5. **Kill a physical-energy gain claim** without the full input/storage/loss/load budget. No spectroscopy or theorem headline changes that requirement.
6. **Do not start three new “discovery” rounds on the present core claim.** A bounded next cycle may proceed as engineering replication/benchmarking after choosing a concrete target and securing its required data. A possible new mathematical direction—parameter regions under externally justified bounds on source color and calibration—needs its own close prior-art comparison before being called open or novel. None is solved or executed in this gate.

## Primary bibliography and reading depth

- **P1:** Rune Brincker (2014), DOI10.1155/2014/325839. [Publisher PDF](https://onlinelibrary.wiley.com/doi/epdf/10.1155/2014/325839). Read introduction/source-filter diagram and Sec.4 Eq.(16); inspected output-only method sections. Not a full proof or data reproduction.
- **P2:** Jin Bong Kim and Hee-Chang Eun (2013), [*Identification of parameter matrices using estimated FRF variation*](https://www.extrica.com/article/14434). Read introduction and Sec.2.1 through the explicit matrix-response definition after Eq.(3b). Exact scalar substitution above is this reviewer's comparison; no matrix-expansion algorithm reproduced.
- **P3:** Rune Brincker, Lingmi Zhang, Palle Andersen (2000), [author-institution proceedings PDF](https://vbn.aau.dk/ws/files/203990023/Modal_Identification_of_Output_Only_Systems_using_Frequency_Domain_Decomposition.pdf). Read pp.273–276 and conclusion/harmonic cautions onp.280. This is the2000 conference version, not the separate2001 journal article DOI10.1088/0964-1726/10/3/303; the journal’s institutional record was inspected separately.
- **P4:** Yanjun Li, Kiryung Lee, Yoram Bresler, [arXiv:1507.01308v2](https://arxiv.org/pdf/1507.01308),23December2015; journal DOI10.1109/TIT.2017.2689779 (2017). Read problem definition, genericity/scaling qualifications and Theorems3.1–3.3; did not independently verify their complete proofs or stability theorem.
- **P5:** Javier Cara, Jesús Juan, Enrique Alarcón (2017), [publisher record](https://www.sciencedirect.com/science/article/pii/S1877705817336834), DOI10.1016/j.proeng.2017.09.233. Publisher-indexed abstract and author conference list only; direct article open403.
- **P6:** [Publisher record](https://www.sciencedirect.com/science/article/pii/S0888327025006508); [author-institution record](https://eprints.whiterose.ac.uk/id/eprint/228646/), DOI10.1016/j.ymssp.2025.112949. Indexed metadata/abstract only; article403 and repository/PDF timeout.
- **P7:** [Publisher record](https://www.sciencedirect.com/science/article/pii/S0888327026007594), DOI10.1016/j.ymssp.2026.114602. Indexed publisher metadata, abstract and introduction excerpts only; direct article403.
- **P8:** [Publisher record](https://www.sciencedirect.com/science/article/pii/S1000936120304362), DOI10.1016/j.cja.2020.09.006. Indexed publisher abstract only; direct article403.

Search families included operational modal analysis, unknown/colored excitation, PSD factorization, blind-deconvolution identifiability, inverse receptance, dynamic stiffness, and2025–2026 Bayesian excitation-aware modal identification. Secondary aggregators were discovery leads only. This gate establishes close prior overlap sufficient to reject our present core novelty claims; it does not claim comprehensive coverage or first historical priority.
