# Round 4 contract — resolution and shared-driver identifiability

Selected from actual R3 failure and four panel objections; engineering replication only. Do not modify R3 frozen artifacts.

PartA: reuse frozen R3 implementation at analysis/round3/model.mjs. Freeze256-point integer vectors before calculating results (deterministic generator/seed or explicit values), with identical shape under uniform relative offsets plus a distinct-shape control; locked lags−3..3,alpha0.05. Enumerate full256group. Verify maximum adjusted global-null rejection fraction<=floor(256alpha)/256. The minimumpossible p lowerbound7/256 now lies below0.05; report actual most-alignedcasep and all outcomes, without promising detection in every fixture. All256lags still p1. Separate targeted aligned alternative (conditional shape matching) from uniform-phase null; no population power claim from one alternative.

PartB: fixed driver z=[−2,−1,0,1,2],observed X=z,Y=2z. Compare modelA Y=2X (direct) andmodelB Y=2z (common driver). Identical observational predictions; centered design[X,z] rank1,nullity1,kernel(1,−1). A duplicated sensor column does not restore source identifiability. Under hypothetical independently set perturbationu=[1,0,−1,0,1],X'=z+u while zfixed, predictions differ by2u; centered design[X',z] rank2. Use explicit matrix/determinant/kernel checks. This is a synthetic intervention assumption, not a feasible or executed human/planetary manipulation. Do not claim adjustment identifies coefficients without independent variation.

Independent verifier must freeze additional vector/rank fixtures first, then compare. Exact integer ranks/p-values, scoretol1e-11, numerical ranktol1e-10if used; matrixdimensions/nullity explicit. Sources: established finite-group randomization and standard linear identifiability; earlier Newton–Tesla same-port witness work already shows agent-label ambiguity. Add report,results,freeze and preserve all failures. Next-round choice awaits review.

## Pre-execution clarification

Producer, verifier and geophysics reviewer independently noticed that R3 hardcodes length32. Literal reuse cannot accept256. Preserve this requirement defect rather than changing R3: implement an additive generalized-N R4 module with the same semantics and conservative tie rule, bind the R3 source hash, and test exact parity atN32 against the original module. “Reuse” above means algorithm/provenance reuse through this explicit version, not silently editing the frozen dependency. This clarification was issued before R4 result computation.
