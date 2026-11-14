import type { AppContextProps, Storage } from '../types';
import FeaturePlaceholder from './ui/FeaturePlaceholder';

export interface CheckInFormProps extends AppContextProps { storage: Storage; onSaved: () => void }
export default function CheckInForm(_props: CheckInFormProps) {
  return <FeaturePlaceholder id="checkin-stub" title="Daily check-in" name="CheckInForm" icon="checkin" description="Add daily observations, optional device readings and measurement reminders." />;
}
