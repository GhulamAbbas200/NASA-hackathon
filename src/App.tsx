import { useEffect, useMemo, useRef, useState } from 'react';
import type { Environment, Region } from './types';
import { indicators } from './data/indicators';
import { SOURCES } from './data/sources';
import { environments } from './data/environments';
import { emergencySteps, EMERGENCY_NOTICE } from './data/emergency';
import { assessCheckIns, orderedEntries } from './lib/baseline';
import { RULE_NOTICE } from './lib/rules';
import { createUserStorage } from './lib/storage';
import { getActiveAstronaut, logoutAstronaut, type AstronautProfile } from './lib/auth';
import Home from './components/Home';
import AuthModal from './components/AuthModal';
import CheckInForm from './components/CheckInForm';
import Dashboard from './components/Dashboard';
import BodyMap from './components/BodyMap';
import RegionPanel from './components/RegionPanel';
import Records from './components/Records';
import EmergencyMode from './components/EmergencyMode';
import About from './pages/About';
import AnatomyPreview from './components/layout/AnatomyPreview';
import Icon from './components/ui/Icon';
import ThemeToggle from './components/ui/ThemeToggle';
import MeasurementReminders from './components/MeasurementReminders';

type Page = 'home' | 'dashboard' | 'check-in' | 'body-map' | 'records' | 'emergency' | 'about';

const VALID_PAGES: Page[] = ['home', 'dashboard', 'check-in', 'body-map', 'records', 'emergency', 'about'];

