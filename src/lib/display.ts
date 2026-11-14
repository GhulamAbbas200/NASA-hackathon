import type { Indicator, IndicatorFlag, Status } from '../types';

export function formatValue(value: number | undefined, indicator: Indicator): string {
  if (value === undefined || !Number.isFinite(value)) return 'Not recorded';
  return new Intl.NumberFormat('en', { maximumFractionDigits: indicator.id === 'temperatureC' || indicator.id === 'sleepHours' ? 1 : 2 }).format(value);
}
export function summarizeFlags(flags: readonly IndicatorFlag[]): { status: Status; comparable: boolean } {
  const assessed = flags.filter(flag => flag.comparable);
  return { comparable: assessed.length > 0, status: assessed.some(flag => flag.status === 'contact') ? 'contact' : assessed.some(flag => flag.status === 'changed') ? 'changed' : 'normal' };
}
