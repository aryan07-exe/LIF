import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ViewUsersFull.module.css';
import Navbar from './NewNavbar';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Use the /api/users endpoint to get all user details (public)
        const response = await axios.get('https://lif.onrender.com/api/users');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users.');
      }
    };
    fetchUsers();
  }, []);

  // Filter users by search
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className={styles.pageBg}>
        <div className={styles.cardContainer}>
          <div className={styles.headerRow}>
            <h2 className={styles.title}>All Users</h2>
            <div className={styles.searchBar}>
              <svg className={styles.searchIcon} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search by name or employee ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.userActionGroup}>
              <button className={styles.userActionBtn} type="button">Add User</button>
              <button className={styles.userActionBtn + ' ' + styles.removeBtn} type="button">Remove User</button>
            </div>
          </div>
          {error && <div className={styles['error-message']}>{error}</div>}
          {filteredUsers.length === 0 && !error && <div className={styles['noUsers']}>No users found.</div>}

          {filteredUsers.length > 0 && (
            <div className={styles['user-table-container']}>
              <table className={styles['user-table']}>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Form Access</th>
                    <th>Password</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id} className={styles['user-row']}>
                      <td data-label="Employee ID"><span className={styles['eid-badge']}>{user.employeeId}</span></td>
                      <td data-label="Name"><span className={styles['user-name']}>{user.name}</span></td>
                      <td data-label="Email">{user.email || <span className={styles['muted']}>-</span>}</td>
                      <td data-label="Department">{user.department || <span className={styles['muted']}>-</span>}</td>
                      <td data-label="Role"><span className={styles['role-pill']}>{user.role || <span className={styles['muted']}>-</span>}</span></td>
                      <td data-label="Form Access">{user.formAccess || <span className={styles['muted']}>-</span>}</td>
                      <td data-label="Password">{user.password || <span className={styles['muted']}>-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewUsers;
