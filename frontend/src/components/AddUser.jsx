import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddUser.css';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    formAccess: 'both' // Default to both forms
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://lif.onrender.com/users', formData, {
        headers: {
          'Authorization': token
        }
      });

      if (response.data.success) {
        setSuccess('User added successfully!');
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'employee',
          formAccess: 'both'
        });
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  return (
    <div className="add-user-container">
      <h2>Add New User</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="formAccess">Form Access:</label>
          <select
            id="formAccess"
            name="formAccess"
            value={formData.formAccess}
            onChange={handleChange}
            required
          >
            <option value="postproduction">Post Production Only</option>
            <option value="onsite">Onsite Only</option>
            <option value="both">Both Forms</option>
          </select>
        </div>

        <button type="submit" className="submit-button">Add User</button>
      </form>
    </div>
  );
};

export default AddUser; 