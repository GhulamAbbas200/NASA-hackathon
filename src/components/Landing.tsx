import { useEffect, useRef, useState } from 'react';
import type { AstronautProfile } from '../lib/auth';
import type { CheckIn, Environment } from '../types';
import { environments } from '../data/environments';
import { getCheckInReminder } from '../lib/reminders';
import { EMERGENCY_NOTICE } from '../data/emergency';
import { AuthPanel } from './AuthModal';
import Icon from './ui/Icon';
import ThemeToggle from './ui/ThemeToggle';
import landingVideo from '../../landing-video.mp4';

interface LandingProps {
  currentUser: AstronautProfile | null;
  entries: CheckIn[];
  environment: Environment;
  onStartCheckIn: () => void;
  onAuthSuccess: (user: AstronautProfile) => void;
  onLogout: () => void;
}

export default function Landing({ currentUser, entries, environment, onStartCheckIn, onAuthSuccess, onLogout }: LandingProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [videoLoaded, setVideoLoaded] = useState(motionAllowed);
  const [playing, setPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const reminder = getCheckInReminder(entries, environment);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setMotionAllowed(!preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const element = video.current;
    if (motionAllowed && !videoLoaded) { setVideoLoaded(true); return; }
    if (!element || !motionAllowed) { element?.pause(); return; }
    const start = () => { void element.play().catch(() => setPlaying(false)); };
    const visibility = () => document.hidden ? element.pause() : start();
    start();
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [motionAllowed, videoLoaded]);

  const toggleVideo = () => {
    if (playing) { setMotionAllowed(false); video.current?.pause(); }
    else { setMotionAllowed(true); void video.current?.play().catch(() => setPlaying(false)); }
  };

  return <div className="landing-page">
    <div className="landing-backdrop" aria-hidden="true">
      <video ref={video} className="landing-video" muted loop playsInline
        src={videoLoaded && !videoFailed ? landingVideo : undefined}
        poster="/assets/landing-poster.jpg" preload={motionAllowed ? 'auto' : 'none'}
        onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onError={() => { setVideoFailed(true); setPlaying(false); }} />
      <div className="landing-shade" />
    </div>

    <header className="landing-header">
      <a className="landing-brand" href="#home" aria-label="ASTRA home">
        <span className="landing-brand-mark"><Icon name="orbit" size={32} /></span>
        <span>astra<span className="landing-brand-dot">.</span></span>
        <span className="landing-brand-label">CREW HEALTH</span>
      </a>
      <div className="landing-header-actions">
        <a href="#about">About ASTRA <Icon name="arrow" size={17} /></a>
        <ThemeToggle />
      </div>
    </header>

    <div className="landing-content">
      <section className="landing-intro" aria-labelledby="landing-title">
        <span className="landing-eyebrow"><span /> A LITTLE CLOSER TO HOME</span>
        <h1 id="landing-title">Far from Earth.<br /><span>In touch with you.</span></h1>
        <p className="landing-description">A moment to check in. A clearer view of how you feel.<br className="landing-desktop-break" /> Your space for crew health, wherever the mission takes you.</p>
        <div className="landing-capabilities" aria-label="ASTRA capabilities">
          <span><Icon name="checkin" size={20} /> Daily check-ins</span>
          <span><Icon name="body" size={20} /> Interactive body map</span>
          <span><Icon name="trend" size={20} /> Personal trends</span>
        </div>
        <div className="landing-mission-note">
          <Icon name="orbit" size={21} />
          <div><strong>Built for life beyond Earth.</strong><span>A NASA Space Apps Challenge prototype.</span></div>
        </div>
      </section>

      <section className="landing-access" aria-label={currentUser ? 'Crew workspace access' : 'Crew profile access'}>
        <div className="landing-access-card">
          <span className="landing-card-eyebrow"><Icon name="orbit" size={19} /> YOUR CREW SPACE</span>
          {currentUser ? <div className="landing-returning">
            <h2>Welcome back,<br />{currentUser.name}.</h2>
            <p>{currentUser.callsign} · {environments[environment].name}</p>
            <div className="landing-checkin-status"><Icon name="checkin" size={22} /><span>{reminder.due ? 'Ready for your next check-in?' : 'Your latest check-in is recorded.'}</span></div>
            <button className="primary-button" type="button" onClick={onStartCheckIn}>{reminder.due ? 'Start daily check-in' : 'Review check-in'} <Icon name="arrow" size={19} /></button>
            <a className="landing-dashboard-link" href="#dashboard">Open dashboard <Icon name="arrow" size={18} /></a>
            <button className="landing-signout" type="button" onClick={onLogout}>Switch crew profile</button>
          </div> : <AuthPanel onSuccess={onAuthSuccess} />}
        </div>
        <p className="landing-access-caption">A small daily habit. A better picture of you.</p>
      </section>
    </div>

    <footer className="landing-footer">
      <div className="landing-footnote"><span className="landing-prototype">RESEARCH PROTOTYPE</span><p>{EMERGENCY_NOTICE}</p></div>
      <div className="landing-video-caption"><span>EARTH, FROM A DIFFERENT PERSPECTIVE</span>
        <button type="button" className="landing-motion-control" onClick={toggleVideo} disabled={videoFailed}
          aria-label={playing ? 'Pause background video' : 'Play background video'}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
            {playing ? <><rect x="4" y="3" width="3" height="10" rx="1" /><rect x="9" y="3" width="3" height="10" rx="1" /></> : <path d="M5 3 13 8 5 13Z" />}
          </svg>
          {videoFailed ? 'Still view' : playing ? 'Pause video' : 'Play video'}
        </button>
      </div>
    </footer>
  </div>;
}
