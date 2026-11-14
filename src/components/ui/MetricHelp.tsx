import type { Indicator } from '../../types';
import Icon from './Icon';

export default function MetricHelp({ indicator }: { indicator: Indicator }) {
  return <details className="metric-help">
    <summary aria-label={`Measurement help for ${indicator.name}`}><Icon name="info" size={16} />Measurement help</summary>
    <div className="help-content"><h4>How to measure</h4><ol>{indicator.howToMeasure.map((step, index) => <li key={index}>{step}</li>)}</ol>
      <h4>Why it matters</h4><p>{indicator.whyItMatters}</p><h4>When a result looks different</h4><p>{indicator.whenAbnormal}</p>
      <h4>Next action</h4><p>{indicator.nextAction}</p><p className="verification-note">{indicator.verificationNote}</p>
      <a href={indicator.sourceUrl} target="_blank" rel="noreferrer">Open research source ↗</a>
    </div>
  </details>;
}
