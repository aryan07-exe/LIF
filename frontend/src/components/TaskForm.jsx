import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Film, Save, X, User, Calendar, FileText, Award, AlertCircle } from 'lucide-react';
import './TaskForm.css';

const TaskForm = () => {
  const [formData, setFormData] = useState({
    eid: '',
    date: new Date().toISOString().split('T')[0],
    projectname: '',
    projecttype: '',
    projectstatus: '',
    note: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ success: false, message: '' });

    try {
      await axios.post('http://localhost:5000/task', formData);
      setSubmitStatus({
        success: true,
        message: 'Task created successfully!'
      });
      // Reset form
      setFormData({
        eid: '',
        date: new Date().toISOString().split('T')[0],
        projectname: '',
        projecttype: '',
        projectstatus: '',
        note: ''
      });
    } catch (error) {
      console.error('Error creating task:', error);
      setSubmitStatus({
        success: false,
        message: 'Error creating task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
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
                onChange={handleChange}
                required
                placeholder="Enter employee ID"
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

            <div className="form-field full-width">
              <label htmlFor="note">
                <FileText size={18} className="field-icon" />
                Notes
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Enter any additional notes"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        {submitStatus.message && (
          <motion.div 
            className={`status-message ${submitStatus.success ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {submitStatus.message}
          </motion.div>
        )}

        <div className="form-actions">
          <motion.button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={18} />
            <span>{isSubmitting ? 'Submitting...' : 'Create Task'}</span>
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
