# Round 2 — executed physical interpretation controls

**Verdict: physical premises and interpretation controls pass; release remains conditional on Round 3 presentation review.** Actual Round 1 objections addressed: phase-sensitive control availability, passive energy versus work, dephasing loss versus heat, degenerate endpoints, and confusion between historical κ and the new magnitude input. Read `rounds/round1-decision.json`, `proof.md`, and the actual `src/dephasing-bound.mjs` API before execution.

Executed `node research/dephasing-work-bound/panel/physics/round2-controls.mjs`: **14 checks passed**, recorded in `round2-results.json` with module, proof, contract and checker SHA-256 values. The script assembles complex 2×2 density matrices and rotates them with a phase-specific unitary; this is a bounded interpretation check, not the dedicated worker's independent numerical certification.

- **Passive control:** p=1/4,c=0 has stored energy ε/4 and zero work/loss. The W=E interpretation fails by ε/4.
- **Energy/heat control:** p=1/2,|c|=1/2,d=0 keeps stored energy ε/2 while removing ε/2 of ideal work. Therefore labeling that loss released heat would contradict the directly evaluated zero state-energy change.
- **Phase/control check:** four phases for p=1/4,|c|=1/4,d=1/2 agree with the scalar API through explicit phase-specific rotations, with residuals below 2×10⁻¹⁶ in gap units. Using the zero-phase pulse on the π/2 state leaves a strictly higher energy. Scalar phase invariance therefore does not imply a universal extraction pulse for unknown phase.
- **Endpoint controls:** p=0,1; c=0; d=1; and maximally mixed output return finite work/loss and the stipulated exact equality flags.
- **Input contract:** passing historical κ=1 as `coherenceMagnitude:1` rejects. For p=.3, the helper's boundary magnitude is accepted while the next larger binary64 value rejects.

The proof's channel is CPTP by the explicit I/Z mixture, energy neutral for fixed H, and confined to real d∈[0,1]. Its attaining unitary and equality argument include the zero-radius case. No damping, bath or time evolution has entered E1.

**Calculator specification:** label the input “coherence magnitude |c|,” range 0≤|c|≤sqrt[p(1−p)], not κ. A boundary helper selects the greatest representable admissible magnitude; it need not prepare an exactly pure mathematical state. Direct decimal inputs can fail exact positivity after binary64 conversion. Show ε and Joule/normalized units distinctly, with fixed stored energy and ideal work separated. Display underflow as representability information, never physical equality; clipped ratios are not inequality-test evidence.

**Remaining limits:** Round 3 must inspect actual page labels, helper behavior and apparatus wording. Finite cases do not prove the continuum theorem or guarantee all binary64 relative errors. Arbitrary coherent cyclic controls remain an ideal assumption; preparation, physical dephasing, drive supply, readout and reset costs remain unknown. No apparatus, power, efficiency or E2 claim follows.
