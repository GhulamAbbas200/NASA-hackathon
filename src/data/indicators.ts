import { REGIONS, type DailyMetric, type Indicator, type Region, type Vitals } from '../types';
import { SOURCE_URLS as S } from './sources';

const guidanceGap = 'TODO: verify indicator-specific repeat, countermeasure, and contact-flight-surgeon criteria against the mission checklist. ASTRA flags are prototype changes, not medical thresholds.';
const entryNote = 'ASTRA entry instructions and scales are team-designed, not a validated NASA questionnaire. TODO: verify mission-specific instructions and action criteria.';

function report(id: DailyMetric, name: string, measurement: string, unit: string,
  steps: string[], whyItMatters: string, sourceUrl: string, hazard: string): Indicator {
  return { id, name, hazard, measurement, unit, selfAssessable: true, sourceUrl,
    howToMeasure: steps, whyItMatters, whenAbnormal: guidanceGap,
    nextAction: 'Review the recorded change with your mission medical checklist; contact the flight surgeon as directed by that checklist.',
    regions: ['head'], verification: 'partial', verificationNote: entryNote };
}
function device(id: keyof Vitals, name: string, measurement: string, unit: string,
  whyItMatters: string, sourceUrl: string, regions: Region[]): Indicator {
  return { id, name, hazard: id === 'temperatureC' ? 'Hostile / closed environment; circadian context' : id === 'glucoseMgDl' ? 'Altered gravity; ASTRA mapping' : 'Altered gravity / distance from Earth (basic-vitals mapping is ASTRA proposal)',
    measurement, unit, selfAssessable: true, sourceUrl,
    howToMeasure: ['Use the mission-approved device and the procedure you were trained to follow.',
      `Enter the device result in ${unit}; leave blank if no approved measurement is available.`,
      'TODO: verify device-specific placement, preparation, and repeat instructions.'],
    whyItMatters, whenAbnormal: guidanceGap,
    nextAction: 'Use the mission checklist and flight surgeon for interpretation; do not change treatment from this demo flag.',
    regions, verification: 'partial', verificationNote: 'Device required. Source supports research relevance, not current availability or a self-testing protocol. TODO: verify current ISS equipment.' };
}

