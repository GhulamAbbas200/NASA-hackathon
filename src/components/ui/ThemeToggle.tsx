import { useState } from 'react';
import Icon from './Icon';

type Theme = 'light' | 'dark';

/** index.html applies the saved/system theme before paint. This controls only UI
 * preference; a blocked localStorage must never disable the theme button.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  const next = theme === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${next} mode`;
  const toggle = () => {
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setTheme(next);
    try { window.localStorage.setItem('astra.theme', next); }
    catch { /* Keep the current session usable when browser storage is blocked. */ }
  };

  return <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
    <Icon name={next === 'dark' ? 'moon' : 'sun'} size={19} />
    <span className="theme-toggle-label">{next === 'dark' ? 'Dark mode' : 'Light mode'}</span>
  </button>;
}
