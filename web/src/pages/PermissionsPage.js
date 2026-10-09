import React from 'react';
import { Link } from 'react-router-dom';
import { demoSources } from '../data/demoMessages';
import '../styles/PermissionsPage.css';

function PermissionsPage({ selectedApps, onAppsSelected }) {
  const handleAppSelection = (app) => {
    const nextApps = selectedApps.some((selectedApp) => selectedApp.id === app.id)
      ? selectedApps.filter((selectedApp) => selectedApp.id !== app.id)
      : [...selectedApps, app];
    onAppsSelected(nextApps);
  };

  return (
    <div className="permissions-page">
      <section className="clarity-hero" aria-labelledby="clarity-home-title">
        <div className="hero-copy">
          <p className="hero-eyebrow"><span /> A MORE THOUGHTFUL WAY TO CATCH UP</p>
          <h2 id="clarity-home-title">
            Conversations,<br />
            <span>with clarity.</span>
          </h2>
          <p className="hero-description">
            Clarity turns conversations, documents, and voice notes into concise summaries,
            key points, and translations—so you can spend less time catching up and more time
            on what matters.
          </p>
          <div className="hero-actions">
            <Link className="hero-cta" to="/summarize">Explore Clarity <span aria-hidden="true">→</span></Link>
            <span className="hero-privacy">Your selected files are processed in this browser.</span>
          </div>
          <p className="hero-asset-note">Public model and runtime assets may be downloaded when needed.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit hero-orbit-outer" />
          <div className="hero-orbit hero-orbit-inner" />
          <div className="hero-sun" />
          <span className="hero-star hero-star-one">✦</span>
          <span className="hero-star hero-star-two">✧</span>
          <div className="hero-card hero-card-back" />
          <div className="hero-card hero-card-front">
            <span className="hero-card-label">A MOMENT OF CLARITY</span>
            <span className="hero-card-line hero-card-line-long" />
            <span className="hero-card-line" />
            <span className="hero-card-line hero-card-line-short" />
            <span className="hero-card-accent" />
          </div>
        </div>
      </section>

      <div className="source-heading">
        <div>
          <p className="source-eyebrow">THE SAMPLE LIBRARY</p>
          <h2>See Clarity in action</h2>
          <p className="subtitle">Explore sample conversations, or bring your own content to summarize.</p>
        </div>
        <Link className="source-text-link" to="/summarize">Use my own text <span aria-hidden="true">→</span></Link>
      </div>
      <div className="source-disclaimer" role="note">
        <strong>Privacy & integration note</strong>
        <p>This web app cannot read private WhatsApp, SMS, or email messages just by selecting them. Live account connections require each provider’s approved API, OAuth setup, and credentials. These cards only load clearly labelled sample data for the demo.</p>
      </div>
      <div className="apps-grid">
        {demoSources.map(app => (
          <div 
            key={app.id}
            className={`app-card ${selectedApps.some(selectedApp => selectedApp.id === app.id) ? 'selected' : ''}`}
          >
            <div className="app-icon">{app.icon}</div>
            <h3>{app.name}</h3>
            <div className="permissions-list">
              <p className="permissions-title">Required for a live connection:</p>
              <ul>
                {app.requiredPermissions.map((perm, idx) => (
                  <li key={idx}>• {perm}</li>
                ))}
              </ul>
            </div>
            <button className="select-btn" type="button" onClick={() => handleAppSelection(app)}>
              {selectedApps.some(selectedApp => selectedApp.id === app.id) ? '✓ Sample selected' : 'Preview sample messages'}
            </button>
          </div>
        ))}
      </div>

      {selectedApps.length > 0 && (
        <div className="selected-summary">
          <h3>Sample previews selected ({selectedApps.length})</h3>
          <div className="selected-apps-list">
            {selectedApps.map(app => (
              <span key={app.id} className="selected-app-badge">
                {app.icon} {app.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PermissionsPage;
