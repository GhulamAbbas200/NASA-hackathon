# ASTRA: Project Handoff (NASA Space Apps 2026)

Last updated: Nov 15, 2026. Paste this file into any new chat (or hand it to a coding agent) to resume without losing context.

## 0. How to resume in a new chat

Paste this file and say:

> I'm Abbas, building ASTRA for NASA Space Apps 2026. Here is the handoff doc. Continue from "Current status" and walk me through the next step by step. I learn best from concrete examples and working code, and I want to understand each step rather than receive finished code.

Preferences: direct, honest feedback; concrete examples; step-by-step learning.

---

## 1. The challenge

**Create Health Monitoring Software for Astronauts on Space Missions** (NASA Space Apps Challenge 2026).

The tool should help decide which health indicators are useful, how they support a quick assessment, and answer these questions:
- Which measurements can be performed in space?
- Why is an exam needed?
- How do spaceflight hazards affect these health indicators?
- When does a result warrant attention from the crew or flight surgeons?
- What actions can prevent a critical health condition?

Optional considerations ("may, not required"):
- Insights for different environments (spacecraft, station, rover, base)
- Prompts for astronauts to take measurements or actions
- Gamification
- Dynamic charts of indicators over time
- Colour coding for at-a-glance status
- Do not assume astronauts know how to assess their health: give simple instructions and explanations
- UI idea from the brief: a clickable human figure where each body part shows its function and health status

**Requirement from Abbas:** use authentic data/sources from NASA. Every indicator, explanation and countermeasure in the app should trace to a NASA source. Demo astronaut entries may be simulated, but must be clearly labelled as simulated.

**Full brief details (added Nov 15, from the complete challenge text):**
- Goal: a *visual tool* that helps astronauts assess their own health and **provides guidance on treatments and health improvements**, so astronauts can evaluate and act on their status.
- Example indicators named by NASA: blood pressure, heart rate, **blood sugar (mg/dL)**, **body temperature**, daily sleep hours, mood.
- Health problems named: immune changes, bone density loss, cardiovascular events, inadequate nutrition, behavioral health conditions.
- Input can be anything representing a health indicator: keyboard text, mouse clicks, camera images, ultrasound images (image input is a stretch for us).
- The brief says the UI should present "metrics and diagnosis" clearly. We frame output as sourced decision support, not a medical diagnosis (see section 2).

**Challenge video (presented by the Brazilian Space Agency, which authored the challenge). Key requirements:**
- Scenario: halfway to Mars, a crewmate feels sharp chest pain and collapses. "What's happening? Is he or she dying? What should you do?"
- The tool must help astronauts assess their own health **and give guidance on what to do in an emergency**.
- "Astronauts are not doctors." For **each measurement** the tool should explain **how to take it, why it matters, and what to do when a value does not look normal**.
- Go further: **remind the crew to take measurements**; **adapt to different environments** (spacecraft, space station, Moon surface base).
- Suggested starting points: NASA Human Research Program (risks and relevant indicators) and **NASA's Open Science Data Repository (OSDR)**, which holds real spaceflight biology data "for inspiration and to test your ideas."
- Pitch angle: the tool could inspire healthcare tools for remote communities or places with limited access to health services on Earth.
- Implication for us: **emergency mode** is a core feature, not a stretch. Per-indicator instructions, reminders and an environment switch move from "nice to have" to "expected."

**NASA-provided resources (from the challenge page):**
- 5 Hazards of Human Spaceflight: https://www.nasa.gov/hrp/hazards/
- Risks of Human Spaceflight: https://www.nasa.gov/hrp/risks/
- Ongoing HRP Research in Space: https://www.nasa.gov/hrp/ongoing-hrp-research/
- CSA, Monitoring Radiation for Astronaut Health: https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- CSA, Why Do We Conduct Science Experiments in Space?: https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp

Note: NASA does not endorse non-U.S. Government sites; follow each site's data-use terms.

## 2. Decisions made

