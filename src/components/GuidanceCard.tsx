import type { Indicator, IndicatorFlag } from '../types';
import { RULE_NOTICE } from '../lib/rules';
import StatusChip from './ui/StatusChip';
import MetricHelp from './ui/MetricHelp';
import Icon from './ui/Icon';

export interface GuidanceCardProps { indicator: Indicator; flag?: IndicatorFlag }
export default function GuidanceCard({ indicator, flag }: GuidanceCardProps) {
  return <section className="panel guidance-card"><div className="card-heading"><span className="card-icon icon-shield"><Icon name="shield" /></span><h3>{indicator.name}: next steps</h3></div>
    <StatusChip status={flag?.status} comparable={flag?.comparable} /><p>{flag?.explanation ?? 'Not assessed: there are no comparable readings yet.'}</p>
    <h4>Why it matters</h4><p>{indicator.whyItMatters}</p><h4>Next action</h4><p>{indicator.nextAction}</p>
    <MetricHelp indicator={indicator} /><a className="source-link" href={indicator.sourceUrl} target="_blank" rel="noreferrer">Research source ↗</a>
    <p className="verification-note">{indicator.verificationNote}</p><p className="small-text">All flags: {RULE_NOTICE}.</p>
  </section>;
}
