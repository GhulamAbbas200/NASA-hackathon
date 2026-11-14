import assert from 'node:assert/strict';
import test from 'node:test';
import type { CheckIn } from '../types';
import { seedCheckIns } from '../data/seed';
import { assessCheckIns, flagIndicator, orderedEntries } from './baseline';

function records(count = 8): CheckIn[] {
  return Array.from({ length: count }, (_, index) => ({ ...structuredClone(seedCheckIns[0]),
    date: `2026-10-${String(index + 1).padStart(2, '0')}`, sleepHours: 8, fatigue: 2 }));
}
test('compares the latest with seven preceding entries, never including itself', () => {
  const entries = records();
  entries[7].sleepHours = 6.5;
  const flag = flagIndicator(entries, 'sleepHours');
  assert.equal(flag.baseline, 8);
  assert.equal(flag.status, 'changed');
  assert.equal(flag.sampleCount, 7);
  assert.equal(flag.comparable, true);
});
test('uses the last seven, even when older entries differ; does not mutate input order', () => {
  const entries = records(10);
  entries[0].sleepHours = 3;
  const reversed = [...entries].reverse();
  assert.equal(flagIndicator(reversed, 'sleepHours').baseline, 8);
  assert.equal(reversed[0].date, entries[9].date);
});
test('partial baseline and empty history are explicitly not assessed', () => {
  assert.equal(flagIndicator(records(7), 'sleepHours').comparable, false);
  assert.match(flagIndicator([], 'sleepHours').explanation, /Not assessed/);
});
test('missing optional readings never become zero or a normal clinical result', () => {
  const entries = records();
  entries[0].vitals = undefined;
  assert.equal(flagIndicator(entries, 'hr').comparable, false);
  entries[0].vitals = { hr: 65 };
  entries[7].vitals = {};
  const flag = flagIndicator(entries, 'hr');
  assert.equal(flag.latest, undefined);
  assert.equal(flag.comparable, false);
});
test('contact requires three consecutive independently compared deviations', () => {
  const entries = records(10);
  entries.slice(7).forEach(entry => { entry.fatigue = 5; });
  assert.equal(flagIndicator(entries.slice(0, 8), 'fatigue').status, 'changed');
  assert.equal(flagIndicator(entries.slice(0, 9), 'fatigue').status, 'changed');
  assert.equal(flagIndicator(entries, 'fatigue').status, 'contact');
  assert.match(flagIndicator(entries, 'fatigue').explanation, /prototype rule, not a medical threshold/);
});
test('an intervening normal reading breaks persistent escalation', () => {
  const entries = records(10);
  entries[7].fatigue = 5;
  entries[9].fatigue = 5;
  assert.equal(flagIndicator(entries, 'fatigue').status, 'changed');
});
test('favorable direction does not trigger adverse-only rules', () => {
  const entries = records();
  entries[7].sleepHours = 10;
  assert.equal(flagIndicator(entries, 'sleepHours').status, 'normal');
});
test('radiation is never assessed from symptoms; duplicate dates match storage upsert', () => {
  const entries = records();
  const replacement = { ...entries[7], sleepHours: 5 };
  assert.equal(orderedEntries([...entries, replacement]).length, 8);
  assert.equal(flagIndicator([...entries, replacement], 'sleepHours').latest, 5);
  assert.match(flagIndicator(entries, 'radiation').explanation, /dosimeter/);
  assert.equal(flagIndicator(entries, 'radiation').comparable, false);
});
test('demo gives meaningful changed/contact flags without inventing radiation values', () => {
  const flags = assessCheckIns(seedCheckIns);
  assert.ok(flags.some(flag => flag.status === 'contact'));
  assert.ok(flags.some(flag => flag.status === 'changed'));
  assert.equal(flags.find(flag => flag.indicatorId === 'radiation')?.latest, undefined);
});