- **Environment:** ISS is the primary, fully documented environment. The video explicitly encourages adapting to other environments, so add a small environment switch (ISS / deep-space spacecraft / Moon base) implemented as a **config object**, not a second app: it changes available measurements, reminder frequency, and the escalation path (ground flight surgeon vs. autonomous with communication delay). Build ISS first; the switch is added only after the core works.
- **Product:** a daily check-in plus a clickable 2D body model showing stats per body part, with a dashboard of trends.
- **Tool stance:** the app organizes health data, flags changes from the astronaut's own baseline, and gives **sourced guidance** on actions and countermeasures (e.g. exercise, sleep, hydration, nutrition, when to repeat a measurement, when to contact the flight surgeon). Guidance text must come from NASA/agency sources and cite them. It is decision support, not a medical diagnosis, and does not replace flight surgeons. Alert rules are labelled "prototype rule, not a medical threshold." Do not invent clinical thresholds.
- **Team:** 3 people total (Abbas + 2 teammates). Abbas builds the scaffold and contract files first, then the work is split into 3 equal parts, one per person (section 12). Each person's coding agent reads its part's task file. Abbas handles integration and deploy.
- **Database:** none for MVP (localStorage). Optional stretch: Supabase (hosted Postgres) behind a storage interface, added only after the core app works. Offline-first is a defensible design choice for crews with delayed or limited communication.

## 3. Current status (Nov 15)

- Research table drafted (section 5). **Sources not yet cross-checked.**
- GitHub Foundations exam passed (Nov 14).
- **Nothing built yet.** No repo yet.
- Submission deadline: **unknown, ask/confirm.**
- Team: 3 people total. Teammate availability unknown (earlier they were not free until ~5pm Nov 15).

## 4. NASA's five hazards and their risks

Source: NASA HRP hazard/risk pages. Verify at nasa.gov/hrp/hazards and nasa.gov/human-system-risks.

1. **Space radiation:** cancer, central nervous system effects, cardiovascular tissue degeneration; separate non-ionizing radiation risk.
2. **Isolation and confinement:** adverse cognitive/behavioral conditions, psychiatric disorders, team cooperation/communication problems.
3. **Distance from Earth:** in-flight medical conditions, medications becoming ineffective/toxic after long storage.
4. **Gravity fields (altered gravity):** SANS (spaceflight-associated neuro-ocular syndrome), renal stones, sensorimotor/vestibular problems, bone fracture risk, reduced muscle mass/strength, aerobic capacity loss, orthostatic intolerance, cardiac rhythm problems.
5. **Hostile/closed environments:** sleep loss, circadian disruption, work overload, poor human-system interface design, decompression sickness, toxic exposure, hearing loss, CO2 exposure, hypoxia, immune response.

## 5. Research table (draft, verify before final)

| Hazard | Indicator | How measured | Astronaut can do alone? | Source |
|---|---|---|---|---|
| Space radiation | Radiation dose exposure | Dosimeters/detectors (tissue-equivalent counters, neutron detectors, phantom torso) | No | [1] |
| Isolation & confinement | Mood, stress, team cohesion | Short questionnaire (NASA uses monthly; ours is a shortened daily version) | Yes | [2] |
| Hostile/closed environments | Sleep duration and quality | Questionnaire plus actigraphy or wearable | Yes | [2][3] |
| Hostile/closed environments | Fatigue and alertness | Self-rating plus 5-minute reaction-time task | Yes | [3] |
| Distance from Earth | Basic vitals: HR, BP, SpO2 | Wearable, BP cuff from diagnostic pack, ECG/BP kit | Yes (with device) | [4][5] |
| Altered gravity | HR and BP trends (cardiovascular adaptation) | Same devices, compared with the person's own baseline | Yes (with device) | [4][5] |
| Altered gravity | Vision changes (SANS) | Symptom report; full check needs OCT, ultrasound, pneumotonometer | Symptoms yes; full exam no | [6] |
| Altered gravity | Back and muscle discomfort | Symptom rating (body map); spine ultrasound is the specialized follow-up | Yes (rating only) | [6][7] |
| Altered gravity | Dizziness and balance | Motion sickness questionnaire | Yes | [8] |

Notes:
- The "Distance from Earth: basic vitals" mapping is the **team's own proposal**, not something NASA states. Label it that way.
- Radiation cannot be self-assessed. Show it as "needs dosimeter" and explain why.
- Vision is symptom-only in the app. Say so openly; do not claim the app detects SANS.

### Source key (all need verification)

