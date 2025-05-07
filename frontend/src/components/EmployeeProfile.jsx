import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Award, Clock, User, CheckCircle, Star, ClockIcon, Camera, LogOut, Briefcase } from 'lucide-react';
import './EmployeeProfile.css';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser.employeeId) {
      navigate('/');
      return;
    }
    setUser(storedUser);
    setLoading(false);

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatDate = (date) => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <Briefcase className="company-logo" />
          <h1 className="company-name">LIFE IN FRAMES</h1>
        </div>
        <div className="header-right">
          <div className="date-time-display">
            <div className="current-date">{formatDate(currentTime)}</div>
            <div className="current-time">{formatTime(currentTime)}</div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <div className="profile-summary">
            <div className="profile-avatar">
              {user?.photoUrl ? (
                <img src={user.photoUrl || "/placeholder.svg"} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <User size={40} />
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{user?.name || 'User'}</h2>
              <p className="profile-role">{user?.role || 'Employee'}</p>
            </div>
          </div>
          
          <nav className="dashboard-nav">
            <button className="nav-item active">
              <User size={18} />
              <span>Profile</span>
            </button>
            <button className="nav-item">
              <Calendar size={18} />
              <span>Calendar</span>
            </button>
            <button className="nav-item">
              <ClockIcon size={18} />
              <span>Time Tracking</span>
            </button>
            <button className="nav-item">
              <Award size={18} />
              <span>Achievements</span>
            </button>
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="welcome-banner">
            <div className="welcome-message">
              <h2>Welcome back, <span className="highlight">{user?.name.split(' ')[0] || 'User'}</span></h2>
              <p>Here's your professional dashboard</p>
            </div>
          </div>

          <section className="profile-card">
            <div className="card-header">
              <h3>Employee Profile</h3>
            </div>
            <div className="card-content">
              <div className="profile-details">
                <div className="detail-group">
                  <label>Employee ID</label>
                  <p>{user?.employeeId || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Department</label>
                  <p>{user?.department || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Email</label>
                  <p>{user?.email || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Role</label>
                  <p>{user?.role || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Joining Date</label>
                  <p>{user?.joiningDate || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Status</label>
                  <p className="status-active">
                    <CheckCircle size={16} />
                    <span>Active</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="actions-section">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="actions-grid">
              {user?.formAccess === 'postproduction' && (
                <button className="action-card" onClick={() => navigate('/task3')}>
                  <div className="action-icon">
                    <Plus size={24} />
                  </div>
                  <div className="action-text">
                    <h4>Add Today's Task</h4>
                    <p>Record your daily activities</p>
                  </div>
                </button>
              )}
              
              {user?.formAccess === 'onsite' && (
                <button className="action-card" onClick={() => navigate('/onsite')}>
                  <div className="action-icon">
                    <Camera size={24} />
                  </div>
                  <div className="action-text">
                    <h4>Add Onsite Task</h4>
                    <p>Document field activities</p>
                  </div>
                </button>
              )}
              
              {user?.formAccess === 'both' && (
                <>
                  <button className="action-card" onClick={() => navigate('/task3')}>
                    <div className="action-icon">
                      <Plus size={24} />
                    </div>
                    <div className="action-text">
                      <h4>Add Today's Task</h4>
                      <p>Record your daily activities</p>
                    </div>
                  </button>
                  
                  <button className="action-card" onClick={() => navigate('/onsite')}>
                    <div className="action-icon">
                      <Camera size={24} />
                    </div>
                    <div className="action-text">
                      <h4>Add Onsite Task</h4>
                      <p>Document field activities</p>
                    </div>
                  </button>
                </>
              )}
              
              <button className="action-card">
                <div className="action-icon">
                  <Calendar size={24} />
                </div>
                <div className="action-text">
                  <h4>View Schedule</h4>
                  <p>Check upcoming tasks</p>
                </div>
              </button>
              
              <button className="action-card">
                <div className="action-icon">
                  <ClockIcon size={24} />
                </div>
                <div className="action-text">
                  <h4>Time Reports</h4>
                  <p>View your time logs</p>
                </div>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default EmployeeProfile;