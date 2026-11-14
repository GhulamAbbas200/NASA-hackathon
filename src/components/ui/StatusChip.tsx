import type { Status } from '../../types';

export const STATUS_LABELS = { normal: 'Normal', changed: 'Changed', contact: 'Contact surgeon', unassessed: 'Not assessed' };
export const STATUS_SYMBOLS = { normal: '✓', changed: '△', contact: '!', unassessed: '—' };

export default function StatusChip({ status = 'normal', comparable = false }: { status?: Status; comparable?: boolean }) {
  const state = comparable ? status : 'unassessed';
  return <span className={`status-chip status-${state}`} title={comparable ? 'Prototype baseline flag, not medical clearance' : 'No comparable baseline or no reading'}><span aria-hidden="true">{STATUS_SYMBOLS[state]}</span>{STATUS_LABELS[state]}</span>;
}
