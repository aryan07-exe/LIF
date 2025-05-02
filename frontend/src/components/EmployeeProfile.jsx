import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Award, Clock, User, CheckCircle, Star, Clock as ClockIcon } from 'lucide-react';
import './EmployeeProfile.css';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser.employeeId) {
      navigate('/');
      return;
    }
    setUser(storedUser);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="employee-profile">
      <div className="profile-header">
        <div className="welcome-section">
          <div className="avatar-container">
            <div className="avatar">
              <div className="avatar-inner">
                <User size={40} />
              </div>
              <div className="avatar-stats">
                <div className="stat-item">
                  <CheckCircle size={16} />
                  <span>Active</span>
                </div>
                <div className="stat-item">
                  <Star size={16} />
                  <span>Premium</span>
                </div>
                <div className="stat-item">
                  <ClockIcon size={16} />
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>
          <h1 className="welcome-text">Welcome, {user?.name || 'User'}</h1>
          <p className="employee-id">Employee ID: {user?.employeeId}</p>
          <p className="department">Department: {user?.department}</p>
        </div>
        <div className="quick-actions">
          <button className="add-task-btn" onClick={() => navigate('/task3')}>
            <Plus size={20} />
            <span>Add Today's Task</span>
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/task3')}>
          <div className="card-icon-container">
            <Calendar size={40} className="card-icon" />
          </div>
          <h3>Daily Tasks</h3>
          <p>View and manage your daily tasks</p>
          <button>View Tasks</button>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/monthly')}>
          <div className="card-icon-container">
            <Award size={40} className="card-icon" />
          </div>
          <h3>Monthly View</h3>
          <p>Track your monthly progress</p>
          <button>View Progress</button>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/time-tracking')}>
          <div className="card-icon-container">
            <Clock size={40} className="card-icon" />
          </div>
          <h3>Time Tracking</h3>
          <p>Monitor your work hours</p>
          <button>Track Time</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
