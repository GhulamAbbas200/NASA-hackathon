/** Shared contract. Coordinate changes in docs/BUILD_LOG.md before editing. */
export const REGIONS = ['head', 'chest', 'upperBack', 'lowerBack', 'arms', 'legs'] as const;
export type Region = typeof REGIONS[number];
export type Status = 'normal' | 'changed' | 'contact';
export type Environment = 'iss' | 'spacecraft' | 'moonBase';
export type Rating5 = 1 | 2 | 3 | 4 | 5;
export type Symptom4 = 0 | 1 | 2 | 3 | 4;
export type Discomfort10 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export interface Vitals {
  hr?: number;
  systolic?: number;
  diastolic?: number;
  spo2?: number;
  temperatureC?: number;
  glucoseMgDl?: number;
}
export interface CheckIn {
  /** YYYY-MM-DD; one entry per crew-local calendar day. */
  date: string;
  sleepHours: number;
  sleepQuality: Rating5;
  fatigue: Rating5;
  mood: Rating5;
  stress: Rating5;
  teamCohesion: Rating5;
  dizziness: Symptom4;
  visionSymptoms: Symptom4;
  bodyDiscomfort: Record<Region, Discomfort10>;
  vitals?: Vitals;
  /** Required provenance: seeded records true, a crew-entered record false. */
  simulated: boolean;
}
export type DailyMetric = 'sleepHours' | 'sleepQuality' | 'fatigue' | 'mood' |
  'stress' | 'teamCohesion' | 'dizziness' | 'visionSymptoms';
export type IndicatorId = DailyMetric | keyof Vitals | `discomfort.${Region}` | 'radiation';
export type Verification = 'verified' | 'partial' | 'unverified';
export interface Indicator {
  id: IndicatorId;
  name: string;
  hazard: string;
  measurement: string;
  unit: string;
  selfAssessable: boolean;
  sourceUrl: string;
  additionalSourceUrls?: string[];
  /** Ordered list: render with <ol>. Scale instructions are ASTRA UI conventions. */
  howToMeasure: string[];
  whyItMatters: string;
  whenAbnormal: string;
  nextAction: string;
  regions: Region[];
  verification: Verification;
  verificationNote: string;
}
export interface IndicatorFlag {
  indicatorId: IndicatorId;
  status: Status;
  latest?: number;
  baseline?: number;
  sampleCount: number;
  comparable: boolean;
  explanation: string;
}
export interface EmergencyAnswer { label: string; nextStepId: string }
export interface EmergencyStep {
  id: string;
  title: string;
  instruction: string;
  question?: string;
  answers: EmergencyAnswer[];
  sourceUrl: string;
  sourceSection: string;
  verification: Verification;
  verificationNote?: string;
}
export interface EnvironmentConfig {
  id: Environment;
  name: string;
  conceptual: boolean;
  availableMeasurements: IndicatorId[];
  equipmentNote: string;
  reminderFrequency: { dailyCheckInHours: number | null; note: string };
  escalationText: string;
  sourceUrls: string[];
}
export interface Reminder {
  indicatorId: IndicatorId;
  intervalHours: number | null;
  timing: 'daily-check-in' | 'mission-plan' | 'equipment-only';
  label: string;
  note: string;
}
export interface Storage {
  load(): CheckIn[];
  /** Upsert by date; failures throw. Only update React state after success. */
  save(entry: CheckIn): void;
  /** Clear ASTRA records; never clears other applications' keys or re-seeds. */
  reset(): void;
}
export interface AppContextProps {
  entries: CheckIn[];
  environment: Environment;
}
