import type { AppContextProps, IndicatorFlag, Region } from '../types';
import { REGION_LABELS } from '../data/regionMap';

export interface RegionPanelProps extends AppContextProps { region: Region; flags: IndicatorFlag[]; onEmergency: () => void }
export default function RegionPanel({ region }: RegionPanelProps) {
  return <section className="panel" aria-labelledby="region-stub">
    <span className="owner-label">Part 3 · Abbas</span>
    <h2 id="region-stub">RegionPanel</h2>
    <p>TODO: Show {REGION_LABELS[region].toLowerCase()} values, mini trends, status, sources and next actions.</p>
  </section>;
}
