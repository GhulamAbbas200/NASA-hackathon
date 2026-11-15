import { useEffect, useRef, useState } from 'react';
import type { EmergencyStep, Environment } from '../types';
import { EMERGENCY_NOTICE, EMERGENCY_START_STEP_ID } from '../data/emergency';
import { environments } from '../data/environments';
import Icon from './ui/Icon';

export interface EmergencyModeProps {
  environment: Environment;
  steps: EmergencyStep[];
  onExit: () => void;
}

// Friendly, plain-English action guides mapped to each step ID
const STEP_GUIDES: Record<string, {
  summary: string;
  bulletPoints: string[];
  alertLevel: 'urgent' | 'critical' | 'care';
}> = {
  'call-help': {
    summary: 'Immediately alert the crew and establish communication with ground medical control.',
    bulletPoints: [
      'Shout loudly for the Crew Medical Officer (CMO) to report to the medical bay immediately.',
      'Open the mission comms channel to contact the Ground Flight Surgeon.',
      'Retrieve the onboard Emergency Medical Pack and the Automated External Defibrillator (AED).',
    ],
    alertLevel: 'urgent',
  },
  'responsive': {
    summary: 'Check if the collapsed crewmate is conscious and able to respond to you.',
    bulletPoints: [
      'Gently shake their shoulders and speak loudly: "Can you hear me? Open your eyes!"',
      'Look for any eye opening, speaking, movement, or hand squeeze.',
      'If they respond, keep them calm and monitor for chest pain or shortness of breath.',
    ],
    alertLevel: 'urgent',
  },
  'breathing': {
    summary: 'Check for normal breathing. In zero gravity, look closely at chest rise.',
    bulletPoints: [
      'Look, listen, and feel for normal breathing for no more than 10 seconds.',
      'Occasional gasping or no breathing means cardiac arrest — act immediately.',
      'If breathing normally, position them safely and monitor vital signs.',
    ],
    alertLevel: 'critical',
  },
  'cpr': {
    summary: 'Begin chest compressions immediately using microgravity restraint techniques.',
    bulletPoints: [
      'ANCHOR YOURSELF: Hook your legs into floor restraints or use waist tethers so you do not push yourself away from the patient in zero-g.',
      'HAND PLACEMENT: Place the heel of one hand in the center of the chest (lower half of breastbone); interlock fingers.',
      'COMPRESSIONS: Push hard and fast at 100–120 beats per minute, pressing 2 inches (5 cm) deep.',
      'Allow full chest recoil between compressions. Do not stop until the AED is ready.',
    ],
    alertLevel: 'critical',
  },
  'aed': {
    summary: 'Attach the Automated External Defibrillator (AED) and follow its voice commands.',
    bulletPoints: [
      'Turn on the AED and wipe any sweat or moisture off the patient’s bare chest.',
      'Attach pads firmly: one on the upper right chest, the other on the lower left side.',
      'CLEAR PATIENT: Ensure nobody is touching the patient while the device analyzes the heart rhythm.',
      'If shock advised: ensure everyone is clear and press the Shock button, then resume CPR immediately.',
    ],
    alertLevel: 'critical',
  },
  'medical-care': {
    summary: 'Provide continuous monitoring and transfer care to the medical team.',
    bulletPoints: [
      'Keep patient resting comfortably and secured to the medical rack.',
      'Continuously monitor vital signs: pulse, blood pressure, and oxygen saturation.',
      'Report all observations, symptom timeline, and actions taken to the ground flight surgeon.',
    ],
    alertLevel: 'care',
  },
};

const STEP_TITLES = [
  { id: 'call-help', label: '1. Call Help' },
  { id: 'responsive', label: '2. Check Consciousness' },
  { id: 'breathing', label: '3. Breathing Check' },
  { id: 'cpr', label: '4. Microgravity CPR' },
  { id: 'aed', label: '5. Use AED' },
  { id: 'medical-care', label: '6. Ongoing Care' },
];

