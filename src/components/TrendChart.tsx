import type { CheckIn, Indicator } from '../types';

export interface TrendChartProps { entries: CheckIn[]; indicator: Indicator }
export default function TrendChart({ indicator }: TrendChartProps) {
  return <section className="panel" aria-labelledby="trend-stub">
    <span className="owner-label">Part 2 · Teammate 2</span>
    <h2 id="trend-stub">TrendChart</h2>
    <p>TODO: Plot {indicator.name.toLowerCase()} with Recharts and an accessible text alternative.</p>
  </section>;
}
