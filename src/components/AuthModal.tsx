import { useEffect, useRef, useState } from 'react';
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
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const controls = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>('button, input, select, a[href]') ?? []).filter(el => !el.hasAttribute('disabled'));
    controls()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return <div className="modal-backdrop" onClick={onClose}>
    <div ref={dialog} className="modal-card panel" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={e => e.stopPropagation()}>
      <AuthPanel key={initialMode} onSuccess={onSuccess} onClose={onClose} initialMode={initialMode} />
    </div>
  </div>;
}

/** The same crew-profile flow is used inline on Home and in workspace dialogs. */
export function AuthPanel({ onClose, onSuccess, initialMode = 'login' }: {
  onClose?: () => void;
  onSuccess: (user: AstronautProfile) => void;
  initialMode?: 'login' | 'signup';
}) {
  const [users, setUsers] = useState<AstronautProfile[]>(getRegisteredAstronauts);
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedUserId, setSelectedUserId] = useState<string>(() => users[0]?.id ?? '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Signup form fields
  const [name, setName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [role, setRole] = useState('Mission Commander');
  const [environment, setEnvironment] = useState<Environment>('iss');
  const [avatar, setAvatar] = useState('orbit');
  const [signupPin, setSignupPin] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let res;
    try { res = loginAstronaut(selectedUserId, pin || undefined); }
    catch { setError('Could not access browser storage. Allow local storage to log in.'); return; }
    if (!res.success || !res.user) {
      setError(res.error || 'Login failed.');
      return;
    }
    onSuccess(res.user);
    onClose?.();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!signupPin.trim()) {
      setError('Please enter a PIN.');
      document.getElementById('reg-pin')?.focus();
      return;
    }
    let newUser: AstronautProfile;
    try {
      newUser = registerAstronaut({
        name: name.trim(),
        callsign: callsign.trim() || 'Crew-Lead',
        role: role || 'Flight Specialist',
        environment,
        avatar,
        pin: signupPin,
      });
    } catch { setError('Could not save your profile. Check browser storage and try again.'); return; }
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
    <div className="auth-panel">
        <div className="modal-header">
          <div className="card-heading">
            <span className="card-icon"><Icon name="user" size={24} /></span>
            <h2 id="auth-title">{mode === 'login' ? 'Welcome aboard.' : 'Join the crew.'}</h2>
          </div>
          {onClose && <button type="button" className="close-btn" onClick={onClose} aria-label="Close modal">✕</button>}
        </div>

        <p className="secondary-text">
          {mode === 'login'
            ? 'Your next check-in starts here.'
            : 'Create a local profile for your mission records.'}
        </p>

        <div className="tab-buttons" aria-label="Profile access">
          <button
            type="button"
            className={mode === 'login' ? 'tab-btn active' : 'tab-btn'}
            aria-pressed={mode === 'login'}
            onClick={() => { setMode('login'); setError(''); setSuccessNotice(''); }}
          >
            <Icon name="user" size={16} /> Log In
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'tab-btn active' : 'tab-btn'}
            aria-pressed={mode === 'signup'}
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
              <h3 style={{ marginTop: 12 }}>First time on board?</h3>
              <p className="secondary-text">
                Create a crew profile on this device to get started.
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
              <label className="field-label" htmlFor="astronaut-select">Crew profile</label>
              <select id="astronaut-select" value={selectedUserId} onChange={e => { setSelectedUserId(e.target.value); setPin(''); setError(''); }}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} · {u.callsign}</option>)}
              </select>

              {users.find(u => u.id === selectedUserId)?.pin && (
                <div className="form-field" style={{ marginTop: 14 }}>
                  <label htmlFor="login-pin">PIN / Passcode</label>
                  <input
                    id="login-pin"
                    type="password"
                    autoComplete="current-password"
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
                <label htmlFor="reg-pin">PIN (Required)</label>
                <input
                  id="reg-pin"
                  type="password"
                  autoComplete="new-password"
                  required
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
      <p className="auth-local-note"><Icon name="info" size={17} /> Profiles and records stay in this browser. They do not sync between devices.</p>
    </div>
  );
}