export default function EmergencyMode({ environment, steps, onExit }: EmergencyModeProps) {
  const [history, setHistory] = useState<string[]>([EMERGENCY_START_STEP_ID]);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const currentId = history.at(-1)!;
  const current = steps.find(step => step.id === currentId);
  const guide = STEP_GUIDES[currentId];
  const config = environments[environment];

  useEffect(() => {
    titleRef.current?.focus();
  }, [currentId]);

  const stepIndex = STEP_TITLES.findIndex(s => s.id === currentId);
  const currentStepNumber = stepIndex >= 0 ? stepIndex + 1 : history.length;

  return (
    <section className="panel emergency-container" aria-labelledby="emergency-heading">
      {/* High-visibility Emergency Alert Banner */}
      <div className="emergency-alert-banner">
        <div className="banner-left">
          <span className="emergency-siren"><Icon name="alert" size={28} /></span>
          <div>
            <h2 id="emergency-heading">EMERGENCY MEDICAL RESPONSE PROTOCOL</h2>
            <p className="emergency-subtitle">
              {config.name}: {config.escalationText}
            </p>
          </div>
        </div>
        <button type="button" className="emergency-exit-top" onClick={onExit} aria-label="Exit Emergency Mode">
          ✕ Exit Emergency
        </button>
      </div>

      {/* Visual Step-by-Step Progress Track */}
      <nav className="emergency-progress-track" aria-label="Emergency steps progress">
        {STEP_TITLES.map((step, idx) => {
          const isCurrent = step.id === currentId;
          const isPast = history.includes(step.id) && !isCurrent;
          return (
            <div
              key={step.id}
              className={`progress-step-pill ${isCurrent ? 'current' : isPast ? 'completed' : 'pending'}`}
            >
              <span className="step-circle">{isPast ? '✓' : idx + 1}</span>
              <span className="step-text">{step.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Main Action Instructions Card */}
      {current ? (
        <div className="emergency-action-card panel">
          <div className="action-card-header">
            <span className={`urgency-badge ${guide?.alertLevel || 'urgent'}`}>
              {guide?.alertLevel === 'critical' ? 'CRITICAL ACTION' : 'STEP ' + currentStepNumber}
            </span>
            <h3 ref={titleRef} tabIndex={-1}>{current.title}</h3>
          </div>

          {guide && (
            <div className="plain-instructions-box">
              <p className="instruction-lead"><strong>What to do right now:</strong></p>
              <ul className="action-bullet-list">
                {guide.bulletPoints.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Decision Question & Answers */}
          {current.question ? (
            <div className="triage-question-section">
              <h4 className="triage-title">
                <Icon name="activity" size={20} /> {current.question}
              </h4>
              <div className="triage-answer-buttons">
                {current.answers.map(answer => (
                  <button
                    key={answer.nextStepId + answer.label}
                    type="button"
                    className="triage-btn"
                    onClick={() => setHistory(prev => [...prev, answer.nextStepId])}
                  >
                    <span>{answer.label}</span>
                    <Icon name="arrow" size={18} />
                  </button>
                ))}
              </div>
            </div>
          ) : current.answers.length > 0 ? (
            <div className="single-proceed-action">
              {current.answers.map(answer => (
                <button
                  key={answer.nextStepId + answer.label}
                  type="button"
                  className="primary-button proceed-btn"
                  onClick={() => setHistory(prev => [...prev, answer.nextStepId])}
                >
                  {answer.label} <Icon name="arrow" size={18} />
                </button>
              ))}
            </div>
          ) : (
            <div className="care-handoff-banner">
              <span className="handoff-icon"><Icon name="shield" size={24} /></span>
              <div>
                <strong>Continuous Care Protocol Active</strong>
                <p>Continue following your mission medical checklist and stay connected with the ground flight surgeon. Do not stop resuscitation or monitoring until authorized by the medical officer.</p>
              </div>
            </div>
          )}

          {/* Quick Microgravity Tips Box */}
          <div className="microgravity-tip-box">
            <span className="tip-icon"><Icon name="info" size={18} /></span>
            <div>
              <strong>Key Microgravity Rule:</strong> Remember to use foot straps or wall restraints while performing CPR. In zero gravity, without anchoring yourself, your push force will propel you backwards away from the crewmate.
            </div>
          </div>

          {/* Source Reference & Disclaimer */}
          <div className="emergency-footer-meta">
            <p className="medical-disclaimer">{EMERGENCY_NOTICE}</p>
            <p className="source-note">
              Based on NASA / CSA space resuscitation guidelines ({current.sourceSection}).{' '}
              <a href={current.sourceUrl} target="_blank" rel="noreferrer">
                Medical source ↗
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div className="panel error-notice" role="alert">
          <p>Step information is unavailable. Contact the crew medical officer immediately.</p>
        </div>
      )}

      {/* Emergency Navigation Bar */}
      <div className="emergency-bottom-nav">
        <button
          type="button"
          className="button-link"
          disabled={history.length < 2}
          onClick={() => setHistory(prev => prev.slice(0, -1))}
        >
          ← Previous Step
        </button>
        <button
          type="button"
          className="button-link"
          onClick={() => setHistory([EMERGENCY_START_STEP_ID])}
        >
          Restart Emergency Flow
        </button>
        <button
          type="button"
          className="danger-button exit-btn"
          onClick={onExit}
        >
          Exit Emergency Protocol
        </button>
      </div>
    </section>
  );
}