/** Atomic indicators split combined research-table rows so forms/charts share IDs. */
export const indicators: Indicator[] = [
  report('sleepHours', 'Sleep duration', 'Sleep log; optional wearable/actigraphy', 'hours',
    ['Think about your most recent main sleep period.', 'Enter the hours you slept; estimate if you have no sleep log.'],
    'NASA uses sleep logs and actigraphy to study sleep in space.', S.standardMeasures, 'Hostile / closed environment'),
  report('sleepQuality', 'Sleep quality', 'Short self-report', '1–5',
    ['Recall how restful your last sleep felt.', 'Choose 1 (very poor) to 5 (very good).'],
    'Sleep quality is part of NASA’s sleep/team questionnaire.', S.standardMeasures, 'Hostile / closed environment'),
  report('fatigue', 'Fatigue and alertness', 'Self-report only; no reaction-time task in MVP', '1–5',
    ['Consider how tired you feel now.', 'Choose 1 (not tired) to 5 (very tired).'],
    'Fatigue can reduce performance; NASA studied alertness with a five-minute Reaction Self Test.', S.sleep, 'Hostile / closed environment'),
  report('mood', 'Mood', 'Short self-report', '1–5',
    ['Consider your overall mood today.', 'Choose 1 (very low) to 5 (very good).'],
    'NASA includes mood in its sleep/team questionnaire.', S.standardMeasures, 'Isolation / confinement'),
  report('stress', 'Stress', 'Short self-report', '1–5',
    ['Consider how much stress you feel today.', 'Choose 1 (very little) to 5 (very high).'],
    'NASA’s fatigue study reported stress alongside sleep and tiredness.', S.sleep, 'Isolation / confinement'),
  report('teamCohesion', 'Team cohesion', 'Short self-report', '1–5',
    ['Consider how connected and supported you feel within your team.', 'Choose 1 (very little) to 5 (very much).'],
    'Team cohesion and performance are measured in NASA Standard Measures.', S.standardMeasures, 'Isolation / confinement'),
  report('dizziness', 'Dizziness and balance symptoms', 'Symptom report only', '0–4',
    ['Report symptoms without trying an unguided balance test.', 'Choose 0 (none) to 4 (very strong).'],
    'NASA studies motion sickness and balance before and after flight; this app only records symptoms.', S.standardMeasures2018, 'Altered gravity'),
  report('visionSymptoms', 'Vision symptoms', 'Symptom report; no eye examination', '0–4',
    ['Note any change you have noticed in your vision.', 'Choose 0 (none) to 4 (very strong). This cannot detect SANS.'],
    'Spaceflight can alter eye and brain structure. A symptom report cannot diagnose SANS.', S.risks, 'Altered gravity'),
  device('hr', 'Heart rate', 'Mission-approved heart-rate monitor', 'beats/min',
    'NASA’s AstroSkin analog study monitored heart rate.', S.biosensor, ['chest']),
  device('systolic', 'Systolic blood pressure', 'Mission-approved BP cuff; upper displayed BP number', 'mmHg',
    'CSA studies blood pressure alongside changes in arteries.', S.vascular, ['chest']),
  device('diastolic', 'Diastolic blood pressure', 'Mission-approved BP cuff; lower displayed BP number', 'mmHg',
    'Blood-pressure measurements contribute to cardiovascular research in space.', S.vascular, ['chest']),
  device('spo2', 'Blood oxygen saturation', 'Mission-approved oxygen-saturation sensor', '%',
    'NASA’s AstroSkin analog study included oxygen saturation.', S.biosensor, ['chest']),
  device('temperatureC', 'Body temperature', 'Mission-approved body-temperature device', '°C',
    'NASA describes body-temperature regulation and circadian-rhythm research. Skin readings are not interchangeable with body/core temperature.', S.sleep, [...REGIONS]),
  device('glucoseMgDl', 'Blood glucose', 'Mission-approved blood-glucose instrument, if provided', 'mg/dL',
    'CSA’s Vascular Aging study measures blood sugar to examine insulin function.', S.vascular, [...REGIONS]),
  ...REGIONS.map((region): Indicator => ({
    id: `discomfort.${region}`, name: `${({ head: 'Head', chest: 'Chest', upperBack: 'Upper back', lowerBack: 'Lower back', arms: 'Arm', legs: 'Leg' })[region]} discomfort`,
    hazard: 'Altered gravity; body-region symptom mapping is ASTRA proposal',
    measurement: 'Self-reported discomfort; no imaging or muscle/bone exam', unit: '0–10',
    selfAssessable: true, sourceUrl: S.risks,
    howToMeasure: ['Select the body region where you feel discomfort.', 'Choose 0 (none) to 10 (strongest discomfort you can imagine).'],
    whyItMatters: 'NASA studies muscle, bone, and sensorimotor risks. This rating does not measure bone density or muscle loss.',
    whenAbnormal: `${guidanceGap}${region === 'chest' ? ' Chest pain/collapse must use the mission emergency procedure, regardless of baseline status.' : ''}`,
    nextAction: region === 'chest' ? 'Open Emergency mode for the checklist handoff and contact the crew medical officer.' : 'Review this symptom with your mission checklist and flight surgeon.',
    regions: [region], verification: 'partial', verificationNote: 'ASTRA navigation and rating convention. TODO: verify region-specific guidance; no diagnosis or exercise prescription.'
  })),
  { id: 'radiation', name: 'Radiation exposure', hazard: 'Space radiation',
    measurement: 'Needs dosimeter; cannot be self-assessed', unit: 'device-specific dose units',
    selfAssessable: false, sourceUrl: S.radiation,
    howToMeasure: ['Use mission radiation monitoring and dosimetry.', 'Do not estimate radiation exposure from symptoms or this app.'],
    whyItMatters: 'NASA uses active and passive detectors to track radiation exposure.',
    whenAbnormal: 'TODO: verify mission-specific radiation alarm and protective-action procedures with the radiation health team.',
    nextAction: 'Follow the mission radiation procedure; ASTRA does not calculate dose.',
    regions: [], verification: 'partial', verificationNote: 'Monitoring approach verified. TODO: verify mission-specific action guidance. Display in a separate Whole body panel.' },
];

export const indicatorById = Object.fromEntries(indicators.map(indicator => [indicator.id, indicator])) as Record<Indicator['id'], Indicator>;
export function indicatorsForRegion(region: Region): Indicator[] {
  return indicators.filter(indicator => indicator.regions.includes(region));
}
