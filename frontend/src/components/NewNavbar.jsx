import React, { useState } from 'react';
import './NewNavbar.css';
import { FaUserPlus, FaProjectDiagram, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState('');

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
    setDropdown('');
  };

  const toggleDropdown = (menu) => {
    setDropdown(dropdown === menu ? '' : menu);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-logo">🎬📸</div>
        <span className="brand-text">Life in Frames</span>
      </div>

      <div className="hamburger" onClick={toggleMobileMenu}>
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </div>

      <ul className={`nav-links ${mobileOpen ? 'active' : ''}`}>
        <li><a href="/register"><FaUserPlus /> Add User</a></li>
        <li><a href="/add-project"><FaProjectDiagram /> Add Project</a></li>

        <li className="dropdown">
          <button onClick={() => toggleDropdown('post')}>
            Postproduction <FaChevronDown />
          </button>
          {dropdown === 'post' && (
            <ul className="dropdown-menu">
              <li><a href="/admin">Admin Panel</a></li>
              <li><a href="/post-production-monthly">Monthly Panel</a></li>
            </ul>
          )}
        </li>

        <li className="dropdown">
          <button onClick={() => toggleDropdown('onsite')}>
            Onsite <FaChevronDown />
          </button>
          {dropdown === 'onsite' && (
            <ul className="dropdown-menu">
              <li><a href="/onsite-admin">Admin Panel</a></li>
              <li><a href="/onsite-monthly">Monthly Panel</a></li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
