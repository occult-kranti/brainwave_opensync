# Original listening comparisons for the levitation laboratory

These four recipes are quiet audible examples authored for this app. They are grade D, Experimental listening designs with unvalidated benefits. They do not reproduce the spatial field of a levitator, generate ultrasound, control hardware, levitate objects or predict biological effects. The separate force model and its assumptions should be evaluated on their own terms.

`LEVITATION_PRESETS` is exported from `src/data/levitationPresets.ts`.

| ID | Channel content | Duration | Controlled comparison |
|---|---|---:|---|
| `levitation-frequency-reference` | 340 Hz in both channels | 5 min | Shared-frequency baseline |
| `levitation-phase-drift` | Left 340 Hz; right 340.75 Hz | 5 min | Only the right-channel frequency changes |
| `levitation-wavelength-ascent` | 225 → 450 → 675 → 900 Hz in both channels | 6 min | Four successive tones, 90 seconds each |
| `levitation-wavelength-descent` | 900 → 675 → 450 → 225 Hz in both channels | 6 min | Same tones and time per tone, reversed order |

Every phase has a −30 dBFS gain and the saved mixer has the same ceiling. The complete clean sine mixer replaces old noise, nature, bowl and interval-bell layers. Automatic stop and the matching duration limit are enabled. Digital amplitude is not a calibrated sound-pressure level at the ear; device volume and the existing governor remain relevant. Equal digital gain across frequencies is not equal perceived loudness.

## Phase comparison

For separate channel frequencies, the change in relative phase is `Δφ(t)−Δφ(0)=2π(fR−fL)t`. The detuned pair advances by 0.75 cycles each second, or one full turn in 4/3 seconds. The preset schema has no initial-phase control. The shared-frequency reference has no ongoing phase drift from detuning.

Both signals are ordinary audible sine tones. Neither channel contains a standalone 0.75 Hz pressure-wave tone. Stereo headphones keep the signals in different channels; combining loudspeaker fields in a room would add propagation and reflection conditions that this preset does not specify. A listening impression of fluctuation would not demonstrate a spatial trap or measure a brain response.

[OpenStax, Mathematics of Waves, §16.2](https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves) supplies the phase and wave-speed relations. The frequencies, gain, duration and comparison design are ours.

## Frequency, wavelength and sequence order

For an explicitly fixed propagation speed, `λ=c/f`: the rising frequency sequence corresponds to wavelength ratios `1, 1/2, 1/3, 1/4`. The reverse sequence reverses those ratios. No measured propagation speed, room dimensions or particle properties are part of these recipes, so they report no wavelength in metres, node location or force. Their audible content is successive pitches, rather than all four frequencies sounding together.

[OpenStax, Standing Waves and Resonance, §16.6](https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance) derives a spatial standing-wave pattern from counterpropagating waves and boundary conditions. Shared-frequency headphone channels alone do not specify that physical arrangement. Frequency sequences can accompany the visual model as an illustration of frequency change, but do not render its spatial field.

Reversing the sequence preserves total exposure time at each pitch. This offers a simple comparison of ascending and descending order. It does not establish a therapeutic effect, nor does it isolate an effect of order from familiarity, expectations or ordinary loudness differences without a separately designed study.

## Connection to levitation research

[Marzo et al., *Holographic acoustic elements for manipulation of levitated objects*, Nature Communications 6, 8661 (2015)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4627579/) is the primary source for the limited connection: phased acoustic fields can be shaped experimentally, and force depends on their spatial structure and the target. Its Results and Methods describe acoustic traps and a radiation-force model using spatial derivatives. This is a useful reason to distinguish a time signal at an audio channel from a complete field over space. The paper did not test these recipes or establish listening benefits.

## Playback and verification

All phases use the existing binaural mode. A zero beat gives the same steady tone to both channels; the detuned pair preserves the documented left/right frequency relation. No nonzero-rate monaural mode is used. Live and offline gain paths and transitions are not promised to be sample-identical. The stored 15-second ramp is authored metadata under the engine’s existing transition rules.

Four tests cover clean mixer replacement, bounded gain/duration/frequencies, evidence labels, the matched detuning control, Fourier projections of channel frequencies, absence of an extra low-frequency spectral line, reversed sequence exposure, deterministic finite rendering, distinct short output and PCM16 encoding bounds. The tests allocate only short buffers and write no preview files.

Two seconds of 12 kHz stereo PCM16 requires 96,044 bytes including a standard WAV header, so four such previews add 384,176 bytes. The highest pure tone is 900 Hz, below the 6 kHz Nyquist limit. This remains a budget estimate until integration verifies the actual files plus manifest.

After catalog registration, `node scripts/render-previews.mjs --append --sample-rate=12000 --seconds=2` creates only missing previews. Add `--dry-run` to check existing hashes, metadata, specifications and the proposed budget without rendering or writing previews. Existing WAVs, entry metadata and the manifest’s 48 kHz/two-second defaults are preserved. New entries explicitly record 12 kHz, actual duration and an explanatory note. Lower-rate append is restricted to clean binaural sine recipes; it is not a general downsampling path for textures or harmonic layers. The append command verifies the complete output and the budget before writes, creates new WAV paths exclusively, and replaces the manifest only after those files are ready.
