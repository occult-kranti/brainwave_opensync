# Round 5 contract — hidden information and leakage

Fixed known-law probability benchmark, no human sessions. Inputs: Nfixedtrials,K>=2 equiprobable unpredictable targets, objective correctness H. Under the specified no-information model, each target is independent and uniform conditional on the response and prior history; then H~Binomial(N,1/K). Mere marginal balance is insufficient. No optional stopping, post-hoc scoring or silent exclusions.

Compute one-sided exact upper tail P(H>=h) and smallest rejection count atalpha0.05 for N100,K4. Report h25,30,35,40,50,100,0; preserve the integer lattice. Independent oracle uses exact integer/rational binomial sums. Numeric tailcomparison relative1e-10orabsolute1e-14, whichever permits harmless floating error; discrete threshold exact. Include validdegenerate N0 for subproblems and invalid fractional/nonfinite/out-of-domain inputs. Bound numericalAPI to declared tested range (e.g.N<=1000); don't claim arbitrary precision JavaScript.

Ordinary leak model: independently eachtrial a perfect leak occurs withprobabilityepsilon; otherwise a blindguess succeeds1/K. Then hitprobabilityq=epsilon+(1−epsilon)/K. At epsilon0.2,K4, q0.4. Any posited exotic information model with the same independentq gives identical binomial likelihoods for everyhitcount. This is a distributional identity, not evidence that a particular person leaked or that all hypothetical mechanisms are impossible.

Sensitivity to atmostm compromisedtrials, m0,5,10,20,N: (A) fixed/preselected contaminated subset, allcompromisedcorrect, remainingN−m independentblindtrials gives tailBin(N−m,1/K) atthresholdh−m. This assumption must be explicit. (B) arbitrary after-outcome corruption of atmostm entries of an underlyingN-trial independentguess vector is conservatively bounded by P(Bin(N,1/K)>=h−m). Do not useAforoutcome-dependentcorruption. Threshold<=0 yields1. These are conditional sensitivity analyses; the real m is unknown, not estimated or certified.

No score outputs ET probability, contactvalidated, or confirmedcoupling. Preserve assumptionlabels,fullcounts,failures. Four reviewers then choose R6 evidence-admission/prospectiveprotocol based on actual results. Root will not run humans or prescribe contact practices.

## Numerical review clarification

Independent skeptic and verifier noted that the N<=1000 bound does not prevent positive tails from underflowing binary64 (e.g.4^-1000). A numerical0 must not mean an impossible event: return a log-probability/underflow indicator or reject the unsupported computation. Preserve exact mathematical zero separately. This semantic requirement is not waived by the absolute comparison tolerance. Record any implementation repair before final admission.
