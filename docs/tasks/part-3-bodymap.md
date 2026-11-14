# Part 3 — Body map, integration, deployment and demo

Owner: Abbas. Branch: `feature/part-3-bodymap`.

Read `docs/HANDOFF.md` completely, then this file, `docs/BUILD_LOG.md`, and `docs/CONTRACT.md`. The scaffold and eight stubs exist. Build only this part and integrate the other two via their props.

## Goal

Connect body regions to latest values, trends and sourced next actions; finish App integration/environment switch; deploy the completed prototype and prepare a short demo.

## Owned files

- `src/components/BodyMap.tsx`
- `src/components/RegionPanel.tsx`
- `src/App.tsx`
- `src/components/layout/AnatomyPreview.tsx` and `public/assets/astra-anatomy.png` (adapt the decorative reference-led canvas when integrating the actual map; do not claim the image itself has selectable regions)
- `docs/DEMO_SCRIPT.md` (create in this part)
- Deployment configuration, only as needed for Vercel/Netlify after integration.

Use Tailwind utilities and existing shared styles. Keep default exports. No server or database.

**Do not edit files owned by another part; if the contract must change, write the request in docs/BUILD_LOG.md under Proposed changes.** Add progress there without overwriting others. Review teammate PRs instead of changing their files on your branch.

## Exact contract

Preserve light/dark mode and the larger type scale in `src/theme.css`. Use its shared surface/text/accent CSS variables for your new UI, and check both themes at phone width. Do not shrink body text below 16px to fit a layout. Keep the header theme toggle and its independent `astra.theme` preference intact.

- `Region`, `REGIONS`, `Status`, `Environment`, `CheckIn`, `Indicator`, `IndicatorFlag`, `EnvironmentConfig` from `src/types.ts`.
- `BodyMapProps`: entries, environment, flags, `onSelectRegion: (region: Region) => void`, `onEmergency: () => void`.
- `RegionPanelProps`: entries, environment, flags, region, `onEmergency: () => void`.
- `regionMap`, `REGION_LABELS`, `regionForSlug(slug)`, `createBodyMapClickHandler(onRegion)`, `BodyMapClickHandler` from `src/data/regionMap.ts`.
- **Installed react-body-map 1.1.0 API was inspected:** `import { Body, type BodyPart } from 'react-body-map'`. Use **data** and **onBodyPartPress**, not the README's stale parts/onPartPress. Example props: `data={[]}`, `scale={1}`, `side="front"`, `frontOnly={true}`, `backOnly={false}`, `onBodyPartPress={createBodyMapClickHandler(onSelectRegion)}`. For the back view set side="back", frontOnly=false, backOnly=true. All those props are required in declarations. Data items require `{ slug, color, intensity? }`; intensities index the `colors` array from 1.
- Selectable `head-front` and `head-back` are verified in the actual paths. No head fallback is needed. Some abdomen, neck, hips/glutes paths intentionally have no exact contract mapping; `regionForSlug` returns undefined. Do not relabel them silently.
- Package SVG paths are mouse-click only. Provide six labelled region buttons using the **same** selection handler for keyboard access and a visible selected state.
- `indicatorsForRegion(region)`, `indicatorById.radiation`, `indicators` from `src/data/indicators.ts`; use sourced whyItMatters, nextAction, howToMeasure and verificationNote.
- `readIndicatorValue`, `orderedEntries`, `assessCheckIns`, `flagIndicator` from `src/lib/baseline.ts`. Use `IndicatorFlag.comparable` to distinguish unassessed from normal. Respect units and missing data. Import Part 2's `TrendChart` with `{entries, indicator}` if useful; don't edit it.
- `environments: Record<Environment, EnvironmentConfig>` from `src/data/environments.ts`; only ISS is primary. The other entries are conceptual and have no assumed measurements/cadence.
- App currently owns records, selected region, hash navigation and flags, invokes storage.load, and passes `onSaved` to Part 1. Preserve this flow; handle load/save failures and simulated records visibly. Environment switching changes UI availability/escalation, not stored history or data provenance.
- `storage` implements `Storage.load/save/reset` in `src/lib/storage.ts`. No new backend. Preserve persistent Emergency route/button and `EMERGENCY_NOTICE` / `RULE_NOTICE`.

## Acceptance criteria

- [ ] Front/back drawings render with the pinned package API. Mouse selection and the six keyboard buttons select the same region. Head selection works; selected state has text/icon beyond colour.
- [ ] Clicking a region shows latest value, unit, mini trend, flag/explanation, why it matters, next action, source and verification notes. Missing values and insufficient baseline data remain explicit.
- [ ] Chest has an obvious Emergency link that works without a flagged value. Region status never hides access or diagnoses chest pain.
- [ ] Whole body panel states “needs dosimeter, cannot be self-assessed.” No invented radiation value, status or exposure score.
- [ ] Environment switch uses config data, labels spacecraft/Moon base conceptual, adapts supported measurements/reminders/escalation and does not implement those environments as separate apps.
- [ ] Integrate Part 1 and Part 2 through existing props, preserve their ownership and keep simulation labels and warnings visible on every page.
- [ ] Verify form → save → refresh → dashboard/body data flow, editing same date, reset/reload, optional blank vitals and storage failure. Prototype works locally with network disconnected after assets load; do not claim a service worker/offline installation exists.
- [ ] Phone-width layout (360px), keyboard navigation, headings/focus, readable contrast and colour-plus-icon status checked in a browser.
- [ ] Merge in order: Part 1, Part 2, Part 3; run `npm test` and `npm run build` on the integrated result.
- [ ] Deploy to Vercel or Netlify using Vite's `npm run build` and output `dist`; document returned URL and test direct navigation. Hash routes require no server rewrite.
- [ ] Write a demo script using explicitly simulated data: check-in/help → trends/baseline → body/head/chest → emergency checklist handoff → sources/limits and OSDR research context.

## Run and definition of done

Repo root: `npm install`, `npm run dev`, `npm test`, `npm run build`. For local production preview use `npm run preview`. PowerShell script-policy restrictions: use `npm.cmd`.

Done means the three parts are integrated, body navigation is accessible, conceptual environments are honestly scoped, automated and browser checks pass, deployment URL is verified, demo script is ready, and limitations/unverified medical content remain visible. Record deployment/verification in the build log and PR. No backend or extra environments beyond config-driven UI.
