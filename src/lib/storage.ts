import { REGIONS, type CheckIn, type Storage, type Vitals } from '../types';
import { seedCheckIns } from '../data/seed';
import { orderedEntries } from './baseline';

export const STORAGE_KEY = 'astra.check-ins.v1';
export class StorageError extends Error {
  constructor(message: string, options?: ErrorOptions) { super(message, options); this.name = 'StorageError'; }
}
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const rating = (value: unknown, min: number, max: number) => finite(value) && Number.isInteger(value) && value >= min && value <= max;
const VITAL_KEYS: (keyof Vitals)[] = ['hr', 'systolic', 'diastolic', 'spo2', 'temperatureC', 'glucoseMgDl'];

/** Shape/scale checks only; these ranges are form constraints, not alert limits. */
export function isCheckIn(value: unknown): value is CheckIn {
  if (!object(value) || typeof value.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)) return false;
  const date = new Date(`${value.date}T00:00:00Z`);
  if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== value.date) return false;
  if (!finite(value.sleepHours) || value.sleepHours < 0 || value.sleepHours > 24) return false;
  if (!['sleepQuality', 'fatigue', 'mood', 'stress', 'teamCohesion'].every(key => rating(value[key], 1, 5))) return false;
  if (!['dizziness', 'visionSymptoms'].every(key => rating(value[key], 0, 4))) return false;
  if (!object(value.bodyDiscomfort)) return false;
  const discomfort = value.bodyDiscomfort;
  if (!REGIONS.every(region => rating(discomfort[region], 0, 10))) return false;
  if (typeof value.simulated !== 'boolean') return false;
  if (value.vitals !== undefined) {
    if (!object(value.vitals)) return false;
    const vitals = value.vitals;
    if (!VITAL_KEYS.every(key => vitals[key] === undefined || (finite(vitals[key]) && vitals[key] > 0))) return false;
    if (finite(vitals.spo2) && vitals.spo2 > 100) return false;
  }
  return true;
}

export function createLocalStorage(
  getDriver: () => Pick<globalThis.Storage, 'getItem' | 'setItem'>,
  initialEntries: readonly CheckIn[] = [],
  storageKey: string = STORAGE_KEY,
): Storage {
  const load = (): CheckIn[] => {
    try {
      const raw = getDriver().getItem(storageKey);
      if (raw === null) return structuredClone([...initialEntries]);
      const parsed: unknown = JSON.parse(raw);
      if (!object(parsed) || parsed.version !== 1 || !Array.isArray(parsed.entries) || !parsed.entries.every(isCheckIn)) {
        throw new Error('Invalid ASTRA data format.');
      }
      return orderedEntries(parsed.entries);
    } catch (cause) {
      throw new StorageError('Could not load ASTRA records. Existing data was left untouched.', { cause });
    }
  };
  const write = (entries: CheckIn[]) => {
    try { getDriver().setItem(storageKey, JSON.stringify({ version: 1, entries })); }
    catch (cause) { throw new StorageError('Could not save ASTRA records. Storage may be blocked or full.', { cause }); }
  };
  return {
    load,
    save(entry) {
      if (!isCheckIn(entry)) throw new StorageError('Check-in has invalid fields. Nothing was saved.');
      write(orderedEntries([...load(), entry]));
    },
    reset() { write([]); },
  };
}

export function getUserStorageKey(userId?: string | null): string {
  return userId ? `astra.check-ins.v1.${userId}` : STORAGE_KEY;
}

export function createUserStorage(userId?: string | null): Storage {
  const key = getUserStorageKey(userId);
  return createLocalStorage(() => window.localStorage, [], key);
}

/** No browser access until a method is called; safe to import in tests. */
export const storage: Storage = createLocalStorage(() => window.localStorage, seedCheckIns);
