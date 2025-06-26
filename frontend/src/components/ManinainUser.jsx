import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManinainUser = () => {
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

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Manage Users</h2>
      {users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.employeeId}</td>
                <td>
                  <button
                    onClick={() => removeUser(user._id)}
                    disabled={removingUserId === user._id}
                    style={{ color: 'white', background: 'red', border: 'none', padding: '6px 12px', cursor: 'pointer' }}
                  >
                    {removingUserId === user._id ? 'Removing...' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManinainUser;
