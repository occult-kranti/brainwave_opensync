# Round 1 independent analytic derivation

Prepared before producer/verifier results were read. This establishes formulas within the declared models; it does not validate an Earth measurement or all floating-point inputs.

## Geometry

The eigenvalues of minus the unit-sphere angular Laplacian are l(l+1). For a thin lossless shell of radius R and constant wave speed v, the spatial eigenvalue is l(l+1)/R². Substituting a time factor into the wave equation gives ω_l²=v²l(l+1)/R². On R>0, v>0 and integer l≥1,
\[
 f_l=\frac{v\sqrt{l(l+1)}}{2\pi R},\qquad
 \lambda_{h,l}=\frac{2\pi R}{\sqrt{l(l+1)}},\qquad
 f_l\lambda_{h,l}=v.
\]
Changing R to aR divides f by a and multiplies λ_h by a. Changing v scales f only. A measured lossy forced peak is not stipulated to satisfy this eigenvalue equation. A one-parameter effective-v fit to one peak is a calibration of that toy model; comparison with historical approximate higher peaks is not a statistical test without their data and errors.

## Driven oscillator

Let m,ω0,γ>0 and physical displacement q satisfy
\[
 m\ddot q+2m\gamma\dot q+m\omega_0^2q=F.
\]
The Laplace poles are −γ±sqrt(γ²−ω0²); for γ<ω0 their imaginary magnitude is sqrt(ω0²−γ²). At γ=ω0 the repeated pole is real; for larger γ both poles are real and negative. Thus no oscillatory ringdown frequency is returned when γ≥ω0.

Using the Fourier convention q=Re(Q exp(iωt)),
\[
 H(\omega)=\frac{Q}{F_0}
 =\frac{1}{m(\omega_0^2-\omega^2+2i\gamma\omega)}.
\]
Its SI unit is s²/kg = m/N. For a constant positive white-force PSD S0 and displacement readout, the output shape is S0/[m²D(y)] with y=ω²≥0 and
\[
 D(y)=y^2+(4\gamma^2-2\omega_0^2)y+\omega_0^4>0.
\]
Since D is a convex quadratic, its minimum on y≥0 occurs at y=max(0,ω0²−2γ²). This gives a positive-frequency maximum precisely when γ<ω0/√2. At equality the maximum remains at DC; the shape is flat to second order in ω but does not acquire a positive peak.

Velocity readout multiplies the spectrum by y. Its derivative with respect to y has sign
\[
 D(y)-yD'(y)=\omega_0^4-y^2.
\]
Therefore its unique positive-frequency global maximum is ω=ω0 for all γ>0: the sign changes there from positive to negative, and the spectrum tends to zero at both endpoints. This includes overdamped dynamics. The peak position does not by itself certify a narrow resonance or an oscillatory ringdown.

A constant positive multiplier changes neither maximum. A change of readout from q to qdot keeps H's physical poles fixed. A change of γ keeps ω0 fixed but changes the poles and cannot be called an unchanged-pole case. PSD conventions per hertz versus per radian/second introduce a constant Jacobian when treated consistently; they do not alter these maximum locations.

Independent numeric ratios:
| Q=ω0/(2γ) | γ/ω0 | displacement-peak/ω0 | ringdown/ω0 |
|---|---:|---:|---:|
| 5 | 0.1 | 0.9899494936611666 | 0.9949874371066200 |
| 0.6 | 5/6 | 0 | 0.5527707983925666 |
| 0.4 | 5/4 | 0 | no oscillatory ringdown |

## Energy and harmonic averages

The mechanical stored energy is
\[
 E=\frac m2(\dot q^2+\omega_0^2q^2).
\]
For every twice-differentiable solution of the equation, multiplication by qdot gives
\[
 \dot E=F\dot q-2m\gamma\dot q^2.
\]
All terms have units watts. The result follows directly from the equation; a numerical residual only checks an implementation.

For harmonic force F=F0 cos(ωt), ω>0, write a=ω0²−ω², b=2γω, D=a²+b². Then
\[
 q=\frac{F_0}{mD}(a\cos\omega t+b\sin\omega t),\quad
 \dot q=\frac{F_0\omega}{mD}(-a\sin\omega t+b\cos\omega t).
\]
A full-period average gives
\[
 \langle F\dot q\rangle
 =\frac{F_0^2\omega b}{2mD}
 =\frac{\gamma F_0^2\omega^2}{mD}
 =2m\gamma\langle\dot q^2\rangle
 =m\gamma\omega^2|H F_0|^2.
\]
This uses F0 as peak amplitude; using RMS force instead changes the amplitude factor consistently. At ω=0 the force is static, steady displacement is F0/(mω0²), and both average powers vanish. No free-output-energy term appears.

## Magnetic reference

In the declared linear vacuum reference, u_B=B²/(2μ0) has units J/m³. For a static B0 plus a zero-mean perturbation b, the mean cross term B0·〈b〉 vanishes; the mean increment is 〈|b|²〉/(2μ0). If b_rms is supplied, no additional sinusoidal factor of one-half is applied.

Using the stated reference approximation μ0=4π×10^-7 H/m yields 9.947183943243459×10^-4 J/m³ at 50 μT and 3.9788735772973833×10^-19 J/m³ at 1 pT RMS. Doubling field magnitude multiplies the density by four. Neither frequency alone nor this density specifies power, collected volume, coupling efficiency, or a replenishment mechanism.

