# Sound Research Laboratory — release verification

Verified on 16 October 2026. These checks validate the implementation, not a health claim.

## Branch isolation

- Archive parent: `96b62177e4f6f9071f62173b7689684dd5b6535c` (`archive/dark-landscapes`).
- Master parent: `22af1cd1a9a37dc8d1cacac2e52be0aabf065dd7` (`master`).
- Shared lab files were copied into separate worktrees. Existing branch layouts were retained; the archive was not merged into master.
- No changes to the core engine, audio transport, session provider, safety subsystem, Home page or global stylesheet.

## Automated checks

| Edition | Command | Test files | Tests | Result |
| --- | --- | ---: | ---: | --- |
| Archive | `VITE_BASE=/brainwave_opensync/archive/ npm run check` | 106 | 1,398 | Lint, typecheck, tests and production build passed |
| Master | `VITE_BASE=/brainwave_opensync/ npm run check` | 96 | 1,335 | Lint, typecheck, tests and production build passed |

The new model tests check analytic values, bounds, invalid inputs, units and export metadata. Page tests exercise quiet opt-in previews, advisory/mute/panic/session/infant gates, route cleanup, silent preset loading, model controls, country filtering and dossier navigation. An independent review passed all 62 targeted model, acoustics, preset and page tests.

Route-shell generation passed for 35 archive routes and 29 master routes, with 404 fallbacks. Production output was served with each actual deployment base path during browser review.

## Browser review

Both editions were checked at 1440 × 1000 and 390 × 844 in Chromium. All four direct lab URLs returned HTTP 200. All seven sections opened, with no JavaScript page errors or horizontal document overflow. Desktop and mobile screenshots were inspected. The archive retained its spatial backdrop; master retained its existing sidebar workspace.

## Preset preservation

- 12 original experimental recipes and 12 rendered two-second stereo WAV previews added.
- 151 preview files total, occupying 57,990,644 bytes, below the 60 MB budget.
- All 139 pre-existing WAV files were compared against each branch parent and remained byte-identical.
- Both branches use identical new recipes, preview files and source modules.

The existing offline sine-AM versus live two-tone `monaural` distinction is disclosed in the new lab and affected recipes. This release does not change that engine behavior.

## Evidence boundaries

The review includes selected recent primary studies, six mechanism chains, primary-text readings, commercial-method records, 11 government records from three countries, six falsifiable research questions and four additional listening proposals. Access restrictions, abstracts, preprints, institutional reports and unknown dates are explicitly labeled. A source record or formula does not validate an original preset. No patient response or biological efficacy is calculated.

## Publication check

The deployment coordinator builds the archive source separately and reads its preset count from its preview manifest. Publish the archive commit before the master commit so the master workflow captures both updates. The authoritative deployed source SHAs are recorded by the coordinator in the site's `deployments.json`; verify those against the branch commits after its workflow completes.
