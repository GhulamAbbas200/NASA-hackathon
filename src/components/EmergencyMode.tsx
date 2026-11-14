import type { EmergencyStep, Environment } from '../types';
import { EMERGENCY_NOTICE, EMERGENCY_REVIEW_NOTE } from '../data/emergency';

export interface EmergencyModeProps { environment: Environment; steps: EmergencyStep[]; onExit: () => void }
export default function EmergencyMode(_props: EmergencyModeProps) {
  return <section className="panel emergency-panel" aria-labelledby="emergency-stub">
    <span className="owner-label">Part 2 · Teammate 2</span>
    <h2 id="emergency-stub">EmergencyMode</h2>
    <p>{EMERGENCY_NOTICE}</p>
    <p>TODO: Build the sourced guided flow from emergency.ts, with branches and environment escalation text.</p>
    <p className="contract-hint">{EMERGENCY_REVIEW_NOTE}</p>
  </section>;
}
