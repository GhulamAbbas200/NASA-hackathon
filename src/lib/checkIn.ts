import { REGIONS, type CheckIn, type DailyMetric, type Discomfort10, type Rating5, type Symptom4, type Vitals } from '../types';
import { dailyFields, vitalFields } from '../data/checkInFields';
import { isCheckIn } from './storage';

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export interface CheckInDraft {
  date: string;
  daily: Record<DailyMetric, string>;
  discomfort: Record<typeof REGIONS[number], string>;
  vitals: Record<keyof Vitals, string>;
  simulated: boolean;
}
export function createDraft(date: string, entry?: CheckIn): CheckInDraft {
  return {
    date,
    daily: Object.fromEntries(dailyFields.map(field => [field.id, entry ? String(entry[field.id]) : ''])) as CheckInDraft['daily'],
    discomfort: Object.fromEntries(REGIONS.map(region => [region, String(entry?.bodyDiscomfort[region] ?? 0)])) as CheckInDraft['discomfort'],
    vitals: Object.fromEntries(vitalFields.map(field => [field.id, entry?.vitals?.[field.id] === undefined ? '' : String(entry.vitals[field.id])])) as CheckInDraft['vitals'],
    simulated: entry?.simulated ?? false,
  };
}
export function validateCheckInDraft(draft: CheckInDraft, today = localDate()): { errors: Record<string, string>; entry?: CheckIn } {
  const errors: Record<string, string> = {};
  const day = new Date(`${draft.date}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || !Number.isFinite(day.valueOf()) || localDate(day) !== draft.date) errors.date = 'Choose a real calendar date.';
  else if (draft.date > today) errors.date = 'Choose today or an earlier date.';
  for (const field of dailyFields) {
    const raw = draft.daily[field.id].trim();
    const value = Number(raw);
    if (!raw || !Number.isFinite(value)) errors[field.id] = `Enter ${field.label.toLowerCase()}.`;
    else if (value < field.min || value > field.max || (field.step === 1 && !Number.isInteger(value))) errors[field.id] = `Use ${field.step === 1 ? 'a whole number' : 'a number'} from ${field.min} to ${field.max}.`;
  }
  for (const region of REGIONS) {
    const value = Number(draft.discomfort[region]);
    if (!draft.discomfort[region].trim() || !Number.isInteger(value) || value < 0 || value > 10) errors[`discomfort.${region}`] = 'Use a whole number from 0 to 10.';
  }
  const vitals: Vitals = {};
  for (const field of vitalFields) {
    const raw = draft.vitals[field.id].trim();
    if (!raw) continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0 || (field.id === 'spo2' && value > 100)) errors[field.id] = field.id === 'spo2' ? 'Enter a device percentage above 0 and at most 100, or leave blank.' : 'Enter a positive device reading, or leave blank.';
    else vitals[field.id] = value;
  }
  if (Object.keys(errors).length) return { errors };
  const values = Object.fromEntries(dailyFields.map(field => [field.id, Number(draft.daily[field.id])])) as Record<DailyMetric, number>;
  const entry: CheckIn = {
    date: draft.date, sleepHours: values.sleepHours,
    sleepQuality: values.sleepQuality as Rating5, fatigue: values.fatigue as Rating5,
    mood: values.mood as Rating5, stress: values.stress as Rating5, teamCohesion: values.teamCohesion as Rating5,
    dizziness: values.dizziness as Symptom4, visionSymptoms: values.visionSymptoms as Symptom4,
    bodyDiscomfort: Object.fromEntries(REGIONS.map(region => [region, Number(draft.discomfort[region])])) as Record<typeof REGIONS[number], Discomfort10>,
    ...(Object.keys(vitals).length ? { vitals } : {}), simulated: draft.simulated,
  };
  return isCheckIn(entry) ? { errors, entry } : { errors: { form: 'Review the check-in fields before saving.' } };
}
