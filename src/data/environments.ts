import type { Environment, EnvironmentConfig } from '../types';
import { indicators } from './indicators';
import { SOURCE_URLS as S } from './sources';

/** Availability means supported entry fields conditional on issued equipment;
 * it is NOT a verified inventory of hardware on the ISS today.
 */
export const environments: Record<Environment, EnvironmentConfig> = {
  iss: {
    id: 'iss', name: 'International Space Station', conceptual: false,
    availableMeasurements: indicators.filter(indicator => indicator.id !== 'radiation').map(indicator => indicator.id),
    equipmentNote: 'Self-reports supported. Optional vitals require an issued, approved device; leave unavailable values blank. Radiation needs separate dosimetry. TODO: verify current device inventory.',
    reminderFrequency: { dailyCheckInHours: 24, note: 'ASTRA demo schedule, not a NASA requirement. Device checks follow the mission plan.' },
    escalationText: 'Contact the crew medical officer and ground flight surgeon through the mission procedure. If communication is interrupted, follow the onboard medical checklist.',
    sourceUrls: [S.acls, S.standardMeasures, S.biosensor],
  },
  spacecraft: {
    id: 'spacecraft', name: 'Deep-space spacecraft · conceptual', conceptual: true,
    availableMeasurements: [], equipmentNote: 'Conceptual only. TODO: verify vehicle equipment and procedures.',
    reminderFrequency: { dailyCheckInHours: null, note: 'TODO: verify mission-specific cadence; no schedule assigned.' },
    escalationText: 'Conceptual: plan for communication delay; use mission-approved onboard procedures. TODO: verify escalation protocol.',
    sourceUrls: [S.hazards],
  },
  moonBase: {
    id: 'moonBase', name: 'Moon base · conceptual', conceptual: true,
    availableMeasurements: [], equipmentNote: 'Conceptual only. TODO: verify base equipment and procedures.',
    reminderFrequency: { dailyCheckInHours: null, note: 'TODO: verify mission-specific cadence; no schedule assigned.' },
    escalationText: 'Conceptual: contact the mission medical team using the base procedure. TODO: verify local and ground response.',
    sourceUrls: [S.hazards],
  },
};
