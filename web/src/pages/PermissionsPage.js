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
