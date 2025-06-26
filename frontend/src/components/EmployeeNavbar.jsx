import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NewNavbar.css';
import logoImg from '../images/5.png';

const EmployeeNavbar = ({ formAccess, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleHamburger = () => setMenuOpen((open) => !open);

  // Always show both buttons, highlight if active
  const renderFormButtons = () => {
    return (
      <>
        <li>
          <button
            className={`logout-btn${location.pathname === '/onsite' ? ' active-nav-btn' : ''}`}
            onClick={() => navigate('/onsite')}
            style={{ width: '100%' }}
          >
            SHOOT REPORT
          </button>
        </li>
        <li>
          <button
            className={`logout-btn${location.pathname === '/task3' ? ' active-nav-btn' : ''}`}
            onClick={() => navigate('/task3')}
            style={{ width: '100%' }}
          >
            DAILY REPORT
          </button>
        </li>
      </>
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logoImg} alt="Life in Frames Logo" className="navbar-logo-img" />
      </div>
      <div className="hamburger" onClick={handleHamburger}>
        <span role="img" aria-label="menu">&#9776;</span>
      </div>
      <ul className={`nav-links${menuOpen ? ' active' : ''}`} style={{ marginRight: 0 }}>
        <li>
          <a
            href="/employee-profile"
            className={location.pathname === '/employee-profile' ? 'active-nav-link' : ''}
          >
            DASHBOARD
          </a>
        </li>
        {renderFormButtons()}
        <li>
          <button className="logout-btn" onClick={handleLogout} style={{ width: '100%' }}>LOGOUT</button>
        </li>
      </ul>
    </nav>
  );
};

export default EmployeeNavbar;
