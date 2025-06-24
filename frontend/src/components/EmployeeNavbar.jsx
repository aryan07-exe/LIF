import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewNavbar.css';
import logoImg from '../images/5.png';

const EmployeeNavbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleHamburger = () => setMenuOpen((open) => !open);

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
        <li><a href="/onsite">SUBMIT SHOOT REPORT</a></li>
        <li><a href="/task3">SUBMIT DAILY REPORT</a></li>
        <li>
          <button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
        </li>
      </ul>
    </nav>
  );
};

export default EmployeeNavbar;