1. ISS guide (radiation detectors): https://webarchive.library.unt.edu/eot2008/20080917150037/http://www.nasa.gov/pdf/167129main_Systems.pdf
2. NASA Spaceflight Standard Measures: https://ntrs.nasa.gov/api/citations/20200001281/downloads/20200001281.pdf
3. NASA Science in Space (sleep and fatigue): https://www.nasa.gov/mission_pages/station/research/news/science-in-space-15sep23
4. NASA AstroSkin biosensor study: https://ntrs.nasa.gov/api/citations/20190000238/downloads/20190000238.pdf
5. NASA CHeCS internship report (BP cuffs, stethoscope, tonometer): https://ntrs.nasa.gov/api/citations/20110011351/downloads/20110011351.pdf
6. NASA human system risks: https://www.nasa.gov/human-system-risks
7. NASA ISS daily status report (lumbar spine ultrasound): https://www.nasa.gov/?p=775985
8. NASA Standard Measures (2018, sensorimotor): https://ntrs.nasa.gov/api/citations/20180002943/downloads/20180002943.pdf

### Cross-check procedure (about 5 min per source; use Ctrl+F)

| Source | Search for | Confirms |
|---|---|---|
| [1] | Bonner, Tissue Equivalent, Phantom | Radiation detectors |
| [2] | Mood, Sleep, team, Motion Sickness | Mood/stress and sleep rows |
| [3] | Reaction Self Test | 5-minute reaction-time task |
| [4] | SPO2, blood pressure, BP/ECG | Vitals rows |
| [5] | blood pressure, tonometer | BP cuff in diagnostic pack |
| [6] | Sensorimotor, Bone, Muscle, neuro-ocular | Altered gravity risks |
| [7] | Lumbar | Spine ultrasound |
| [8] | Sensorimotor, Motion Sickness | Dizziness/balance |

Mark each row found / found but reword / not found.

Known likely fixes:
- Dizziness row: the motion sickness questionnaire appeared in the 2020 Standard Measures slides ([2]), so cite [2] if [8] does not contain it.
- Vision row [6]: if the page lacks "neuro-ocular", cite https://ntrs.nasa.gov/api/citations/20190025288/downloads/20190025288.pdf (NASA HRP slides listing SANS).
- Typo in the doc: "ECG/BP ki" should be "kit".
- Some details came from search excerpts, not full documents. Treat as drafts until opened.
- Sources [1] and the CHeCS lists are old (2008 to 2011). Equipment may have changed; check NASA's current ISS medical operations documentation before formal citation.

## 6. ISS equipment (documented, verify currency)

Crew Health Care System (CHeCS) has three parts: Environmental Health, Countermeasures, Health Maintenance.
- **Health Maintenance System:** Advanced Life Support Pack, Ambulatory Medical Pack, Crew Contamination Protection Kit; diagnostic pack with blood pressure cuffs, stethoscope, tonometer; Ultrasound 2; automated external defibrillator; Reflotron blood analyzer; saliva sample kit; BP/ECG kit (NASA describes it as bulky, heavy, power-hungry).
- **Countermeasures:** TVIS treadmill, T2 treadmill, heart rate monitors.
- **Environmental Health:** acoustics kit, microbial air sampler, potable water sampler, atmosphere grab sampler; continuous major-gas monitoring.
- **Specialized (not self-assessable):** OCT eye scans, pneumotonometer, ultrasound for spine/eye, MELFI freezer for samples, ground-based blood/urine analysis, MRI (ground only), radiation dosimetry, KUDUwave hearing assessment.
- **Moving toward self-assessment:** guided ultrasound (AMOS demonstration: crew without prior training produced clinically useful images with on-board guidance), wearables (Oura ring tests for temperature/SpO2).

Equipment status labels to use in docs: Verified available / Planned or tested / Unknown / Not suitable.

## 7. Tech stack

| Layer | Choice | Why |
|---|---|---|
| App | React + Vite (TypeScript) | Fast setup, agent-friendly |
| Styling | Tailwind CSS | Quick, consistent UI. Follow Tailwind's official Vite guide (setup differs by version) |
| Charts | Recharts | Easy trend lines in React |
| Body model | `react-body-map` (MIT), fallback: custom SVG | See section 8 |
| Storage | localStorage behind a `storage.ts` interface | No backend, offline-first |
| Deploy | Vercel or Netlify from the GitHub repo | Auto-deploy on push |
| Optional | Supabase (Postgres) as 2nd storage implementation | Stretch only |

