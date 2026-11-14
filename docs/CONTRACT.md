# ASTRA shared contract

The implementation is at repository root (no extra `astra/` directory). `docs/HANDOFF.md` is the supplied source of truth; the explicit foundation request supersedes its older four-task layout and unresolved deadline. Types/data/helpers are foundation-owned. Request changes in `docs/BUILD_LOG.md`, do not fork this contract inside components.

## Check-ins and provenance

`src/types.ts` exports `CheckIn`, `Vitals`, `Region`, `REGIONS`, `Status`, `Environment`, `Indicator`, `IndicatorId`, `IndicatorFlag`, `EmergencyStep`, `EmergencyAnswer`, `EnvironmentConfig`, `Reminder`, `Storage`, plus scale types and props context.

```ts
const entry: CheckIn = {
  date: '2026-11-15',
  sleepHours: 7.5, sleepQuality: 4, fatigue: 2,
  mood: 4, stress: 2, teamCohesion: 4,
  dizziness: 0, visionSymptoms: 0,
  bodyDiscomfort: { head: 0, chest: 0, upperBack: 1, lowerBack: 1, arms: 0, legs: 1 },
  vitals: { hr: 66, systolic: 116, diastolic: 74, spo2: 99, temperatureC: 36.6, glucoseMgDl: 93 },
  simulated: true, // This example is simulated, like every entry in seed.ts.
};
```

Dates are crew-local `YYYY-MM-DD`; one entry per date. Required discomfort keys are exactly the six regions. Device readings are nested in `vitals`, all optional. Omit blank readings. Units are fixed: beats/min, mmHg, %, °C, mg/dL. The temperature input is body temperature, never an interchangeable wearable skin-temperature reading. NASA's cited wearable study measured skin temperature and was conducted in HERA.

`simulated` is required on every record. Label any view containing simulated entries. The 14-day demo runs Nov 2–15, 2026; values are authored and never presented as OSDR or astronaut observations. User-entered records require explicit provenance. Do not mix dates/provenance silently.

## Indicators, rules and comparisons

- `indicators`: 21 atomic entries (eight daily metrics, six optional vitals, six discomfort regions, radiation). Combined research-table rows are split for independent form/plot IDs. `indicatorById[id]` gives a single entry; `indicatorsForRegion(region)` returns an array.
- `howToMeasure` is an ordered string array for an `<ol>`. Scale labels are ASTRA UI conventions. `verification` is `verified | partial | unverified`; show `verificationNote` and any `TODO: verify` content. A verified source link alone does not verify device availability or medical action guidance.
- `readIndicatorValue(entry, id)` returns number or undefined; radiation has no value in CheckIn. Discomfort IDs use `discomfort.lowerBack`, etc. All numeric charts read via this helper.
- `orderedEntries(entries)` sorts by date without mutating input, deduplicating by date with the last input record winning, matching storage upsert.
- `flagIndicator(entries, id)` and `assessCheckIns(entries)` compare the latest with the seven preceding entries, **excluding latest**, as Abbas confirmed. The window is the last seven records, not the last seven nonmissing readings or necessarily seven consecutive days.
- Require seven valid readings within that window for the particular metric. Missing latest/partial history gives `comparable: false`, a “Not assessed” explanation and no alert. `status: normal` in this case is a type-level absence of a prototype flag; **render Not assessed, not normal/healthy**.
- All amounts live in `rules.ts`, labelled **prototype rule, not a medical threshold**. Adverse-direction or bidirectional deviations produce `changed`; three consecutive changed comparisons produce `contact`. Each comparison uses its own prior-seven window. This contact rule is a demo persistence rule, never a severity assessment. Never use flags to decide whether emergency care is needed.
- `IndicatorFlag` exposes indicatorId, status, latest?, baseline?, sampleCount, comparable, explanation. Use explanations verbatim or without losing limitations. Do not duplicate alert math in components.

## Storage and App flow

`storage.load(): CheckIn[]`, `storage.save(entry): void`, `storage.reset(): void` are synchronous and can throw `StorageError`. `isCheckIn(unknown)` checks shape, scales, real date, finite values and basic representation constraints, not clinical normal ranges.

The browser implementation uses `astra.check-ins.v1` with `{version: 1, entries: CheckIn[]}`. Absent key returns cloned simulated seed entries. Save loads and upserts by date. Reset writes an empty envelope (never clears other keys), so refresh remains empty rather than re-seeding. Corruption/unknown versions fail visibly and are never silently replaced; explicit reset can recover. Blocked access/quota errors must not be shown as a successful save. A factory `createLocalStorage(getDriver, initialEntries?)` supports tests without touching the browser.

App owns entries and passes the storage interface plus `onSaved` to CheckInForm. The form calls onSaved only after successful save/reset; App reloads and recomputes flags. App also refreshes on storage events. Five hash navigation links work without a routing dependency or server rewrites. Overview (`#dashboard`) is the default and composes the check-in, body-map and insight stubs in a light three-column workspace. Persistent Emergency access does not depend on records or flags.

The user-approved visual redesign adds foundation-owned `src/components/ui/Icon.tsx`, `FeaturePlaceholder.tsx` and `src/components/layout/AnatomyPreview.tsx`. The latter displays decorative art from `public/assets/astra-anatomy.png`, with no health overlay or interaction. Feature owners can replace their own placeholder markup while preserving exported props. Part 3 can adapt or replace the decorative canvas while integrating the actual map. Do not mistake the art for a selectable region model; provenance/prompt is in `docs/ANATOMY_ASSET.md`.

## Body package

Pinned react-body-map 1.1.0 source and declarations were inspected. Its README is stale. `Body` takes `data`, `onBodyPartPress`, `side`, `scale`, `frontOnly`, `backOnly`, optional `colors`. `BodyPart` requires slug and color, with optional intensity/pathArray. `regionMap.ts` maps actual drawing slugs; both head paths exist. Unmapped abdomen/neck/hips are deliberately undefined. The SVG paths have mouse callbacks without keyboard semantics; Part 3 must provide labelled buttons for the six regions.

`contracts.test.ts` checks source slugs against the installed drawing arrays, renders both package views and checks the adapter callback, without implementing the BodyMap feature.

## Environments, reminders and emergency flow

`environments[environment]` contains supported entry IDs, equipment note, conceptual flag, reminder cadence and escalation text. ISS is the primary complete prototype config. Availability is conditional on mission-approved devices, not a verified ISS inventory. Other environments remain minimal and conceptual; do not implement additional environments.

`reminders` provides one schedule per indicator. Daily self-report is an ASTRA 24-hour product default, not NASA's monthly research protocol. Device and radiation entries have null intervals and use mission/equipment schedules. No notifications service.

Emergency data is a directed graph with `EMERGENCY_START_STEP_ID`, `emergencySteps` and `emergencyStepById`. Every step has a section 14b citation and a section locator; answers reference step IDs. Empty answers mean handoff to continued mission care, never an all-clear or stop-CPR instruction. Explicit clinical-method gaps stay visible and are controlled by the mission checklist. Part 2 builds only the graph UI, not unsourced clinical content.

Always display: “Decision support only; follow your mission medical checklist and contact the ground flight surgeon.” Research sources are not medical certification. See `docs/RESEARCH_VERIFICATION.md` for the cross-check ledger and `THIRD_PARTY_NOTICES.md` for credits.
