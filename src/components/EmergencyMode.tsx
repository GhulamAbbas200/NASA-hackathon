import type { EmergencyStep, Environment } from '../types';
import { EMERGENCY_NOTICE, EMERGENCY_REVIEW_NOTE } from '../data/emergency';
import Icon from './ui/Icon';

export interface EmergencyModeProps { environment: Environment; steps: EmergencyStep[]; onExit: () => void }
export default function EmergencyMode(_props: EmergencyModeProps) {
  return <section className="panel emergency-panel" aria-labelledby="emergency-stub">
    <div className="card-heading"><span className="card-icon icon-alert"><Icon name="alert" /></span><h2 id="emergency-stub">Emergency support</h2></div>
    <p>{EMERGENCY_NOTICE}</p>
    <p>TODO: Build the sourced guided flow from emergency.ts, with branches and environment escalation text.</p>
    <p className="contract-hint">{EMERGENCY_REVIEW_NOTE}</p>
    <span className="component-name">EmergencyMode</span>
  </section>;
}
