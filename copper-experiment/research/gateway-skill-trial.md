# Gateway skill trial — repository audit

Audit date: 22 October 2026. Question: can this checkout regenerate its listed audio exactly, and do its Gateway/Focus frequency labels support a copper-object location experiment?

**Neither claim is established by the inspected repository.** It provides enough information to construct broadly similar study tones, but not to reproduce the listed MP3 bytes. Its labels do not supply evidence that a listener can locate copper, or a calibrated physical coupling that predicts copper position.

## What the bytes establish

Pinned local checkout: `075bbab71bd4c83946fac1c3180dbc9460ce32d2`; declared origin: `https://github.com/occult-kranti/gateway-files.git`. The bundled inventory tool found **10 committed text files, 48,846 bytes, no `index.html`, no PDFs, and no audio binaries**. Working-tree status was clean before and after the audit. README claims about a deployed website were not checked against a deployment.

`archive/BINARIES.md:34–38` claims exact regeneration from the presets and a browser Frequency Lab. The committed tree has neither that lab nor any generator. Available details include stereo 44.1 kHz MP3, sine pairs, 1 kHz pulses repeated at 40 pulses/s, low-passed pink noise, approximately 62–63-second loops, and MP3 V4 (`BINARIES.md:22–38`; `archive/FREQUENCY-RESEARCH.md:45–58`). Missing details include a pinned generator, exact per-file sample count, phase, gains/envelopes, pulse shape/width, noise algorithm/seed/filter, and encoder implementation/version/options and file metadata. V4 alone does not fix the encoder output. The published hashes could verify a supplied file; they cannot reconstruct absent bytes.

The bundled script and an independent Decimal subtraction both checked these five metadata pairs:

| Preset | Carriers (Hz) | Difference (Hz) | Result |
|---|---:|---:|---|
| Gateway Theta | 200 / 204 | 4 | matches metadata |
| Alpha Focus | 200 / 210 | 10 | matches metadata |
| Deep Theta | 180 / 186 | 6 | matches metadata |
| Delta Sleep | 100 / 102 | 2 | matches metadata |
| Schumann Octave | 200 / 207.83 | 7.83 | matches metadata |

No waveform was generated, decoded, listened to, or spectrally measured. The arithmetic does not verify channel routing, original Hemi-Sync processing, EEG effects, or physical effects.

## Claim and channel map

| Source assertion / present interpretation | Observable, units, input and readout | Alternative, discriminator and status |
|---|---|---|
| Exact audio regeneration (`BINARIES.md:34–38`) | Input: complete generator/configuration. Readout: PCM samples and encoded file SHA-256. | Many waveforms/encoders share these carrier labels. Supply deterministic code and all parameters, regenerate, and compare to the listed hashes. **Unsupported from this tree.** |
| Focus 10/12 represent experiential stages (transcript:95–105,166–180); the Alpha Focus preset also uses a 10 Hz difference | Carrier and interaural difference: Hz. Focus: a named subjective stage, without a calibrated numerical unit here. EEG would require recorded voltage and its spectrum. | Shared digits do not identify a state with a frequency. The transcript describes counting and subjective changes, not a 10/12 Hz specification. **Terminology is documented; Hz-to-Focus calibration is absent.** |
| 40 Hz clicks and 7.83 Hz beat labels (`presets.json:39–54`) | 40 Hz is pulse repetition; 1 kHz is its carrier. 7.83 Hz is a chosen difference between carriers. | Neither is a measured copper resonance or a measured environmental field. The dossier's “exact geophysics” label supplies no field measurement. **Metadata only.** |
| Remote viewing/spatial orientation (transcript:86–122) might motivate a copper-location hypothesis | Input: concealed, independently randomized target. Readout: a preselected hit rate or position error in cm against recorded ground truth. | Chance, sensory leakage, cueing and flexible scoring remain alternatives. The repo contains instructions, not target trials or location outcomes. **No copper-location support found.** |

For a copper-location hypothesis, source channel, target channel, dimensioned law, parameters, calibration, transfer function, source/load/loss budget, raw data and held-out predictions are all **null / unspecified** in this corpus. This is an evidence gap, not a measurement of zero coupling. Acoustic pressure, interaural difference, pulse rate, EEG voltage, quasi-static electric fields, copper mechanical modes and spatial coordinates must remain separate channels. A grade attached to a health or EEG study cannot be transferred to copper location.

A discriminating first test would conceal randomized copper, a matched dummy and empty conditions from both participant and scorer; prevent target/audio/handling cues; fix trial count, scoring and chance model beforehand; and reserve held-out trials. Use matched control audio and audio-off trials to distinguish any location performance from an audio-specific effect. If a physical mechanism is claimed, independently measure the proposed input and copper response with units and calibration. Numerical frequency matches, a subjective Focus report, phase reversal alone, or the tallest spectral bin changing are insufficient controls.

One source rebuttal also fails its own stated standard: `archive/FREQUENCY-RESEARCH.md:21,24–28` acknowledges sound is a pressure wave but uses photon-energy arithmetic and an unspecified universal tissue Q to dismiss acoustic effects. Those do not replace a classical source/transfer/loss calculation. Rejecting that argument does not establish Gateway or copper-location efficacy.

## Source and fidelity limits

