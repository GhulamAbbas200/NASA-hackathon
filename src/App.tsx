import { useEffect, useMemo, useRef, useState } from 'react';
import type { Environment, Region } from './types';
import { indicators } from './data/indicators';
import { SOURCES } from './data/sources';
import { environments } from './data/environments';
import { emergencySteps, EMERGENCY_NOTICE } from './data/emergency';
import { DEMO_DATA_LABEL } from './data/seed';
import { assessCheckIns, orderedEntries } from './lib/baseline';
import { RULE_NOTICE } from './lib/rules';
import { storage } from './lib/storage';
import CheckInForm from './components/CheckInForm';
import Dashboard from './components/Dashboard';
import BodyMap from './components/BodyMap';
import RegionPanel from './components/RegionPanel';
import EmergencyMode from './components/EmergencyMode';
import About from './pages/About';
import AnatomyPreview from './components/layout/AnatomyPreview';
import Icon, { type IconName } from './components/ui/Icon';
import ThemeToggle from './components/ui/ThemeToggle';
import MeasurementReminders from './components/MeasurementReminders';

const navigation = [
  { id: 'dashboard', label: 'Overview', icon: 'activity', title: 'Crew health overview', subtitle: 'Your daily observations, connected to the bigger picture.' },
  { id: 'check-in', label: 'Check-in', icon: 'checkin', title: 'A moment to check in', subtitle: 'Make space for how you feel today.' },
  { id: 'body-map', label: 'Body map', icon: 'body', title: 'Health, from a different perspective', subtitle: 'A workspace for exploring observations by body region.' },
  { id: 'emergency', label: 'Emergency', icon: 'alert', title: 'Emergency support', subtitle: 'Follow your mission medical checklist and contact the crew medical officer.' },
  { id: 'about', label: 'About', icon: 'info', title: 'Built on research. Clear about its limits.', subtitle: 'Understand the sources and scope behind ASTRA.' },
] as const satisfies readonly { id: string; label: string; icon: IconName; title: string; subtitle: string }[];
type Page = typeof navigation[number]['id'];
const pageFromHash = (): Page => navigation.find(page => '#' + page.id === window.location.hash)?.id ?? 'dashboard';
const loadRecords = () => {
  try { return { entries: storage.load(), error: '' }; }
  catch (error) { return { entries: [], error: error instanceof Error ? error.message : 'Could not load records.' }; }
};

