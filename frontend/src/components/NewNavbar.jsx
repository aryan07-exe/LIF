import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import gsap from 'gsap';
import './NewNavbar.css';

const NewNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) {
      const name = user?.name || 'User';
      const letters = name.split('');
      
      // Clear existing content
      nameRef.current.innerHTML = '';
      
      // Create spans for each letter
      letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'letter';
        nameRef.current.appendChild(span);
      });

      // Animate each letter
      gsap.fromTo(
        '.letter',
        {
          opacity: 0,
          y: 20,
          rotateX: -90,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
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
      <div className="navbar-brand" onClick={() => navigate('/employee-profile')}>
        <span className="brand-text">LIF</span>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <div className="animated-name" ref={nameRef}></div>
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