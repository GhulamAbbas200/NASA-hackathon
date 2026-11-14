import type { AppContextProps, IndicatorFlag } from '../types';
import { indicatorById } from '../data/indicators';
import TrendChart from './TrendChart';
import GuidanceCard from './GuidanceCard';

export interface DashboardProps extends AppContextProps { flags: IndicatorFlag[]; onEmergency: () => void }
export default function Dashboard({ entries, flags }: DashboardProps) {
  return <div className="stack">
    <section className="panel" aria-labelledby="dashboard-stub">
      <span className="owner-label">Part 2 · Teammate 2</span>
      <h2 id="dashboard-stub">Dashboard</h2>
      <p>TODO: Build status summaries with text and icons, and show baseline changes.</p>
    </section>
    <div className="panel-grid">
      <TrendChart entries={entries} indicator={indicatorById.sleepHours} />
      <GuidanceCard indicator={indicatorById.sleepHours} flag={flags.find(flag => flag.indicatorId === 'sleepHours')} />
    </div>
  </div>;
}
