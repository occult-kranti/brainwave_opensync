# Security policy

Open Sync is a static, client-only web app: no server, no accounts, no data leaves the browser except font requests. The attack surface is the browser tab itself.

## Reporting

Open a GitHub issue titled `security:` with the details, or, if the report should stay private until fixed, use GitHub's private vulnerability reporting on the repository. Expect an acknowledgment within a week.

## In scope

- Anything that lets a crafted **share link** (`#s=…`) or persisted **localStorage** blob execute code, crash the app, or bypass a safety rail (gain cap, session limit, infant mode, advisory gate). Decoders are defensive by design (`src/ui/session/shareLink.ts`, `sessionPersistence.ts`); tests cover hostile inputs.
- Output-level bugs: any path that can raise the master gain above the governor cap or skip the panic cut.
- Service-worker caching mistakes that could serve a stale, vulnerable build indefinitely.

## Out of scope

- Denial of service against your own browser tab.
- Third-party CDN availability (Google Fonts).

## Supported versions

Only the latest release on `master` is supported.
