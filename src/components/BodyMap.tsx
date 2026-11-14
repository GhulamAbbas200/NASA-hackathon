import type { AppContextProps, IndicatorFlag, Region } from '../types';

export interface BodyMapProps extends AppContextProps {
  flags: IndicatorFlag[];
  onSelectRegion: (region: Region) => void;
  onEmergency: () => void;
}
export default function BodyMap(_props: BodyMapProps) {
  return <section className="panel" aria-labelledby="body-stub">
    <span className="owner-label">Part 3 · Abbas</span>
    <h2 id="body-stub">BodyMap</h2>
    <p>TODO: Render front and back views, region selection and a separate dosimeter information panel.</p>
    <p className="contract-hint">Verified API: Body data / onBodyPartPress · head-front / head-back exist</p>
  </section>;
}
