# Reproduce the energy study

Run from the extracted `energy-observatory/` directory. Install `python3 -m pip install -r analysis/requirements.txt`. Node22+ is used by browser-model comparisons. All samples are synthetic.

## Independently authored release gates

```sh
python3 -B analysis/panel_crosscheck.py --output /tmp/energy-crosscheck.json
python3 -B analysis/metrology_quantum_check.py --compare research/panel/metrology/round3-independent-quantum-fixtures.json --output /tmp/energy-quantum-check.json
python3 -B analysis/metrology_reference.py --output /tmp/energy-metrology-check.json
```

The systems reviewer independently reconstructs EM/piezo complex matrices and matched-input constraints. The metrology reviewer froze quantum matrix fixtures before inspecting the quantum implementation. The metrology reference separately checks waveform products, aliasing, storage and uncertainty against its own JavaScript implementation; that last comparison is a different formulation by the same author, not independent authorship.

## Producer replays and their scope

```sh
python3 -B analysis/em_reference.py --output /tmp/energy-em.json
python3 -B analysis/acoustic_reference.py --output /tmp/energy-acoustic.json
python3 -B analysis/quantum_reference.py --output /tmp/energy-quantum.json
python3 -B analysis/systems_reference.py --output /tmp/energy-systems.json
```

These use independent mathematical formulations by their respective producers. ODE evolution, external sampled power quadrature, matrix eigenvalues and finite unitary searches have different numerical error sources; none replaces apparatus calibration or data. Parameter grids and constraints are recorded in the emitted JSON and panel reports. Round2 versions and results remain preserved where Round3 changed code.

The browser package is dependency-free at runtime. `npm run check` runs integration guards and builds all seven pages and the three preserved apps. Each preserved version also retains its original package tests. `scripts/browser-check.cjs` uses an external Playwright installation and Chromium; configure NODE_PATH and ENERGY_CHROMIUM for your environment.
