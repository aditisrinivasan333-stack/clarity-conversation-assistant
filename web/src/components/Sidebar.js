import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiLock, FiMessageCircle, FiSettings } from 'react-icons/fi';
import '../styles/Sidebar.css';

function Sidebar({ selectedApps }) {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <FiHome /> Dashboard
        </Link>
        <Link 
          to="/permissions" 
          className={`nav-item ${location.pathname === '/permissions' ? 'active' : ''}`}
        >
          <FiLock /> Permissions ({selectedApps.length})
        </Link>
        <Link 
          to="/summarize" 
          className={`nav-item ${location.pathname === '/summarize' ? 'active' : ''}`}
        >
          <FiMessageCircle /> Summarize
        </Link>
        <Link
          to="/settings"
          className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
        >
          <FiSettings /> Settings
        </Link>
      </nav>

      <div className="sidebar-footer">
        <p className="version">v1.0.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
