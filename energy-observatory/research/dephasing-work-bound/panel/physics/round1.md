# Round 1 — physical contract admission

**Verdict: admit the E1 proof attempt conditionally.** Revision 1 defines a physical state family, a CPTP channel and an explicit ideal control class. No physical premise blocks the bounded theorem. This is contract admission, not acceptance of a proof, implementation or device. No other worker outputs were read.

## Formal assumptions

The density matrix is Hermitian with trace one; p∈[0,1] and det(ρ)=p(1−p)−|c|²≥0 give positivity, including forced c=0 at p=0,1. H=diag(0,ε) is fixed with ε>0; phase conventions and energy zero do not change the work difference.

For Z=diag(1,−1), D_d(ρ)=((1+d)/2)ρ+((1−d)/2)ZρZ. Its coefficients are probabilities for the entire contracted range d∈[0,1], so it is CPTP. It preserves p and Tr(Hρ)=εp. The project deliberately uses nonnegative retained-coherence fractions; the larger physical real-multiplier range [−1,1] is outside this contract. No Markovian dynamics, rate, duration, bath temperature or semigroup is assumed.

Ergotropy minimizes final energy over all qubit unitaries. Physical attainability requires ideal coherent control with suitable phase access and return of the control Hamiltonian to H at endpoints. An energy-commuting control alone extracts zero work. A diagonal phase rotation commutes with H, explaining scalar phase invariance under this unrestricted class; it does not make unknown phase irrelevant to a fixed hardware protocol.

Because mean energy is unchanged, W(1)−W(d) is an increase of passive energy. It is not heat emitted, extra stored energy, or a measured controller expenditure. Preparation, dephasing implementation, extraction supplies and reset remain outside the model. The historical damping functions are comparison context only: E1 must hold their population-changing operation absent.

## Admissible demonstration and controls

The calculator should display p, |c| (or clearly labeled κ), d and ε/frequency; reject unphysical states; identify normalized energy and joule outputs; show unchanged stored energy alongside reduced ideal work. Phase input may demonstrate invariance. No output watts or efficiency is derivable.

Freeze these interpretation controls for later execution:

- Passive state: p=1/4,c=0 gives E=ε/4 but W(d)=0. Reject the W=E model.
- Maximal coherence: p=1/2,|c|=1/2,d=0 leaves E=ε/2 while the loss is ε/2. A label calling that loss released heat must fail.
- Complex phases at identical p,|c|,d must agree in scalar work; the attaining unitary must still act on the actual complex state.
- d=1 and c=0 must have zero loss; p=0,1 and the maximally mixed output must remain admissible without singular arithmetic.

**Next evidence:** full-domain spectral proof and explicit attaining unitary; equality necessity and sufficiency; independently assembled complex-matrix checks; implementation domain/precision handling; final UI wording and energy-unit review.

Receipt: direct reads and `sha256sum` only; no numerical experiment in this role's Round 1. Contract SHA-256: `ed0289dbad37b2059f781d500c7986ef8fde81e7e42f2ef96a08d51b33fb9ee2`. Updated role reference: `06b011bd87a823621f7f7b149c2f45a5eb7bbfe6cd5e9adc34585f4181a58c03`. Historical implementation hashes are recorded in `round1-inputs.sha256`.