All ten tracked texts were read. The workbook is explicitly a cleaned transcript with silent OCR corrections (`transcript:3–9`), carries a 1977 Monroe copyright notice, and was not compared with scan images. No original report/workbook PDF, commercial tape, cited paper/book, external site, or hosted audio was accessed. No original/official-archive-copy document was therefore validated here; document IDs and page maps remain repository assertions. Declassification/custody is not empirical confirmation or a general rights conclusion. The two tiny `files/` dossier/program files are pointers, despite their “identical content” wording. No physical, EEG, electrical, mechanical, or location data were supplied or produced.

## Execution evidence

Applied the local `gateway-evidence-audit/SKILL.md`, its evidence contract and source-leads reference, and read the bundled script before execution. The dated reference examples were treated as leads, not as fresh verification of external sources. A second agent independently inspected the regeneration claim and carrier arithmetic and agreed with the missing-parameter finding; this was an AI review, not human or historical-scientist participation.

Commands executed successfully (exit 0):

```text
python /root/.codex/skills/remote-skills/gateway-evidence-audit/scripts/audit_corpus.py /workspace/scratch/c230cc629529/gateway-review --expect-commit 075bbab71bd4c83946fac1c3180dbc9460ce32d2
git -C /workspace/scratch/c230cc629529/gateway-review rev-parse HEAD
git -C /workspace/scratch/c230cc629529/gateway-review ls-tree -rl HEAD
git -C /workspace/scratch/c230cc629529/gateway-review diff --exit-code
git -C /workspace/scratch/c230cc629529/gateway-review status --porcelain
```

The inventory returned `trackedFileCount=10`, `totalBytes=48846`, `indexHtmlPresent=false`, `pdfFilesPresent=[]`, `audioFilesPresent=[]`; all five `presetArithmetic.arithmeticMatches` values were true. Binary floating-point subtraction returned `7.8300000000000125` for the fifth pair; the independent `decimal.Decimal` calculation returned exactly `7.83`. Clean status was `''`; `git diff --exit-code` returned 0. Read-only `cat`, `sed`, `nl`, `rg`, and `git remote -v` supplied the cited passages and provenance. No repository or skill was edited, and nothing was deployed or sent to a third party.

### Committed source ledger

Custody for every row: local committed copy, origin declared above. Reading depth: full text. Hashes identify inspected bytes, not historical fidelity or scientific validity.

| Path | Source category | Bytes / lines | Git blob | SHA-256 |
|---|---|---:|---|---|
| `README.md` | project description / pointer | 2813 / 49 | `40b9f474fcbcaa8d5293bb4b48532b2aed73d183` | `020ea5db6dc5a35b0e0bcf2f091abe66716938b2c6cad965d9a440723fe50149` |
| `archive/BINARIES.md` | binary manifest / pointer | 2229 / 38 | `4f0f6ee344a367ef30a34e9fc4002474c87822b7` | `f50fc971373dd719fab6be3924dd5f47276057d03506766511c2c56c145a8f07` |
| `archive/FREQUENCY-RESEARCH.md` | compiled derivative dossier + synthesized study metadata | 7520 / 70 | `dd2917486fa9b71fdee2aa5e8a6fd5dec8af86aa` | `54c6a6487cfd0f8b5ada808ff7aa39e659e29838593794ca5228e62b36558305` |
| `archive/INDEX.md` | archive index / pointer | 5549 / 72 | `1a9783c626b69b49856ff06e2ef5b44c742897a2` | `bb3bd933a3028e9fc131afda54e2a7d778c9ce639926940b3f559cb911d969a5` |
| `archive/PRACTICE-PROGRAM.md` | reconstructed practice guide | 5372 / 70 | `2e77bd8ae45fc696ec8f606339d2f5803399c25e` | `0efaac0f09e51d57b674bab1172c8a891d98da3f60212b14b96bb53c4702db91` |
| `archive/READING-LIST.md` | bibliographic pointers | 3110 / 58 | `893f5a541a26305360378743b08c663f6ae20cdc` | `14570398f32bbbb0b03ab6ce44ea3af24f9851016e6de2f49fd9ee96bfcdf895` |
| `files/03_Gateway-Intermediate-Workbook_1977_transcript.md` | derivative transcript | 19038 / 367 | `685bfd32c04301734695e901d422bc5c1fd3af90` | `97553256fb8413be51571b94afe720a3d5b0a5b7b98b3d53b38eb5d478d292f8` |
| `files/FREQUENCY-RESEARCH.md` | one-line pointer | 160 / 1 | `7480953a37e4dd029ad71ee0a4d6919abaaaa29b` | `eb7926b6710ca3220c5d4b8a0c921c7cff9f1bfee6aa67382685b7905e2558c3` |
| `files/PRACTICE-PROGRAM.md` | one-line pointer | 158 / 1 | `695c1ca6488e28fb040c80609dbedf7cef724f6e` | `fef174d492c026fea51a1aa52bed8beb815812ad459f01d368875f4c1a132709` |
| `files/audio/presets.json` | synthesized study metadata | 2897 / 65 | `a3b7865e5a7ac8e879f0e006a604a4c9d81e7b9e` | `7d4f0c2e9632cb7058ee75ec278e134ded24328d3b327886ace047e24294eac9` |

Bundled tool SHA-256: `9c4ca249d073e2134903ab967eb2416423376948ab160158b3b417056277b7ef`.
