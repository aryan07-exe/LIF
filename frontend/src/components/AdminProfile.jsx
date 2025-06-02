import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

import { User, Mail, Phone, Award, IdCard, ChevronRight, Users, BarChart3, Settings, FileText, Database } from "lucide-react";
import Navbar from "./NewNavbar";
import Calendar from "./EmployeeCalendar";
import styles from "./AdminProfile.module.css";

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const nameRef = useRef(null);
  const cardRef = useRef(null);
  const actionsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);

    // Redirect if not admin
    if (userData?.role !== 'admin') {
      navigate('/employee-profile');
    }
  }, [navigate]);

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

    // Actions animation
    if (actionsRef.current) {
      gsap.fromTo(
        actionsRef.current.querySelectorAll(`.${styles.actionCard}`),
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5, 
          stagger: 0.1, 
          ease: "back.out(1.7)",
          delay: 0.6
        }
      );
    }
  }, [user?.name]);

  if (!user) return (
    <div className={styles.loadingBg}>
      <div className={styles.loadingSpinner}></div>
    </div>
  );

  // Admin routes that the user can navigate to
  const adminActions = [
    { 
      title: "AddUsers", 
      icon: <Users size={24} />, 
      description: "Add, edit or remove users from the system", 
      route: "/register"
    },
    { 
      title: "View Postproduction Reports", 
      icon: <BarChart3 size={24} />, 
      description: "Access analytics and performance reports", 
      route: "/post-production-monthly" 
    },
 
    { 
      title: "Add Projects", 
      icon: <Database size={24} />, 
      description: "Add or edit projects in the system", 
      route: "/add-project" 
    },
     
    { 
      title: "Onsite Reports", 
      icon: <FileText size={24} />, 
      description: "Manage onsite forms and submissions", 
      route: "/onsite-admin" 
    }
  ];

  return (
    <>
    <Navbar />
    <div className={styles.pageContainer}>
       
      <main className={styles.mainContent}>
        <div className={styles.adminDashboard}>
          <div className={styles.profileCard} ref={cardRef}>
            <div className={styles.cardHeader}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  {user.name?.charAt(0) || "A"}
                </div>
              </div>
              <h2 className={styles.animatedName} ref={nameRef}></h2>
              <div className={styles.adminBadge}>Administrator</div>
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
                <Award className={styles.infoIcon} size={20} />
                <span className={styles.label}>Role:</span> 
                <span className={styles.value}>{user.role}</span>
              </div>
              
              <div className={styles.infoRow}>
                <IdCard className={styles.infoIcon} size={20} />
                <span className={styles.label}>Admin ID:</span> 
                <span className={styles.value}>{user.employeeId}</span>
              </div>
            </div>
          </div>

          <div className={styles.actionsContainer} ref={actionsRef}>
            <h3 className={styles.actionsTitle}>Admin Actions</h3>
            <div className={styles.actionCards}>
              {adminActions.map((action, index) => (
                <div 
                  key={index} 
                  className={styles.actionCard}
                  onClick={() => navigate(action.route)}
                >
                  <div className={styles.actionIcon}>
                    {action.icon}
                  </div>
                  <div className={styles.actionContent}>
                    <h4 className={styles.actionTitle}>{action.title}</h4>
                    <p className={styles.actionDescription}>{action.description}</p>
                  </div>
                  <ChevronRight size={20} className={styles.actionArrow} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
    <div className={styles.calendarContainer}>
      <Calendar />
    </div>
    </>
  );
};

export default AdminProfile; 