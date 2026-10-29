# Round 6 independent verdict

**PASS for metadata syntax, internal chronology and the limited dictionary demonstration.** After reading only the frozen schema/example, the verifier independently froze 75 packets before opening producer implementation. The comparison executed 1,141 checks, including eight SHA256 comparisons between Python hashlib and Node crypto. There were no comparison failures or repairs.

## What was checked

Four independent lane flags were tested for documentary, environmental, information and paired metadata. The independent fixtures cover complete observational and synthetic declarations; isolated lanes; B/E units; reference syntax; impossible and noncanonical dates; future completed-record times relative to asOf; sampling/Nyquist constraints; missing calibration/noise/baseline; nonfinite uncertainty; trial counts/IDs/status; upload dates substituted for original event times; commitment/response/reveal/nonce chronology; fixed stopping and conditional-target declarations; protocol lock, crosswalk, calendar controls and clock tolerance; and event-window boundaries.

The complete fabricated five-attempt record retains two hits, one miss and two abstentions: three nonhits and five total attempts. Abstentions are not silently deleted. Documentary failure does not unnecessarily invalidate independently complete environmental/information lanes. Paired readiness still requires both relevant lanes, valid join metadata and observational origin. The explicitly synthetic case cannot pass paired observational readiness.

The advisor's later statistical clarification is admitted without changing the frozen packet fixtures: Round 5's exact Binomial(N,1/K) equality assumes a guess on every trial. With optional pre-disclosure abstentions, conditional success may be below1/K; given the same conditional unpredictability assumption, the binomial upper tail is a conservative reference instead. The Round 6 gate computes no p-values and does not authenticate that assumption. Keeping abstentions in the denominator preserves attempt accounting; it does not by itself justify an exact binomial distribution.

The schema's event window is inclusive at both boundaries. The supplied asOf value is a consistency ceiling, not an externally authenticated wall-clock reading. A malformed calendar date fails even when JavaScript could normalize it to a different date. Every rejected lane has nonempty reasons, and every ready lane has an empty reason list in these fixtures.

## The deliberate fabricated-evidence counterexample

A completely fabricated packet using example.invalid references, made-up digests and true self-attestations passes all four metadata lanes. It still returns `evidenceAuthenticated:false`, `empiricalResult:null`, `couplingEstablished:false` and `etContactEstablished:false`. Spoofed top-level values claiming verification do not override those outputs.

This is expected behavior, not a successful experimental packet. The checker does not fetch references, match hashes against source bytes, inspect a nonce, validate a commitment opening, authenticate custody, verify target independence or establish a calibration. The three actual-material availability descriptors—Schumann quick looks, separate Kp records and attributed corpus texts—remain insufficient for all measurement/trial lanes. Those descriptors are software fixtures describing missing evidence, not newly acquired observations or calibrated datasets.

## Hash disclosure demonstration

Python independently hashed the frozen literal UTF-8 strings copper, silver, gold and iron, with no newline or salt. All four values match the Node producer's dictionary. The published digest of gold is recovered by enumerating those four candidates. A second independently selected four-label set also matches between Python and Node.

This demonstrates the weakness of publishing an unsalted commitment to a tiny known target set. It does not break SHA256 and does not establish security of a salted implementation. The declared nonce size and scheme label do not prove nonce unpredictability/secrecy, correct domain separation, authentic timestamping or independence of custodians. Those facts require separate audit evidence.

## Final admission boundary

The six-round sequence has produced checked engineering models and an explicit intake protocol. It has not produced an authenticated Schumann anomaly/contact pairing, a measured cross-domain transfer, a demonstrated biological coupling or evidence identifying an extraterrestrial sender. Missing evidence remains unknown rather than measured zero. Suitable next work, if separately selected, is acquisition and auditing of a bounded licensed dataset or a preregistered independently controlled information experiment; no human session or external contact was performed here.

Replay with `python3 -B verification/round6/check.py` from the study root. Exact source/schema/fixture hashes and runtime are in `comparison.json`; `freeze.json` binds this verdict. Subsequent website and publication checks are delivery verification, not a seventh research round. This is independent implementation checking by a separate model-agent, not laboratory replication or human peer review.
