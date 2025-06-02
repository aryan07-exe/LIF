import React, { useState } from 'react';
import './NewNavbar.css';
import logoImg from '../images/5.png';
import { FaUserPlus, FaProjectDiagram, FaChevronDown, FaBars, FaTimes, FaDashcube, FaHome } from 'react-icons/fa';

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
        <img src={logoImg} alt="Life in Frames Logo" className="navbar-logo-img" />
      </div>

      <div className="hamburger" onClick={toggleMobileMenu}>
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </div>

      <ul className={`nav-links ${mobileOpen ? 'active' : ''}`}> 
        <li><a href="/admin-profile"><FaHome/> Dashboard</a></li>
        <li><a href="/register"><FaUserPlus /> Add User</a></li>
        <li><a href="/add-project"><FaProjectDiagram /> Add Project</a></li>
        <li><a href="/post-production-monthly"><FaProjectDiagram /> Post Production Report</a></li>
        <li><a href="/onsite-admin"><FaProjectDiagram /> Onsite Report</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;                                                                             