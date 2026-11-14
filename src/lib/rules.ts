import type { IndicatorId } from '../types';

export const RULE_NOTICE = 'prototype rule, not a medical threshold';
export const BASELINE_ENTRY_COUNT = 7;
export interface PrototypeRule {
  direction: 'increase' | 'decrease' | 'either';
  amount: number;
  mode: 'absolute' | 'relative';
}
/** All amounts are arbitrary demonstration settings, not sourced clinical limits.
 * Never use these to rule out an emergency or prescribe treatment.
 * Contact means a persistent prototype deviation, not a clinical severity grade.
 */
export const CONTACT_AFTER_CONSECUTIVE_CHANGES = 3;
export const RULES: Record<Exclude<IndicatorId, 'radiation'>, PrototypeRule> = {
  sleepHours: { direction: 'decrease', amount: 1.5, mode: 'absolute' },
  sleepQuality: { direction: 'decrease', amount: 1, mode: 'absolute' },
  fatigue: { direction: 'increase', amount: 1, mode: 'absolute' },
  mood: { direction: 'decrease', amount: 1, mode: 'absolute' },
  stress: { direction: 'increase', amount: 1, mode: 'absolute' },
  teamCohesion: { direction: 'decrease', amount: 1, mode: 'absolute' },
  dizziness: { direction: 'increase', amount: 1, mode: 'absolute' },
  visionSymptoms: { direction: 'increase', amount: 1, mode: 'absolute' },
  hr: { direction: 'either', amount: 0.2, mode: 'relative' },
  systolic: { direction: 'either', amount: 0.15, mode: 'relative' },
  diastolic: { direction: 'either', amount: 0.15, mode: 'relative' },
  spo2: { direction: 'decrease', amount: 3, mode: 'absolute' },
  temperatureC: { direction: 'either', amount: 1, mode: 'absolute' },
  glucoseMgDl: { direction: 'either', amount: 0.2, mode: 'relative' },
  'discomfort.head': { direction: 'increase', amount: 2, mode: 'absolute' },
  'discomfort.chest': { direction: 'increase', amount: 2, mode: 'absolute' },
  'discomfort.upperBack': { direction: 'increase', amount: 2, mode: 'absolute' },
  'discomfort.lowerBack': { direction: 'increase', amount: 2, mode: 'absolute' },
  'discomfort.arms': { direction: 'increase', amount: 2, mode: 'absolute' },
  'discomfort.legs': { direction: 'increase', amount: 2, mode: 'absolute' },
};
