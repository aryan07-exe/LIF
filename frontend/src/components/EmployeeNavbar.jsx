import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewNavbar.css';
import logoImg from '../images/5.png';

const EmployeeNavbar = ({ formAccess, onLogout }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleHamburger = () => setMenuOpen((open) => !open);

  // Render form buttons according to formAccess
  const renderFormButtons = () => {
    if (formAccess === 'both') {
      return (
        <>
          <li><button className="logout-btn" onClick={() => navigate('/onsite')}>SHOOT REPORT</button></li>
          <li><button className="logout-btn" onClick={() => navigate('/task3')}>DAILY REPORT</button></li>
        </>
      );
    } else if (formAccess === 'onsite') {
      return <li><button className="logout-btn" onClick={() => navigate('/onsite')}>SHOOT REPORT</button></li>;
    } else if (formAccess === 'postproduction') {
      return <li><button className="logout-btn" onClick={() => navigate('/task3')}>DAILY REPORT</button></li>;
    }
    return null;
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
        <li><a href="/employee-profile">DASHBOARD</a></li>
        {renderFormButtons()}
        <li>
          <button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
        </li>
      </ul>
    </nav>
  );
};

export default EmployeeNavbar;
