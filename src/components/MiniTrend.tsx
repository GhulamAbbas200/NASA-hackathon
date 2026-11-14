import type { CheckIn, Indicator } from '../types';
import { orderedEntries, readIndicatorValue } from '../lib/baseline';

/** Small overview only; the expanded trend includes a full accessible data table. */
export default function MiniTrend({ entries, indicator }: { entries: CheckIn[]; indicator: Indicator }) {
  const points = orderedEntries(entries).slice(-14).map(entry => readIndicatorValue(entry, indicator.id));
  const values = points.filter((value): value is number => value !== undefined);
  if (values.length < 2) return <span className="mini-trend-empty" aria-label="Not enough readings for a trend">—</span>;
  const min = Math.min(...values), max = Math.max(...values);
  const y = (value: number) => 24 - ((value - min) / (max - min || 1)) * 20;
  const segments: string[] = [];
  let segment = '';
  points.forEach((value, index) => {
    if (value === undefined) { if (segment) segments.push(segment); segment = ''; }
    else segment += `${segment ? ' L' : 'M'}${4 + (index / Math.max(1, points.length - 1)) * 88},${y(value)}`;
  });
  if (segment) segments.push(segment);
  return <svg className="mini-trend" viewBox="0 0 96 28" width="96" height="28" role="img" aria-label={`${indicator.name}: ${values.length} readings; ${values[0]} to ${values.at(-1)} ${indicator.unit}. Expand for the full dated table.`}>{segments.map((path, index) => <path key={index} d={path} fill="none" stroke="currentColor" strokeWidth="2" />)}</svg>;
}
