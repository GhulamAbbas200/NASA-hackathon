# Foundation PR

Title: **Build ASTRA foundation and shared contracts for the three-part team split**

Base: `main` (the team repository's default branch). Head: `feature/foundation`.

## Description

ASTRA now has a running React/TypeScript/Vite foundation with Tailwind's Vite setup, Recharts and the verified react-body-map package. The reference-led light dashboard centers an original anatomy illustration between compact crew/context and insight panels. Top navigation links Check-in, Dashboard (Overview), Body map, Emergency and About, keeps Emergency access visible, and labels simulated records. All eight feature components remain typed TODO placeholders for the three assigned owners. The anatomy art is illustrative, not a scan, interactive 3D model or health overlay.

Shared contracts cover indicators and sources, region slugs/click adapter, sourced emergency branches, ISS/conceptual environment configs, reminders, 14 simulated entries, versioned localStorage and seven-prior-entry baseline comparisons. Alert settings are centralized and explicitly labelled prototype rules, not medical thresholds. Storage errors and insufficient data stay explicit. No backend or deployment was added.

Three task files document ownership, exact props/helpers, acceptance criteria, branches and run instructions. The unchanged supplied handoff is preserved at docs/HANDOFF.md. A contract guide, source-verification ledger, build log and third-party credits accompany it.

## Validation

- `npm install`: completed; lockfile committed, zero reported vulnerabilities at installation.
- `npm test`: 20 passing tests covering baseline windows/missing values/persistence, storage round-trip/corruption/quota/reset, emergency graph/citations, and the installed body-map slugs/rendering/callback.
- `npm run build`: passes TypeScript and production bundling.
- `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`: starts successfully; page, App module and stylesheet return HTTP 200.
- Original handoff and docs/HANDOFF.md SHA-256 hashes match.
- Reference-led shell checked in isolated headless Chrome at 1440px, 390px and 320px: anatomy image loads, navigation/Emergency/simulation labels are visible, no horizontal overflow, all five routes navigate, no observed runtime exceptions. Assigned parts still require their feature/browser acceptance checks and manual accessibility review.

## Review notes and limits

- Actual body-package API is data/onBodyPartPress, unlike its README; selectable front/back head paths exist. Its SVG paths need the keyboard alternatives specified in Part 3.
- Seven-prior-entry baseline excludes latest, confirmed by Abbas. Missing/partial readings are unassessed, never medical clearance.
- Medical-device procedures, current equipment, indicator action criteria and mission-specific emergency branches remain visibly TODO: verify. Research sources do not certify a flight protocol.
- Daily scales/reminder cadence are ASTRA design choices. Spacecraft/Moon base are conceptual only. OSDR references are rodent research context; no OSDR data is imported as crew measurements.
- Historical inaccessible sources, OSDR full metadata/terms and any extra wrapper copyright notice remain unverified. Original drawing MIT notice is retained.
- Full outstanding list: docs/BUILD_LOG.md and docs/RESEARCH_VERIFICATION.md.

## Run / team handoff

```sh
npm install
npm run dev
```

On PowerShell with execution-policy restrictions use npm.cmd. Merge/land the foundation, then create feature/part-1-checkin, feature/part-2-dashboard and feature/part-3-bodymap. Merge those in that order. Keep shared contracts stable and record proposed changes before editing them.

No GitHub remote was supplied or configured, so this is prepared PR text for the local branch, not a claim that a remote PR has been opened. Deployment belongs to Part 3.
