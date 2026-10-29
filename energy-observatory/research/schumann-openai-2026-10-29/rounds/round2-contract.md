# Frozen research round 2 contract

Selected after R1 worker results and four actual reviews on 2026-10-29. Producer and independent verifier must preserve Round 1 snapshots. Four reviewers write round2.md only after inspecting actual worker artifacts.

## Question and admissions

Can source color or receiver response change a spectral maximum while the full physical transfer stays fixed, and can one output PSD uniquely determine poles with an unknown forcing spectrum? All data are synthetic; no station fit or anomaly inference is admitted.

1. Use the physical oscillator transfer from R1 with positive mass, natural frequency and damping. Declare a compact positive frequency band (suggest 1–20 Hz), grid spacing, units and endpoint handling. Hold both natural frequency and damping fixed. Change strictly positive bounded source PSD color alone, then frequency-dependent receiver squared gain alone. Record maxima, retaining positive constant scaling as no-shift control. Source color/receiver assumptions are synthetic, not observed lightning or instrument response.
2. For two distinct stable nonzero transfers H1,H2 on the band, construct S2=S1*abs(H1/H2)^2 from continuous positive S1. Prove nonnegative finite integrable admissibility and exact equality abs(H1)^2*S1=abs(H2)^2*S2 on the compact band. Finite residual checks verify code only. Outside-band extensions need no claim. Demonstrate failure of a peak-only inverse rule using the exact equal-output pair; a brute-force sweep cannot overcome this structural ambiguity.
3. Two-mode controls must sum complex amplitudes for a common coherent source. Demonstrate a phase-dependent interference term and compare with an explicitly uncorrelated-source PSD sum; do not silently mix those source models. Check a cancellation/phase control and nonnegative total output.
4. Preserve mechanical SI units and no energy-surplus claim. Displacement/velocity PSD ratio omega^2 is redundant and cannot resolve the ambiguity. State the specific extra calibrated information that would permit a later discrimination test, but do not execute Round 3 prematurely.

## Independent verification and stopping

Verifier freezes independent equations, fixtures and tolerances before reading producer code, then compares final frozen model with independent positive cases and wrong-model controls. Bound extrema checks by stated grid resolution; do not call finite scans global proofs. Workers freeze their scripts, snapshots, outputs and hashes. Stop at R2. Root selects R3 from these results and four reviewer objections.
