# Integration and verification record

Research snapshot: 21 October 2026. No physical experiment was conducted.

## Independent roles

The actual research agents handled source provenance, forward physics, independent numerical reconstruction, recent literature, apparatus drawings, interface implementation, and browser verification. These are AI agent contributions, not participation by Tesla, Newton, outside scientists, human reviewers or named model providers.

## Executed checks

- 13 Node tests passed, including the independent numerical comparison entry point.
- 127 independent comparisons/property checks passed against Python/SciPy roots, shell determinants, generalized eigenvalues, complex response calculations and invariant/negative controls. The maximum recorded relative discrepancy is 4.79e-12.
- The Python reference was executed again after integration; the comparisons were rerun against the exact shipped models.mjs.
- Actual Chromium 153 desktop 1440x1000 and mobile 390x844: 20/20 browser checks passed. All five presets, sphere/empty-table channels, validation, approximation warning, raw exports, shared URL, keyboard tabs, graph/filter/details and source/diagram loading were checked. No runtime errors or failed requests remained.
- Initial visual review identified overlapping mobile readouts and a cropped plot range. One repair batch and one confirmation batch resolved both. A closed text-disclosure test was corrected to open the disclosure before inspecting it; it was not a product failure.
- Three deterministic SVG apparatus diagrams were rendered and inspected. They are schematic, not scale drawings or physical prototypes.
- An actual rsync fixture verified that the parent deployment preserves the independently deployed location/ subtree while removing stale parent files.
- The existing Device Observatory's 21 tests and build passed after the navigation integration.

## Source and deployment boundaries

The new page belongs to research/location-spectrum and publishes only devices/location/. The parent source branch receives a deployment exclusion and a navigation link. Master and archive source branches are outside this change. Native Pages publication and live byte-level verification are a separate final release gate, recorded by deployment.json and the GitHub workflow history.

The source register has 38 records; the curated network has 32 nodes and 34 typed relations. These counts refer to selected records and a project-authored connection map, not exhaustive SOTA coverage or 38 independent experiments. External tool source code, neural operators and Lean formalizations were not executed unless explicitly identified in the reports.
