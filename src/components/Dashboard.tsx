import { useState } from 'react';
import type { AppContextProps, IndicatorFlag, IndicatorId } from '../types';
import { indicators, indicatorById } from '../data/indicators';
import { RULE_NOTICE } from '../lib/rules';
import TrendChart from './TrendChart';
import GuidanceCard from './GuidanceCard';
import StatusChip from './ui/StatusChip';
import Icon from './ui/Icon';

export interface DashboardProps extends AppContextProps { flags: IndicatorFlag[]; onEmergency: () => void }
export default function Dashboard({ entries, flags, onEmergency }: DashboardProps) {
  const [selected, setSelected] = useState<IndicatorId>('sleepHours');
  const indicator = indicatorById[selected];
  const flag = flags.find(item => item.indicatorId === selected);
  const measured = flags.filter(item => item.indicatorId !== 'radiation');
  const counts = { normal: measured.filter(item => item.comparable && item.status === 'normal').length, changed: measured.filter(item => item.comparable && item.status === 'changed').length, contact: measured.filter(item => item.comparable && item.status === 'contact').length, unassessed: measured.filter(item => !item.comparable).length };
  return <div className="stack dashboard-content">
    <section className="panel snapshot-card" aria-labelledby="snapshot-title"><div className="card-heading"><span className="card-icon icon-heart"><Icon name="heart" /></span><h2 id="snapshot-title">Health snapshot</h2></div>
      <div className="status-counts"><div><StatusChip status="normal" comparable /><strong>{counts.normal}</strong></div><div><StatusChip status="changed" comparable /><strong>{counts.changed}</strong></div><div><StatusChip status="contact" comparable /><strong>{counts.contact}</strong></div><div><StatusChip /><strong>{counts.unassessed}</strong></div></div>
      <p className="small-text">Indicators, not diagnoses. Radiation is assessed separately with dosimetry. Every flag is a {RULE_NOTICE}.</p>
      {entries.length === 0 && <p className="empty-state">Start with a check-in. Seven preceding valid readings are needed for each baseline.</p>}
      <button type="button" className="text-button" onClick={onEmergency}>Chest pain or collapse? Open Emergency →</button>
    </section>
    <section className="panel metric-selector"><label htmlFor="dashboard-indicator">Explore an indicator</label><select id="dashboard-indicator" value={selected} onChange={event => setSelected(event.target.value as IndicatorId)}>{indicators.filter(item => item.id !== 'radiation').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></section>
    <TrendChart entries={entries} indicator={indicator} />
    <GuidanceCard indicator={indicator} flag={flag} />
  </div>;
}
