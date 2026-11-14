import Icon, { type IconName } from './Icon';

/** Foundation-owned presentation only. Feature contracts stay in their stubs. */
export default function FeaturePlaceholder({ id, title, name, icon, description }: {
  id: string; title: string; name: string; icon: IconName; description: string;
}) {
  return <section className="panel feature-placeholder" aria-labelledby={id}>
    <div className="card-heading"><span className={`card-icon icon-${icon}`}><Icon name={icon} size={19} /></span><h2 id={id}>{title}</h2><span className="preview-dot" title="Foundation placeholder" /></div>
    <p className="placeholder-description"><span className="todo-label">TODO</span> {description}</p>
    <span className="component-name">{name}</span>
  </section>;
}
