# Source verification ledger

Checked Nov 15, 2026. This verifies specific research claims, not a clinical protocol. Links that could not be opened remain unverified; none are silently substituted in the original handoff. Runtime sources and scope notes are in `src/data/sources.ts`.

| Handoff source | Result | Evidence and resulting wording |
| --- | --- | --- |
| [1] Archived ISS Systems PDF | Not found / inaccessible | Archive URL could not be opened. Use the [NASA SRAG monitoring page](https://srag.jsc.nasa.gov/SpaceRadiation/How/How.cfm) for active/passive dosimetry. Do not repeat the old detector inventory as current. |
| [2] Standard Measures 2020 | Found but reword | [Slides 4–7 and 14](https://ntrs.nasa.gov/api/citations/20200001281/downloads/20200001281.pdf) support sleep logs/actigraphy, monthly mood/team questionnaire and pre/postflight sensorimotor work. ASTRA's daily scales are not the NASA instrument. |
| [3] Sleep/fatigue article | Found at canonical URL | [Sleep on Station](https://www.nasa.gov/humans-in-space/science-in-space-week-of-sept-15-2023-sleep-on-station/) supports sleep monitoring and the five-minute Reaction Self Test. The game is out of scope. |
| [4] AstroSkin poster | Found but reword | [NASA HERA poster](https://ntrs.nasa.gov/api/citations/20190000238/downloads/20190000238.pdf) lists HR, systolic BP, SpO2 and skin temperature. This was an analog study, not proof of current ISS hardware; skin temperature is not body/core temperature. |
| [5] CHeCS report 2011 | Found but reword | [Pages 4–5](https://ntrs.nasa.gov/api/citations/20110011351/downloads/20110011351.pdf) list diagnostic-pack BP cuffs, stethoscope and tonometer. Historical context only; current availability is unknown. |
| [6] Human-system risks | Found on current HRP URL | [NASA risks](https://www.nasa.gov/hrp/risks/) covers SANS, cardiovascular, muscle/bone and sensorimotor risks. Does not establish symptom-based diagnosis or region-specific treatment instructions. |
| [7] Lumbar spine report | Not found / retrieval failed | Original `https://www.nasa.gov/?p=775985` could not be opened. TODO: verify lumbar ultrasound details; they are not claimed by this foundation. |
| [8] Standard Measures 2018 | Found | [Slide 14](https://ntrs.nasa.gov/api/citations/20180002943/downloads/20180002943.pdf) includes motion sickness questionnaire and balance measures. Ground tests are not copied into in-flight self-testing instructions. |

Additional verified context: [CSA Vascular series](https://www.asc-csa.gc.ca/eng/sciences/vascular.asp) supports research relevance of blood pressure and blood glucose. It does not validate a daily glucose self-testing procedure. Body-temperature relevance comes from the NASA sleep article; specific thermometer protocol remains TODO. All device entry instructions defer to mission training.

The distance-from-Earth/basic-vitals link, body-region navigation, abbreviated questionnaire, reminder cadence, numerical demo rules and persistence escalation are ASTRA design choices. No clinical limits were inferred from research examples. Per-indicator whenAbnormal guidance explicitly marks missing repeat/countermeasure/contact criteria.

## Emergency sources from section 14b

- [DGLRM / ESAM-SMG microgravity CPR guideline](https://pmc.ncbi.nlm.nih.gov/articles/PMC7607644/), published **2020**, is the supplied fallback. Verified recommendations on early help/BLS, CPR, restraint and AED guidance. The handoff's “2018” label does not describe this fallback publication.
- [NASA ACLS evaluation slides (2007)](https://ntrs.nasa.gov/api/citations/20070030123/downloads/20070030123.pdf) support the CMO/checklist/autonomy context. Historical communication-gap figures are not treated as current operational facts.
- Exact responsiveness/breathing tests, unsure-assessment handling, responsive chest-pain care, current device/training procedures and post-event protocols remain **TODO: verify**. The flow hands off to the current mission checklist and never infers a diagnosis from a button.
- The 2018 PDF, NASA AED integration abstract and 1991 study were not needed to support the implemented data. They are not claimed as verified. No astronomy news claim, drug dose or invented compression amount appears in the flow.

## OSDR context (limited scope)

[NASA's Reynolds interview](https://www.nasa.gov/osdr-chats-with-dr-robert-reynolds/) names [OSD-310](https://osdr.nasa.gov/bio/repo/data/studies/OSD-310) and [OSD-351](https://osdr.nasa.gov/bio/repo/data/studies/OSD-351) as inputs to rodent bone-loss causal-diagram work. Those links are research inspiration for monitoring musculoskeletal risks. Dataset pages need JavaScript; full metadata and reuse terms remain TODO before any analysis. No OSDR dataset is imported, and seed records are independently authored simulated values.

## Equipment status

| Capability | Status used in this foundation |
| --- | --- |
| Self-report fields | Prototype-supported; scales team-designed |
| HR/BP/SpO2 devices | Historically documented / tested; current issued devices unknown |
| Body temperature / glucose input | Conditional on an approved device; current availability unknown |
| AstroSkin wearable | Tested in cited analog study; do not infer current inventory |
| Radiation dose | Dosimeter required; not suitable for symptom self-assessment |
| SANS / bone density / specialized imaging | Not suitable for this symptom-only app to diagnose or measure |
