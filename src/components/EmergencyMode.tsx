import { useEffect, useRef, useState } from 'react';
import type { EmergencyStep, Environment } from '../types';
import { EMERGENCY_NOTICE, EMERGENCY_REVIEW_NOTE, EMERGENCY_START_STEP_ID } from '../data/emergency';
import { environments } from '../data/environments';
import Icon from './ui/Icon';

export interface EmergencyModeProps { environment: Environment; steps: EmergencyStep[]; onExit: () => void }
export default function EmergencyMode({ environment, steps, onExit }: EmergencyModeProps) {
  const [history, setHistory] = useState<string[]>([EMERGENCY_START_STEP_ID]);
  const title = useRef<HTMLHeadingElement>(null);
  const currentId = history.at(-1)!;
  const current = steps.find(step => step.id === currentId);
  const config = environments[environment];
  useEffect(() => { title.current?.focus(); }, [currentId]);
  return <section className="panel emergency-panel emergency-flow" aria-labelledby="emergency-flow-title">
    <div className="card-heading"><span className="card-icon icon-alert"><Icon name="alert" /></span><h2 id="emergency-flow-title">Emergency support</h2></div>
    <p className="emergency-notice"><strong>{EMERGENCY_NOTICE}</strong></p><p className="escalation-notice">{config.name}: {config.escalationText}</p>
    <details className="verification-disclosure" open><summary>Research prototype · verification required</summary><p>{EMERGENCY_REVIEW_NOTE}</p></details>
    {current ? <><ol className="flow-history" aria-label="Steps visited">{history.map((id, index) => <li key={`${id}-${index}`} aria-current={index === history.length - 1 ? 'step' : undefined}>{steps.find(step => step.id === id)?.title}</li>)}</ol>
      <div className="emergency-step"><span className="small-text">Step {history.length}</span><h3 ref={title} tabIndex={-1}>{current.title}</h3><p className="emergency-instruction">{current.instruction}</p>{current.question && <h4>{current.question}</h4>}
        <div className="emergency-answers">{current.answers.map(answer => <button key={answer.nextStepId + answer.label} type="button" onClick={() => setHistory(previous => [...previous, answer.nextStepId])}>{answer.label}<Icon name="arrow" size={20} /></button>)}</div>
        {!current.answers.length && <div className="care-handoff"><strong>Continue the mission medical checklist.</strong><p>This is a handoff to continuing care, not an all-clear or an instruction to stop resuscitation.</p></div>}
        {current.verificationNote && <p className="verification-note">{current.verificationNote}</p>}
        <p className="small-text">Evidence status: {current.verification}. <a href={current.sourceUrl} target="_blank" rel="noreferrer">Step source ↗</a><br />{current.sourceSection}</p>
      </div></> : <p role="alert">This step is unavailable. Continue your mission medical checklist and contact the crew medical officer.</p>}
    <div className="emergency-navigation"><button type="button" disabled={history.length < 2} onClick={() => setHistory(previous => previous.slice(0, -1))}>← Back</button><button type="button" onClick={() => setHistory([EMERGENCY_START_STEP_ID])}>Restart flow</button><button type="button" onClick={onExit}>Exit to overview</button></div>
  </section>;
}
