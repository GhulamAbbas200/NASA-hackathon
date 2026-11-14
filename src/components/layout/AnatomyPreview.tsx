import Icon from '../ui/Icon';

/** Decorative foundation art only. Part 3 owns actual body-map selection and overlays. */
export default function AnatomyPreview({ compact = false }: { compact?: boolean }) {
  return <figure className={`anatomy-stage${compact ? ' anatomy-compact' : ''}`}>
    <div className="anatomy-stage-heading"><div><span className="stage-eyebrow">THE HUMAN ELEMENT</span><h2>Body overview</h2></div><span className="illustration-badge">Anatomy preview</span></div>
    <div className="anatomy-orbit orbit-one" aria-hidden="true" />
    <div className="anatomy-orbit orbit-two" aria-hidden="true" />
    <div className="anatomy-crosshair crosshair-one" aria-hidden="true">+</div>
    <div className="anatomy-crosshair crosshair-two" aria-hidden="true">+</div>
    <img className="anatomy-image" src="/assets/astra-anatomy.png" width="1024" height="1536" alt="" fetchPriority="high" />
    <figcaption className="anatomy-caption"><span className="anatomy-caption-icon"><Icon name="body" size={21} /></span><div><strong>A closer look at crew health</strong><p>Illustration only. No health overlay is shown.</p></div></figcaption>
    <span className="stage-coordinate" aria-hidden="true">ASTRA / HUMAN SYSTEMS</span>
  </figure>;
}
