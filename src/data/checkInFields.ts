import type { DailyMetric, Vitals } from '../types';

/** Input scale/representation constraints, not medical alert thresholds. */
export const dailyFields: { id: DailyMetric; label: string; min: number; max: number; step: number; endpoints: string }[] = [
  { id: 'sleepHours', label: 'Hours slept', min: 0, max: 24, step: .1, endpoints: 'Hours in your most recent main sleep period' },
  { id: 'sleepQuality', label: 'Sleep quality', min: 1, max: 5, step: 1, endpoints: '1 very poor · 5 very good' },
  { id: 'fatigue', label: 'Fatigue', min: 1, max: 5, step: 1, endpoints: '1 not tired · 5 very tired' },
  { id: 'mood', label: 'Mood', min: 1, max: 5, step: 1, endpoints: '1 very low · 5 very good' },
  { id: 'stress', label: 'Stress', min: 1, max: 5, step: 1, endpoints: '1 very little · 5 very high' },
  { id: 'teamCohesion', label: 'Team cohesion', min: 1, max: 5, step: 1, endpoints: '1 very little support · 5 very connected' },
  { id: 'dizziness', label: 'Dizziness / balance symptoms', min: 0, max: 4, step: 1, endpoints: '0 none · 4 very strong' },
  { id: 'visionSymptoms', label: 'Vision changes', min: 0, max: 4, step: 1, endpoints: '0 none · 4 very strong; symptom report only' },
];
export const vitalFields: { id: keyof Vitals; label: string; unit: string; step: string }[] = [
  { id: 'hr', label: 'Heart rate', unit: 'beats/min', step: '1' },
  { id: 'systolic', label: 'Systolic blood pressure', unit: 'mmHg', step: '1' },
  { id: 'diastolic', label: 'Diastolic blood pressure', unit: 'mmHg', step: '1' },
  { id: 'spo2', label: 'Blood oxygen saturation', unit: '%', step: '.1' },
  { id: 'temperatureC', label: 'Body temperature', unit: '°C', step: '.1' },
  { id: 'glucoseMgDl', label: 'Blood glucose', unit: 'mg/dL', step: '.1' },
];
