import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ChevronDown, UserPlus, FolderPlus } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [postproductionOpen, setPostproductionOpen] = useState(false);
  const [onsiteOpen, setOnsiteOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const togglePostproduction = () => {
    setPostproductionOpen(!postproductionOpen);
    setOnsiteOpen(false);
  };

  const toggleOnsite = () => {
    setOnsiteOpen(!onsiteOpen);
    setPostproductionOpen(false);
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/landing">LIF</Link>
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <div className="navbar-item dropdown">
            <button className="dropdown-btn" onClick={togglePostproduction}>
              Postproduction <ChevronDown size={16} />
            </button>
            <div className={`dropdown-content ${postproductionOpen ? 'show' : ''}`}>
              <Link to="/admin" onClick={() => setIsOpen(false)}>Admin Panel</Link>
              <Link to="/post-production-monthly" onClick={() => setIsOpen(false)}>Monthly Panel</Link>
            </div>
          </div>

          <div className="navbar-item dropdown">
            <button className="dropdown-btn" onClick={toggleOnsite}>
              Onsite <ChevronDown size={16} />
            </button>
            <div className={`dropdown-content ${onsiteOpen ? 'show' : ''}`}>
              <Link to="/onsite-admin" onClick={() => setIsOpen(false)}>Admin Panel</Link>
              <Link to="/onsite-monthly" onClick={() => setIsOpen(false)}>Monthly Panel</Link>
            </div>
          </div>

          <div className="navbar-item">
            <Link to="/register" onClick={() => setIsOpen(false)} className="nav-link">
              <UserPlus size={18} />
              Add User
            </Link>
          </div>

          <div className="navbar-item">
            <Link to="/add-project" onClick={() => setIsOpen(false)} className="nav-link">
              <FolderPlus size={18} />
              Add Project
            </Link>
          </div>

          <div className="navbar-item">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 