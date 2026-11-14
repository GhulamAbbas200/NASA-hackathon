import { useEffect, useMemo, useRef, useState } from 'react';
import type { Region } from './types';
import { indicators } from './data/indicators';
import { SOURCES } from './data/sources';
import { environments } from './data/environments';
import { emergencySteps, EMERGENCY_NOTICE } from './data/emergency';
import { DEMO_DATA_LABEL } from './data/seed';
import { assessCheckIns } from './lib/baseline';
import { RULE_NOTICE } from './lib/rules';
import { storage } from './lib/storage';
import CheckInForm from './components/CheckInForm';
import Dashboard from './components/Dashboard';
import BodyMap from './components/BodyMap';
import RegionPanel from './components/RegionPanel';
import EmergencyMode from './components/EmergencyMode';
import About from './pages/About';

const navigation = [
  { id: 'check-in', label: 'Check-in', symbol: '＋', title: 'Daily check-in', subtitle: 'A place to record how the crew feels and review device readings.' },
  { id: 'dashboard', label: 'Dashboard', symbol: '▥', title: 'Health overview', subtitle: 'A shared foundation for trends, baseline changes and sourced guidance.' },
  { id: 'body-map', label: 'Body map', symbol: '◎', title: 'Explore by region', subtitle: 'Connect symptoms and measurements to the body.' },
  { id: 'emergency', label: 'Emergency', symbol: '!', title: 'Emergency support', subtitle: 'Use the mission medical checklist and contact the crew medical officer.' },
  { id: 'about', label: 'About', symbol: 'i', title: 'Sources and scope', subtitle: 'Trace the research, understand the limits and credit the tools.' },
] as const;
type Page = typeof navigation[number]['id'];
const pageFromHash = (): Page => navigation.find(page => `#${page.id}` === window.location.hash)?.id ?? 'check-in';
const loadRecords = () => {
  try { return { entries: storage.load(), error: '' }; }
  catch (error) { return { entries: [], error: error instanceof Error ? error.message : 'Could not load records.' }; }
};

/** Part 3 owns further integration and the future environment selector. */
export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [records, setRecords] = useState(loadRecords);
  const [region, setRegion] = useState<Region>('head');
  const heading = useRef<HTMLHeadingElement>(null);
  const environment = 'iss' as const;
  const config = environments[environment];
  const active = navigation.find(item => item.id === page)!;
  const flags = useMemo(() => assessCheckIns(records.entries), [records.entries]);
  const refresh = () => setRecords(loadRecords());
  const openEmergency = () => { window.location.hash = 'emergency'; };
  useEffect(() => {
    const changePage = () => {
      if (window.location.hash !== '#main') setPage(pageFromHash());
    };
    window.addEventListener('hashchange', changePage);
    return () => window.removeEventListener('hashchange', changePage);
  }, []);
  useEffect(() => { heading.current?.focus(); }, [page]);
  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const context = { entries: records.entries, environment };

  return <div className="app-shell">
    <a href="#main" className="skip-link">Skip to content</a>
    <aside className="sidebar">
      <a className="brand" href="#check-in" aria-label="ASTRA home"><span className="brand-mark" aria-hidden="true">✦</span><span>ASTRA<small>CREW HEALTH</small></span></a>
      <p className="nav-caption">MISSION WORKSPACE</p>
      <nav aria-label="Main navigation">
        {navigation.map(item => <a key={item.id} href={`#${item.id}`} aria-current={page === item.id ? 'page' : undefined}>
          <span className="nav-symbol" aria-hidden="true">{item.symbol}</span>{item.label}
        </a>)}
      </nav>
      <div className="sidebar-note"><span className="small-label">BUILD 0.1</span><p>Foundation ready for the team.</p><span className="muted">Feature components are placeholders.</span></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div><span className="small-label">ENVIRONMENT</span><p>{config.name}</p></div>
        <a href="#emergency" className="emergency-button"><span aria-hidden="true">!</span> Emergency</a>
      </header>
      <main id="main" tabIndex={-1} className="main-content">
        <div className="page-heading"><span className="eyebrow">ASTRA / {active.label.toUpperCase()}</span><h1 ref={heading} tabIndex={-1}>{active.title}</h1><p>{active.subtitle}</p></div>
        {records.error ? <div className="notice error-notice" role="alert"><strong>Storage unavailable</strong><p>{records.error}</p><button type="button" onClick={refresh}>Retry loading</button></div>
          : <div className="notice" role="status"><span aria-hidden="true">◇</span><div><strong>{records.entries.some(entry => entry.simulated) ? DEMO_DATA_LABEL : 'No simulated records loaded'}</strong><p>{records.entries.length} check-ins available in this browser.</p></div></div>}
        {page === 'check-in' && <CheckInForm {...context} storage={storage} onSaved={refresh} />}
        {page === 'dashboard' && <Dashboard {...context} flags={flags} onEmergency={openEmergency} />}
        {page === 'body-map' && <div className="panel-grid"><BodyMap {...context} flags={flags} onSelectRegion={setRegion} onEmergency={openEmergency} /><RegionPanel {...context} region={region} flags={flags} onEmergency={openEmergency} /></div>}
        {page === 'emergency' && <EmergencyMode environment={environment} steps={emergencySteps} onExit={() => { window.location.hash = 'dashboard'; }} />}
        {page === 'about' && <About indicators={indicators} sources={SOURCES} />}
        <p className="foundation-note">Foundation preview · follow your assigned task file to implement this workspace.</p>
      </main>
      <footer><p>{EMERGENCY_NOTICE}</p><p>All baseline flags: {RULE_NOTICE}. No diagnosis.</p></footer>
    </div>
  </div>;
}
