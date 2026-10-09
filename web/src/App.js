import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PermissionsPage from './pages/PermissionsPage';
import DashboardPage from './pages/DashboardPage';
import SummarizePage from './pages/SummarizePage';
import SettingsPage from './pages/SettingsPage';
import AppTour from './components/AppTour';
import './styles/App.css';

function App() {
  const [selectedApps, setSelectedAppsState] = React.useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('conversation-summarizer-sample-apps') || '[]');
    } catch {
      return [];
    }
  });
  const [deviceMode, setDeviceMode] = React.useState(
    () => window.localStorage.getItem('conversation-summarizer-device') || 'laptop'
  );
  const [tourOpen, setTourOpen] = React.useState(
    () => window.localStorage.getItem('conversation-summarizer-tour-complete') !== 'true'
  );

  const handleDeviceModeChange = (mode) => {
    setDeviceMode(mode);
    window.localStorage.setItem('conversation-summarizer-device', mode);
  };

  const handleAppsSelected = (apps) => {
    setSelectedAppsState(apps);
    window.localStorage.setItem('conversation-summarizer-sample-apps', JSON.stringify(apps));
  };

  return (
    <Router>
      <div className="app-container" data-device-mode={deviceMode}>
        <Header
          deviceMode={deviceMode}
          onDeviceModeChange={handleDeviceModeChange}
          onOpenTour={() => setTourOpen(true)}
        />
        <div className="app-content">
          <Sidebar selectedApps={selectedApps} />
          <main className="main-content">
            <Routes>
              <Route path="/permissions" element={<PermissionsPage selectedApps={selectedApps} onAppsSelected={handleAppsSelected} />} />
              <Route path="/dashboard" element={<DashboardPage selectedApps={selectedApps} />} />
              <Route path="/summarize" element={<SummarizePage />} />
              <Route
                path="/settings"
                element={(
                  <SettingsPage
                    deviceMode={deviceMode}
                    onDeviceModeChange={handleDeviceModeChange}
                    selectedApps={selectedApps}
                    onAppsSelected={handleAppsSelected}
                    onOpenTour={() => setTourOpen(true)}
                  />
                )}
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
        {tourOpen && <AppTour onClose={() => setTourOpen(false)} />}
      </div>
    </Router>
  );
}

export default App;
