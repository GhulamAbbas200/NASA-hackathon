import type { EmergencyStep } from '../types';
import { SOURCE_URLS as S } from './sources';

export const EMERGENCY_NOTICE = 'Decision support only; follow your mission medical checklist and contact the ground flight surgeon.';
export const EMERGENCY_START_STEP_ID = 'call-help';
export const EMERGENCY_REVIEW_NOTE = 'Research-backed prototype, not an approved emergency checklist. TODO: verify current mission procedures and triage branches with the mission medical team.';

/** Every step cites a section 14b source. No compression rates, drug doses or
 * invented chest-pain treatments. The verified guideline is from 2020.
 * Responsiveness/breathing branch mechanics remain explicit verification gaps.
 */
export const emergencySteps: EmergencyStep[] = [
  { id: 'call-help', title: 'Chest pain or collapse: call for help',
    instruction: 'Call the crew medical officer and activate the mission medical checklist. Contact ground using the mission communication procedure.',
    answers: [{ label: 'Open the assessment checklist', nextStepId: 'responsive' }],
    sourceUrl: S.acls, sourceSection: 'History and Background: trained CMOs and autonomous medical protocols', verification: 'partial',
    verificationNote: 'NASA historical capability context, not a current activation script. TODO: verify current call procedure.' },
  { id: 'responsive', title: 'Responsiveness assessment',
    instruction: 'Use the responsiveness assessment in your mission checklist. TODO: verify the exact assessment method; it is not provided by these source excerpts.',
    question: 'What does the mission assessment show?',
    answers: [{ label: 'Responsive', nextStepId: 'medical-care' }, { label: 'Unresponsive or unsure', nextStepId: 'breathing' }],
    sourceUrl: S.cpr, sourceSection: 'Recommendation 1: early recognition and call for help', verification: 'unverified',
    verificationNote: 'TODO: verify responsiveness question and branch against the current mission checklist.' },
  { id: 'breathing', title: 'Breathing and cardiac-arrest assessment',
    instruction: 'Use the breathing and cardiac-arrest assessment in your mission checklist. TODO: verify the exact assessment and decision rule with the crew medical officer.',
    question: 'Which action does the mission checklist direct?',
    answers: [{ label: 'Checklist directs CPR', nextStepId: 'cpr' }, { label: 'Checklist directs other care', nextStepId: 'medical-care' },
      { label: 'Unsure — use crew medical officer/checklist', nextStepId: 'medical-care' }],
    sourceUrl: S.cpr, sourceSection: 'Recommendation 1 and recommendation 14: recognition and CPR for apparent arrest', verification: 'unverified',
    verificationNote: 'TODO: verify breathing triage. The source does not supply a layperson breathing-test algorithm; ASTRA does not infer arrest from a click.' },
  { id: 'cpr', title: 'Follow trained microgravity CPR procedure',
    instruction: 'For apparent cardiac arrest, begin CPR using your mission training and checklist. The guideline recommends immediate basic life support and continuing CPR even if a defibrillator is unavailable.',
    answers: [{ label: 'Continue mission CPR procedure and AED guidance', nextStepId: 'aed' }],
    sourceUrl: S.cpr, sourceSection: 'Recommendations 1–4 and 14', verification: 'partial',
    verificationNote: 'TODO: verify mission-specific technique and current resuscitation guidance; this screen is not CPR training.' },
  { id: 'aed', title: 'Use the mission AED procedure',
    instruction: 'The guideline calls for defibrillation only with the patient restrained on an electrically isolated safe surface. Follow the mission AED’s visual and voice instructions and your training.',
    answers: [{ label: 'Continue checklist care', nextStepId: 'medical-care' }],
    sourceUrl: S.cpr, sourceSection: 'Recommendations 10–13: restraint, AED instructions and training', verification: 'partial',
    verificationNote: 'TODO: verify issued AED and restraint checklist. Continue CPR/checklist care; do not wait for this interface.' },
  { id: 'medical-care', title: 'Continue mission medical care',
    instruction: 'Continue with the crew medical officer and mission checklist; keep ground informed. The guideline does not supply detailed post-resuscitation care recommendations.',
    answers: [], sourceUrl: S.cpr, sourceSection: 'Conclusion and limitations: post-resuscitation care evidence gap', verification: 'partial',
    verificationNote: 'TODO: verify responsive chest-pain management, unsure-assessment handling and post-event care. This is a checklist handoff, not an all-clear or a reason to stop resuscitation.' },
];
export const emergencyStepById: Record<string, EmergencyStep> = Object.fromEntries(emergencySteps.map(step => [step.id, step]));