const pageFromHash = (): Page => {
  const hash = window.location.hash.replace('#', '') as Page;
  return VALID_PAGES.includes(hash) ? hash : 'home';
};

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [currentUser, setCurrentUser] = useState<AstronautProfile | null>(getActiveAstronaut);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'signup'; message?: string }>({
    open: false,
    mode: 'login',
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [environment, setEnvironment] = useState<Environment>(() => currentUser?.environment ?? 'iss');

  const currentStorage = useMemo(() => createUserStorage(currentUser?.id), [currentUser?.id]);

  const loadRecords = (store = currentStorage) => {
    try {
      return { entries: store.load(), error: '' };
    } catch (error) {
      return { entries: [], error: error instanceof Error ? error.message : 'Could not load records.' };
    }
  };

  const [records, setRecords] = useState(() => loadRecords(currentStorage));
  const [region, setRegion] = useState<Region>('head');
  const heading = useRef<HTMLHeadingElement>(null);
  const previousPage = useRef(page);

  const config = environments[environment];
  const flags = useMemo(() => assessCheckIns(records.entries), [records.entries]);
  const latest = orderedEntries(records.entries).at(-1);
  const hasSimulated = records.entries.some(entry => entry.simulated);

  const refresh = () => setRecords(loadRecords(currentStorage));
  const openEmergency = () => { window.location.hash = 'emergency'; };

  useEffect(() => {
    setRecords(loadRecords(currentStorage));
    if (currentUser?.environment) {
      setEnvironment(currentUser.environment);
    }
  }, [currentStorage, currentUser]);

  useEffect(() => {
    const changePage = () => {
      if (window.location.hash !== '#main') {
        setPage(pageFromHash());
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('hashchange', changePage);
    return () => window.removeEventListener('hashchange', changePage);
  }, []);

  useEffect(() => {
    if (previousPage.current !== page) heading.current?.focus();
    previousPage.current = page;
  }, [page]);

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [currentStorage]);

  const handleLogout = () => {
    logoutAstronaut();
    setCurrentUser(null);
    setMobileSidebarOpen(false);
    window.location.hash = 'home';
  };

  const handleAuthSuccess = (user: AstronautProfile) => {
    setCurrentUser(user);
    if (user.environment) setEnvironment(user.environment);
    // When member logs in, redirect directly to dashboard
    window.location.hash = 'dashboard';
    setPage('dashboard');
  };

  const handleStartCheckIn = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (currentUser) {
      window.location.hash = 'check-in';
    } else {
      setAuthModal({
        open: true,
        mode: 'login',
        message: 'Please log in or sign up first to access your daily check-in.',
      });
    }
  };

  const context = { entries: records.entries, environment };
  const bodyProps = { ...context, flags, selectedRegion: region, onSelectRegion: setRegion, onEmergency: openEmergency };
  const regionProps = { ...context, region, flags, onEmergency: openEmergency };

  const isPublicPage = page === 'home' || page === 'about';
  const showLoginGate = !currentUser && !isPublicPage;

  const crewContext = (
    <section className="panel crew-card" aria-labelledby="crew-context-title">
      <div className="crew-card-identity">
        <span className="crew-avatar">
          <Icon name={(currentUser?.avatar as any) || 'orbit'} size={31} />
        </span>
        <div>
          <h2 id="crew-context-title">{currentUser?.name ?? 'Crew workspace'}</h2>
          <p>{currentUser ? `${currentUser.callsign} · ${currentUser.role}` : (hasSimulated ? 'Simulated profile' : 'Local observations')}</p>
        </div>
      </div>
      <div className="crew-context-line">
        <span>Environment</span>
        <strong>{environment === 'iss' ? 'ISS' : environment === 'spacecraft' ? 'Spacecraft' : 'Moon base'}</strong>
      </div>
      <div className="crew-context-line">
        <span>Check-ins available</span>
        <strong>{records.error ? 'Unavailable' : records.entries.length}</strong>
      </div>
      <div className="crew-context-line">
        <span>Latest entry</span>
        <strong>{latest?.date ?? 'No entries'}</strong>
      </div>
      <div className="crew-card-bottom">
        <span className="small-orbit" aria-hidden="true" />
        {hasSimulated ? 'Simulated data workspace' : 'Stored in this browser'}
      </div>
    </section>
  );

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">Skip to content</a>

      {/* Top Navigation Bar: Only Home, About, Start Check-in, and Login/Profile */}
      <header className="topbar">
        <div className="brand-group">
          {currentUser && (
            <button
              type="button"
              className="mobile-menu-trigger"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle Workspace Menu"
            >
              <Icon name="orbit" size={20} />
              <span>Menu</span>
            </button>
          )}
          <a className="brand" href="#home" aria-label="ASTRA home">
            <span className="brand-mark"><Icon name="orbit" size={29} /></span>
            <span>astra<span className="brand-period">.</span></span>
          </a>
        </div>

        <nav className="nav-center" aria-label="Main navigation">
          <a
            href="#home"
            aria-current={page === 'home' ? 'page' : undefined}
          >
            <Icon name="orbit" size={16} />
            <span>Home</span>
          </a>

          <a
            href="#about"
            aria-current={page === 'about' ? 'page' : undefined}
          >
            <Icon name="info" size={16} />
            <span>About</span>
          </a>

          <button
            type="button"
            onClick={handleStartCheckIn}
            aria-current={page === 'check-in' ? 'page' : undefined}
          >
            <Icon name="checkin" size={16} />
            <span>Start Check-in</span>
          </button>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          {currentUser ? (
            <div className="crew-header-pill">
              <span className="crew-profile-trigger">
                <span className="crew-profile-avatar">
                  <Icon name={(currentUser.avatar as any) || 'user'} size={18} />
                </span>
                <span className="crew-profile-name">{currentUser.name}</span>
              </span>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={handleLogout}
                title="Log out astronaut"
                aria-label="Log out"
              >
                <Icon name="logout" size={16} />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="primary-button nav-login-btn"
              onClick={() => setAuthModal({ open: true, mode: 'login' })}
            >
              <Icon name="user" size={17} />
              <span>Log In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main" tabIndex={-1} className="main-content">
        {/* If member is NOT logged in and trying to access protected features */}
        {showLoginGate ? (
          <div className="panel login-required-panel" style={{ textAlign: 'center', padding: '56px 20px', maxWidth: 600, margin: '40px auto' }}>
            <Icon name="lock" size={48} />
            <h2 style={{ marginTop: 16 }}>Crew Member Log In Required</h2>
            <p className="secondary-text" style={{ margin: '12px auto 28px', lineHeight: 1.7 }}>
              Check-in evaluations, health trends, the body map, and mission records are private to each astronaut. Please log in or sign up with your crew profile to access this section.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="primary-button"
                onClick={() => setAuthModal({ open: true, mode: 'login' })}
              >
                <Icon name="user" size={18} /> Crew Log In
              </button>
              <button
                type="button"
                className="button-link"
                onClick={() => setAuthModal({ open: true, mode: 'signup' })}
              >
                <Icon name="sparkles" size={18} /> Sign Up New Profile
              </button>
            </div>
          </div>
        ) : currentUser && page !== 'home' && page !== 'about' ? (
          /* Logged-In Astronaut Workspace with Sidebar Navigation */
          <div className="workspace-shell">
            {/* Mobile Backdrop */}
            {mobileSidebarOpen && (
              <div
                className="mobile-sidebar-backdrop"
                onClick={() => setMobileSidebarOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Astronaut Sidebar */}
            <aside className={`workspace-sidebar ${mobileSidebarOpen ? 'open' : ''}`} aria-label="Astronaut workspace menu">
              <div className="sidebar-crew-card">
                <div className="crew-card-identity">
                  <span className="crew-avatar">
                    <Icon name={(currentUser.avatar as any) || 'orbit'} size={32} />
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{currentUser.name}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {currentUser.callsign} · {currentUser.role}
                    </p>
                  </div>
                </div>

                <div className="sidebar-env-badge">
                  <label htmlFor="sidebar-env">Environment:</label>
                  <select
                    id="sidebar-env"
                    value={environment}
                    onChange={e => setEnvironment(e.target.value as Environment)}
                  >
                    <option value="iss">ISS (Standard)</option>
                    <option value="spacecraft">Spacecraft · conceptual</option>
                    <option value="moonBase">Moon Base · conceptual</option>
                  </select>
                </div>
              </div>

              {/* Sidebar Links: Each function navigated only through sidebar */}
              <nav className="sidebar-nav" aria-label="Crew workspace navigation">
                <a
                  href="#dashboard"
                  aria-current={page === 'dashboard' ? 'page' : undefined}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <Icon name="activity" size={18} />
                  <span>Dashboard</span>
                </a>

                <a
                  href="#check-in"
                  aria-current={page === 'check-in' ? 'page' : undefined}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <Icon name="checkin" size={18} />
                  <span>Daily Check-in</span>
                </a>

                <a
                  href="#body-map"
                  aria-current={page === 'body-map' ? 'page' : undefined}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <Icon name="body" size={18} />
                  <span>Body Map</span>
                </a>

                <a
                  href="#records"
                  aria-current={page === 'records' ? 'page' : undefined}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <Icon name="trend" size={18} />
                  <span>Records</span>
                </a>

                <a
                  href="#emergency"
                  className="sidebar-emergency-link"
                  aria-current={page === 'emergency' ? 'page' : undefined}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <Icon name="alert" size={18} />
                  <span>Emergency</span>
                </a>
              </nav>

              <div className="sidebar-footer">
                <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
                  <Icon name="logout" size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </aside>

            {/* Main Feature View */}
            <div className="workspace-main">
              {config.conceptual && (
                <div className="conceptual-notice" role="status">
                  <strong>Conceptual environment.</strong> {config.equipmentNote} Historical check-ins remain visible; no new measurement schedule is assumed.
                  <p>{config.escalationText}</p>
                </div>
              )}

              {/* Dedicated Dashboard Page (Preserving team member's Dashboard UI) */}
              {page === 'dashboard' && (
                <div className="dashboard-page-layout">
                  <div className="dashboard-header-bar">
                    {crewContext}
                    <MeasurementReminders {...context} />
                  </div>
                  <Dashboard {...context} flags={flags} onEmergency={openEmergency} />
                </div>
              )}

              {/* Dedicated Body Map Page */}
              {page === 'body-map' && (
                <div className="overview-grid">
                  <div className="anatomy-column" style={{ gridColumn: 'span 2' }}>
                    <BodyMap {...bodyProps} />
                  </div>
                  <aside className="insights-column" aria-label="Region insights">
                    <RegionPanel {...regionProps} />
                  </aside>
                </div>
              )}

              {/* Dedicated Check-In Page */}
              {page === 'check-in' && (
                <div className="checkin-layout">
                  <CheckInForm {...context} storage={currentStorage} onSaved={refresh} />
                  <aside className="stack" aria-label="Reminders and anatomy illustration">
                    <MeasurementReminders {...context} />
                    <AnatomyPreview compact />
                  </aside>
                </div>
              )}

              {/* Dedicated Records History Page */}
              {page === 'records' && (
                <Records
                  entries={records.entries}
                  storage={currentStorage}
                  onRefresh={refresh}
                  onStartCheckIn={() => { window.location.hash = 'check-in'; }}
                />
              )}

              {/* Overhauled Step-by-Step Emergency Page */}
              {page === 'emergency' && (
                <EmergencyMode
                  environment={environment}
                  steps={emergencySteps}
                  onExit={() => { window.location.hash = 'dashboard'; }}
                />
              )}
            </div>
          </div>
        ) : (
          /* Public / Standalone Views: Home and About */
          <div className="public-content-container">
            {page === 'home' && (
              <Home
                currentUser={currentUser}
                entries={records.entries}
                environment={environment}
                onStartCheckIn={handleStartCheckIn}
                onOpenAuth={mode => setAuthModal({ open: true, mode: mode || 'login' })}
              />
            )}

            {page === 'about' && <About indicators={indicators} sources={SOURCES} />}
          </div>
        )}
      </main>

      {/* Comprehensive Spaceflight Footer */}
      <footer className="app-footer">
        <div className="footer-top-grid">
          {/* Column 1: ASTRA Identity & Offline Status */}
          <div className="footer-col footer-brand-section">
            <div className="footer-brand-title">
              <span className="brand-orbit"><Icon name="orbit" size={24} /></span>
              <span>ASTRA <span style={{ fontWeight: 400, opacity: 0.8 }}>CREW HEALTH</span></span>
            </div>
            <p className="footer-tagline">
              Autonomous Spaceflight Triage &amp; Readiness Assessment. Operational clinical decision
              support and physiological monitoring engineered for microgravity and deep-space expeditions.
            </p>
            <div className="footer-badge-offline">
              <span className="pulse-dot" aria-hidden="true" />
              <span>Offline-First Engine · 100% Local Privacy</span>
            </div>
          </div>

          {/* Column 2: System Navigation Links */}
          <div className="footer-col">
            <h4><Icon name="sparkles" size={16} /> Navigation</h4>
            <ul className="footer-nav-list">
              <li><a href="#home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home Overview</a></li>
              <li><a href="#about" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Clinical Evidence &amp; Sources</a></li>
              {currentUser ? (
                <>
                  <li><a href="#dashboard" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Health Dashboard</a></li>
                  <li><a href="#check-in" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Daily Health Check-In</a></li>
                  <li><a href="#body-map" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Interactive Body Map</a></li>
                  <li><a href="#records" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Mission Records History</a></li>
                  <li><a href="#emergency" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Emergency Protocols</a></li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => setAuthModal({ open: true, mode: 'login' })}
                    >
                      Astronaut Log In
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setAuthModal({ open: true, mode: 'signup' })}
                    >
                      New Crew Sign-Up
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Spaceflight Operating Environments */}
          <div className="footer-col">
            <h4><Icon name="rocket" size={16} /> Flight Environments</h4>
            <div className="footer-env-list">
              <div className="footer-env-item">
                <strong>International Space Station</strong>
                <span>Low Earth Orbit (LEO) · Microgravity</span>
              </div>
              <div className="footer-env-item">
                <strong>Deep-Space Spacecraft</strong>
                <span>Transit Vehicle · Radiation Monitoring</span>
              </div>
              <div className="footer-env-item">
                <strong>Lunar Surface Habitat</strong>
                <span>Partial Gravity (0.166g) · Artemis Standards</span>
              </div>
              <div className="footer-env-item" style={{ marginTop: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Verified against NASA Human Research Program (HRP) &amp; CSA Flight Medicine standards.
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Clinical Decision Support & Safety Notices */}
          <div className="footer-col">
            <h4><Icon name="shield" size={16} /> Clinical Directives</h4>
            <div className="footer-disclaimer-card">
              <div className="footer-emergency-alert">
                <Icon name="shield" size={16} />
                <span>Emergency Directive</span>
              </div>
              <p>{EMERGENCY_NOTICE}</p>
              <div style={{ height: 1, background: 'var(--border-color)', margin: '10px 0' }} />
              <p><strong>Baseline Assessment Rule:</strong> All telemetry flags are derived from {RULE_NOTICE}.</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            <span>NASA Space Apps Challenge 2026 · Autonomous Medical Systems</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span>Zero Remote Telemetry · 100% Client-Side Storage</span>
            <button
              type="button"
              className="footer-back-to-top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
            >
              ↑ Top
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal for Sign Up & Log In */}
      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal(prev => ({ ...prev, open: false }))}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
