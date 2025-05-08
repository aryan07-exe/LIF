import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Bell, Home, Globe } from 'lucide-react';
import gsap from 'gsap';
import './EmployeeProfile.css';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser.employeeId) {
      navigate('/');
      return;
    }
    setUser(storedUser);
    // GSAP name animation
    if (nameRef.current) {
      const name = storedUser?.name || 'User';
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
        { opacity: 0, y: 20, rotateX: -90, scale: 0.5 },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.7)' }
      );
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="modern-profile dark-theme">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-icons">
          <button className="sidebar-icon active"><Home size={22} /></button>
          <button className="sidebar-icon"><Globe size={22} /></button>
          <button className="sidebar-icon"><Settings size={22} /></button>
          <button className="sidebar-icon"><User size={22} /></button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="search-bar">
            <input type="text" placeholder="Search" />
            <span className="search-icon">🔍</span>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn"><Bell size={20} /></button>
            <div className="user-info">
              <img src={user?.photoUrl || 'https://i.pravatar.cc/100'} alt="avatar" className="user-avatar" />
              <div className="user-meta">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-type">{user?.role || 'Employee'}</span>
              </div>
              <button className="icon-btn logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/'); }}><LogOut size={18} /></button>
            </div>
          </div>
        </header>

        {/* Profile Section */}
        <div className="profile-section">
          {/* Profile Card */}
          <div className="profile-card-modern">
            <div className="profile-avatar-modern">
              <img src={user?.photoUrl || 'https://i.pravatar.cc/200'} alt="Profile" />
            </div>
            <div className="profile-main-info">
              <h2 ref={nameRef} className="profile-name-modern"></h2>
              <span className="profile-status">{user?.status || 'Active'}</span>
            </div>
          </div>

          {/* Employee Details Card */}
          <div className="details-card">
            <div className="details-col">
              <div className="detail-label">Employee ID</div>
              <div className="detail-value">{user?.employeeId || 'N/A'}</div>
              <div className="detail-label">Department</div>
              <div className="detail-value">{user?.department || 'N/A'}</div>
              <div className="detail-label">Email</div>
              <div className="detail-value">{user?.email || 'N/A'}</div>
              <div className="detail-label">Joining Date</div>
              <div className="detail-value">{user?.joiningDate || 'N/A'}</div>
              <div className="detail-label">Badges</div>
              <div className="detail-value"><span className="badge">Top Performer</span></div>
            </div>
            <div className="details-col">
              <div className="detail-label">Current Project</div>
              <div className="detail-value">{user?.currentProject || 'N/A'}</div>
              <div className="detail-label">Project Role</div>
              <div className="detail-value">{user?.projectRole || user?.role || 'N/A'}</div>
              <div className="detail-label">Points</div>
              <div className="detail-value">{user?.points || 'N/A'}</div>
              <div className="detail-label">Availability</div>
              <div className="detail-value"><span className="availability available">{user?.availability || 'Available'}</span></div>
              <div className="detail-label">Tags</div>
              <div className="detail-value">{user?.tags ? user.tags.join(', ') : '#TeamLead, #Remote'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;