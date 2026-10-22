# Fieldwork / Copper sphere position spectroscopy

An experiment-design page with a radial elastic-sphere calculator, synthetic position-response counterexamples, a paper/topic network, exact apparatus drawings, and offline measurement-analysis tools. Author/project credit: Hruday N M / BUNZEEY; research, implementation and independent checks assisted by separate model agents. These are internal computational reviews, not external human peer review.

**Question:** Does the same matched mechanical mode change between two surveyed positions after controlling support, drive, sensor projection, orientation, temperature and time? Neither an object nor a table coordinate has one universally defined “entire frequency.” The operational outputs are finite-band spectra and transfer functions with units, uncertainty and instrument calibration.

The physical setup has not been constructed or measured. Browser traces and bundled CSV examples are explicitly synthetic. A 25 mm sphere's illustrative first radial breathing mode is ultrasonic, about 167 kHz; this is one selected family, not the lowest mode of the whole sphere. Chemical purity alone does not make copper elastically isotropic. Do not use the isotropic calculator as a calibration certificate.

## Run

```sh
cd device-observatory/position
python3 -m pip install -r analysis/requirements.txt
npm run check
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080/`. The website needs no npm runtime dependencies. Python analysis uses NumPy and SciPy, pinned in the requirements file. The deployed `code/` directory includes calculator tests and analysis source. See `analysis/README.md` for raw CSV and paired-block commands.

## Scientific record

- `research/contract.json`: bounded question, assumptions, controls and acceptance conditions.
- `research/protocol.md`: channel definitions, apparatus, randomized ABBA/BAAB design, controls and uncertainty.
- `research/derivation.md`: free-sphere boundary equation, numerical model and limitations.
- `research/sources-review.md` and `src/evidence.json`: selected primary sources, reading depth, dates and typed graph.
- `research/advisor-decision.md`: reconciliation of producer and skeptical findings.
- `research/verification.json`: current calculation, data-analysis and browser evidence.

The OpenAI mathematics release and Anthropic research are reviewed as dated, scoped source claims. They are not evidence that space has a unique measurable frequency, nor have their reported proofs been independently formalized by this project. The source graph distinguishes established methods, reported claims, model examples and open experimental questions. Conference names and publication status are recorded without inventing universal venue rankings.

## Isolation

Source lives on `research/copper-position-spectroscopy`, based on `research/device-observatory` at `c2f79aaa46a520a14cab18ef56b13f3b89ca504b`. The new page is built separately for `/brainwave_opensync/devices/position/`. Master and archive application source are outside this change. The deployment workflow updates only this subdirectory under the shared Pages lock. Publication, successful workflow execution and live byte matching are separate checks.

Code and deterministic diagrams follow the repository MIT license. Linked sources retain their own rights. No third-party paper is redistributed as a full text; the source register links to originals.
