# Part 1 — Check-in and Sources/About

Owner: Teammate 1. Branch: `feature/part-1-checkin`.

Read `docs/HANDOFF.md` completely, then this file, `docs/BUILD_LOG.md`, and `docs/CONTRACT.md`. This task is the authorized feature scope; the handoff's older four-task layout is superseded by this three-part split.

## Goal

Build an accessible daily check-in that takes about two minutes, provides measurement help and reminders, and saves locally. Build About/Sources so every health claim can be traced and the demo's limitations are clear.

## Owned files

- `src/components/CheckInForm.tsx`
- `src/pages/About.tsx`

Use Tailwind utilities inside these files; use existing shared CSS classes where helpful. You may import another part's component through its existing public props. Shared types, data, helpers, dependencies, App and global styles are foundation contracts.

**Do not edit files owned by another part; if the contract must change, write the request in docs/BUILD_LOG.md under Proposed changes.** Record your own progress there without removing other entries. Do not install a backend or replace the stack.

## Exact contract

- `CheckInFormProps`: `entries: CheckIn[]`, `environment: Environment`, `storage: Storage`, `onSaved: () => void`. Preserve the default export.
- `CheckIn`, `Rating5`, `Symptom4`, `Discomfort10`, `Vitals`, `REGIONS`, `Region`, `Environment`, `Indicator`, `Storage` from `src/types.ts`.
- `CheckIn.date`: valid `YYYY-MM-DD`, one record per crew-local day. Create it from local date parts, not UTC `toISOString()` for the current local day.
- Required: sleepHours, sleepQuality, fatigue, mood, stress, teamCohesion, dizziness, visionSymptoms and all six `bodyDiscomfort` keys. Optional readings are **nested** in `vitals`: hr, systolic, diastolic, spo2, temperatureC, glucoseMgDl. Blank optional values are omitted, never converted to zero.
- `CheckIn.simulated`: false for crew-entered records; true only for simulated data. Do not lose this flag when editing an existing demo entry; explicitly identify whether the edit is still simulated.
- `Storage.load(): CheckIn[]`, `save(entry: CheckIn): void` upserts by date, `reset(): void` writes an empty dataset. Save/reset may throw `StorageError`; call `onSaved()` only after success. Reset is user-initiated; offer clear wording that it removes ASTRA records in this browser.
- `isCheckIn` / `StorageError` from `src/lib/storage.ts`. This helper checks shape and form scales, not medical thresholds. Implement friendly field validation without importing alert limits as medical ranges.
- `indicators`, `indicatorById`, `indicatorsForRegion` from `src/data/indicators.ts`. Render `howToMeasure` using a numbered list, plus `whyItMatters`, `whenAbnormal`, `nextAction`, sourceUrl and verificationNote. Preserve visible `TODO: verify` labels.
- `reminders`, `REMINDER_NOTICE` from `src/data/reminders.ts`: nullable `intervalHours`; daily self-reports vs mission-plan optional-device reminders. `environments[environment]` supplies supported entries and schedule context. Do not prescribe device checks from the 24-hour self-report cadence.
- `AboutProps`: `indicators: Indicator[]`, `sources: SourceReference[]`; `SourceReference` is exported by `src/data/sources.ts`.
- `SOURCES` / `SOURCE_URLS` registry, `DEMO_DATA_LABEL`, `EMERGENCY_NOTICE`, `RULE_NOTICE`, `THIRD_PARTY_NOTICES.md`, `docs/RESEARCH_VERIFICATION.md` provide the text and provenance needed for About.

## Acceptance criteria

- [ ] Required scales validate with plain field-specific errors, associated labels and keyboard input; a valid entry saves and is reflected after `onSaved()`.
- [ ] Date editing upserts that day instead of duplicating it. Invalid dates and nonfinite values are rejected.
- [ ] All six optional vitals, including °C and mg/dL, can be omitted. Input has units and approved-device wording. No self-invented clinical limits or treatment advice.
- [ ] Discomfort is collapsed by default; all six regions have values even if zero. Help for every item uses the existing data and preserves verification gaps.
- [ ] Daily in-app reminders use reminder/config data; devices remain mission-plan only. No push service, backend or hardware integration.
- [ ] Save/quota/corruption errors are visible and do not claim success or silently erase records. Reset refreshes App and stays empty after reload.
- [ ] About lists source links, verification notes, NASA/agency research context, decision-support limits, simulated data, OSDR context and the original MIT notice/credits.
- [ ] Explain OSDR rodent studies are research context, not the source of simulated astronaut records; do not claim imported datasets.
- [ ] Readable contrast, meaningful labels, visible keyboard focus; colour never carries meaning alone. Mobile layout works at 360px.
- [ ] `npm test` and `npm run build` pass; no edits to Part 2/3 files. Update build log and open a PR.

## Run and definition of done

From repository root: `npm install`, `npm run dev`. PowerShell with script restrictions: use `npm.cmd` in place of `npm`. Validate with `npm test` and `npm run build`.

Create your branch from the integrated foundation. Done means both owned components work against the unchanged contracts, form behavior is checked in the browser (including blank devices, errors and reload), sources/limits are visible, checks pass, and the PR describes behavior and validation. Merge Part 1 first. Stop after your owned scope.
