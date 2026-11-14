import type { AppContextProps, IndicatorFlag } from '../types';
import { indicatorById } from '../data/indicators';
import TrendChart from './TrendChart';
import GuidanceCard from './GuidanceCard';
import FeaturePlaceholder from './ui/FeaturePlaceholder';

export interface DashboardProps extends AppContextProps { flags: IndicatorFlag[]; onEmergency: () => void }
export default function Dashboard({ entries, flags }: DashboardProps) {
  return <div className="stack">
    <FeaturePlaceholder id="dashboard-stub" title="Health snapshot" name="Dashboard" icon="heart" description="Add status summaries and changes from your personal baseline." />
    <div className="panel-grid">
      <TrendChart entries={entries} indicator={indicatorById.sleepHours} />
      <GuidanceCard indicator={indicatorById.sleepHours} flag={flags.find(flag => flag.indicatorId === 'sleepHours')} />
    </div>
  </div>;
}
