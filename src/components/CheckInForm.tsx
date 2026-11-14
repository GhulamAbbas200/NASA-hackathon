import type { AppContextProps, Storage } from '../types';

export interface CheckInFormProps extends AppContextProps { storage: Storage; onSaved: () => void }
export default function CheckInForm(_props: CheckInFormProps) {
  return <section className="panel" aria-labelledby="checkin-stub">
    <span className="owner-label">Part 1 · Teammate 1</span>
    <h2 id="checkin-stub">CheckInForm</h2>
    <p>TODO: Build the daily check-in, optional device readings, measurement help and reminders.</p>
    <p className="contract-hint">Contract: CheckIn · Storage.load / save / reset · indicators · reminders</p>
  </section>;
}
