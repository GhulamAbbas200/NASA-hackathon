import type { CheckIn } from '../types';

/** SIMULATED: authored demo values. Not NASA astronaut records or OSDR data. */
export const DEMO_DATA_SIMULATED = true;
export const DEMO_DATA_LABEL = 'Simulated demo data · not real astronaut measurements';

const sleep = [7.4, 7.1, 7.6, 7.2, 7.8, 7.3, 7.5, 7.2, 7.4, 7.1, 7.3, 5.6, 5.3, 5.1];
export const seedCheckIns: CheckIn[] = sleep.map((sleepHours, index) => ({
  date: `2026-11-${String(index + 2).padStart(2, '0')}`,
  sleepHours,
  sleepQuality: index > 10 ? 2 : index % 3 === 0 ? 3 : 4,
  fatigue: index > 10 ? 4 : 2,
  mood: index > 11 ? 3 : 4,
  stress: index > 10 ? 4 : 2,
  teamCohesion: 4,
  dizziness: index === 13 ? 1 : 0,
  visionSymptoms: 0,
  bodyDiscomfort: { head: 0, chest: 0, upperBack: 1, lowerBack: index > 10 ? 4 : 1, arms: 1, legs: index % 4 === 0 ? 2 : 1 },
  vitals: {
    hr: [65, 66, 64, 67, 65, 63, 66, 65, 67, 64, 66, 70, 72, 71][index],
    systolic: 114 + index % 5,
    diastolic: 73 + index % 3,
    spo2: index % 4 === 0 ? 98 : 99,
    temperatureC: index % 3 === 0 ? 36.7 : 36.6,
    // Optional device readings intentionally absent on some days, to exercise missing-data handling.
    ...(index % 4 !== 0 ? { glucoseMgDl: 90 + index % 7 } : {}),
  },
  simulated: DEMO_DATA_SIMULATED,
}));
