import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AddUser.css'; // Reuse the same CSS for styling
import Navbar from './NewNavbar';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

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

  return (
    <>
      <Navbar />
      <div className="add-user-container">
        <h2>All Users</h2>
        {/* Debug: Show the raw users object */}
        <pre style={{background:'#eee',padding:'1em',overflow:'auto'}}>{JSON.stringify(users, null, 2)}</pre>
        {error && <div className="error-message">{error}</div>}
        {users.length === 0 && !error && <div>No users found.</div>}

        {users.length > 0 && (
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Form Access</th>
                  <th>_id</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.employeeId}</td>
                    <td>{user.name}</td>
                    <td>{user.email || '-'}</td>
                    <td>{user.department || '-'}</td>
                    <td>{user.role || '-'}</td>
                    <td>{user.formAccess || '-'}</td>
                    <td>{user._id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewUsers;
