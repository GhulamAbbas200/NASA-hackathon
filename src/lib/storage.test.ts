import assert from 'node:assert/strict';
import test from 'node:test';
import { seedCheckIns } from '../data/seed';
import { createLocalStorage, isCheckIn, STORAGE_KEY, StorageError } from './storage';

function fixture(initial = seedCheckIns) {
  const data = new Map<string, string>([['other-app', 'keep']]);
  const driver = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
  return { data, driver, store: createLocalStorage(() => driver, initial) };
}
test('round-trips simulated provenance, optional fields and upsert across reload', () => {
  const { store, driver } = fixture();
  const entry = { ...structuredClone(seedCheckIns[13]), sleepHours: 6.2, vitals: {}, simulated: false };
  store.save(entry);
  const reloaded = createLocalStorage(() => driver).load();
  assert.equal(reloaded.length, 14);
  assert.deepEqual(reloaded[13], entry);
});
test('reset persists empty records without erasing other keys or restoring demo data', () => {
  const { store, data } = fixture();
  assert.equal(store.load().length, 14);
  store.reset();
  assert.deepEqual(store.load(), []);
  assert.equal(data.get('other-app'), 'keep');
});
test('corruption is reported and remains untouched until explicit reset', () => {
  const { store, data } = fixture();
  data.set(STORAGE_KEY, '{broken');
  assert.throws(() => store.load(), StorageError);
  assert.throws(() => store.save(seedCheckIns[0]), StorageError);
  assert.equal(data.get(STORAGE_KEY), '{broken');
  store.reset();
  assert.deepEqual(store.load(), []);
});
test('unknown schema and invalid persisted values are not silently accepted', () => {
  const { store, data } = fixture();
  data.set(STORAGE_KEY, JSON.stringify({ version: 2, entries: [] }));
  assert.throws(() => store.load(), StorageError);
  data.set(STORAGE_KEY, JSON.stringify({ version: 1, entries: [{ ...seedCheckIns[0], mood: 9 }] }));
  assert.throws(() => store.load(), StorageError);
});
test('blocked access and quota failure are surfaced instead of claiming success', () => {
  const blocked = createLocalStorage(() => { throw new Error('blocked'); });
  assert.throws(() => blocked.load(), StorageError);
  const full = createLocalStorage(() => ({ getItem: () => null, setItem: () => { throw new Error('quota'); } }));
  assert.throws(() => full.save(seedCheckIns[0]), StorageError);
});
test('rejects impossible dates, nonfinite values, incomplete scales and invalid optional vitals', () => {
  const entry = structuredClone(seedCheckIns[0]);
  assert.equal(isCheckIn({ ...entry, date: '2026-02-30' }), false);
  assert.equal(isCheckIn({ ...entry, sleepHours: NaN }), false);
  assert.equal(isCheckIn({ ...entry, simulated: undefined }), false);
  assert.equal(isCheckIn({ ...entry, bodyDiscomfort: {} }), false);
  assert.equal(isCheckIn({ ...entry, vitals: { hr: Infinity } }), false);
  assert.equal(isCheckIn({ ...entry, vitals: { spo2: 101 } }), false);
  assert.equal(isCheckIn({ ...entry, vitals: undefined }), true);
});
test('editing a returned initial demo record does not mutate the seed', () => {
  const { store } = fixture();
  const entries = store.load();
  entries[0].bodyDiscomfort.head = 10;
  assert.equal(store.load()[0].bodyDiscomfort.head, 0);
});