Setup commands:

```
npm create vite@latest astra -- --template react-ts
cd astra
npm install
npm install react-body-map recharts
```

Then follow Tailwind's Vite install guide. Create the GitHub repo and push. Protect `main`; teammates work on branches and open pull requests.

## 8. The 2D body model

Options:
1. **`react-body-map`** (recommended, MIT): React/TS, front and back views, selectable/highlightable parts via slug, intensity 1..N mapped to a colour array, scalable. Part slugs are listed in `bodyFront.ts` and `bodyBack.ts` in its source.
2. `react-body-selector` (MIT): male/female models, front/back, intensity 1 to 3.
3. `body-muscles` (framework-agnostic, 70+ regions, intensity 0 to 10).
4. A custom SVG generated by an LLM (Kimi prompt below). Judge visually; often crude.

These packages are muscle-oriented. **Unverified:** whether there is a usable head region (needed for vision, dizziness, mood, sleep). Also unverified: the click handler's name and signature. Check the README and the two slug files first.

Credit: keep the MIT license credit (README or About page). The body drawings derive from react-native-body-highlighter (MIT).

### Fallback Kimi prompt (custom SVG)

```
Create a single SVG of a simple, stylized human body for a web app,
front view and back view side by side, in one file.

Requirements:
- viewBox="0 0 600 500"; no external fonts, images, or scripts.
- Flat, clean style: light grey fill, dark grey 2px outline, symmetrical,
  neutral gender, standing pose with arms slightly away from the torso.
- Wrap the front view in <g id="view-front"> and the back view in
  <g id="view-back">.
- Each body region must be ONE closed <path> (or shape) with its own id,
  class="region", and a data-region attribute with the same name.
  Regions must not overlap and must fit together like a puzzle.
- Front view regions: head, neck, chest, abdomen, left-arm, right-arm,
  left-leg, right-leg.
- Back view regions: head-back, upper-back, lower-back, left-arm-back,
  right-arm-back, left-leg-back, right-leg-back.
- Style with CSS classes only: .region { fill: #d9dde3; stroke: #444;
  cursor: pointer; } .region:hover { fill: #b8c4d6; }
  .region.ok { fill: #8fd19e; } .region.changed { fill: #f2c46b; }
  .region.alert { fill: #ef8a8a; }
- Do not use inline fill attributes on the regions.
- Output only the SVG code, no explanation.
```

## 9. How hazards map to the body model

| Region clicked | Indicators shown | Hazard |
|---|---|---|
| Head | Mood/stress, sleep, fatigue, vision changes, dizziness/balance | Isolation & confinement; hostile/closed environments; altered gravity |
| Chest | Heart rate, blood pressure, SpO2 (trend vs. baseline) | Altered gravity (cardiovascular); distance from Earth (basic vitals, team proposal) |
| Upper and lower back | Back discomfort | Altered gravity |
| Arms and legs | Muscle discomfort | Altered gravity |
| "Whole body" button | Radiation: needs a dosimeter, can't be self-assessed | Space radiation |
| Banner above model | "Contact your flight surgeon" guidance when something changes | Distance from Earth |

Each region panel shows: latest value, mini trend, status chip, a short "why this matters" line from the NASA source, and the suggested next action. Region colours (green/amber/red) plus an icon so colour is never the only signal.

## 10. Daily check-in (about 2 minutes, 10 fields)

| Section | Field | Type |
|---|---|---|
| Sleep and fatigue | Hours slept | number |
| | Sleep quality | 1 to 5 |
| | Fatigue | 1 to 5 |
| Mood and team | Mood | 1 to 5 |
| | Stress | 1 to 5 |
| | Team cohesion | 1 to 5 |
| Symptoms | Dizziness/balance trouble | 0 to 4 |
| | Vision changes | 0 to 4 |
| | Discomfort by region | 0 to 10 each, collapsed by default |
| Vitals (optional) | HR, BP, SpO2, body temperature (C), blood glucose (mg/dL) | numbers, "if you have a device" |

