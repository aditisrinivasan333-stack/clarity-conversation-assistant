import React from 'react';
import { FiBookOpen, FiMonitor, FiShield, FiTrash2 } from 'react-icons/fi';
import '../styles/SettingsPage.css';

function SettingsPage({
  deviceMode,
  onDeviceModeChange,
  selectedApps,
  onAppsSelected,
  onOpenTour
}) {
  return (
    <div className="settings-page">
      <header className="settings-heading">
        <p className="settings-eyebrow">CLARITY <span>/</span> PREFERENCES</p>
        <h2>Settings</h2>
        <p>Make Clarity feel right for the way you work.</p>
      </header>

      <section className="settings-card" aria-labelledby="display-heading">
        <div className="settings-card-icon"><FiMonitor aria-hidden="true" /></div>
        <div className="settings-card-copy">
          <h3 id="display-heading">Display</h3>
          <p>Preview the workspace in a laptop or mobile layout. Your choice is saved in this browser.</p>
        </div>
        <label className="settings-control">
          <span className="sr-only">Preview layout</span>
          <select
            value={deviceMode}
            onChange={(event) => onDeviceModeChange(event.target.value)}
          >
            <option value="laptop">Laptop view</option>
            <option value="mobile">Mobile view</option>
          </select>
        </label>
      </section>

      <section className="settings-card" aria-labelledby="privacy-heading">
        <div className="settings-card-icon"><FiShield aria-hidden="true" /></div>
        <div className="settings-card-copy">
          <h3 id="privacy-heading">Privacy & local processing</h3>
          <p>
            Text, PDFs, images, and audio you select are processed in this browser and are not
            uploaded to an AI server. Clarity does not save imported content after you leave
            the summarization page.
          </p>
          <p className="settings-detail">
            Public AI models, OCR language data, and PDF/OCR runtime assets may be downloaded
            from their providers. Initial setup may require internet access.
          </p>
        </div>
      </section>

      <section className="settings-card" aria-labelledby="tour-heading">
        <div className="settings-card-icon"><FiBookOpen aria-hidden="true" /></div>
        <div className="settings-card-copy">
          <h3 id="tour-heading">Feature tour</h3>
          <p>Revisit the short introduction to Clarity’s features at any time.</p>
        </div>
        <button className="settings-secondary-button" type="button" onClick={onOpenTour}>
          Replay tour
        </button>
      </section>

      <section className="settings-card" aria-labelledby="samples-heading">
        <div className="settings-card-icon"><FiTrash2 aria-hidden="true" /></div>
        <div className="settings-card-copy">
          <h3 id="samples-heading">Sample previews</h3>
          <p>
            {selectedApps.length
              ? `${selectedApps.length} sample source${selectedApps.length === 1 ? '' : 's'} selected for the dashboard.`
              : 'No sample sources are currently selected for the dashboard.'}
            {' '}These are demo selections, not live account connections.
          </p>
        </div>
        <button
          className="settings-secondary-button"
          type="button"
          onClick={() => onAppsSelected([])}
          disabled={selectedApps.length === 0}
        >
          Clear selections
        </button>
      </section>
    </div>
  );
}

export default SettingsPage;
