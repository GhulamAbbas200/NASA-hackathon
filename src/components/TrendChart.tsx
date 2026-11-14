import { useId } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CheckIn, Indicator } from '../types';
import { flagIndicator, orderedEntries, readIndicatorValue } from '../lib/baseline';
import { formatValue } from '../lib/display';
import StatusChip from './ui/StatusChip';

export interface TrendChartProps { entries: CheckIn[]; indicator: Indicator; compact?: boolean }
export default function TrendChart({ entries, indicator, compact = false }: TrendChartProps) {
  const id = useId();
  const ordered = orderedEntries(entries);
  const data = ordered.slice(-14).map(entry => ({ date: entry.date, value: readIndicatorValue(entry, indicator.id) ?? null, simulated: entry.simulated }));
  const flag = flagIndicator(ordered, indicator.id);
  const readingCount = data.filter(point => point.value !== null).length;
  return <section className={compact ? 'trend-card trend-compact' : 'panel trend-card'} aria-labelledby={`${id}-title`}>
    <div className="section-heading"><div><h3 id={`${id}-title`}>{indicator.name}</h3><p className="small-text">{indicator.unit} · last {data.length} check-ins</p></div><StatusChip {...flag} /></div>
    <p className="trend-current"><strong>{formatValue(flag.latest, indicator)}</strong>{flag.latest !== undefined && <span>{indicator.unit}</span>}</p>
    {readingCount ? <div className="trend-chart-area" style={{ height: compact ? 160 : 220 }}><ResponsiveContainer width="100%" height="100%" minWidth={0}><LineChart data={data} margin={{ top: 8, right: 12, left: -15, bottom: 8 }} accessibilityLayer>
      <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="date" tickFormatter={value => String(value).slice(5)} minTickGap={30} tick={{ fill: 'var(--text-secondary)', fontSize: 14 }} /><YAxis domain={['auto', 'auto']} width={60} tick={{ fill: 'var(--text-secondary)', fontSize: 14 }} />
      <Tooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-primary)' }} formatter={value => [typeof value === 'number' ? `${formatValue(value, indicator)} ${indicator.unit}` : 'Not recorded', indicator.name]} />
      {flag.comparable && flag.baseline !== undefined && <ReferenceLine y={flag.baseline} stroke="var(--text-muted)" strokeDasharray="6 4" />}
      <Line dataKey="value" type="linear" stroke="var(--accent-text)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={false} />
    </LineChart></ResponsiveContainer></div> : <p className="empty-state">No recorded values for this indicator yet.</p>}
    <p className="small-text">{flag.comparable ? `Dashed line: preceding-seven mean ${formatValue(flag.baseline, indicator)} ${indicator.unit}.` : 'Baseline needs a latest reading and seven valid preceding readings.'} Missing readings remain gaps.</p>
    {data.some(point => point.simulated) && <p className="simulation-tag">◇ Contains simulated demo readings</p>}
    <details className="subtle-details"><summary>View values as a table</summary><div className="table-scroll"><table><caption>{indicator.name} in {indicator.unit}</caption><thead><tr><th scope="col">Date</th><th scope="col">Value</th><th scope="col">Provenance</th></tr></thead><tbody>{data.map(point => <tr key={point.date}><th scope="row">{point.date}</th><td>{point.value === null ? 'Not recorded' : formatValue(point.value, indicator)}</td><td>{point.simulated ? 'Simulated' : 'Observed'}</td></tr>)}</tbody></table></div></details>
  </section>;
}
