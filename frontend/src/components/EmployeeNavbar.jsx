import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NewNavbar.css';
import logoImg from '../images/5.png';

const EmployeeNavbar = ({ onLogout }) => {
  const [formaccess, setFormaccess] = useState(localStorage.getItem('formaccess'));

  // Listen for storage changes (e.g., from other tabs/windows)
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'formaccess') {
        setFormaccess(event.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Optionally, update formaccess on focus (for same-tab changes)
  useEffect(() => {
    const handleFocus = () => {
      setFormaccess(localStorage.getItem('formaccess'));
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleHamburger = () => setMenuOpen((open) => !open);

  // Conditionally show buttons based on formaccess from localStorage
  const renderFormButtons = () => {
    // Use the same logic as EmployeeProfile
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const access = user.formAccess;
    return (
      <>
        {(access === 'onsite' || access === 'both') && (
          <li>
            <button
              className={`logout-btn${location.pathname === '/onsite' ? ' active-nav-btn' : ''}`}
              onClick={() => navigate('/onsite')}
              style={{ width: '100%' }}
            >
              SHOOT REPORT
            </button>
          </li>
        )}
        {(access === 'postproduction' || access === 'both') && (
          <li>
            <button
              className={`logout-btn${location.pathname === '/task3' ? ' active-nav-btn' : ''}`}
              onClick={() => navigate('/task3')}
              style={{ width: '100%' }}
            >
              DAILY REPORT
            </button>
          </li>
        )}
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
