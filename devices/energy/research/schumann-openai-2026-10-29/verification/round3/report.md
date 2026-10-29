# Independent round 3 verification

**Admitted within the stated model and metadata-only scope.** The independent Python oracle and fixtures were frozen before reading round 3 producer code. The final JavaScript snapshot `analysis/round3/model.mjs`, SHA256 `c59e7b5d2489294c897a641a767fce25d5c743ea49e4236dcfebdc35ea1bec30`, passed 82 API requests and 340 recorded assertions. Eight malformed or extreme numerical inputs were rejected, as was the separately declared conjugated-phase counterexample. The largest nonzero relative discrepancy in compared numerical fields was about 3.21e-13, within the preregistered 2e-11 tolerance. These checks establish bounded implementation agreement, not uniform numerical accuracy or a physical discovery.

## Inverse and held-out checks

Under known positive mass, positive probe frequency, calibrated complex force/displacement and q=Re(Q exp(i omega t)), write Z=1/H. Then omega0²=omega²+Re(Z)/m and gamma=Im(Z)/(2m omega). The derivation is an algebraic identity within a single stable damped mode. Positive finite reconstruction is necessary; it does not establish the model class.

Four exact synthetic cases recover the actual R2 equal-output pair (7.8 Hz, m=.25 kg and 10.3 Hz, m=.4 kg) and independently chosen 8-Hz Q=.6 and 2.5-Hz Q=.4 models. Each predicts three held-out frequencies, 2.3, 11.7 and 17.1 Hz, distinct from its identifying probe. The tests use relative 2e-10 and absolute 1e-15 m/N held-out tolerances. These are arithmetic thresholds, not observational error bars.

The declared countercases behaved as expected:

| Countercase | Independent result |
|---|---|
| Conjugated phase convention | Reconstructed damping is negative; rejected. |
| Gain 1.35 treated as calibrated unity, known mass | Held-out relative discrepancy reaches .3021. |
| H1+.8 H2 fitted by one mode | Held-out relative discrepancy reaches .4901. |
| Identifying datum multiplied by 1+1e-4+2e-4 i | Frequency shifts by about 6.41e-8 relatively, damping by −4.98e-4; clean held-out discrepancy reaches 1.16e-4. |

The table uses the independently frozen measured-response normalization. The API reports symmetric residuals normalized by max(predicted, measured); `revision-record.md` documents that reporting distinction. Both discriminators give the same declared decisions. Finite failed countercases do not show that every wrong model must fail.

## Calibration ambiguity and constant gain

The exact identity G(f)=H2(f)/H1(f), G H1=H2 holds where H1 is nonzero. Stable individual modes are continuous, finite and nonzero on our compact positive band. Eleven receiver-ratio API points were compared, including four with the same known mass .25 kg in both models. That latter control isolates receiver calibration: the observed response of the 7.8-Hz oscillator reconstructs the 10.3-Hz target and passes all three held-outs, with maximum relative mismatch about 4.31e-16. No mass error is needed.

For these rational oscillator responses, the ratio has a proper stable causal system-theory representation with direct feedthrough. That algebra does not establish a physical sensor implementation or passivity. Arbitrary nuisance responses remain unconstrained in the countermodel; finite-band equality alone does not validate a real instrument.

An unknown positive **constant real** gain is a more restricted nuisance. For Y=gH, Z=1/Y=A(omega0²−omega²+2i gamma omega) with A=m/g. The slope of Re(Z) against omega² is −A. Two distinct frequencies recover A, omega0 and gamma. The independent g=3.7 example recovers 7.8 Hz and gamma=4.900884539600076/s, with A=.06756756756756757 kg. Mass and gain remain confounded if neither is known; poles need not be. This calculation is recorded in the frozen Python fixture, not an unexecuted optional producer feature.

## Evidence intake and actual October outcome

Forty-six metadata cases were executed: two fully specified synthetic cases were ready-for-analysis; 44 incomplete or invalid cases were insufficient-evidence. The controls include missing fields, wrong units and Kp observable, screenshot-like record kind, malformed hash/URL, invalid calendar dates, time offsets, future/incomplete/reversed intervals, failed QC, missing calibration/baseline/uncertainty, duplicate station IDs, missing child records and mismatched global intervals. The global positive control supplies full independently identified calibration metadata, not merely an ID count.

The actual October inventory returned **insufficient-evidence**, `synthetic:false`, `metadataOnly:true` and `anomalyEstablished:false`. It lacks a specified calibrated numeric Schumann station/channel record, complete series, QC, calibration, matched baseline and decision/uncertainty procedure. Saved NOAA/GFZ Kp bytes and source manifests remain bound and checked; Kp supplies separate geomagnetic context. This analysis did not acquire or fit missing Schumann waveforms and makes no recent Schumann-anomaly inference.

Even a ready metadata packet authenticates none of its assertions. Different station names do not establish independent instruments or nonoverlapping feeds; full metadata also does not verify those claims. Raw numeric validity, calibration traceability, baseline matching, shared-observable assumptions, dependence, selection and multiple-testing choices, and physical nuisance models remain external requirements. The synthetic controls prove no anomaly.

## Preserved failure and reproducibility

The first producer snapshot accepted H=(1−i)1e308 at a 6.4-Hz probe despite loss of the inverse's real detuning correction. The failure is preserved in `initial-comparison-results.json`, with the captured producer and harness bytes. The producer added forward replay and rejects unsupported range or relative replay error greater than 1e-10. The final replay rejects the original counterexample; normal controls remain unchanged. Frozen oracle fixtures and numerical thresholds were not loosened.

Run from `energy-observatory/`:

```sh
python3 -B research/schumann-openai-2026-10-29/verification/round3/compare_producer.py
```

`comparison-results.json` binds the final module, oracle, fixtures, schema and receiver supplements, bridge, checker and relevant saved source bytes. `freeze.json` hashes this final record and the preserved initial failure. No fourth research round was performed. The next admissible work requires calibrated station data and an actual uncertainty procedure; it does not follow from additional simulated agreement.
