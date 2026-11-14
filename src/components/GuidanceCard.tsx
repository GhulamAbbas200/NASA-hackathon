import type { Indicator, IndicatorFlag } from '../types';

export interface GuidanceCardProps { indicator: Indicator; flag?: IndicatorFlag }
export default function GuidanceCard(_props: GuidanceCardProps) {
  return <section className="panel" aria-labelledby="guidance-stub">
    <span className="owner-label">Part 2 · Teammate 2</span>
    <h2 id="guidance-stub">GuidanceCard</h2>
    <p>TODO: Show sourced guidance, the baseline explanation and visible verification notes.</p>
  </section>;
}
