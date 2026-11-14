import type { CheckIn, DailyMetric, IndicatorFlag, IndicatorId, Region } from '../types';
import { BASELINE_ENTRY_COUNT, CONTACT_AFTER_CONSECUTIVE_CHANGES, RULE_NOTICE, RULES } from './rules';

export function readIndicatorValue(entry: CheckIn, id: IndicatorId): number | undefined {
  if (id === 'radiation') return undefined;
  if (id.startsWith('discomfort.')) return entry.bodyDiscomfort[id.slice(11) as Region];
  if (['hr', 'systolic', 'diastolic', 'spo2', 'temperatureC', 'glucoseMgDl'].includes(id)) {
    return entry.vitals?.[id as keyof NonNullable<CheckIn['vitals']>];
  }
  return entry[id as DailyMetric];
}

/** Sort without mutation; duplicate dates use the last record, matching storage upsert. */
export function orderedEntries(entries: readonly CheckIn[]): CheckIn[] {
  return [...new Map(entries.map(entry => [entry.date, entry])).values()]
    .sort((a, b) => a.date.localeCompare(b.date));
}

function comparison(entries: CheckIn[], index: number, id: Exclude<IndicatorId, 'radiation'>) {
  const latest = readIndicatorValue(entries[index], id);
  const values = entries.slice(Math.max(0, index - BASELINE_ENTRY_COUNT), index)
    .map(entry => readIndicatorValue(entry, id))
    .filter((value): value is number => value !== undefined && Number.isFinite(value));
  const baseline = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
  const comparable = values.length === BASELINE_ENTRY_COUNT && latest !== undefined && Number.isFinite(latest);
  if (!comparable || baseline === undefined || latest === undefined) {
    return { latest, baseline, sampleCount: values.length, comparable: false, changed: false };
  }
  const rule = RULES[id];
  const delta = latest - baseline;
  const difference = rule.direction === 'increase' ? delta : rule.direction === 'decrease' ? -delta : Math.abs(delta);
  const amount = rule.mode === 'relative' ? Math.abs(baseline) * rule.amount : rule.amount;
  // A zero relative baseline cannot produce a meaningful percentage comparison.
  if (rule.mode === 'relative' && baseline === 0) {
    return { latest, baseline, sampleCount: values.length, comparable: false, changed: false };
  }
  return { latest, baseline, sampleCount: values.length, comparable, changed: difference >= amount };
}

export function flagIndicator(input: readonly CheckIn[], id: IndicatorId): IndicatorFlag {
  const entries = orderedEntries(input);
  const empty: IndicatorFlag = { indicatorId: id, status: 'normal', sampleCount: 0, comparable: false, explanation: '' };
  if (id === 'radiation') return { ...empty, explanation: 'Not assessed: needs a dosimeter; symptoms cannot estimate radiation dose.' };
  if (!entries.length) return { ...empty, explanation: 'Not assessed: no check-ins. Normal here means no prototype flag, not medical clearance.' };
  const index = entries.length - 1;
  const result = comparison(entries, index, id);
  const { changed: _changed, ...details } = result;
  if (!result.comparable) return {
    ...empty, ...details,
    explanation: `Not assessed: need a latest value and ${BASELINE_ENTRY_COUNT} valid values in the preceding seven entries (${result.sampleCount} available). No medical clearance.`,
  };
  let consecutive = 0;
  for (let i = index; i >= 0 && consecutive < CONTACT_AFTER_CONSECUTIVE_CHANGES; i--) {
    if (!comparison(entries, i, id).changed) break;
    consecutive++;
  }
  const status = !result.changed ? 'normal' : consecutive >= CONTACT_AFTER_CONSECUTIVE_CHANGES ? 'contact' : 'changed';
  const action = status === 'contact'
    ? 'Persistent demo change: contact the ground flight surgeon using your mission procedure.'
    : status === 'changed' ? 'Changed from your baseline; repeat the check using the mission procedure.'
    : 'No prototype deviation detected; symptoms and mission guidance take priority.';
  return { indicatorId: id, status, ...details,
    explanation: `${action} Latest ${result.latest}; preceding-seven mean ${result.baseline?.toFixed(2)}. ${RULE_NOTICE}.` };
}

export function assessCheckIns(entries: readonly CheckIn[]): IndicatorFlag[] {
  return [...Object.keys(RULES) as Exclude<IndicatorId, 'radiation'>[], 'radiation' as const]
    .map(id => flagIndicator(entries, id));
}
