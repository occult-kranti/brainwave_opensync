# Mobile audio stability review

Review date: 2026-10-29. Baseline: archive source `42acf6f`. Scope: the live audio bridge and its texture buffers; deterministic offline synthesis and preset recipes are unchanged.

## Finding and correction

The baseline repeats an eight-second noise buffer and a twelve-second nature buffer directly. For slowly varying textures, the last and first samples can differ far more than ordinary neighboring samples. These joins recur at 8/16/24 seconds and 12/24 seconds, making them a plausible contributor to the reported 15–30 second noise change. This reproduces a software defect; it does not prove the cause of every report from a physical phone or Bluetooth device.

`seamlessTextureLoop` conditions only live buffers. Each renderer supplies an extra 100 ms of material. An equal-power overlap joins the end to the discarded head; the playable loop stays exactly eight or twelve seconds. Overall RMS is restored to the source RMS. The method has no periodic fade-to-zero envelope. Natural noise fluctuations and ocean/thunder envelopes remain audible.

Nature gain edits now ramp the existing source when its kind is unchanged. They no longer release and regenerate the texture, resetting its slow envelope. A real kind change still replaces the source through the existing release path.

## Numerical evidence

The following values use the default deterministic seed at 48 kHz. “Jump” means the absolute difference between samples on opposite sides of a loop boundary, in internal floating-point sample units. These are neither sound-pressure measurements nor listening-volume recommendations.

| Texture | Raw jump | Conditioned jump | Raw jump / ordinary difference RMS | Conditioned jump / ordinary difference RMS |
| --- | ---: | ---: | ---: | ---: |
| Brown noise, 8 s | 1.188246320 | 0.005893469 | 82.805 | 0.412 |
| Fire, 12 s | 0.524578830 | 0.015097618 | 9.494 | 0.273 |
| Thunder, 12 s | 0.699198633 | 0.004704833 | 222.837 | 1.500 |

Complete conditioned-loop RMS matches source RMS to six decimal places in the tested fixtures. The unit-RMS source convention is preserved; playback still uses the existing layer, master and governor gains. No limiter or new loudness claim is introduced.

## Independent Web Audio render

Chromium 153 from the official `@sparticuz/chromium` npm distribution was launched with Playwright. A real `OfflineAudioContext`, rather than a mocked audio graph, rendered raw and conditioned `AudioBufferSourceNode` loops into separate channels for 90 seconds. This is accelerated browser rendering, not a 90-second recording from physical output hardware.

| Sample rate | Texture | Raw 90 s RMS | Conditioned 90 s RMS | Maximum conditioned wrap jump |
| --- | --- | ---: | ---: | ---: |
| 44,100 Hz | Brown | 1.001152143 | 1.001330022 | 0.016396165 |
| 44,100 Hz | Fire | 0.999788410 | 0.999300229 | 0.000214100 |
| 44,100 Hz | Thunder | 0.997255573 | 0.996958756 | 0.001780152 |
| 48,000 Hz | Brown | 1.000764127 | 1.001279808 | 0.005893469 |
| 48,000 Hz | Fire | 0.999092993 | 0.998647966 | 0.015097618 |
| 48,000 Hz | Thunder | 0.996219474 | 0.996074804 | 0.004704833 |

The 90-second window contains a partial final loop, so its RMS need not equal the complete-loop RMS exactly. The largest raw-versus-conditioned RMS ratio change in this table is about 0.052%. Every native browser wrap-jump measurement decreased.

## Regression and integration checks

- Thirty-eight tests passed across the new texture-loop suite, new live-stability suite and existing live-engine suite; affected-file lint and diff checks passed.
- Seam measurements cover 44.1 and 48 kHz. Additional 11,025 Hz and 96 kHz cases verify integer loop-frame counts, rounding of the 100 ms margin, finite samples and bounded fixture peaks.
- Ninety simulated clock updates preserve noise/nature source identity. Gain-only edits do not restart nature. Pause/resume retains the same sources.
- An external interruption hard-mutes and remains paused after platform auto-resume until the user resumes. Panic/restart reuses the cached noise buffer while delayed cleanup stops only old nodes.
- No changes were made to `src/engine`, `src/safety`, preset recipes or session timing. Preview clips still intentionally end at their stated duration, up to thirty seconds.
- AudioContext sample rate is fixed for that context. The tests do not model a Bluetooth route change by mutating that immutable property. Physical route changes and platform resampling remain device-level verification work.

## Short physical-device reproduction protocol

1. Record the preset name, phone model, OS/browser versions, output route (phone speaker, wired headphones or Bluetooth device), and whether the screen stayed awake. Use a quiet, comfortable volume throughout.
2. In the archive, choose **One quiet task**, then **Choose sound** and **Play session** in Listen. It contains the authored brown-noise layer. Do not use **Preview** for this full-session test; previews ending after their displayed 2–30 seconds are expected behavior.
3. Listen for at least 90 seconds. Note the exact clock time of any click, texture change, silence or pause, especially near 8, 12, 16, 24 and 30 seconds. Do not change settings during this baseline run.
4. Repeat with a quiet thunder or fire layer selected in Studio. Separately change only the nature volume while it plays; the texture should continue without restarting its envelope. A different selected texture is an intentional sound change.
5. Repeat on the phone speaker and the affected headphones. Then test screen lock or an actual output-route change in a separate run. If the app reports an interruption, use **Resume**; do not confuse that visible pause with a hidden preset change.
6. Report the exact preset/settings, elapsed time, foreground/background state and output route. If recording a comparison, keep the original recording and describe whether it captured the actual analog/device output or only internal browser audio.

## Sources and limits

- [MDN: AudioBufferSourceNode looping](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loop) documents replay at the buffer loop boundary. This explains the join mechanism; it does not establish perceptual audibility for a particular listener.
- [MDN: loopEnd](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loopEnd) and [loopStart](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loopStart) document the loop positions.
- [MDN: BaseAudioContext state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state) describes iOS interruptions on tab changes, minimization and screen-off. Existing explicit-resume handling is retained.

No physical Android/iOS phone, speaker, headphone, Bluetooth transport or analog output was tested by this worker. The software seam correction and browser numerical render are verified; resolution of the user's particular hardware symptom remains a physical-device check.
