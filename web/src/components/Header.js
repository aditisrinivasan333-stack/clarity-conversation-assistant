import React from 'react';
import { FiHelpCircle, FiMonitor, FiSmartphone } from 'react-icons/fi';
import '../styles/Header.css';

function Header({ deviceMode, onDeviceModeChange, onOpenTour }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">C</div>
          <div>
            <h1 className="header-title">Clarity</h1>
            <p className="header-subtitle">Conversation intelligence</p>
          </div>
        </div>
        <div className="header-tools">
          <label className="device-picker">
            {deviceMode === 'mobile' ? <FiSmartphone aria-hidden="true" /> : <FiMonitor aria-hidden="true" />}
            <span className="sr-only">Preview device</span>
            <select
              aria-label="Preview device"
              value={deviceMode}
              onChange={(event) => onDeviceModeChange(event.target.value)}
            >
              <option value="laptop">Laptop view</option>
              <option value="mobile">Mobile view</option>
            </select>
          </label>
          <button className="tour-button" onClick={onOpenTour} type="button">
            <FiHelpCircle aria-hidden="true" />
            <span>App tour</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
