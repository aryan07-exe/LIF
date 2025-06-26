import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ViewUsersFull.module.css';
import NewNavbar from './NewNavbar';

const MaintainUser = () => {
  const navigate = useNavigate();
  return (
    <>
      <NewNavbar />
      <div className={styles.pageBg}>
        <div className={styles.cardContainer} style={{ maxWidth: 500, marginTop: '3rem', padding: '2rem 2.5rem', textAlign: 'center' }}>
          <h2 className={styles.title} style={{ marginBottom: '2rem' }}>User Management</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <button
              className={styles['remove-btn']}
              style={{ fontSize: '1.1rem', background: '#6c0428', marginBottom: 0 }}
              onClick={() => navigate('/view-users-full')}
            >
              View Users
            </button>
            <button
              className={styles['remove-btn']}
              style={{ fontSize: '1.1rem', marginBottom: 0 }}
              onClick={() => navigate('/remove-user')}
            >
              Remove Users
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MaintainUser;
