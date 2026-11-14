import { useState } from 'react';
import type { AppContextProps, CheckIn, Indicator, IndicatorFlag, Region } from '../types';
import { REGION_LABELS } from '../data/regionMap';
import { indicatorsForRegion } from '../data/indicators';
import { orderedEntries, readIndicatorValue } from '../lib/baseline';
import { formatValue, summarizeFlags } from '../lib/display';
import StatusChip from './ui/StatusChip';
import MetricHelp from './ui/MetricHelp';
import MiniTrend from './MiniTrend';
import TrendChart from './TrendChart';
import Icon from './ui/Icon';

export interface RegionPanelProps extends AppContextProps { region: Region; flags: IndicatorFlag[]; onEmergency: () => void }
function RegionMetric({ indicator, entries, flag }: { indicator: Indicator; entries: CheckIn[]; flag?: IndicatorFlag }) {
  const [open, setOpen] = useState(false);
  const latest = orderedEntries(entries).at(-1);
  const value = latest ? readIndicatorValue(latest, indicator.id) : undefined;
  return <details className="region-metric" onToggle={event => setOpen(event.currentTarget.open)}><summary><span className="region-metric-name">{indicator.name}</span><span className="region-metric-value">{formatValue(value, indicator)}{value !== undefined && <small> {indicator.unit}</small>}</span><MiniTrend entries={entries} indicator={indicator} /><StatusChip status={flag?.status} comparable={flag?.comparable} /></summary>
    {open && <div className="region-metric-content"><p>{flag?.explanation ?? 'Not assessed: no comparison is available.'}</p><p><strong>Why it matters:</strong> {indicator.whyItMatters}</p><p><strong>Next action:</strong> {indicator.nextAction}</p><TrendChart entries={entries} indicator={indicator} compact /><MetricHelp indicator={indicator} /><a href={indicator.sourceUrl} target="_blank" rel="noreferrer">Research source ↗</a></div>}
  </details>;
}
export default function RegionPanel({ region, entries, flags, onEmergency }: RegionPanelProps) {
  const relevant = indicatorsForRegion(region);
  const summary = summarizeFlags(flags.filter(flag => relevant.some(indicator => indicator.id === flag.indicatorId)));
  const latest = orderedEntries(entries).at(-1);
  return <section className="panel region-panel" aria-labelledby="region-title"><div className="section-heading"><div className="card-heading"><span className="card-icon icon-activity"><Icon name="activity" /></span><h2 id="region-title">{REGION_LABELS[region]} insights</h2></div><StatusChip {...summary} /></div>
    <p className="secondary-text">{latest ? `Latest check-in: ${latest.date}${latest.simulated ? ' · simulated' : ' · observed'}.` : 'No check-ins yet.'} Expand an indicator for its trend and source. Region assignments are navigation choices, not diagnoses.</p>
    {region === 'chest' && <button type="button" className="danger-button" onClick={onEmergency}><Icon name="alert" size={18} />Chest pain or collapse? Open Emergency</button>}
    <div className="region-metrics">{relevant.map(indicator => <RegionMetric key={`${region}-${indicator.id}`} indicator={indicator} entries={entries} flag={flags.find(flag => flag.indicatorId === indicator.id)} />)}</div>
  </section>;
}
