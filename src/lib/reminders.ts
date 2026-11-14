import type { CheckIn, Environment } from '../types';
import { environments } from '../data/environments';
import { reminders } from '../data/reminders';
import { orderedEntries } from './baseline';
import { localDate } from './checkIn';

export function getCheckInReminder(entries: readonly CheckIn[], environment: Environment, now = new Date()) {
  const config = environments[environment];
  const interval = config.reminderFrequency.dailyCheckInHours;
  const latest = orderedEntries(entries).at(-1);
  const scheduledIndicators = reminders.filter(reminder => reminder.timing === 'daily-check-in' && config.availableMeasurements.includes(reminder.indicatorId));
  if (interval === null || !scheduledIndicators.length) return { due: false, scheduled: false, latestDate: latest?.date, dueDate: undefined, label: 'No measurement schedule configured' };
  if (!latest) return { due: true, scheduled: true, latestDate: undefined, dueDate: localDate(now), label: 'Your first check-in is ready' };
  const dueDate = new Date(`${latest.date}T00:00:00`);
  dueDate.setHours(dueDate.getHours() + interval);
  const due = localDate(now) >= localDate(dueDate);
  return { due, scheduled: true, latestDate: latest.date, dueDate: localDate(dueDate), label: due ? 'Daily check-in is due' : 'Daily check-in recorded' };
}
