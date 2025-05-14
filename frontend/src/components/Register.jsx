import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UserPlus, Save, X, User, Lock, Building, Mail } from 'lucide-react';
import './TaskForm.css';
import Navbar from './NewNavbar'
import { useNavigate } from 'react-router-dom';
import './Register.css';


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    name: '',
    department: '',
    role: 'employee',
    formAccess: 'both'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://lif.onrender.com/api/auth/register', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setMessage('User registered successfully!');
      // Reset form
      setFormData({
        employeeId: '',
        email: '',
        password: '',
        name: '',
        department: '',
        role: 'employee',
        formAccess: 'both'
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Error registering user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <motion.div 
      className="task-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="form-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="logo-container">
          <UserPlus size={32} className="logo-icon" />
          <h2 className="form-title">Register New User</h2>
          <UserPlus size={32} className="logo-icon" />
        </div>
        <div className="header-divider"></div>
        <div className="header-subtitle">Add New Employee</div>
      </motion.div>

      {message && <motion.div 
        className="success-message"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {message}
      </motion.div>}
      {error && <motion.div 
        className="error-message"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {error}
      </motion.div>}

      <motion.form 
        className="task-form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
      >
        <div className="form-section">
          <h3>User Details</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="employeeId">
                <User size={18} className="field-icon" />
                Employee ID
              </label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                placeholder="Enter employee ID"
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">
                <Mail size={18} className="field-icon" />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>

            <div className="form-field">
              <label htmlFor="name">
                <User size={18} className="field-icon" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">
                <Lock size={18} className="field-icon" />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
            </div>

            <div className="form-field">
              <label htmlFor="department">
                <Building size={18} className="field-icon" />
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                placeholder="Enter department"
              />
            </div>

            <div className="form-field">
              <label htmlFor="role">
                <User size={18} className="field-icon" />
                Role
              </label>
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

            <div className="form-field">
              <label htmlFor="formAccess">
                <User size={18} className="field-icon" />
                Form Access
              </label>
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
          </div>
        </div>

        <div className="form-actions">
          <motion.button
            type="submit"
            className="submit-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={18} />
            <span>{loading ? 'Registering...' : 'Register User'}</span>
          </motion.button>
          <motion.button
            type="button"
            className="cancel-btn"
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X size={18} />
            <span>Cancel</span>
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
    </>
  );
};

export default Register; 