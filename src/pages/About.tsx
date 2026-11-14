import type { Indicator } from '../types';
import type { SourceReference } from '../data/sources';

export interface AboutProps { indicators: Indicator[]; sources: SourceReference[] }
export default function About(_props: AboutProps) {
  return <section className="panel" aria-labelledby="about-stub">
    <span className="owner-label">Part 1 · Teammate 1</span>
    <h2 id="about-stub">About</h2>
    <p>TODO: Build the Sources/About page, OSDR context, simulated-data notice and MIT package credits.</p>
    <p className="contract-hint">Source registry: src/data/sources.ts · licence notices: THIRD_PARTY_NOTICES.md</p>
  </section>;
}
