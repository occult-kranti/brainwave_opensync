# Round 5 independent exact-rational freeze

Producer files remain unread at this freeze. The oracle computes binomial upper-tail numerators by integer binomial sums divided by the exact denominator. No floating recurrence or producer library is reused. The rejection threshold is the smallest integer count h in0..N with exact tail <=1/20; if none exists it is null. Probabilities are converted to floats only for comparison, with tolerance max(1e-14,1e-10*|expected|). Positive rational values below representable float range are explicitly marked.

The binomial law requires target uniformity and independence conditional on responses and all prior information. Uniform marginal frequencies alone do not give this conditional statement. A response strategy using only the available past still has success1/K under the stipulated null; leakage of target information violates it. No changing N, optional stopping, subjective rescoring or selective omissions is covered.

Frozen fixtures include 27 tails across N0,1,8,12,100,1000; five exact threshold cases; 37 contamination cases; and all101 likelihood values for the independent perfect-leak model at epsilon1/5,K4. Independently selected small cases include K3 to test non-binary rational probabilities. N1000,h1000 has an exact positive probability below IEEE double range; a numeric zero approximation must not be described as an impossible event.

For A, a fixed/preselected subset of m trials is perfectly successful, with the remaining N−m independent blind trials. For B, start with N independent blind hit indicators and allow arbitrary after-outcome alteration of at most m entries. If a final h is reached then the original blind count is at least h−m, yielding the stated conservative bound. A's tail cannot replace B's when the compromised set is selected using outcomes. Both sensitivity curves assume an m supplied externally; neither estimates or certifies actual m.

For independent per-trial perfect leakage with probability epsilon, q=epsilon+(1−epsilon)/K=2/5. Any other independent model with q=2/5 yields the same complete binomial likelihood vector; this is a mathematical nonidentification example, not a claim that anyone leaked. Observed hit counts alone do not identify an information source.

Invalid observation fixtures cover negative/fractional/out-of-range N,K,h,m, nonfinite values and epsilon outside0..1, with tested numerical range N<=1000. The tail oracle itself allows effective negative thresholds for contamination, while the observed hit count h must be in0..N. The later bridge will respect the producer's separated API without changing these expected scientific results.

After these files are reported frozen, the producer may be inspected and compared. Any discrepancy will be recorded before repairs. No human trial, contact mechanism, ET probability or measured electromagnetic coupling is involved.
