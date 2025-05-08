import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Camera, Film } from 'lucide-react';
import gsap from 'gsap';
import './NewNavbar.css';

const NewNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nameRef = useRef(null);
  const brandRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) {
      const name = user?.name || 'User';
      const letters = name.split('');
      
      nameRef.current.innerHTML = '';
      
      letters.forEach((letter) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'letter';
        nameRef.current.appendChild(span);
      });

      gsap.fromTo(
        '.letter',
        {
          opacity: 0,
          scale: 0,
          x: -50,
          rotateY: 90,
        },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          rotateY: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        }
      );
    }

    if (brandRef.current) {
      gsap.fromTo(
        brandRef.current,
        {
          opacity: 0,
          y: -20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        }
      );
    }
  }, [user?.name]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="new-navbar">
      <div className="navbar-brand" ref={brandRef} onClick={() => navigate('/employee-profile')}>
        <div className="brand-logo">
          <Film size={24} className="brand-icon" />
          <Camera size={24} className="brand-icon" />
        </div>
        <span className="brand-text">LIF</span>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <div className="animated-name" ref={nameRef}></div>
          <span className="user-role">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default NewNavbar; 