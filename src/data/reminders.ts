import type { Reminder } from '../types';
import { indicators } from './indicators';

export const REMINDER_NOTICE = 'ASTRA prototype schedule, not a NASA medical schedule. Use your mission plan.';
/** One default per atomic indicator. Device checks are never prescribed daily. */
export const reminders: Reminder[] = indicators.map(indicator => {
  const deviceOnly = ['hr', 'systolic', 'diastolic', 'spo2', 'temperatureC', 'glucoseMgDl'].includes(indicator.id);
  const radiation = indicator.id === 'radiation';
  return {
    indicatorId: indicator.id,
    intervalHours: deviceOnly || radiation ? null : 24,
    timing: radiation ? 'equipment-only' : deviceOnly ? 'mission-plan' : 'daily-check-in',
    label: radiation ? 'Use mission dosimetry' : deviceOnly ? 'Measure only as directed by the mission plan' : 'Daily check-in',
    note: deviceOnly || radiation ? 'TODO: verify device schedule with the mission medical team.' : 'Team-designed daily self-report. NASA research questionnaire cadence is not this demo cadence.',
  };
});
