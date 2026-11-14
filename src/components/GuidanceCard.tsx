import type { Indicator, IndicatorFlag } from '../types';
import FeaturePlaceholder from './ui/FeaturePlaceholder';

export interface GuidanceCardProps { indicator: Indicator; flag?: IndicatorFlag }
export default function GuidanceCard(_props: GuidanceCardProps) {
  return <FeaturePlaceholder id="guidance-stub" title="Guidance & next steps" name="GuidanceCard" icon="shield" description="Add sourced guidance, baseline explanations and verification notes." />;
}
