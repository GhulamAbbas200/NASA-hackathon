import type { Indicator } from '../types';
import type { SourceReference } from '../data/sources';
import FeaturePlaceholder from '../components/ui/FeaturePlaceholder';

export interface AboutProps { indicators: Indicator[]; sources: SourceReference[] }
export default function About(_props: AboutProps) {
  return <FeaturePlaceholder id="about-stub" title="Sources & project scope" name="About" icon="info" description="Add research sources, OSDR context, simulated-data information and MIT credits." />;
}
