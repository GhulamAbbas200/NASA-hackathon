import type { AppContextProps, IndicatorFlag, Region } from '../types';
import FeaturePlaceholder from './ui/FeaturePlaceholder';

export interface BodyMapProps extends AppContextProps {
  flags: IndicatorFlag[];
  onSelectRegion: (region: Region) => void;
  onEmergency: () => void;
}
export default function BodyMap(_props: BodyMapProps) {
  return <FeaturePlaceholder id="body-stub" title="Explore by region" name="BodyMap" icon="body" description="Connect the front/back body map, region selection and dosimeter information." />;
}
