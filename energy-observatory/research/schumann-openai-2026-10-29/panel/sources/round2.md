# Research round 2 — attribution, hypotheses and novelty

Reviewer: /root/oct_sources. Date: 2026-10-29. Decision: **admit the finite-band synthetic ambiguity and interference results within their stated assumptions.** The work reproduces established systems mathematics; it neither identifies an actual Schumann source nor establishes novel physics.

## Actual evidence reviewed

I read the producer model, report and structured numerical results, plus the independent verifier report/results. I recomputed the following hashes and checked their source bindings; I did not duplicate the workers' numerical execution.

| Artifact | SHA-256 |
| --- | --- |
| analysis/round2/model.mjs | bc31ad2d8d95ffc6152bdb80ac408c3b277b1669f07fc182f9bcac38760b359d |
| analysis/round2/run.mjs | 92d178a9968da283ad15442e3649d5c17b0efa735f2ba9746c483837ef133668 |
| analysis/round2/results.json | 0beb9e603f0b5ba4756b925c1fc0244ebbb8de3c7f2201efa59a12156eab9819 |
| analysis/round2/report.md | 6345437b0876ab89cac0f4703e3ec3a7d6dbe7486050756864cced690d139d14 |
| verification/round2/comparison-results.json | 8e5c6f5981612d96b8900c7a2b286ea91b0aa82339c3f71918951385fddc3737 |
| verification/round2/report.md | d5a3289cc5771f9154a0843cc697b604a50526e4752c6aa2c2de30473347cdc8 |

The producer passed 36 assertions on a 1–20 Hz inclusive grid with 0.001 Hz spacing. Its unchanged oscillator produces sampled maxima of 7.598, 7.722 and 7.840 Hz under the three selected source colors; receiver color reproduces the corresponding change, whereas constant scaling does not. The tilt-12 maximum occurs at the 20 Hz boundary and is explicitly censored by that band.

The equal-output pair has natural frequencies 7.8 and 10.3 Hz but the same sampled output peak, 7.722 Hz; the reported maximum relative equality residual is approximately 5.56e-16. The verifier uses separate fixtures, including 8/10 Hz transfers, and records 96 API requests, 211 scalar comparisons, nine invalid-input rejections and nine grids, with maximum discrepancy approximately 3.77e-14. These residuals check implementations; they are not proofs over a continuum.

## Exact hypotheses and claim boundary

For the admitted individual oscillators, positive mass, natural frequency and damping make H1 and H2 continuous, finite and nonzero on the compact band. Continuous strictly positive S1 and the nowhere-zero denominator make S2=S1*|H1/H2|² continuous, positive, bounded and integrable there. Substitution gives equal output PSDs throughout the band. This is the written algebraic argument, independently supplied by both workers.

The conclusion is non-uniqueness of this output-only inverse problem **when the source PSD may vary freely within that class**. It does not forbid identification with additional source restrictions, known input or a justified richer measurement model. No outside-band extension, globally causal receiver realization or measured lightning spectrum was established. Coherent multimode sums can have zeros and require a fresh argument before serving as the denominator in this construction.

For one common source, complex modal responses are added before squaring. Uncorrelated inputs of equal PSD instead permit summing individual powers. Their cross-term difference is established interference algebra. Negative cross terms do not make the total PSD negative, create energy, or imply negative mechanical dissipation. The distinct-mode cancellation is at one selected frequency; the identical-mode opposite-sign control has a different, stronger cancellation condition. A null measured projection is not zero energy in all coordinates.

## Bounded prior-art check

[Brincker, Zhang and Andersen (2001), DOI 10.1088/0964-1726/10/3/303](https://vbn.aau.dk/en/publications/modal-identification-of-output-only-systems-using-frequency-domai-2/), institutional author record and abstract, documents longstanding output-only modal identification using spectral-density decomposition. I read the abstract/metadata, not its full derivation. It supplies historical context, not a universal identification theorem imported here.

[Howes, Allen, Farina and Charles (2025), DOI 10.1016/j.bspc.2025.107522](https://pmc.ncbi.nlm.nih.gov/articles/PMC11870678/), sections 2.1.1 and 2.1.4, equations (1)–(6) and Figure 2, separates standard input–output spectral relations, cross-power terms and correlated versus uncorrelated inputs. Its FRF interpretation requires linear time invariance, negligible input noise, output noise uncorrelated with the input, and no omitted correlated inputs. These conditions matter for any later calibrated-response proposal. The article appeared in 2025; June 2026 is its PMC availability date. Its newly proposed contribution-coherence measures are not implemented or claimed by our work.

This limited review does not identify the earliest publication of every algebraic identity. It provides no support for originality of the ambiguity, PSD multiplication or interference formulas. The local numerical examples and evidence packaging are reproducible applications, not a new fundamental result or validation of the OpenAI releases.

## Remaining discriminator

Velocity and displacement of the same coordinate remain redundant because their PSD ratio is omega². A useful later test needs calibrated complex response to a known applied input, explicit phase/gain conventions and a declared single-mode model, with an independent held-out measurement that can reject that model. Source-noise assumptions must be stated before interpreting coherence or a cross-spectrum. No Round 3 test was run in this review.

