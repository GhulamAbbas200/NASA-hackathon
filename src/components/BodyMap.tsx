import { useId, useState } from 'react';
import { Body, type BodyPart, type Slug } from 'react-body-map';
import { REGIONS, type AppContextProps, type IndicatorFlag, type Region } from '../types';
import { indicatorsForRegion, indicatorById } from '../data/indicators';
import { regionMap, REGION_LABELS, regionForSlug } from '../data/regionMap';
import { summarizeFlags } from '../lib/display';
import { RULE_NOTICE } from '../lib/rules';
import StatusChip, { STATUS_LABELS, STATUS_SYMBOLS } from './ui/StatusChip';
import Icon from './ui/Icon';

export interface BodyMapProps extends AppContextProps {
  flags: IndicatorFlag[];
  onSelectRegion: (region: Region) => void;
  onEmergency: () => void;
  selectedRegion?: Region;
}
export default function BodyMap({ flags, onSelectRegion, onEmergency, selectedRegion = 'head' }: BodyMapProps) {
  const id = useId();
  const [view, setView] = useState<'anatomy' | 'front' | 'back'>(() => selectedRegion === 'upperBack' || selectedRegion === 'lowerBack' ? 'back' : 'anatomy');
  const [radiationOpen, setRadiationOpen] = useState(false);
  const summaries = Object.fromEntries(REGIONS.map(region => {
    const ids = indicatorsForRegion(region).map(indicator => indicator.id);
    return [region, summarizeFlags(flags.filter(flag => ids.includes(flag.indicatorId)))];
  })) as Record<Region, ReturnType<typeof summarizeFlags>>;
  const summary = summaries[selectedRegion];
  const choose = (region: Region) => {
    onSelectRegion(region);
    if (region === 'upperBack' || region === 'lowerBack') setView('back');
    else if (region === 'chest' && view === 'back') setView('front');
  };
  const colors = ['#91a2bd', '#76c9b5', '#e4bd69', '#df829d'];
  const parts: BodyPart[] = Object.entries(regionMap).map(([slug, region]) => ({
    slug: slug as Slug, color: colors[0],
    intensity: !summaries[region].comparable ? 1 : summaries[region].status === 'normal' ? 2 : summaries[region].status === 'changed' ? 3 : 4,
  }));
  const selectedPaths = Object.entries(regionMap).filter(([, region]) => region === selectedRegion).map(([slug]) => `.body-svg [id="${slug}"] { stroke: #f5f7ff; stroke-width: 3; vector-effect: non-scaling-stroke; }`).join('\n');
  const radiation = indicatorById.radiation;
  const hotspots: { region: Region; left: string; top: string }[] = [
    { region: 'head', left: '70%', top: '9%' }, { region: 'chest', left: '72%', top: '27%' },
    { region: 'arms', left: '15%', top: '46%' }, { region: 'legs', left: '75%', top: '76%' },
  ];
  return <section className="body-map-card" aria-labelledby={`${id}-title`}>
    <div className="anatomy-stage live-body-stage"><div className="live-body-heading"><div><span className="stage-eyebrow">THE HUMAN ELEMENT</span><h2 id={`${id}-title`}>Explore by region</h2></div><span className="illustration-badge">Interactive overview</span></div>
      <div className="body-view-controls" role="group" aria-label="Body view">{(['anatomy', 'front', 'back'] as const).map(side => <button key={side} type="button" aria-pressed={view === side} onClick={() => setView(side)}>{side === 'anatomy' ? 'Anatomy' : side === 'front' ? 'Front model' : 'Back model'}</button>)}</div>
      <div className="anatomy-orbit orbit-one" aria-hidden="true" /><div className="anatomy-orbit orbit-two" aria-hidden="true" />
      <div className="body-figure-frame">{view === 'anatomy' ? <div className="interactive-illustration"><img src="/assets/astra-anatomy.png" width="1024" height="1536" alt="Illustrated human anatomy, with labelled region navigation" />{hotspots.map(spot => <button key={spot.region} type="button" className={`body-hotspot${selectedRegion === spot.region ? ' selected' : ''}`} style={{ left: spot.left, top: spot.top }} onClick={() => choose(spot.region)} aria-label={`Select ${REGION_LABELS[spot.region]} region`} title={REGION_LABELS[spot.region]} aria-pressed={selectedRegion === spot.region}><span aria-hidden="true">+</span><span className="hotspot-label">{REGION_LABELS[spot.region]}</span></button>)}</div>
        : <div className="body-svg" aria-hidden="true"><style>{selectedPaths}</style><Body data={parts} colors={colors} scale={1} side={view} frontOnly={view === 'front'} backOnly={view === 'back'} onBodyPartPress={part => { const region = regionForSlug(part.slug); if (region) choose(region); }} /></div>}</div>
      <div className="body-selection-caption"><span><Icon name="body" />Selected: <strong>{REGION_LABELS[selectedRegion]}</strong></span><StatusChip {...summary} /><p>{view === 'anatomy' ? 'Illustrated navigation, not a scan. Back regions are available in the back model.' : 'Region colours summarize prototype flags. Use the labelled buttons for keyboard selection.'}</p></div>
    </div>
    <div className="panel body-controls"><div className="region-button-grid" role="group" aria-label="Select body region">{REGIONS.map(region => {
      const state = !summaries[region].comparable ? 'unassessed' : summaries[region].status;
      return <button key={region} type="button" className="region-button" aria-pressed={selectedRegion === region} aria-label={`Select ${REGION_LABELS[region]} region; ${STATUS_LABELS[state]}`} onClick={() => choose(region)}><span>{REGION_LABELS[region]}</span><span className={`region-dot status-${state}`} aria-hidden="true">{STATUS_SYMBOLS[state]}</span></button>;
    })}</div>
      <div className="body-legend" aria-label="Region status key"><StatusChip status="normal" comparable /><StatusChip status="changed" comparable /><StatusChip status="contact" comparable /><StatusChip /></div>
      <p className="small-text">Highest comparable flag in each region; global temperature/glucose can appear in multiple regions. All amounts: {RULE_NOTICE}.</p>
      {selectedRegion === 'chest' && <button type="button" className="danger-button" onClick={onEmergency}><Icon name="alert" size={18} />Chest pain or collapse? Emergency</button>}
      <button type="button" className="whole-body-button" aria-expanded={radiationOpen} aria-controls={`${id}-radiation`} onClick={() => setRadiationOpen(open => !open)}><Icon name="shield" size={20} />Whole body · radiation<span aria-hidden="true">{radiationOpen ? '−' : '+'}</span></button>
      {radiationOpen && <div id={`${id}-radiation`} className="radiation-panel"><h3>Needs dosimeter, cannot be self-assessed</h3><p>{radiation.whyItMatters}</p><ol>{radiation.howToMeasure.map(step => <li key={step}>{step}</li>)}</ol><p>{radiation.nextAction}</p><p className="verification-note">{radiation.whenAbnormal}</p><a href={radiation.sourceUrl} target="_blank" rel="noreferrer">NASA radiation monitoring source ↗</a></div>}
    </div>
  </section>;
}
