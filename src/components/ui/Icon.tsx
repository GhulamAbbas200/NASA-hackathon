import type { ReactNode } from 'react';

export type IconName = 'orbit' | 'activity' | 'checkin' | 'body' | 'heart' | 'shield' | 'info' | 'arrow' | 'clock' | 'alert' | 'trend' | 'sun' | 'moon' | 'user' | 'logout' | 'rocket' | 'sparkles' | 'check' | 'lock';
const paths: Record<IconName, ReactNode> = {
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  moon: <path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z" />,
  orbit: <><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-40 12 12)" /><circle cx="18.5" cy="5.5" r="1.5" fill="currentColor" stroke="none" /></>,
  activity: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  checkin: <><rect x="5" y="4" width="14" height="17" rx="3" /><path d="M9 4V2h6v2M9 12l2 2 4-4" /></>,
  body: <><circle cx="12" cy="4" r="2" /><path d="M8 10c0-3 8-3 8 0l1 5M7 15l1-5m4 5v7m-3 0 1-8h4l1 8M8 10h8" /></>,
  heart: <><path d="M20.5 5.5a5 5 0 0 0-7 0L12 7l-1.5-1.5a5 5 0 0 0-7 7L12 21l8.5-8.5a5 5 0 0 0 0-7Z" /><path d="M5 12h4l2-3 2 6 2-3h4" /></>,
  shield: <><path d="m12 2 8 3v6c0 6-8 11-8 11S4 17 4 11V5l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>,
  alert: <><path d="m10.3 3.5-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.7-2.5l-8-14a2 2 0 0 0-3.4 0Z" /><path d="M12 8v5m0 3h.01" /></>,
  trend: <path d="M3 3v17h18M6 14l5-5 4 3 6-7m-5 0h5v5" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  rocket: <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3m5.5-3.5 1.5-1.5a6 6 0 0 0 0-8.5 6 6 0 0 0-8.5 0l-1.5 1.5M9 6l3 3m2.5 5.5L19 19m-4.5-9 6 6" />,
  sparkles: <><path d="m12 3 1.9 4.8L19 9.5l-4.1 3 1.5 5-4.4-3-4.4 3 1.5-5L5 9.5l5.1-1.7Z" /></>,
  check: <path d="m5 13 4 4L19 7" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
};
export default function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
