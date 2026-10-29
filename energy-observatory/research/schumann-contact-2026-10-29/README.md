# Schumann, occult sources and ET-attributed contact

Start with [report.md](report.md), [protocol.md](protocol.md), the [six advisor decisions](rounds/) and [source/repository ledgers](panel/). The main publication is additive to the Energy Observatory; the linked corpus continuation belongs to `occult-kranti/channels-ET`.

## Reproduce the reviewed work

From `energy-observatory/`, with Node22+ and Python3.12+:

```sh
python3 -B research/schumann-contact-2026-10-29/check_release.py --output /tmp/contact-check.json
npm run check
node build-contact.mjs
```

The new release gate verifies hashes and replays the producer and independent verifier for rounds2–6 in an isolated temporary copy. It does not mutate reviewed artifacts. Round1 is the source/prior-art gate, not a numerical experiment. The source code uses Node/Python standard libraries; no source service is contacted by these replays.

The existing `npm run build` remains frozen because earlier scientific receipts bind `package.json` and its builder. `node build-contact.mjs` adds `contact.html` and `contact-methods.html` after that build. The deployment workflow invokes this step explicitly. Do not modify old receipts merely to integrate a new page.

With the documented local Chromium/Playwright runtime available, browser checks are:

```sh
node scripts/contact-browser-check.cjs
```

Set `ENERGY_CHROMIUM` for a compatible browser path and make Playwright resolvable in Node. The check serves only the built local site, exercises both viewport sizes, graph filtering, zero-field/zero-sensitivity calculation, export and artifact links. Browser results do not validate physical observations.

## Preserve boundaries

Four panelists and two dedicated workers were actual model agents. They are not human peer reviewers or independent experimental laboratories. No new physical measurement, human information trial or verified ET contact was produced. Earlier formulas and probability results are replication/engineering; fundamental novelty is not established. Negative or failed controls, including the32-offset resolution failure and initial positive-tail underflow, remain inspectable.

Only public source links, short original summaries, our code and synthetic/derived artifacts are republished. Full third-party recordings/transcripts/artwork and private repository contents are not imported. Each source ledger records actual reading depth; the selected repository read is not a whole-corpus audit. Multiple papers or mirrors sharing one source/data family are not independent corroboration.
