import { useState } from 'react';
import type { Environment } from '../types';
import {
  getRegisteredAstronauts,
  loginAstronaut,
  registerAstronaut,
  type AstronautProfile,
} from '../lib/auth';
import Icon from './ui/Icon';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AstronautProfile) => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [users, setUsers] = useState<AstronautProfile[]>(getRegisteredAstronauts);
  const [mode, setMode] = useState<'login' | 'signup'>(() => {
    // If no profiles exist, always start on signup
    return users.length === 0 ? 'signup' : initialMode;
  });
  const [selectedUserId, setSelectedUserId] = useState<string>(() => users[0]?.id ?? '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Signup form fields
  const [name, setName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [role, setRole] = useState('Mission Specialist');
  const [environment, setEnvironment] = useState<Environment>('iss');
  const [avatar, setAvatar] = useState('orbit');
  const [signupPin, setSignupPin] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = loginAstronaut(selectedUserId, pin || undefined);
    if (!res.success || !res.user) {
      setError(res.error || 'Login failed.');
      return;
    }
    onSuccess(res.user);
    onClose();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    const newUser = registerAstronaut({
      name: name.trim(),
      callsign: callsign.trim() || 'Crew-Lead',
      role: role || 'Flight Specialist',
      environment,
      avatar,
      pin: signupPin,
    });
    const updatedUsers = getRegisteredAstronauts();
    setUsers(updatedUsers);
    setSelectedUserId(newUser.id);
    setPin('');
    setName('');
    setCallsign('');
    setSignupPin('');
    setSuccessNotice(`Profile created for ${newUser.name}! Please enter your credentials below and log in to continue.`);
    setMode('login');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="card-heading">
            <span className="card-icon"><Icon name="user" size={24} /></span>
            <h2>{mode === 'login' ? 'Astronaut Log In' : 'New Crew Sign-Up'}</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <p className="secondary-text">
          {mode === 'login'
            ? 'Select your crew profile to access your private daily health records.'
            : 'Register your astronaut profile to start tracking your personalized health baselines.'}
        </p>

        <div className="tab-buttons" role="tablist">
          <button
            type="button"
            className={mode === 'login' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => { setMode('login'); setError(''); setSuccessNotice(''); }}
          >
            <Icon name="user" size={16} /> Log In
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => { setMode('signup'); setError(''); setSuccessNotice(''); }}
          >
            <Icon name="sparkles" size={16} /> Sign Up
          </button>
        </div>

        {error && <div className="form-error-summary" role="alert">{error}</div>}

        {mode === 'login' && successNotice && (
          <div className="auth-success-banner" role="status">
            <span className="auth-success-icon"><Icon name="check" size={18} /></span>
            <div className="auth-success-text">
              <strong>Profile Created Successfully</strong>
              <p>{successNotice}</p>
            </div>
          </div>
        )}

        {mode === 'login' ? (
          users.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <Icon name="user" size={36} />
              <h3 style={{ marginTop: 12 }}>No crew profiles registered yet</h3>
              <p className="secondary-text">
                Create your astronaut profile to get started with your personal mission records.
              </p>
              <button
                type="button"
                className="primary-button"
                style={{ marginTop: 16 }}
                onClick={() => setMode('signup')}
              >
                Create Profile Now <Icon name="arrow" size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="auth-form">
              <label className="field-label" htmlFor="astronaut-select">Select Astronaut Profile</label>
              <div className="crew-picker-grid">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    className={`crew-picker-item ${selectedUserId === u.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedUserId(u.id); setPin(''); setError(''); }}
                  >
                    <span className="crew-picker-avatar"><Icon name={(u.avatar as any) || 'orbit'} size={24} /></span>
                    <div className="crew-picker-info">
                      <strong>{u.name}</strong>
                      <span>{u.callsign} · {u.role}</span>
                    </div>
                    {selectedUserId === u.id && <span className="selected-check"><Icon name="check" size={16} /></span>}
                  </button>
                ))}
              </div>

              {users.find(u => u.id === selectedUserId)?.pin && (
                <div className="form-field" style={{ marginTop: 14 }}>
                  <label htmlFor="login-pin">4-Digit PIN / Passcode</label>
                  <input
                    id="login-pin"
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                  />
                </div>
              )}

              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="submit" className="primary-button">
                  Log In to Profile <Icon name="arrow" size={16} />
                </button>
                <button type="button" onClick={() => setMode('signup')}>
                  Create New Profile
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-meta-grid" style={{ marginTop: 0 }}>
              <div className="form-field">
                <label htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="reg-callsign">Callsign / Mission ID</label>
                <input
                  id="reg-callsign"
                  type="text"
                  value={callsign}
                  onChange={e => setCallsign(e.target.value)}
                />
              </div>
            </div>

            <div className="form-meta-grid">
              <div className="form-field">
                <label htmlFor="reg-role">Mission Role</label>
                <select id="reg-role" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="Mission Commander">Mission Commander</option>
                  <option value="Flight Engineer">Flight Engineer</option>
                  <option value="Flight Surgeon & Medical Officer">Flight Surgeon & Medical Officer</option>
                  <option value="Science Specialist">Science Specialist</option>
                  <option value="Payload Specialist">Payload Specialist</option>
                  <option value="Pilot">Pilot</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="reg-env">Operating Environment</label>
                <select id="reg-env" value={environment} onChange={e => setEnvironment(e.target.value as Environment)}>
                  <option value="iss">International Space Station (ISS)</option>
                  <option value="spacecraft">Deep-space Spacecraft (Transit)</option>
                  <option value="moonBase">Lunar Surface Base</option>
                </select>
              </div>
            </div>

            <div className="form-meta-grid">
              <div className="form-field">
                <label htmlFor="reg-avatar">Insignia / Avatar</label>
                <select id="reg-avatar" value={avatar} onChange={e => setAvatar(e.target.value)}>
                  <option value="orbit">Orbit (Expedition)</option>
                  <option value="rocket">Rocket (Spacecraft)</option>
                  <option value="shield">Shield (Medical / Safety)</option>
                  <option value="heart">Heart (Physiology)</option>
                  <option value="user">Astronaut (Standard)</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="reg-pin">4-Digit PIN (Optional)</label>
                <input
                  id="reg-pin"
                  type="password"
                  maxLength={6}
                  value={signupPin}
                  onChange={e => setSignupPin(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: 22 }}>
              <button type="submit" className="primary-button">
                Create Astronaut Profile <Icon name="sparkles" size={16} />
              </button>
              {users.length > 0 && (
                <button type="button" onClick={() => setMode('login')}>
                  Back to Log In
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
