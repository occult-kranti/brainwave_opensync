# Original audio companions for the Newton–Tesla page

These four listening recipes are authored for this app. Newton and Tesla did not compose them, specify their digital gains, or validate listening benefits. Historical sources supply context for thinking about periodicity and tuning; the audio is a limited acoustic illustration. All four entries are grade D, in the Experimental tier.

`NEWTON_TESLA_PRESETS` is exported from `src/data/newtonTeslaPresets.ts`. Registration and preview regeneration are separate integration steps. The shared engine, live audio graph and historical presets are unchanged by this file.

| ID | Audible content | Duration | Comparison |
|---|---|---:|---|
| `nt-phase-drift` | Left 240 Hz, right 240.5 Hz | 5 min | Slow change in relative phase |
| `nt-detuning-3` | Left 240 Hz, right 243 Hz | 5 min | Same carrier and gain, greater detuning |
| `nt-ratio-steps` | 320 → 384 → 512 → 256 Hz, both ears | 6 min | Ratios 5:4 → 3:2 → 2:1 → 1:1 against a chosen root |
| `nt-tempered-steps` | Approximately 322.54 → 383.57 → 512 → 256 Hz, both ears | 6 min | Equal-tempered semitones 4 → 7 → 12 → 0 against the same root |

Every phase and saved mixer has a −28 dBFS ceiling. Each recipe fully specifies a clean sine mixer: noise off, nature off, bowls empty, interval bell off. Loading therefore replaces unrelated layers from an earlier session. Automatic stop and the authored time limit are enabled. Digital gain is not a measured sound-pressure level at the ear; the existing governor and device-volume controls still apply.

## What phase drift means here

For two channel signals with frequencies \(f_L\) and \(f_R\), their relative phase evolves as

\[
\Delta\phi(t)=\Delta\phi(0)+2\pi(f_R-f_L)t.
\]

With a 0.5 Hz difference, that phase advances one full turn every two seconds. With a 3 Hz difference, it advances three turns per second. The initial offset is not an authored preset control. These examples therefore demonstrate **phase drift from detuning**, not a fixed phase difference, a rotating magnetic field, or a specific perceived moving sound.

The two frequencies remain separate in stereo headphones. Neither channel contains a standalone 0.5 Hz or 3 Hz pressure-wave tone. Acoustic summation through speakers is a different listening arrangement. There is no EEG input and no measured brain-state outcome.

[OpenStax, Mathematics of Waves](https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves) supplies the wave-phase notation; [OpenStax, Beats](https://openstax.org/books/university-physics-volume-1/pages/17-6-beats) supplies the frequency-difference context. [Tesla’s US381968A patent](https://patents.google.com/patent/US381968A/en) is a historical electrical source involving phased currents and a motor. Sharing a phase concept does not make the headphone signals an implementation of that device.

## What the tuning comparison means

The reference \(f_0=256\) Hz is a design choice. One sequence uses \(f=f_0r\) with ratios \(r=5/4,3/2,2,1\). The other uses \(f=f_0 2^{n/12}\) with semitone offsets \(n=4,7,12,0\). Both keep duration, sequence order, waveform and gain fixed. The first two tones differ between systems; octave and root agree.

The sequences begin with the third above the root so their short previews are distinguishable. The root is played last. These are successive pitches, not simultaneous harmonic spectra. No numerical result is presented as a body frequency or a resonance measurement. A resonance experiment would additionally require a specified driven system and an observed response.

[Newton’s *Opticks* (1704), Book I, Part II, Proposition VI, pp. 114–117](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00034), apportions a color circle using musical intervals and constructs a weighted center for a mixture. That documented analogy motivates examining proportions; it is not a derivation of our four tones, an equal-temperament prescription, or a physical equivalence between light and sound. Newton also reports that the two-color mixture expected at the circle’s center did not give him perfect white: his own observation limits the diagram’s predictive reach. We use the Newton Project’s normalized transcription of the 1704 text.

[CMU’s Steps and Pitch](https://www.cs.cmu.edu/~15322/book/ch04/01.html) documents the modern equal-temperament formula. [Tesla’s 1892 lecture](https://www.gutenberg.org/files/13476/13476-h/13476-h.htm), in the discussion following the induction-coil description, considers how capacitance and self-inductance affect current and how small adjustments can change electrical behavior. This is a useful example of tuning tied to an identified physical system and measurable response. It does not justify an absolute healing pitch or convert this musical interval exercise into an electrical-circuit simulation. The original compositions do not rely on invented quotations or historical attribution of the 256 Hz root.

## Playback and verification boundaries

All phases use the existing binaural implementation; with a zero frequency difference, this yields identical steady sine tones in both channels. This avoids the existing nonzero-rate monaural distinction between live two-tone playback and offline sine AM. Live and offline gain paths and sequence transitions are still not promised to be sample-identical. The stored 15-second ramp value is metadata; it does not override those transition rules.

Tests check recipe bounds, complete mixer replacement, original/Experimental labeling, exact channel frequencies using two-second spectral projections, no extra low-frequency tone, matched controls, tuning arithmetic, deterministic finite output and four distinct short previews. The renderer tests use short buffers rather than allocating full sessions. Listening preference and health effects have not been measured.

At two seconds of 48 kHz stereo PCM16, each generated WAV would add 384,044 bytes including its header. Four add 1,536,176 bytes. This calculation is a planning estimate, not proof of the final preview-directory size; the integration renderer must check its manifest and its existing 60 MB limit.
