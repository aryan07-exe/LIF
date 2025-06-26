import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ViewUsersFull.module.css';

const RemoveUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingUserId, setRemovingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // Use the same logic as ViewUsersFull
      const res = await axios.get('https://lif.onrender.com/api/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users.');
    }
    setLoading(false);
  };


  const removeUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    setRemovingUserId(id);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://lif.onrender.com/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove user');
    }
    setRemovingUserId(null);
  };

  if (loading) return <div className={styles['loading-message']}>Loading users...</div>;
  if (error) return <div className={styles['error-message']}>{error}</div>;

  return (
    <div className={styles.pageBg}>
      <div className={styles.cardContainer}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Remove Users</h2>
        </div>
        {users.length === 0 ? (
          <div className={styles.noUsers}>No users found.</div>
        ) : (
          <div className={styles['user-table-container']}>
            <table className={styles['user-table']}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Employee ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className={styles['user-row']}>
                    <td data-label="Name"><span className={styles['user-name']}>{user.name}</span></td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="Role"><span className={styles['role-pill']}>{user.role}</span></td>
                    <td data-label="Employee ID"><span className={styles['eid-badge']}>{user.employeeId}</span></td>
                    <td>
                      <button
                        className={styles['remove-btn']}
                        onClick={() => removeUser(user._id)}
                        disabled={removingUserId === user._id}
                      >
                        {removingUserId === user._id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveUser;
