# ASTRA

Foundation for a three-person NASA Space Apps health-monitoring prototype. React 18 + Vite + TypeScript + Tailwind's Vite plugin, Recharts 3 and react-body-map 1.1.0. Local browser storage only. **Feature views are typed TODO stubs**, intentionally left to the three assigned parts.

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

Start with [the handoff](docs/HANDOFF.md), [contract](docs/CONTRACT.md), [build log](docs/BUILD_LOG.md), and your task:

- [Part 1 — Check-in and About](docs/tasks/part-1-checkin.md)
- [Part 2 — Dashboard and Emergency UI](docs/tasks/part-2-dashboard.md)
- [Part 3 — Body map, integration and deploy](docs/tasks/part-3-bodymap.md)

Five hash routes: Check-in, Dashboard, Body map, Emergency, About. Emergency access and the simulation notice are persistent in the shell. The environment is fixed to ISS until Part 3 adds the switch; spacecraft/Moon base configs are conceptual only.

All demo entries are **simulated**, not NASA astronaut data or OSDR records. A missing storage key loads the simulated demo; reset writes an empty dataset that stays empty on reload. `Storage.save` upserts a date and can throw on invalid data or browser storage failures.

Baseline compares latest with the **seven preceding entries**. All numerical flags are labelled **prototype rule, not a medical threshold**; `comparable: false` means not assessed, never medical clearance. Decision support only; follow your mission medical checklist and contact the ground flight surgeon.

Research and measurement/action gaps remain visible as `TODO: verify` in the data. See [source verification](docs/RESEARCH_VERIFICATION.md) and [third-party notices](THIRD_PARTY_NOTICES.md). The installed body package uses `data` and `onBodyPartPress`; its README example is stale. Both selectable head paths exist.

Foundation branch: `feature/foundation`. Merge the parts in order 1 → 2 → 3. A GitHub remote has not been configured; add your team's repository and push the foundation before teammates branch from it. Publication/deployment belongs to Part 3.
