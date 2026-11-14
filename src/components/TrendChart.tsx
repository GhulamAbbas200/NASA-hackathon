import type { CheckIn, Indicator } from '../types';
import FeaturePlaceholder from './ui/FeaturePlaceholder';

export interface TrendChartProps { entries: CheckIn[]; indicator: Indicator }
export default function TrendChart({ indicator }: TrendChartProps) {
  return <FeaturePlaceholder id="trend-stub" title="Health trends" name="TrendChart" icon="trend" description={`Add ${indicator.name.toLowerCase()} trends and an accessible text alternative.`} />;
}
