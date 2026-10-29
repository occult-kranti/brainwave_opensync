# Round 6 producer — prospective evidence intake

Status: **PASS, 382 assertions across 61 packet cases**, plus an executed four-target unsalted-hash dictionary demonstration. `schema.json` and the clearly labeled, entirely fabricated `example-packet.json` were frozen before implementation or outcomes. The verifier received their hashes and field names before deriving independent cases. No verifier output files were read before the producer freeze. No producer run failed.

## Four metadata lanes, no authentication

`assessPacket(packet)` returns separate documentary, environment, information and paired metadata-readiness flags with reasons. It always returns `evidenceAuthenticated:false`, `empiricalResult:null`, `couplingEstablished:false` and `etContactEstablished:false`. Caller-supplied self-attestations cannot override them.

The complete **fabricated** observational metadata fixture passes all four syntax/consistency lanes while remaining unauthenticated. Its references use `example.invalid`; there are no physical records, real subjects or actual trials behind it. This counterexample is intentional: complete-looking fields cannot authenticate a calibration, original event, source identity, randomization audit or target custody. Its three illustrative status labels include one hit, one miss and one abstention; they are declared fixture metadata, not empirical outcomes.

The complete synthetic fixture can pass the component metadata lanes but cannot pass paired **observational** readiness. A documentary-only packet passes only its documentary lane. Availability descriptors for the actually inspected quick-look images, saved Kp records and selected corpus texts fail the missing physical/information/paired requirements; the validator does not fabricate numerical station measurements to fill those gaps. A constant 7.83 Hz lookup also fails acquisition readiness.

## Enforced checks

- Common fields require version 1, an explicit synthetic/observational origin and canonical valid UTC timestamps with milliseconds. Calendar validity is checked by parsing and exact ISO round-trip, so dates such as February 30 do not silently normalize. `asOfUtc` is the declared ceiling for complete-record timestamps; it is not an independently trusted clock.
- References require inert absolute HTTPS URLs with a hostname and 64 hexadecimal SHA-256 characters. They are **not fetched, hash-matched or authenticated**.
- Environment metadata must name calibrated numeric Bx/By in T or Ez in V/m, positive finite sample rate, ascending nonnegative analysis band strictly below Nyquist, ordered time window, finite nonnegative clock error, and numeric/calibration/response-noise/QC/baseline references with a fixed estimator and missingness rule. Wrong units, Kp, quick looks and lookup constants cannot satisfy that lane.
- Information metadata requires integer K≥2 and N≥1, exactly N uniquely identified attempts, explicit hit/miss/abstain statuses, original-event time basis, event≤response lock<reveal≤as-of, and the named custody/response/scoring/generation references. It requires the conditional independent-uniform target assumption and fixed-N stopping declaration. Upload/repost dates, silent exclusions, early reveals and alternative stopping declarations are rejected.
- Commitment declarations require salted-domain-separated SHA-256, one per-attempt 64-hex commitment, a commitment timestamp strictly before response lock, declared integer nonce entropy≥128 bits, and nonce reveal no earlier than target reveal and no later than as-of. These fields cannot establish actual unpredictability, entropy, secrecy or historical custody.
- Paired metadata additionally requires observational origin, both physical/information lanes ready, a crosswalk, a protocol locked strictly before the first event and environmental start, fixed lag/null/calendar declarations, a finite clock-error tolerance covering the environmental clock uncertainty, and every original event within the environmental window. The frozen schema uses inclusive environmental endpoints. This successful metadata join does not establish a statistical effect, direction of causation or sender.

Adversarial cases cover invalid/future/noncanonical dates, wrong units, exact Nyquist, negative/nonfinite uncertainties and sampling, missing references, malformed digests, duplicate IDs, count mismatch, upload/repost time, early target/nonce revelation, unsalted commitments, short/fractional nonce declarations, wrong conditional-target assumption, nonfixed stopping, missing response custody, late protocol locking and unpaired event times. Every case preserves the four nonauthentication outputs.

## Abstention clarification

The advisor appended a statistical clarification after the field schema was frozen. Abstentions are retained as nonhits for complete attempt accounting. The exact Binomial(N,1/K) equality in Round 5 requires every trial to make a guess under the stipulated conditional-uniform model. If the response may abstain before target disclosure, per-trial success can instead be below 1/K; under the same conditional unpredictability premise, the N-trial binomial tail is a conservative upper-tail reference rather than an exact distributional equality. This gate calculates no p-values. Its metadata completeness cannot validate the premise in either case.

## Concrete unsalted commitment disclosure

The Node crypto demonstration computes SHA-256 of the literal UTF-8 strings `copper`, `silver`, `gold` and `iron`, without newlines. Enumerating these four candidates against the disclosed digest identifies `gold`. The example exposes how a tiny public target space defeats secrecy of an unsalted commitment through dictionary enumeration; it is not an inversion of arbitrary SHA-256 inputs. No real target secrets or nonces were generated or published.

The demonstration does **not** prove that a salted toy is cryptographically secure. A real protocol would require independently assessed nonce unpredictability/secrecy, domain separation, committed message encoding, key/target custody, unambiguous chronology and binding to response archives. A merely declared `nonceBits:128` cannot establish those conditions.

## Reproduction and limits

Run `node analysis/round6/run.mjs` from the study directory. `api.mjs` accepts one JSON packet per line (or `{packet:...}`) and returns `{ok:true,result:...}`. `{kind:"dictionary"}` returns the fixed demonstration. The module exports `assessPacket` and `unsaltedDictionaryDemo` for the independent bridge. Full per-case flags/reasons are retained in `results.json`; no automated acquisition, external contact, human experiment or practice recommendation occurred.

This is the final authorized research round. The useful deliverable is a falsifiable intake boundary and an explicit unresolved evidence checklist. An independent reviewer still must inspect actual records, permissions, timestamps, custody, stimulus/randomization and calibrated station data before any empirical inference. Metadata readiness does not convert the current documentary links into an established electromagnetic, occult or ET-contact mechanism.
