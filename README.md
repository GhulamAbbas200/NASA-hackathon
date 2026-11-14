# ASTRA

Light and dark modes are available through the header sun/moon button. The app remembers your choice in this browser and otherwise starts with the system preference. Shared typography uses 16px body text, 18px card headings and generally 14px supporting labels.

Complete local NASA Space Apps health-monitoring prototype. React 18 + Vite + TypeScript + Tailwind's Vite plugin, Recharts 3 and react-body-map 1.1.0. Local browser storage only. The daily check-in, trends, guidance, emergency flow, sources and interactive body-map views are implemented.

Requires Node.js 22.12+ and npm. The implementation is at this repository root.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite. In PowerShell, if `npm.ps1` is blocked by execution policy, use `npm.cmd install` and `npm.cmd run dev` (same for other scripts). No environment variables, account, API key or backend are needed.

```sh
npm test
npm run build
npm run preview
```

Build output is `dist`. `package-lock.json` is committed; use `npm ci` for a clean, lockfile-based installation. There is no service worker: a loaded app can use local data without API calls, but fresh offline loading is not implemented.

Start with [done/remaining progress](docs/PROGRESS.md), [the original handoff](docs/HANDOFF.md), [shared contract](docs/CONTRACT.md), [validation](docs/TESTING.md) and [demo script](docs/DEMO_SCRIPT.md). The original team task breakdown is retained for reference:

- [Part 1 — Check-in and About](docs/tasks/part-1-checkin.md)
- [Part 2 — Dashboard and Emergency UI](docs/tasks/part-2-dashboard.md)
- [Part 3 — Body map, integration and deploy](docs/tasks/part-3-bodymap.md)

Five hash routes: Check-in, Dashboard (labelled Overview), Body map, Emergency, About. Anatomy hotspots and labelled buttons select live region insights; actual front/back SVG models support mouse selection and equivalent keyboard controls. Charts read the saved values and provide dated table alternatives. Emergency follows the sourced graph with per-step limits. The environment selector keeps ISS primary and clearly marks spacecraft/Moon base as conceptual; it does not invent hardware or schedules for those environments.

All demo entries are **simulated**, not NASA astronaut data or OSDR records. A missing storage key loads the simulated demo; reset writes an empty dataset that stays empty on reload. `Storage.save` upserts a date and can throw on invalid data or browser storage failures.

Baseline compares latest with the **seven preceding entries**. All numerical flags are labelled **prototype rule, not a medical threshold**; `comparable: false` means not assessed, never medical clearance. Decision support only; follow your mission medical checklist and contact the ground flight surgeon.

Research and measurement/action gaps remain visible as `TODO: verify` in the data. See [source verification](docs/RESEARCH_VERIFICATION.md) and [third-party notices](THIRD_PARTY_NOTICES.md). The installed body package uses `data` and `onBodyPartPress`; its README example is stale. Both selectable head paths exist.

Full implementation branch: `feature/complete-app`, based on the earlier `feature/foundation`. Abbas authorized completing all three parts together. No GitHub remote is configured, and nothing has been pushed or published. **Deployment is deferred by the user's choice.** See `docs/PROGRESS.md` for implemented work and the remaining external verification items.