/** Integrated local app; all feature parts authorized by Abbas. */
export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [records, setRecords] = useState(loadRecords);
  const [region, setRegion] = useState<Region>('head');
  const heading = useRef<HTMLHeadingElement>(null);
  const previousPage = useRef(page);
  const [environment, setEnvironment] = useState<Environment>('iss');
  const config = environments[environment];
  const active = navigation.find(item => item.id === page)!;
  const flags = useMemo(() => assessCheckIns(records.entries), [records.entries]);
  const latest = orderedEntries(records.entries).at(-1);
  const hasSimulated = records.entries.some(entry => entry.simulated);
  const refresh = () => setRecords(loadRecords());
  const openEmergency = () => { window.location.hash = 'emergency'; };
  useEffect(() => {
    const changePage = () => { if (window.location.hash !== '#main') setPage(pageFromHash()); };
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
  }, []);
  const context = { entries: records.entries, environment };
  const bodyProps = { ...context, flags, selectedRegion: region, onSelectRegion: setRegion, onEmergency: openEmergency };
  const regionProps = { ...context, region, flags, onEmergency: openEmergency };

  const crewContext = <section className="panel crew-card" aria-labelledby="crew-context-title">
    <div className="crew-card-identity"><span className="crew-avatar"><Icon name="orbit" size={31} /></span><div><h2 id="crew-context-title">{hasSimulated ? 'Demo crew member' : 'Crew workspace'}</h2><p>{hasSimulated ? 'Simulated profile' : 'Local observations'}</p></div></div>
    <div className="crew-context-line"><span>Environment</span><strong>{environment === 'iss' ? 'ISS' : environment === 'spacecraft' ? 'Spacecraft' : 'Moon base'}</strong></div>
    <div className="crew-context-line"><span>Check-ins available</span><strong>{records.error ? 'Unavailable' : records.entries.length}</strong></div>
    <div className="crew-context-line"><span>Latest entry</span><strong>{latest?.date ?? 'No entries'}</strong></div>
    <div className="crew-card-bottom"><span className="small-orbit" aria-hidden="true" />{hasSimulated ? 'Simulated data workspace' : 'Stored in this browser'}</div>
  </section>;
  const researchNote = <section className="research-note" aria-labelledby="research-note-title">
    <span className="research-note-icon"><Icon name="shield" size={22} /></span><h2 id="research-note-title">A little context matters.</h2><p>Health guidance should be traceable to its source. Keep the research and its limits close by.</p><a href="#about">Sources & project scope <Icon name="arrow" size={16} /></a>
  </section>;

  return <div className="app-shell">
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="topbar">
      <a className="brand" href="#dashboard" aria-label="ASTRA overview"><span className="brand-mark"><Icon name="orbit" size={29} /></span><span>astra<span className="brand-period">.</span></span></a>
      <nav aria-label="Main navigation">{navigation.map(item => <a key={item.id} href={'#' + item.id} aria-current={page === item.id ? 'page' : undefined} onFocus={event => event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}><Icon name={item.icon} size={16} /><span>{item.label}</span></a>)}</nav>
      <div className="header-actions"><ThemeToggle /><a href="#emergency" className="emergency-button" aria-label="Emergency"><Icon name="alert" size={19} /><span className="emergency-label">Emergency</span></a></div>
    </header>
    <main id="main" tabIndex={-1} className="main-content">
      <div className="breadcrumb"><span>Crew health</span><span aria-hidden="true">/</span><span>{active.label}</span><label className="environment-control"><span>Environment</span><select aria-label="Environment" value={environment} onChange={event => setEnvironment(event.target.value as Environment)}><option value="iss">ISS</option><option value="spacecraft">Spacecraft · conceptual</option><option value="moonBase">Moon base · conceptual</option></select></label></div>
      <div className="page-heading"><div><h1 ref={heading} tabIndex={-1}>{active.title}</h1><p>{active.subtitle}</p></div><span className="foundation-badge">Local prototype</span></div>
      {config.conceptual && <div className="conceptual-notice" role="status"><strong>Conceptual environment.</strong> {config.equipmentNote} Historical check-ins remain visible; no new measurement schedule is assumed.<p>{config.escalationText}</p></div>}
      {records.error ? <div className="notice error-notice" role="alert"><Icon name="alert" /><div><strong>Storage unavailable</strong><p>{records.error}</p></div><button type="button" onClick={refresh}>Retry loading</button></div>
        : <div className="notice" role="status"><Icon name="info" size={17} /><span>{hasSimulated ? DEMO_DATA_LABEL : 'No simulated records loaded'}</span><span className="notice-count">{records.entries.length} check-ins</span></div>}
      {page === 'dashboard' && <div className="overview-grid">
        <aside className="context-column" aria-label="Crew context and reminders">{crewContext}<MeasurementReminders {...context} />{researchNote}</aside>
        <div className="anatomy-column"><BodyMap {...bodyProps} /></div>
        <aside className="insights-column" aria-label="Selected region insights"><RegionPanel {...regionProps} /></aside>
        <div className="overview-analysis"><div className="analysis-heading"><span className="stage-eyebrow">YOUR RECORDED OBSERVATIONS</span><h2>Trends & guidance</h2><p>Explore all indicators and their changes from your own baseline.</p></div><Dashboard {...context} flags={flags} onEmergency={openEmergency} /></div>
      </div>}
      {page === 'body-map' && <div className="overview-grid"><aside className="context-column" aria-label="Crew context">{crewContext}{researchNote}</aside><div className="anatomy-column"><BodyMap {...bodyProps} /></div><aside className="insights-column" aria-label="Region insights"><RegionPanel {...regionProps} /></aside></div>}
      {page === 'check-in' && <div className="checkin-layout"><CheckInForm {...context} storage={storage} onSaved={refresh} /><aside className="stack" aria-label="Reminders and anatomy illustration"><MeasurementReminders {...context} /><AnatomyPreview compact /></aside></div>}
      {page === 'emergency' && <div className="focused-page"><EmergencyMode environment={environment} steps={emergencySteps} onExit={() => { window.location.hash = 'dashboard'; }} /></div>}
      {page === 'about' && <About indicators={indicators} sources={SOURCES} />}
    </main>
    <footer><span className="footer-symbol"><Icon name="shield" size={17} /></span><div><p>{EMERGENCY_NOTICE}</p><p>All baseline flags: {RULE_NOTICE}.</p></div><span className="footer-brand">ASTRA <span>/</span> CREW HEALTH</span></footer>
  </div>;
}
