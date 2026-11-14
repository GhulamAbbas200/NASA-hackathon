import assert from 'node:assert/strict';
import test from 'node:test';
import { seedCheckIns } from '../data/seed';
import { dailyFields, vitalFields } from '../data/checkInFields';
import { createDraft, localDate, validateCheckInDraft } from './checkIn';
import { getCheckInReminder } from './reminders';
import { createLocalStorage } from './storage';

test('an edited simulated entry round-trips without losing its provenance or optional fields', () => {
  const original = seedCheckIns[13];
  const draft = createDraft(original.date, original);
  assert.equal(draft.simulated, true);
  const result = validateCheckInDraft(draft, '2026-11-15');
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.entry, original);
});
test('blank optional vitals are omitted and an observed new entry remains observed', () => {
  const draft = createDraft('2026-11-15', seedCheckIns[13]);
  vitalFields.forEach(field => { draft.vitals[field.id] = ' '; });
  draft.simulated = false;
  const result = validateCheckInDraft(draft, '2026-11-15');
  assert.equal(result.entry?.vitals, undefined);
  assert.equal(result.entry?.simulated, false);
});
test('blank required ratings do not silently become zero; errors are attached to fields', () => {
  const draft = createDraft('2026-11-15');
  const result = validateCheckInDraft(draft, '2026-11-15');
  assert.equal(result.entry, undefined);
  dailyFields.forEach(field => assert.ok(result.errors[field.id]));
});
test('invalid dates, future dates and fractional ordinal scales are rejected', () => {
  const draft = createDraft('2026-02-30', seedCheckIns[13]);
  draft.daily.mood = '2.5';
  draft.discomfort.chest = '-1';
  const errors = validateCheckInDraft(draft, '2026-11-15').errors;
  assert.ok(errors.date && errors.mood && errors['discomfort.chest']);
  draft.date = '2026-11-16';
  assert.ok(validateCheckInDraft(draft, '2026-11-15').errors.date);
});
test('device representation errors are rejected without inventing clinical ranges', () => {
  const draft = createDraft('2026-11-15', seedCheckIns[13]);
  draft.vitals.hr = 'Infinity'; draft.vitals.spo2 = '101'; draft.vitals.glucoseMgDl = '-5';
  const result = validateCheckInDraft(draft, '2026-11-15');
  assert.equal(result.entry, undefined);
  assert.ok(result.errors.hr && result.errors.spo2 && result.errors.glucoseMgDl);
});
test('validated same-date edits save via the shared storage upsert contract', () => {
  const memory = new Map<string, string>();
  const store = createLocalStorage(() => ({ getItem: key => memory.get(key) ?? null, setItem: (key, value) => { memory.set(key, value); } }), seedCheckIns);
  const draft = createDraft('2026-11-15', seedCheckIns[13]);
  draft.daily.sleepHours = '6.2';
  const entry = validateCheckInDraft(draft, '2026-11-15').entry;
  assert.ok(entry); store.save(entry);
  assert.equal(store.load().length, 14);
  assert.equal(store.load()[13].sleepHours, 6.2);
});
test('reminders use calendar days, preserve missing-history states and do not prescribe conceptual schedules', () => {
  const now = new Date(2026, 10, 15, 9, 30);
  assert.equal(localDate(now), '2026-11-15');
  assert.equal(getCheckInReminder([], 'iss', now).due, true);
  assert.equal(getCheckInReminder(seedCheckIns, 'iss', now).due, false);
  assert.equal(getCheckInReminder(seedCheckIns.slice(0, -1), 'iss', now).due, true);
  assert.equal(getCheckInReminder(seedCheckIns, 'moonBase', now).scheduled, false);
  assert.equal(getCheckInReminder(seedCheckIns, 'spacecraft', now).due, false);
});
