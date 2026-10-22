# Version1.1 validation record

22 October 2026. This record covers the selected model and interface. The deployed `deployment.json` identifies the exact published commit and model hashes. Physical measurements: zero.

- 28 Node tests passed, including 15,395 independent acquisition/covariance comparisons and the original127 sphere/support/table comparisons.
- Near-boundary radial roots were checked using90-digit arithmetic; modal masses were checked by separate quadrature. Two numerical cancellation defects were repaired without changing the copper defaults.
- The optional package bench was executed by its producer, independently reviewed/reproduced, and rerun during integration:18/18 checks passed. These reruns reproduce the same adapter and are not additional independent implementations or physical experiments.
- Original browser behavior:20/20 checks passed. Expanded acquisition, graph, image, export and benchmark behavior:18/18 checks passed. Chromium153, desktop1440×1000 and mobile390×844. No JavaScript errors or failed HTTP requests remained.
- The first browser pass found a duplicated readout selector and a numeric input-step mismatch; these were repaired. The expanded graph's patent filter initially omitted nodes because of group classification; explicit groups repaired it. Confirmation checks passed. Final screenshots were visually inspected, including the actual mobile FFT/readouts and apparatus gallery.
- Both new scientific SVGs were rendered and inspected. All75 text elements remained within their canvases. Three generated apparatus images were inspected and integrated with explicit illustration labels and recorded prompts.
- Build validation rejects duplicate source/node identifiers, missing source provenance and graph edges with missing endpoints.

Evidence: `regression-browser-v1.1.json`, `acquisition-browser-v1.1.json`, `acquisition-review-results.json`, `producer-comparison-v1.1.json`, `tool-bench.json`, and the independent review. The21October reports remain historical records of the preceding version.

Coverage is selected:80source records,10patent/application records,82graphnodes,84typedrelations,5mechanicalpresets,6acquisitionpresets,12hypotheses. Full books, every patent family, all modal families and all available packages were not reviewed or simulated. Tool-specific failures and unsupported methods remain visible in the tool-integration report.
