import React, { useState } from 'react';
import './AddUser.css';

const AddUserFull = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', role: 'employee', formAccess: 'both' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add user');
      setSuccess('User added successfully!');
      setForm({ name: '', email: '', password: '', department: '', role: 'employee', formAccess: 'both' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-container">
      <h2>Add New User</h2>
      <form className="add-user-form" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
        <input name="department" value={form.department} onChange={handleChange} placeholder="Department" required />
        <select name="role" value={form.role} onChange={handleChange} required>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <select name="formAccess" value={form.formAccess} onChange={handleChange} required>
          <option value="both">Both</option>
          <option value="onsite">Onsite</option>
          <option value="postproduction">Post Production</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add User'}</button>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
      </form>
    </div>
  );
};

export default AddUserFull;
