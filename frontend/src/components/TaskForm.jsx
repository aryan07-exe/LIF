import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Film, Save, X, User, Calendar, FileText, Award, AlertCircle } from 'lucide-react';
import './TaskForm.css';

const TaskForm = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    eid: user.employeeId || '',
    ename: user.name || '',
    date: new Date().toISOString().split('T')[0],
    projectname: '',
    projecttype: '',
    projectstatus: '',
    category: '',
    notes: ''
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const projectTypes = [
    'Reel',
    'Teaser',
    'Highlight',
    'Film',
    'Cine Film',
    'Photo Edit',
    'Album Edit',
    'Album Design',
    'Others'
  ];

  const projectStatuses = [
    'Complete',
    'In-Process',
    'In House Correction',
    'Client\'s Correction'
  ];

  const handleChange = (e) => {
    if (e.target.name === 'eid') return; // Prevent manual EID changes
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Validate required fields
      if (!formData.projectname || !formData.date || !formData.projecttype || 
          !formData.projectstatus || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      // Convert date to ISO string
      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString()
      };

      console.log('Submitting form data:', submitData);
      const response = await axios.post('https://lif.onrender.com/task', submitData, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.data);
      setMessage('Task submitted successfully!');
      
      // Reset form except EID and ename
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
        projectname: '',
        projecttype: '',
        projectstatus: '',
        category: '',
        notes: ''
      }));
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <Film size={32} className="logo-icon" />
          <h2 className="form-title">Life in Frames</h2>
          <Camera size={32} className="logo-icon" />
        </div>
        <div className="header-divider"></div>
        <div className="header-subtitle">Create New Task</div>
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
          <h3>Task Details</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="eid">
                <User size={18} className="field-icon" />
                Employee ID
              </label>
              <input
                type="text"
                id="eid"
                name="eid"
                value={formData.eid}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-field">
              <label htmlFor="ename">
                <User size={18} className="field-icon" />
                Employee Name
              </label>
              <input
                type="text"
                id="ename"
                name="ename"
                value={formData.ename}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-field">
              <label htmlFor="date">
                <Calendar size={18} className="field-icon" />
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="projectname">
                <FileText size={18} className="field-icon" />
                Project Name
              </label>
              <input
                type="text"
                id="projectname"
                name="projectname"
                value={formData.projectname}
                onChange={handleChange}
                required
                placeholder="Enter project name"
              />
            </div>

            <div className="form-field">
              <label htmlFor="projecttype">
                <Film size={18} className="field-icon" />
                Project Type
              </label>
              <select
                id="projecttype"
                name="projecttype"
                value={formData.projecttype}
                onChange={handleChange}
                required
              >
                <option value="">Select project type</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="projectstatus">
                <AlertCircle size={18} className="field-icon" />
                Project Status
              </label>
              <select
                id="projectstatus"
                name="projectstatus"
                value={formData.projectstatus}
                onChange={handleChange}
                required
              >
                <option value="">Select project status</option>
                {projectStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="category">
                <FileText size={18} className="field-icon" />
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="notes">
                <FileText size={18} className="field-icon" />
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any additional notes"
                rows="3"
              ></textarea>
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
            <span>{loading ? 'Submitting...' : 'Submit Task'}</span>
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
  );
};

export default TaskForm;