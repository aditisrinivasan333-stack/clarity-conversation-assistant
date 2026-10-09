import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MessageList from '../components/MessageList';
import { getDemoMessages } from '../data/demoMessages';
import '../styles/DashboardPage.css';

function DashboardPage({ selectedApps }) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (selectedApps.length > 0) {
      setSelectedApp(selectedApps[0].id);
    }
  }, [selectedApps]);

  const messages = useMemo(
    () => (selectedApp ? getDemoMessages(selectedApp) : []),
    [selectedApp]
  );
  const unreadMessages = messages.filter((message) => !message.read);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAppChange = (appId) => {
    setSelectedApp(appId);
  };

  if (selectedApps.length === 0) {
    return (
      <div className="dashboard-page">
        <section className="clarity-hero" aria-labelledby="clarity-dashboard-title">
          <div className="hero-copy">
            <p className="hero-eyebrow"><span /> A MORE THOUGHTFUL WAY TO CATCH UP</p>
            <h2 id="clarity-dashboard-title">
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
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h2>Messages Dashboard</h2>
      <p className="sample-data-note">
        Demo sample messages · Real WhatsApp, SMS, and email sources must be imported or connected through their official APIs.
      </p>

      <div className="dashboard-controls">
        <div className="app-selector">
          <label>Select App:</label>
          <select value={selectedApp || ''} onChange={(e) => handleAppChange(e.target.value)}>
            {selectedApps.map(app => (
              <option key={app.id} value={app.id}>
                {app.icon} {app.name}
              </option>
            ))}
          </select>
        </div>

        <div className="tab-selector">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            All Messages
          </button>
          <button 
            className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => handleTabChange('unread')}
          >
            Unread ({unreadMessages.length})
          </button>
        </div>

      </div>

      <MessageList 
        messages={activeTab === 'unread' ? unreadMessages : messages}
        appId={selectedApp}
      />
    </div>
  );
}

export default DashboardPage;
