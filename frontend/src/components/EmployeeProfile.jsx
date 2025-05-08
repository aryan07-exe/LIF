import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import NewNavbar from "./NewNavbar";
import { User, Mail, Phone, Award, IdCard, ChevronRight } from "lucide-react";
import styles from "./EmployeeProfile.module.css";

const EmployeeProfile = () => {
  const [user, setUser] = useState(null);
  const nameRef = useRef(null);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  }, []);

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
            <span>Onsite Form</span>
            <ChevronRight size={18} />
          </button>
        )}
        {(access === "postproduction" || access === "both") && (
          <button
            onClick={() => navigate("/postproduction")}
            className={styles.formButton}
          >
            <span>Post Production Form</span>
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <NewNavbar />
      <main className={styles.mainContent}>
        <div className={styles.profileCard} ref={cardRef}>
          <div className={styles.cardHeader}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>
                {user.name?.charAt(0) || "U"}
              </div>
            </div>
            <h2 className={styles.animatedName} ref={nameRef}></h2>
            <div className={styles.employeeRole}>{user.role}</div>
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
              <span className={styles.label}>Employee ID:</span> 
              <span className={styles.value}>{user.employeeId}</span>
            </div>
          </div>
          
          {renderFormButtons()}
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfile;