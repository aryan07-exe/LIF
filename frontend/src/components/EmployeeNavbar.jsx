import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NewNavbar.css';

const EmployeeNavbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-logo">🎬</div>
        <span className="brand-text">Life in Frames</span>
      </div>
      <ul className="nav-links" style={{ marginRight: 0 }}>
        <li>
          <button className="logout-btn" onClick={handleLogout} style={{background:'none',border:'none',color:'var(--white)',fontSize:'1rem',cursor:'pointer',padding:'0.5rem 1rem'}}>Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default EmployeeNavbar;
