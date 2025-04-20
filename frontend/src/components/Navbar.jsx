import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Film, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
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
          <Film className="logo-icon" size={24} />
          <span className="logo-text">Life in Frames</span>
          <Camera className="logo-icon" size={24} />
        </div>
        
        <div className="navbar-links">
          <Link to="/admin" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={18} className="nav-icon" />
            <span>Admin Dashboard</span>
          </Link>
          
          <Link to="/monthly" className={`nav-link ${isActive('/monthly') ? 'active' : ''}`}>
            <Calendar size={18} className="nav-icon" />
            <span>Monthly View</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 