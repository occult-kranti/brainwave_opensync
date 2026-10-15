# Published editions

- `master`, at `/brainwave_opensync/`: original sound workspace restored from `78b0751`, before either listening-room revamp. App source matches that release apart from one link to the new listening room. Deployment configuration excludes the separately published editions from its service worker.
- `archive/dark-landscapes`, at `/brainwave_opensync/archive/`: redesigned Today / Explore / Listen / Research experience, all 131 presets, and the Night Country / Quiet Horizon landscape themes.
- `archive/listening-room-2026-10-15`, at `/brainwave_opensync/previous/`: the intermediate listening room, frozen at `ae4a1ebd6d1449979739edc9b5f84e2f09d39287`.
- `legacy-v2.5`, at `/brainwave_opensync/v2/`: retained legacy release.

The master Pages workflow checks out and builds all editions before publishing one complete site. After updating `archive/dark-landscapes`, run the Pages workflow on master to publish it. Every actual source commit is recorded in `deployments.json`. The preserved audio suite and research atlas remain at `/open-sync/` and `/research/`. Small redirect documents keep archive links to those projects working.

The restoration is a new commit; no branch history is force-rewritten.
