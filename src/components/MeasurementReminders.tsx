import type { AppContextProps } from '../types';
import { reminders, REMINDER_NOTICE } from '../data/reminders';
import { environments } from '../data/environments';
import { getCheckInReminder } from '../lib/reminders';
import Icon from './ui/Icon';

export default function MeasurementReminders({ entries, environment }: AppContextProps) {
  const reminder = getCheckInReminder(entries, environment);
  const config = environments[environment];
  return <section className="panel reminder-card" aria-labelledby="reminders-title"><div className="card-heading"><span className="card-icon"><Icon name="clock" /></span><h2 id="reminders-title">Measurement reminders</h2></div>
    <p className={reminder.due ? 'reminder-due' : ''}><strong>{reminder.label}</strong></p>
    {reminder.scheduled ? <><p className="secondary-text">{reminder.latestDate ? `Latest: ${reminder.latestDate}. Next check-in date: ${reminder.dueDate}.` : 'Start with a short daily self-report.'}</p><a className="button-link" href="#check-in">{reminder.due ? 'Start check-in' : 'Review check-in'} <Icon name="arrow" size={17} /></a></> : <p>{config.reminderFrequency.note}</p>}
    <details className="subtle-details"><summary>Device and radiation reminders</summary><ul>{reminders.filter(item => item.timing !== 'daily-check-in').map(item => <li key={item.indicatorId}><strong>{item.indicatorId}:</strong> {item.label}. {item.note}</li>)}</ul></details>
    <p className="small-text">{REMINDER_NOTICE} Dates are used because check-ins do not store a measurement time.</p>
  </section>;
}
