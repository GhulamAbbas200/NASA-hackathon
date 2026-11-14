import type { AppContextProps, IndicatorFlag, Region } from '../types';
import { REGION_LABELS } from '../data/regionMap';
import FeaturePlaceholder from './ui/FeaturePlaceholder';

export interface RegionPanelProps extends AppContextProps { region: Region; flags: IndicatorFlag[]; onEmergency: () => void }
export default function RegionPanel({ region }: RegionPanelProps) {
  return <FeaturePlaceholder id="region-stub" title="Region insights" name="RegionPanel" icon="activity" description={`Add ${REGION_LABELS[region].toLowerCase()} values, mini trends, sources and next actions.`} />;
}
