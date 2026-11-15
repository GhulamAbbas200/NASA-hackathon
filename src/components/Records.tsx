import { useState } from 'react';
import type { CheckIn, Storage } from '../types';
import { REGIONS } from '../types';
import { REGION_LABELS } from '../data/regionMap';
import { orderedEntries } from '../lib/baseline';
import Icon from './ui/Icon';

export interface RecordsProps {
  entries: CheckIn[];
  storage: Storage;
  onRefresh: () => void;
  onStartCheckIn: () => void;
}

export default function Records({ entries, storage, onRefresh, onStartCheckIn }: RecordsProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<CheckIn | null>(null);

  const sorted = orderedEntries(entries).reverse(); // newest first
  const filtered = filterDate ? sorted.filter(e => e.date.includes(filterDate)) : sorted;

  const handleClear = () => {
    storage.reset();
    onRefresh();
    setConfirmClear(false);
    setSelectedEntry(null);
  };

  return (
    <div className="records-page stack">
      <div className="section-heading">
        <div className="card-heading">
          <span className="card-icon"><Icon name="activity" size={24} /></span>
          <div>
            <h2>Mission Health Records</h2>
            <p className="secondary-text">Your historical daily check-ins and device observations.</p>
          </div>
        </div>
        <button type="button" className="primary-button" onClick={onStartCheckIn}>
          <Icon name="checkin" size={18} /> New Check-in
        </button>
      </div>

      <div className="records-controls-bar panel">
        <div className="records-filter-group">
          <label htmlFor="filter-date-input">Filter by Date</label>
          <input
            id="filter-date-input"
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
        {filterDate && (
          <button type="button" className="button-link" onClick={() => setFilterDate('')}>
            Show All
          </button>
        )}
        <div className="records-stats">
          <span>Total Records: <strong>{entries.length}</strong></span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel empty-state" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <Icon name="checkin" size={40} />
          <h3 style={{ marginTop: 14 }}>No check-in records found</h3>
          <p className="secondary-text" style={{ maxWidth: 440, margin: '8px auto 20px' }}>
            {filterDate ? 'No records match the selected date.' : 'You haven’t recorded any health check-ins yet. Take 2 minutes to record your first daily log!'}
          </p>
          <button type="button" className="primary-button" onClick={onStartCheckIn}>
            Start Daily Check-in <Icon name="arrow" size={16} />
          </button>
        </div>
      ) : (
        <div className="records-grid-layout">
          <div className="records-table-card panel">
            <div className="table-scroll">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sleep</th>
                    <th>Mood</th>
                    <th>Fatigue</th>
                    <th>Discomfort</th>
                    <th>Vitals</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(entry => {
                    const discomfortSum = (Object.values(entry.bodyDiscomfort) as number[]).reduce((a, b) => a + b, 0);
                    const vitalsCount = entry.vitals ? Object.values(entry.vitals).filter(v => v !== undefined).length : 0;
                    const isSelected = selectedEntry?.date === entry.date;

                    return (
                      <tr
                        key={entry.date}
                        className={isSelected ? 'selected-row' : ''}
                        onClick={() => setSelectedEntry(entry)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <strong>{entry.date}</strong>
                          {entry.simulated && <span className="record-tag simulated">Simulated</span>}
                        </td>
                        <td>{entry.sleepHours} hrs ({entry.sleepQuality}/5)</td>
                        <td>{entry.mood}/5</td>
                        <td>{entry.fatigue}/5</td>
                        <td>
                          <span className={`discomfort-pill ${discomfortSum > 4 ? 'high' : discomfortSum > 0 ? 'mid' : 'none'}`}>
                            {discomfortSum > 0 ? `Level ${discomfortSum}` : 'None (0)'}
                          </span>
                        </td>
                        <td>{vitalsCount > 0 ? `${vitalsCount} readings` : '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="text-button"
                            onClick={(e) => { e.stopPropagation(); setSelectedEntry(entry); }}
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selectedEntry && (
            <aside className="panel record-detail-card" aria-label="Detailed check-in view">
              <div className="card-top">
                <h3>Check-in: {selectedEntry.date}</h3>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setSelectedEntry(null)}
                  aria-label="Close detail view"
                >
                  ✕
                </button>
              </div>

              <div className="detail-section">
                <h4>Sleep & Mental Wellness</h4>
                <div className="detail-grid">
                  <div><span>Sleep Duration:</span> <strong>{selectedEntry.sleepHours} hrs</strong></div>
                  <div><span>Sleep Restfulness:</span> <strong>{selectedEntry.sleepQuality} / 5</strong></div>
                  <div><span>Fatigue / Alertness:</span> <strong>{selectedEntry.fatigue} / 5</strong></div>
                  <div><span>Daily Mood:</span> <strong>{selectedEntry.mood} / 5</strong></div>
                  <div><span>Stress Level:</span> <strong>{selectedEntry.stress} / 5</strong></div>
                  <div><span>Team Cohesion:</span> <strong>{selectedEntry.teamCohesion} / 5</strong></div>
                  <div><span>Dizziness / Balance:</span> <strong>{selectedEntry.dizziness} / 4</strong></div>
                  <div><span>Vision Symptoms:</span> <strong>{selectedEntry.visionSymptoms} / 4</strong></div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Body Discomfort (0–10)</h4>
                <div className="discomfort-badges">
                  {REGIONS.map(reg => (
                    <span key={reg} className={`region-badge ${selectedEntry.bodyDiscomfort[reg] > 0 ? 'active' : ''}`}>
                      {REGION_LABELS[reg]}: <strong>{selectedEntry.bodyDiscomfort[reg]}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {selectedEntry.vitals && Object.keys(selectedEntry.vitals).length > 0 && (
                <div className="detail-section">
                  <h4>Recorded Vitals</h4>
                  <div className="detail-grid">
                    {selectedEntry.vitals.hr && <div><span>Heart Rate:</span> <strong>{selectedEntry.vitals.hr} bpm</strong></div>}
                    {selectedEntry.vitals.systolic && selectedEntry.vitals.diastolic && (
                      <div><span>Blood Pressure:</span> <strong>{selectedEntry.vitals.systolic}/{selectedEntry.vitals.diastolic} mmHg</strong></div>
                    )}
                    {selectedEntry.vitals.spo2 && <div><span>Blood Oxygen:</span> <strong>{selectedEntry.vitals.spo2}%</strong></div>}
                    {selectedEntry.vitals.temperatureC && <div><span>Body Temp:</span> <strong>{selectedEntry.vitals.temperatureC}°C</strong></div>}
                    {selectedEntry.vitals.glucoseMgDl && <div><span>Blood Glucose:</span> <strong>{selectedEntry.vitals.glucoseMgDl} mg/dL</strong></div>}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      )}

      <div className="records-management panel">
        <h4>Manage Local Records</h4>
        <p className="secondary-text">
          Clear all check-in entries stored in your browser for this astronaut profile.
        </p>
        {confirmClear ? (
          <div className="form-actions">
            <button type="button" className="danger-button" onClick={handleClear}>
              Confirm Delete All Records
            </button>
            <button type="button" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="danger-button" onClick={() => setConfirmClear(true)}>
            Clear All Profile Records
          </button>
        )}
      </div>
    </div>
  );
}