Stretch: quick nutrition/hydration check (the brief names inadequate nutrition); optional image input (camera/ultrasound) is out of scope for MVP. Stretch: 1-minute reaction-time mini-game for fatigue (NASA uses a short reaction-time task). Radiation is never asked; only explained.

## 11. Architecture and data contract

Suggested repo layout:

```
astra/
  docs/
    HANDOFF.md              (this file)
    tasks/
      task-1-checkin-form.md
      task-2-dashboard.md
      task-3-body-map.md
      task-4-about-deploy.md
  src/
    types.ts                CheckIn, Region, Status types
    data/
      indicators.ts         research table as data (with source URLs)
      seed.ts               14 days of demo entries, labelled "simulated"
      regionMap.ts          package slugs -> our regions
    lib/
      baseline.ts           7-entry average + deviation flags
      rules.ts              all alert amounts in one file
      storage.ts            load/save/reset (interface; localStorage impl)
    components/
      CheckInForm.tsx
      Dashboard.tsx
      TrendChart.tsx
      BodyMap.tsx
      RegionPanel.tsx
    pages/
      About.tsx             sources, licences, disclaimers
    App.tsx
```

### CheckIn shape

- date
- sleepHours, sleepQuality (1 to 5), fatigue (1 to 5)
- mood (1 to 5), stress (1 to 5), teamCohesion (1 to 5)
- dizziness (0 to 4), visionSymptoms (0 to 4)
- bodyDiscomfort: map of region to 0 to 10
- optional vitals: hr, systolic, diastolic, spo2, temperatureC, glucoseMgDl

### Indicator entry (indicators.ts)

name, hazard, measurement method, selfAssessable, sourceUrl, **howToMeasure** (short numbered steps in plain language), **whyItMatters** (short, from the source), **whenAbnormal** (what to do when a value looks off: repeat, countermeasure, contact flight surgeon), nextAction. Content must be sourced; mark unverified text `TODO: verify`.

### Baseline and alerts

- Baseline = average of the last 7 entries.
- Flag a value that drifts beyond a set amount from baseline. Amounts live in `rules.ts`, labelled "prototype rule, not a medical threshold."
- Three levels: normal; "changed from your baseline, repeat the check"; "contact the flight surgeon" (guidance text only).
- Never diagnose.

### Storage

`storage.ts` exposes load/save/reset. Default is localStorage. If Supabase is added later: one table `check_ins` with a `jsonb` entry and a date column; simulated data only, never real health data. Watch env vars and row-level security.

## 12. Task split (each is an md file in docs/tasks)

Each task file contains: goal, files owned, inputs (types/contract), acceptance criteria, "do not touch other files." One owner per file avoids merge conflicts.

| Part | Owner | Scope | Files |
|---|---|---|---|
| Foundation (before the split) | Abbas | Scaffold, types, indicators, regionMap, rules, storage, seed, task files | contract files |
| Part 1: Check-in | Teammate 1 | Daily check-in form, validation, optional vitals (incl. temperature, glucose), saving via storage, per-item "how to measure / why it matters" help, measurement reminders (in-app prompts on a schedule); About/Sources page | CheckInForm.tsx, About.tsx |
| Part 2: Dashboard + Emergency | Teammate 2 | Status summary, trend charts, baseline flags, colour-coded status, guidance/action cards with sources, **Emergency mode UI** (guided triage flow from `src/data/emergency.ts`) | Dashboard.tsx, TrendChart.tsx, GuidanceCard.tsx, EmergencyMode.tsx |
| Part 3: Body map | Abbas | Clickable 2D body, region panel (value, trend, why it matters, next action), App.tsx wiring, deploy, demo script | BodyMap.tsx, RegionPanel.tsx, App.tsx (chest region links to Emergency mode: "chest pain?") |

Merge order: check-in form, dashboard, body map. Task files live in `docs/tasks/part-1-checkin.md`, `part-2-dashboard.md`, `part-3-bodymap.md`. Equal split: one part each.

## 13. Order of work

