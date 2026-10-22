# Round 3 — physical presentation and conversion closure

**Verdict: accept the reviewed interface's physical scope and conversions.** Read `rounds/round2-decision.json`, the actual page and UI sources. This closes the Round 2 requirement to inspect labels and actual conversion behavior; no fourth round or new scientific target is requested.

Two concrete defects were reproduced before repair in `round3-pre-fix.json`: a positive κ=5×10⁻³²⁴ at p=1/4 converted to |c|=0 and produced false requested-state equality; a passive state at p=1/4, ε=5×10⁻³²⁴ J displayed unflagged zero stored energy despite εp>0. The integrator repaired both. Positive coherence-conversion underflow now rejects, clears results and disables export. Nonzero decimal text that parses to zero also rejects. Stored energy now has its own range status, participates in the warning, and is retained with its status in the export.

Executed `node research/dephasing-work-bound/panel/physics/round3-ui-controls.mjs round3-ui-results.json`: **7/7 checks passed**. The harness runs the actual UI module with a minimal DOM/fetch fixture and Node built-ins. It covers units, κ-to-|c| conversion, boundary helper, both input-underflow mechanisms, stored-energy underflow, forced zero coherence at p=1 and physical wording. This is execution evidence, not full browser/layout evidence.

The page clearly identifies κ as an interface fraction of the representable admissible maximum; the theorem and result use actual |c|. At p=.3, κ=1 uses the helper's greatest admissible binary64 value. This need not be exactly pure mathematically. Normalized work is labeled “Divided by ε”; energies are Joules. The unchanged mean energy is distinct from work lost, and the text explicitly says that lost accessibility is not released heat.

The attaining work remains conditional on all single-qubit cyclic unitaries and suitable phase access. The page excludes preparation, phase-reference, control and reset costs and infers no power or efficiency. Our prior complex-phase control shows why scalar invariance does not authorize a fixed unknown-phase extraction pulse. Range status remains a representability label, not an accuracy guarantee or physical equality test.

The original fixture is preserved as `round3-ui-controls-v1.mjs` with the pre-fix receipt. Its first post-fix run (`round3-post-fix-format-check.json`) retained one obsolete formatting assertion: “J (unchanged)” became “J · status (unchanged).” The final harness checks the two semantic labels separately and retains that intermediate outcome.

Final reviewed SHA-256 values:

- Page: `a7a30fae419d1377f12a1ec39a9c553ca11fa6eecb1673244c7665ffd8b04b7e`
- UI: `697ada688c21d9fef058fb18beb41bb6927d27ff69bde2d5c9688e60f7ef50d2`
- Model: `05b2ad552c3bb0c1812dd3553163a59f28bc77b9bc55861c96d673fd85afb78b`
- Harness: `951bd5811fda38ec2b8838e9a324e88db70a5c1aa02cf93a0a94e011aa56fca4`

No remaining physical-scope obstruction was found in these bytes. Root release replay, final link/browser review and deployment remain separate gates.
