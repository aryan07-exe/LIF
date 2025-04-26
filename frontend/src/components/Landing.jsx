import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1 className="landing-title">Welcome to Task Management System</h1>
      <div className="options-container">
        <div 
          className="option-card"
          onClick={() => navigate('/post-production')}
        >
          <h2>Post Production</h2>
          <p>Manage post-production tasks and workflows</p>
        </div>
        <div 
          className="option-card"
          onClick={() => navigate('/onsite')}
        >
          <h2>Onsite</h2>
          <p>Handle onsite production tasks and schedules</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;