**Tonight (Nov 15):**
1. Create the Vite + React + Tailwind repo and push.
2. Install `react-body-map`, render front and back, note the slugs for head, chest, upper back, lower back, arms, legs.
3. Write `types.ts`, `indicators.ts`, `regionMap.ts` (with Claude, step by step).
4. If teammates are free, send the repo link as soon as step 1 is done.

**Next:** `rules.ts`, `storage.ts`, `seed.ts`, then the four task md files; assign teammates; review pull requests; cross-check sources in a fresh session; deploy; test on a phone; prepare the demo.

**Skip for now:** Supabase, the second environment, the reaction-time game, a 3D model, AI diagnosis, hardware integration.

## 14. Presentation points

- Every indicator ties to a NASA source and a hazard (show the source on every flag).
- Explain why each question is asked and how it is measured (the brief says not to assume astronauts know).
- Flags compare against the astronaut's own baseline, not generic thresholds.
- Works offline and tolerates communication delay (offline-first design).
- Honest limits: radiation and full SANS exams need equipment; the tool doesn't diagnose.
- Demo data is simulated and labelled.

## 14b. Emergency mode (required by the video)

Goal: answer "my crewmate has chest pain and collapsed, what do I do?" with a short guided flow that works for non-doctors.

Design rules:
- Content lives in `src/data/emergency.ts` and every step cites a source. **Do not write clinical steps from memory.** Paraphrase only what the sources below state, and mark gaps `TODO: verify`.
- Keep the flow short: responsive? breathing? → if not, start CPR/defibrillation per the sourced guideline, call ground/CMO, then post-event steps. Always show "follow your mission medical checklist and ground flight surgeon" and a visible "decision support, not a substitute for medical care" notice.
- Reachable from a persistent Emergency button and from the chest region of the body map.
- Environment config changes the escalation text (ISS: communication gaps possible; deep space: communication delay, act autonomously).

Starting sources (found Nov 15; open and verify before use):
- CPR in microgravity guideline (DGLRM / ESAM-SMG, 2018): https://klinikum-oldenburg.de/fileadmin/content/pdf/2024/2018_DLRM_-_Saving_lives_spaceflight.pdf (search result excerpt: chest compression method of choice in immediate BLS is the Evetts-Russomano method; ALS with the patient restrained on the Crew Medical Restraint System; CPR in microgravity is feasible and should follow AHA/ERC guidelines). If this URL fails, use https://pmc.ncbi.nlm.nih.gov/articles/PMC7607644 (background on CPR and medical emergencies in microgravity).
- NASA ACLS/ISS emergency capability slides: https://ntrs.nasa.gov/api/citations/20070030123/downloads/20070030123.pdf (excerpt: two ISS crewmembers are designated CMOs, trained in ACLS, typically not physicians; the ISS can have communication gaps of up to 45 minutes per orbit; algorithms live in the ISS Medical Checklist).
- NASA AED integration abstract (ISS AED and ACLS protocols): search NASA NTRS for "Integration of an Automated External Defibrillator aboard the ISS".
- NASA 1991 CPR-in-microgravity study (KC-135): https://ntrs.nasa.gov/api/citations/19910023475/downloads/19910023475.pdf (older; background only).
- Note: research finds manual CPR is less effective in weightlessness and automated compression devices may outperform it (news report: https://www.astronomy.com/science/cpr-in-space/; verify against the underlying study before citing).

## 14c. Open Science Data Repository (OSDR)

The video suggests OSDR "for inspiration and to test your ideas." OSDR holds spaceflight biology data. **Unverified:** what is usable for our app. It is likely omics/biology datasets, not daily astronaut vitals. Spend at most 30 minutes: find one or two datasets related to our indicators (bone, immune, cardiovascular, sleep), and cite them in About and the presentation as evidence for why we monitor those areas. Do not present simulated check-in entries as OSDR data.

## 15. Open items

- Confirm the submission deadline.
- Confirm teammate availability (team size is settled: 3 people).
- Verify `react-body-map` slugs (head region?) and click handler API.
- Cross-check all 8 sources (section 5).
- Check the challenge page's Resources tab for any datasets or required indicators added Nov 13.
- Decide later whether to add the environment switch (config object) and Supabase.
- Verify emergency sources (14b) and write `src/data/emergency.ts` with citations.
- Spend 30 min checking OSDR for citeable datasets (14c).