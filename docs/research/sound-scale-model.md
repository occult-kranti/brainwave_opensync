# Acoustic scale and ideal interfaces

`src/sound-research/acoustics.ts` adds three separate numerical comparisons: wavelength and period, a musical interval in cents, and power fractions at a hypothetical interface. These are textbook models with explicit units. They contain no model of tissue, disease, recovery, acoustic dose or therapeutic effect.

## Wavelength and time scale

For a sinusoidal traveling wave with frequency `f` and speed `c`,

`λ = c/f` in metres, and `period = 1/f` in seconds.

The module reports the period as `1000/f` milliseconds. The medium selector offers two approximate classroom values at 20 °C: air at 343 m/s and fresh water at 1480 m/s. These values and the wave relation follow [OpenStax College Physics 2e, §17.2](https://openstax.org/books/college-physics-2e/pages/17-2-speed-of-sound-frequency-and-wavelength). They are fixed references rather than measured conditions. Frequency is restricted to 60–1000 Hz. Doubling frequency halves wavelength and period at fixed speed; changing speed changes wavelength while leaving period unchanged.

The selection changes the wavelength calculation only. It does not derive an impedance, identify the materials on either side of an interface or estimate coupling into a person.

## Musical frequency ratios

The pitch-interval helper computes `cents = 1200 log2(f/reference)`. An octave is +1200 cents; reversing the ratio changes the sign. This logarithmic interval follows [UNSW Physics, Note names, MIDI numbers and frequencies](https://www.phys.unsw.edu.au/jw/notes.html). Both frequencies must lie in the module's 60–1000 Hz range. The result measures a musical interval, not an energy level or physiological state.

## Hypothetical normal-incidence interface

The interface model assumes plane waves in two homogeneous linear media, one flat boundary, positive real impedances and no absorption. It excludes oblique incidence, complex impedance, multiple boundaries and nonlinear effects. With `q = Z2/Z1`, continuity of pressure and normal particle velocity gives

`pi + pr = pt`, and `(pi − pr)/Z1 = pt/Z2`.

Thus the pressure reflection coefficient is `r = (q−1)/(q+1)`. The pressure transmission coefficient is `tp = 2q/(q+1)`. Because power also depends on impedance, the reflected and transmitted power fractions are

`R = r² = ((q−1)/(q+1))²`, and `T = tp²/q = 4q/(q+1)²`.

This specializes the acoustic boundary conditions in [David H. Staelin, MIT, Electromagnetics and Applications, §13.2.1, equations 13.2.15–20](https://ocw.mit.edu/courses/6-013-electromagnetics-and-applications-spring-2009/d3be4ea78b036a6362230fb41780cf54_MIT6_013S09_notes.pdf) to normal incidence. `R` and `T` are power fractions, not pressure-amplitude fractions. No incident power or absolute pressure is provided.

The dimensionless ratio is hypothetical and independently selected in `[0.01, 100]`. It is not calculated from the air/water wavelength selector. Within this simplified model, the fractions depend only on `q`, not on the selected frequency or speed. At `q=1`, `R=0` and `T=1`; at `q=3`, `R=1/4` and `T=3/4`. For every positive real `q`, `R+T=1`, and replacing `q` with `1/q` preserves both fractions.

## Bounds, sweep and export

All numerical inputs must be finite numbers. Unsupported speeds, out-of-range frequencies and ratios, malformed inputs, and fractional or excessive sample counts are rejected before array allocation. The interface plot contains 2–600 logarithmically spaced ratios between 0.01 and 100. Its default 201 rows include exactly `q=1` as the midpoint.

`acousticsCsv` records a model version, assumptions, selected inputs, wavelength in metres, period in milliseconds, selected power fractions and the independent hypothetical-ratio sweep. Metadata lines begin with `#`. The remaining CSV columns are dimensionless ratio, reflected power fraction and transmitted power fraction. The file is calculated data, not measurements.

Focused tests verify dimensions, frequency and medium scaling, octave and semitone identities, conservation and reciprocal symmetry, exact sweep endpoints, input rejection, bounded allocation and reproducible numerical export. Source pages were checked on 2026-10-16. The implementation is original; no source text, diagrams or recordings are copied.
