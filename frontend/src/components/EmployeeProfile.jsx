import React, { useEffect, useState, useRef } from "react";
// AssignedTaskList replaced by inline block below

import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import EmployeeNavbar from "./EmployeeNavbar";

import { User, Mail, Phone, Award, IdCard, ChevronRight } from "lucide-react";
import LifFooter from './LifFooter';
import styles from "./EmployeeProfile.module.css";
import TaskCalendar from "./EmployeeCalendar";
import OnsiteCalendar from "./OnsiteCalender";
import axios from 'axios';

const EmployeeProfile = () => {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };
  const nameRef = useRef(null);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  }, []);

  // Monthly assignments feature removed — backend endpoints deleted.

  useEffect(() => {
    if (user?.name && nameRef.current) {
      // Animate name with letter-by-letter animation
      const name = user.name;
      nameRef.current.innerHTML = '';
      name.split('').forEach((letter, i) => {
        const span = document.createElement('span');
        span.textContent = letter === ' ' ? '\u00A0' : letter; // Use non-breaking space for spaces
        span.className = styles.letter;
        // Add a simpler data attribute for selecting
        span.setAttribute('data-letter', 'true');
        nameRef.current.appendChild(span);
      });
      
      // Use a correct selector for GSAP animation that doesn't rely on CSS module class name
      gsap.fromTo(
        nameRef.current.querySelectorAll('[data-letter="true"]'),
        { opacity: 0, x: -40, y: 10 },
        { 
          opacity: 1, 
          x: 0, 
          y: 0,
          duration: 0.5, 
          stagger: 0.06, 
          ease: "back.out(1.7)" 
        }
      );
    }

    // Card entry animation
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.3 }
      );
    }
  }, [user?.name]);

  if (!user) return (
    <div className={styles.loadingBg}>
      <div className={styles.loadingSpinner}></div>
    </div>
  );

  // Render form buttons based on access
  const renderFormButtons = () => {
    const access = user.formAccess;
    return (
      <div className={styles.buttonRow}>
        {(access === "onsite" || access === "both") && (
          <button
            onClick={() => navigate("/onsite")}
            className={styles.formButton}
          >
            <span>Shoot Report</span>
            <ChevronRight size={14} />
          </button>
        )}
        {(access === "postproduction" || access === "both") && (
          <button
            onClick={() => navigate("/task3")}
            className={styles.formButton}
          >
            <span>Daily Report</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    );
  };

  // Render calendar cards based on form access
  const renderCalendarCards = () => {
    const access = user?.formAccess;
    if (access === 'postproduction') {
      return (
        <div>
          <TaskCalendar />
        </div>
      );
    } else if (access === 'onsite') {
      return (
        <div>
          <OnsiteCalendar />
        </div>
      );
    } else if (access === 'both') {
      return (
        <>
          <div>
            <TaskCalendar />
          </div>
          <div>
            <OnsiteCalendar />
          </div>
        </>
      );
    } else {
      return null;
    }
  };

  return (
    <>
      <EmployeeNavbar onLogout={handleLogout} formAccess={user?.formAccess} />
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          {/* Profile Card Section */}
          <div className={styles.profileCard} ref={cardRef}>
            <div className={styles.cardHeader}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  {/* Optionally, add a profile image here if available in user.profileImage */}
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                  ) : (
                    user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || "U"
                  )}
                </div>
              </div>
              <div className={styles.profileName}>{user.name}</div>
            </div>
            <div className={styles.cardDivider}></div>
            <div className={styles.detailsContainer}>
              <div className={styles.infoRow}>
                <Mail className={styles.infoIcon} size={20} />
                <span className={styles.label}>Email:</span> 
                <span className={styles.value}>{user.email}</span>
              </div>
              <div className={styles.infoRow}>
                <Phone className={styles.infoIcon} size={20} />
                <span className={styles.label}>Phone:</span> 
                <span className={styles.value}>{user.phone}</span>
              </div>
             
              <div className={styles.infoRow}>
                <IdCard className={styles.infoIcon} size={20} />
                <span className={styles.label}>Employee ID:</span> 
                <span className={styles.value}>{user.employeeId}</span>
              </div>
            </div>
            {renderFormButtons()}
          </div>

          {/* Calendar Section - styled to match profile card */}
          {renderCalendarCards()}
          {/* Assigned tasks for employee (inline) */}
            <div className={styles.assignmentsCard}>
              <div className={styles.assignmentsHeader}>
                <div>
                  <div className={styles.assignmentsTitle}>Assigned Tasks</div>
                  <div className={styles.assignmentsSubtle}>Tasks assigned to you by month</div>
                </div>
              </div>
              <div className={styles.assignmentsBody}>
                <InlineAssignedTasks />
              </div>
            </div>
        </main>
      </div>
    </>
  );
};

function InlineAssignedTasks() {
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const directEid = localStorage.getItem('eid') || localStorage.getItem('employeeId');
    let eid = directEid;
    if (!eid) {
      try {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          eid = user.employeeId || user.eid || user.employee_id;
        }
      } catch (_) {}
    }
    if (!eid) {
      setError('Employee ID not found');
      return;
    }
    fetchAssigned(eid);
  }, []);

  const fetchAssigned = async (eid) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${' https://lif-lkgk.onrender.com'}/api/assigned-task?eid=${encodeURIComponent(eid)}`, { headers });
      if (!res.ok) {
        setError('Failed to load assigned tasks');
        setTasks([]);
        return;
      }
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching assigned tasks', err);
      setError('Error fetching assigned tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className={styles.assignmentsEmpty}>{error}</div>;
  if (loading) return <div className={styles.assignmentsEmpty}>Loading...</div>;
  if (!tasks || tasks.length === 0) return <div className={styles.assignmentsEmpty}>No assigned tasks found.</div>;

  return (
    <table className={styles.assignmentsTable}>
      <thead>
        <tr>
          <th className={styles.colProjectType}>Month</th>
          <th className={styles.colProjectType}>Project Type</th>
          <th className={styles.colAssigned}>Assigned</th>
          <th className={styles.colCompleted}>Completed</th>
          <th className={styles.colActions}></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t, i) => (
          <tr key={`${t._id}::${t.projectType}::${i}`}>
            <td>{t.year}-{String(t.month).padStart(2,'0')}</td>
            <td style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 800, color: 'var(--accent-2)' }}>{t.projectType}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{/* optional subtitle */}</div>
              </div>
            </td>
            <td style={{ textAlign: 'center' }}>
              <span className={`${styles.pill} ${styles.assigned}`}>{t.assigned}</span>
            </td>
            <td style={{ textAlign: 'center' }}>
              <span className={`${styles.pill} ${styles.completed}`}>{t.completed}</span>
            </td>
            <td className={styles.colActions}>
              <button className={styles.tinyBtn} title="Details">View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EmployeeProfile;