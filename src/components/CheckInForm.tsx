import { useId, useRef, useState, type FormEvent } from 'react';
import { REGIONS, type AppContextProps, type Storage } from '../types';
import { dailyFields, vitalFields } from '../data/checkInFields';
import { indicatorById } from '../data/indicators';
import { REGION_LABELS } from '../data/regionMap';
import { environments } from '../data/environments';
import { createDraft, localDate, validateCheckInDraft, type CheckInDraft } from '../lib/checkIn';
import MetricHelp from './ui/MetricHelp';
import Icon from './ui/Icon';

export interface CheckInFormProps extends AppContextProps { storage: Storage; onSaved: () => void }
export default function CheckInForm({ entries, environment, storage, onSaved }: CheckInFormProps) {
  const prefix = useId();
  const [draft, setDraft] = useState<CheckInDraft>(() => createDraft(localDate(), entries.find(entry => entry.date === localDate())));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [storageError, setStorageError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const config = environments[environment];
  const existing = entries.find(entry => entry.date === draft.date);
  const update = (group: 'daily' | 'discomfort' | 'vitals', id: string, value: string) => {
    setDraft(current => ({ ...current, [group]: { ...current[group], [id]: value } }));
    setFeedback('');
  };
  const chooseDate = (date: string) => {
    setDraft(createDraft(date, entries.find(entry => entry.date === date)));
    setErrors({}); setFeedback(''); setStorageError('');
  };
  const submit = (event: FormEvent) => {
    event.preventDefault(); setFeedback(''); setStorageError('');
    const result = validateCheckInDraft(draft);
    setErrors(result.errors);
    if (!result.entry) { requestAnimationFrame(() => errorSummary.current?.focus()); return; }
    try {
      storage.save(result.entry); onSaved();
      setFeedback(`${existing ? 'Updated' : 'Saved'} ${result.entry.simulated ? 'simulated' : 'observed'} check-in for ${result.entry.date}.`);
    } catch (error) { setStorageError(error instanceof Error ? error.message : 'Could not save. Nothing was confirmed saved.'); }
  };
  const reset = () => {
    try { storage.reset(); onSaved(); setDraft(createDraft(localDate())); setErrors({}); setStorageError(''); setConfirmReset(false); setFeedback('ASTRA records cleared in this browser. Your theme preference was kept.'); }
    catch (error) { setStorageError(error instanceof Error ? error.message : 'Could not clear records.'); }
  };
  const error = (id: string) => errors[id] ? <span className="field-error" id={`${prefix}-${id}-error`}>{errors[id]}</span> : null;
  const describedBy = (id: string) => errors[id] ? `${prefix}-${id}-error` : undefined;
  if (config.conceptual) return <section className="panel"><h2>Check-in is configured for ISS</h2><p>{config.equipmentNote}</p><p>Choose International Space Station in the environment selector to record a check-in. Existing history stays available.</p></section>;
  return <section className="panel checkin-form-panel" aria-labelledby="checkin-title">
    <div className="section-heading"><div className="card-heading"><span className="card-icon"><Icon name="checkin" /></span><h2 id="checkin-title">Daily check-in</h2></div><span className="small-text">About 2 minutes</span></div>
    <p className="secondary-text">Record what you noticed. Optional device readings can be left blank.</p>
    <form onSubmit={submit} noValidate>
      {Object.keys(errors).length > 0 && <div className="form-error-summary" ref={errorSummary} tabIndex={-1} role="alert"><strong>Review these fields before saving:</strong><ul>{Object.entries(errors).map(([id, message]) => <li key={id}><button type="button" className="text-button" onClick={() => document.getElementById(`${prefix}-${id}`)?.focus()}>{dailyFields.find(field => field.id === id)?.label ?? vitalFields.find(field => field.id === id)?.label ?? id}: {message}</button></li>)}</ul></div>}
      {storageError && <div className="form-error-summary" role="alert">{storageError}</div>}
      {feedback && <p className="success-notice" role="status">{feedback}</p>}
      <div className="form-meta-grid"><div className="form-field"><label htmlFor={`${prefix}-date`}>Check-in date</label><input id={`${prefix}-date`} name="date" type="date" max={localDate()} value={draft.date} onChange={event => chooseDate(event.target.value)} aria-invalid={!!errors.date} aria-describedby={describedBy('date')} />{error('date')}{existing && <span className="small-text">Editing an existing {existing.simulated ? 'simulated' : 'observed'} record; saving replaces this date.</span>}</div>
        <div className="form-field"><label htmlFor={`${prefix}-provenance`}>Data provenance</label><select id={`${prefix}-provenance`} name="provenance" value={draft.simulated ? 'simulated' : 'observed'} onChange={event => setDraft(current => ({ ...current, simulated: event.target.value === 'simulated' }))}><option value="observed">Actual observation</option><option value="simulated">Simulated demo record</option></select><span className="small-text">Keep demo edits labelled simulated. Only choose actual for measurements you observed.</span></div></div>
      <fieldset className="form-section"><legend>Sleep, mood & symptoms</legend><div className="form-grid">{dailyFields.map(field => <div className="form-field" key={field.id}><label htmlFor={`${prefix}-${field.id}`}>{field.label}</label>
        {field.id === 'sleepHours' ? <input id={`${prefix}-${field.id}`} name={field.id} type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step} value={draft.daily[field.id]} onChange={event => update('daily', field.id, event.target.value)} aria-invalid={!!errors[field.id]} aria-describedby={describedBy(field.id)} />
          : <select id={`${prefix}-${field.id}`} name={field.id} value={draft.daily[field.id]} onChange={event => update('daily', field.id, event.target.value)} aria-invalid={!!errors[field.id]} aria-describedby={describedBy(field.id)}><option value="">Choose a rating</option>{Array.from({ length: field.max - field.min + 1 }, (_, index) => field.min + index).map(value => <option key={value} value={value}>{value}</option>)}</select>}
        <span className="small-text">{field.endpoints}</span>{error(field.id)}<MetricHelp indicator={indicatorById[field.id]} /></div>)}</div></fieldset>
      <details className="form-disclosure" open={Object.keys(errors).some(key => key.startsWith('discomfort.')) || undefined}><summary>Body discomfort · 0–10 by region</summary><p className="secondary-text">All regions start at 0 (none) for a new record. Change any region that feels uncomfortable.</p><div className="form-grid">{REGIONS.map(region => <div className="form-field" key={region}><label htmlFor={`${prefix}-discomfort.${region}`}>{REGION_LABELS[region]} discomfort</label><input id={`${prefix}-discomfort.${region}`} name={`discomfort.${region}`} type="number" inputMode="numeric" min="0" max="10" step="1" value={draft.discomfort[region]} onChange={event => update('discomfort', region, event.target.value)} aria-invalid={!!errors[`discomfort.${region}`]} aria-describedby={describedBy(`discomfort.${region}`)} />{error(`discomfort.${region}`)}<MetricHelp indicator={indicatorById[`discomfort.${region}`]} /></div>)}</div></details>
      <details className="form-disclosure" open={vitalFields.some(field => !!errors[field.id]) || undefined}><summary>Optional device readings · six measurements</summary><p className="secondary-text">{config.equipmentNote} Blank values are omitted, never saved as zero.</p><div className="form-grid">{vitalFields.map(field => <div className="form-field" key={field.id}><label htmlFor={`${prefix}-${field.id}`}>{field.label} <span className="input-unit">({field.unit})</span></label><input id={`${prefix}-${field.id}`} name={field.id} type="number" inputMode="decimal" step={field.step} value={draft.vitals[field.id]} onChange={event => update('vitals', field.id, event.target.value)} aria-invalid={!!errors[field.id]} aria-describedby={describedBy(field.id)} />{error(field.id)}<MetricHelp indicator={indicatorById[field.id]} /></div>)}</div></details>
      <div className="form-actions"><button type="submit" className="primary-button">{existing ? 'Update check-in' : 'Save check-in'} <Icon name="checkin" size={18} /></button><span className="small-text">Saved locally in this browser.</span></div>
    </form>
    <details className="data-controls"><summary>Manage local records</summary><p>Clear all ASTRA check-ins in this browser. This does not restore the simulated demo or change your theme.</p>{confirmReset ? <div className="form-actions"><button type="button" className="danger-button" onClick={reset}>Confirm clear all records</button><button type="button" onClick={() => setConfirmReset(false)}>Cancel</button></div> : <button type="button" onClick={() => setConfirmReset(true)}>Clear all ASTRA records…</button>}</details>
  </section>;
}
