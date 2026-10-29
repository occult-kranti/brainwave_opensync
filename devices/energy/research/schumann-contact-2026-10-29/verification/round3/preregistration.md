# Round 3 independent fixture freeze

The advisor contract was read; producer files were not inspected before generating `oracle.py` and `fixtures.json`. The oracle uses centered **integer** dot products: `X_i=n*x_i−sum(x)` and similarly for Y. Under cyclic shifts the denominator is constant, so the order and equality of absolute Pearson correlations are exactly the order and equality of integer absolute dot products. Max-over-lag statistics inherit this exact ranking. Floating scores are emitted only for API comparison, with the contract's 1e-11 tolerance.

Positive shift s means comparing x[i] with y[(i+s) mod n]. For each of 32 offsets, enumerate all 32 transformations, including identity. Exact p is the inclusive tail count divided by 32. There is no extra Monte Carlo correction. For a selected family L, calculate `max_l |r(s+l)|` for every transformed offset. The intentionally invalid selected-minimum fixed-lag p uses the smallest fixed-lag tail probability in L.

Three independently chosen integer shape pairs are frozen: a nonconstant identical pair, a distinct pair, and a period-two pair with extensive ties. Each is evaluated with `[0]`, `[-3,...,3]`, and all 32 lags: nine fixture families, 288 offset rows. Exact tail counts and rejection counts must agree. The all-lag maximum is invariant across the shift group; every p must be 1. The exact ties fixture also yields p=1. All nonzero gaps in the other score orbits are recorded; the conservative producer tie tolerance of at most 1e-12 must not collapse distinct fixture scores.

Invalid cases cover constants, unequal length, empty lag families, fractional/string/null lag values and nonfinite values in either series or lags. No additional restriction on signed integer lags is imposed. Only the contract's length-32 numeric inputs are certified, rather than every possible length or extreme floating scale.

For a uniform relative offset over the declared group, a fixed or complete-max statistic has at most floor(32*0.05)=1 rejecting offset. This checks a global-null conditional finite experiment; it is neither strong FWER under arbitrary partial nulls nor evidence that a real time series is shift-exchangeable. Missingness, nonstationarity, common calendar drivers, leakage and real-time timestamp registration are not repaired by this test.

After root receives this fixture freeze, an API bridge may be written without changing the fixtures. The full known-law/null-method prior art remains acknowledged; no new theorem or empirical SR/contact result is claimed.
