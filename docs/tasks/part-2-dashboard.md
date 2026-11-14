# Part 2 — Dashboard, trends, guidance and Emergency UI

Owner: Teammate 2. Branch: `feature/part-2-dashboard`.

Read `docs/HANDOFF.md` completely, then this file, `docs/BUILD_LOG.md`, and `docs/CONTRACT.md`. Use the existing data contracts; build the views, not another rule engine or clinical protocol.

## Goal

Make changes from the astronaut's baseline understandable through summaries, charts and sourced actions. Build a short Emergency UI driven by the existing sourced graph and mission-checklist handoffs.

## Owned files

- `src/components/Dashboard.tsx`
- `src/components/TrendChart.tsx`
- `src/components/GuidanceCard.tsx`
- `src/components/EmergencyMode.tsx`

Use Tailwind utilities in your components and existing shared CSS. Keep default exports. Dashboard already composes TrendChart and GuidanceCard; App mounts Dashboard and EmergencyMode. Do not duplicate those children in App.

**Do not edit files owned by another part; if the contract must change, write the request in docs/BUILD_LOG.md under Proposed changes.** Add progress there without overwriting others' entries. No backend, AI diagnosis or new health algorithms.

## Exact contract

Preserve light/dark mode and the larger type scale in `src/theme.css`. Use its shared surface/text/accent CSS variables for your new UI, and check both themes at phone width. Do not shrink body text below 16px to fit a layout.

- Types from `src/types.ts`: `CheckIn`, `Indicator`, `IndicatorId`, `IndicatorFlag`, `Status`, `Environment`, `EmergencyStep`, `EmergencyAnswer`.
- `DashboardProps`: `entries: CheckIn[]`, `environment: Environment`, `flags: IndicatorFlag[]`, `onEmergency: () => void`.
- `TrendChartProps`: `entries: CheckIn[]`, `indicator: Indicator`. Use installed Recharts 3; `react-is` matches React 18. Handle several chart instances with unique accessible IDs.
- `GuidanceCardProps`: `indicator: Indicator`, `flag?: IndicatorFlag`.
- `EmergencyModeProps`: `environment: Environment`, `steps: EmergencyStep[]`, `onExit: () => void`.
- `assessCheckIns(entries)`, `flagIndicator(entries, id)`, `readIndicatorValue(entry, id)`, `orderedEntries(entries)` from `src/lib/baseline.ts`. App passes computed flags; readIndicatorValue handles nested vitals/discomfort and returns undefined for missing readings/radiation. Never turn absence into zero.
- `IndicatorFlag`: indicatorId, status, latest?, baseline?, sampleCount, comparable, explanation. Status is `normal | changed | contact`. If comparable is false, show **Not assessed / insufficient data**, regardless of status. Normal means no demo rule flag, not medical clearance.
- Latest is compared with the seven preceding entries, excluding latest (Abbas confirmed). Require seven valid prior values for that indicator. The three-consecutive-change contact rule is only demo persistence, not clinical urgency. Every amount comes from `rules.ts`; display `RULE_NOTICE`.
- `indicators`, `indicatorById` and their sourceUrl/verificationNote/whenAbnormal/nextAction. Preserve source links and `TODO: verify`; do not generate treatment text.
- `EMERGENCY_START_STEP_ID`, `EMERGENCY_NOTICE`, `EMERGENCY_REVIEW_NOTE`, `emergencyStepById` from `src/data/emergency.ts`. Start at call-help; `steps` contains id, title, instruction, question?, answers[{label,nextStepId}], sourceUrl, sourceSection, verification and optional verificationNote.
- `environments[environment].escalationText` from `src/data/environments.ts` supplies the environment-specific handoff. Only ISS is implemented; conceptual configs are visibly conceptual.

## Acceptance criteria

- [ ] Summary shows text plus distinct icons for normal/changed/contact; insufficient data is a separate clear display. Never imply a normal flag excludes an emergency.
- [ ] Charts use actual dates/units, sort without mutating props and leave gaps for optional missing readings. Provide text/table alternatives and readable legends. Clearly distinguish latest from baseline.
- [ ] Flags/explanations come from shared helpers; no duplicated thresholds or arithmetic in components. Simulation provenance remains visible when charts are reused outside the shell.
- [ ] Guidance cards show why it matters, next action, source and verification note; no unsourced thresholds, diagnoses or prescribed treatment.
- [ ] Emergency view follows the data graph, uses plain large controls, shows every step's citation, and preserves TODO verification warnings. Source fallback is a 2020 guideline, not an approved current mission checklist.
- [ ] The mission checklist controls responsiveness/breathing/CPR decisions where the source has gaps. Do not invent an assessment method or turn a click into a diagnosis. Do not omit unsure branches.
- [ ] Display the exact `EMERGENCY_NOTICE`, current environment escalation and research-prototype note throughout the flow. A terminal handoff is not “all clear” or a command to stop CPR.
- [ ] Back/restart/exit navigation is keyboard-usable and never automatically dismisses emergency support. Changing steps announces/focuses the new heading.
- [ ] Keep emergency access available regardless of flags, missing data or storage errors. No form entry or internet request is required to enter the flow.
- [ ] Mobile works at 360px; visible focus, readable contrast, colour plus icon/text. `npm test` and `npm run build` pass; build log and PR updated.

## Run and definition of done

At repo root: `npm install`, `npm run dev`, then `npm test` and `npm run build`. In restricted PowerShell use `npm.cmd`.

Done means all four owned views work with the existing App props; empty/missing data, changed/contact examples, all emergency branches and keyboard navigation are checked; sourced limitations remain visible; automated checks pass and the PR states results. Merge after Part 1, before Part 3. Stop after your scope.
