import type { AstronautProfile } from '../lib/auth';
import type { CheckIn, Environment } from '../types';
import { environments } from '../data/environments';
import { getCheckInReminder } from '../lib/reminders';
import Icon from './ui/Icon';

export interface HomeProps {
  currentUser: AstronautProfile | null;
  entries: CheckIn[];
  environment: Environment;
  onStartCheckIn: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

export default function Home({
  currentUser,
  entries,
  environment,
  onStartCheckIn,
  onOpenAuth,
}: HomeProps) {
  const reminder = getCheckInReminder(entries, environment);
  const envConfig = environments[environment];

  return (
    <div className="home-container stack">
      {/* Hero Welcome Section */}
      <section className="panel home-hero">
        <div className="home-hero-glow" aria-hidden="true" />
        <div className="home-hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>MISSION READINESS & HEALTH COMPANION</span>
          </div>
          <h1 className="home-hero-title">
            ASTRA <span className="title-accent">Health</span>
          </h1>
          <p className="home-hero-subtitle">
            A simple, stress-free health tool built for astronauts in spaceflight. Take quick 2-minute check-ins, pinpoint body discomfort, and access instant emergency guidance without confusing medical jargon.
          </p>

          {currentUser ? (
            <div className="hero-crew-status">
              <div className="crew-profile-mini">
                <span className="crew-mini-avatar">
                  <Icon name={(currentUser.avatar as any) || 'orbit'} size={28} />
                </span>
                <div>
                  <strong>{currentUser.name}</strong>
                  <p>{currentUser.callsign} · {currentUser.role} ({envConfig.name})</p>
                </div>
              </div>
              <div className="hero-status-pill">
                <span className={`status-indicator ${reminder.due ? 'due' : 'ready'}`} />
                <span>{reminder.due ? 'Today’s Check-in is Due' : 'Check-in Recorded for Today'}</span>
              </div>
              <button
                type="button"
                className="primary-button hero-cta"
                onClick={onStartCheckIn}
              >
                {reminder.due ? 'Start Daily Check-in' : 'Review Today’s Check-in'} <Icon name="arrow" size={18} />
              </button>
            </div>
          ) : (
            <div className="hero-auth-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => onOpenAuth('signup')}
              >
                <Icon name="sparkles" size={18} /> Sign Up Crew Profile
              </button>
              <button
                type="button"
                className="button-link"
                onClick={() => onOpenAuth('login')}
              >
                <Icon name="user" size={18} /> Log In
              </button>
            </div>
          )}
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <div className="hero-orbit orbit-large" />
          <div className="hero-orbit orbit-small" />
          <div className="hero-figure-wrapper">
            <img
              src="/assets/astra-anatomy.png"
              alt="ASTRA Human Anatomy Overview"
              className="hero-anatomy-preview"
              width={260}
              height={390}
            />
          </div>
        </div>
      </section>

      {/* Simplified System Features Overview */}
      <section className="home-section" aria-labelledby="features-overview-title">
        <div className="section-title-wrap">
          <span className="stage-eyebrow">WHAT ASTRA DOES</span>
          <h2 id="features-overview-title">Core Health Capabilities</h2>
          <p className="secondary-text">
            Designed specifically for the physical and mental challenges of life in zero gravity.
          </p>
        </div>

        <div className="features-card-grid">
          <article className="panel feature-action-card">
            <div className="card-top">
              <span className="feature-icon icon-checkin"><Icon name="checkin" size={26} /></span>
              <span className="feature-step-pill">2 mins daily</span>
            </div>
            <h3>Daily Check-in</h3>
            <p className="feature-description">
              A quick morning log of your sleep, fatigue, stress, mood, and optional vitals.
            </p>
          </article>

          <article className="panel feature-action-card">
            <div className="card-top">
              <span className="feature-icon icon-body"><Icon name="body" size={26} /></span>
              <span className="feature-step-pill">Visual Anatomy</span>
            </div>
            <h3>Interactive Body Map</h3>
            <p className="feature-description">
              Tap your head, chest, spine, arms, or legs to pinpoint discomfort and check space radiation guidelines.
            </p>
          </article>

          <article className="panel feature-action-card">
            <div className="card-top">
              <span className="feature-icon icon-activity"><Icon name="activity" size={26} /></span>
              <span className="feature-step-pill">Personal Baseline</span>
            </div>
            <h3>Health Trends & Guidance</h3>
            <p className="feature-description">
              Tracks changes against your own 7-day normal to spot health shifts early, with clear doctor tips.
            </p>
          </article>

          <article className="panel feature-action-card">
            <div className="card-top">
              <span className="feature-icon icon-alert"><Icon name="alert" size={26} /></span>
              <span className="feature-step-pill danger-pill">Critical Protocol</span>
            </div>
            <h3>Emergency Guide</h3>
            <p className="feature-description">
              Step-by-step instructions for chest pain, collapse, and zero-gravity CPR with patient restraints.
            </p>
          </article>
        </div>
      </section>

      {/* 3-Step Simple Flow */}
      <section className="panel home-steps-section" aria-labelledby="how-it-works-title">
        <h2 id="how-it-works-title">How It Works in 3 Easy Steps</h2>
        <div className="steps-row">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-icon"><Icon name="user" size={22} /></div>
            <h4>Identify</h4>
            <p>Log in or sign up with your astronaut profile. All records stay 100% private in this browser.</p>
          </div>
          <div className="step-arrow" aria-hidden="true">→</div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-icon"><Icon name="checkin" size={22} /></div>
            <h4>Record</h4>
            <p>Answer a few quick questions each morning about sleep, mood, and optional vitals.</p>
          </div>
          <div className="step-arrow" aria-hidden="true">→</div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-icon"><Icon name="trend" size={22} /></div>
            <h4>Take Action</h4>
            <p>Compare against your own personal baseline. If values deviate, follow clear next steps.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
