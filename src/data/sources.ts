import type { Verification } from '../types';

export const SOURCE_URLS = {
  standardMeasures: 'https://ntrs.nasa.gov/api/citations/20200001281/downloads/20200001281.pdf',
  standardMeasures2018: 'https://ntrs.nasa.gov/api/citations/20180002943/downloads/20180002943.pdf',
  sleep: 'https://www.nasa.gov/humans-in-space/science-in-space-week-of-sept-15-2023-sleep-on-station/',
  biosensor: 'https://ntrs.nasa.gov/api/citations/20190000238/downloads/20190000238.pdf',
  checs: 'https://ntrs.nasa.gov/api/citations/20110011351/downloads/20110011351.pdf',
  risks: 'https://www.nasa.gov/hrp/risks/',
  hazards: 'https://www.nasa.gov/hrp/hazards/',
  radiation: 'https://srag.jsc.nasa.gov/SpaceRadiation/How/How.cfm',
  vascular: 'https://www.asc-csa.gc.ca/eng/sciences/vascular.asp',
  cpr: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7607644/',
  acls: 'https://ntrs.nasa.gov/api/citations/20070030123/downloads/20070030123.pdf',
  osdrContext: 'https://www.nasa.gov/osdr-chats-with-dr-robert-reynolds/',
  osdr310: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-310',
  osdr351: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-351',
} as const;

export interface SourceReference { title: string; url: string; verification: Verification; note: string }
/** Opened Nov 15, 2026. Verification covers claims described here, not clinical approval. */
export const SOURCES: SourceReference[] = [
  { title: 'NASA Spaceflight Standard Measures (2020)', url: SOURCE_URLS.standardMeasures, verification: 'verified', note: 'Slides 4–7: actigraphy and monthly sleep/team questionnaire; slide 14: motion sickness questionnaire, pre/postflight. ASTRA daily scales are its own design.' },
  { title: 'NASA Spaceflight Standard Measures (2018)', url: SOURCE_URLS.standardMeasures2018, verification: 'verified', note: 'Slide 14 includes motion sickness and balance. Do not turn ground balance tests into unguided in-flight tests.' },
  { title: 'NASA Sleep on Station', url: SOURCE_URLS.sleep, verification: 'verified', note: 'Sleep logs, wearable monitoring, sleep countermeasures and five-minute Reaction Self Test. Recovered canonical URL from stale handoff link.' },
  { title: 'NASA AstroSkin analog study', url: SOURCE_URLS.biosensor, verification: 'verified', note: 'HERA analog, not confirmation of current ISS inventory. HR, systolic BP, SpO2, skin temperature; skin temperature is not body/core temperature.' },
  { title: 'NASA CHeCS internship report (2011)', url: SOURCE_URLS.checs, verification: 'partial', note: 'Historical hardware context only. TODO: verify current equipment and device procedures.' },
  { title: 'NASA HRP risks', url: SOURCE_URLS.risks, verification: 'verified', note: 'SANS and spaceflight risks. No claim that symptom ratings diagnose SANS or bone loss.' },
  { title: 'NASA five hazards', url: SOURCE_URLS.hazards, verification: 'verified', note: 'Hazard taxonomy. Body-region assignments are ASTRA navigation choices.' },
  { title: 'NASA Space Radiation Analysis Group', url: SOURCE_URLS.radiation, verification: 'verified', note: 'Active and passive radiation monitoring. Dose is not a symptom rating.' },
  { title: 'CSA Vascular series', url: SOURCE_URLS.vascular, verification: 'verified', note: 'Blood pressure and glucose studies. Research protocols do not establish daily self-testing instructions.' },
  { title: 'DGLRM / ESAM-SMG microgravity CPR guideline (2020)', url: SOURCE_URLS.cpr, verification: 'partial', note: 'Verified recommendations 1–4, 10–14 and post-resuscitation limitations. TODO: verify current mission checklist; this is the section 14b fallback, dated 2020, not 2018.' },
  { title: 'NASA ISS ACLS algorithm evaluation (2007)', url: SOURCE_URLS.acls, verification: 'partial', note: 'Historical CMO training and autonomous checklist context. TODO: verify current protocols; do not treat historical communication-gap duration as current.' },
  { title: 'NASA OSDR bone research context', url: SOURCE_URLS.osdrContext, verification: 'verified', note: 'NASA links rodent bone datasets OSD-310 and OSD-351 (among others). Background research only, never the source of demo vitals.' },
  { title: 'OSD-310', url: SOURCE_URLS.osdr310, verification: 'partial', note: 'NASA article verifies accession relevance; dataset page is JavaScript-only. TODO: verify full dataset metadata before analysis.' },
  { title: 'OSD-351', url: SOURCE_URLS.osdr351, verification: 'partial', note: 'NASA article verifies accession relevance. TODO: verify full metadata. No dataset imported into ASTRA.' },
];
