import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Film, Save, X, User, Calendar, Clock, Users, FileText } from 'lucide-react';
import './TaskForm.css';

const OnsiteForm = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    eid: user.employeeId || '',
    ename: user.name || '',
    projectname: '',
    shootDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    categories: {
      weddingCeremony: false,
      engagementSangeet: false,
      haldiGrahShanti: false,
      preWedding: false,
      birthdayAnniversaryFamily: false,
      corporateEvent: false
    },
    teamNames: '',
    notes: ''
  });

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Add useEffect to update form data when user data changes
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({
      ...prev,
      eid: userData.employeeId || '',
      ename: userData.name || ''
    }));
  }, []);

  // Add useEffect to fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': token
        }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects. Please try again later.');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'eid') return; // Prevent manual EID changes
    
    if (e.target.name.startsWith('categories.')) {
      const categoryName = e.target.name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [categoryName]: e.target.checked
        }
      }));
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
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
      if (!formData.projectname || !formData.shootDate || !formData.startTime || 
          !formData.endTime || !formData.teamNames) {
        throw new Error('Please fill in all required fields');
      }

      // Validate at least one category is selected
      const hasSelectedCategory = Object.values(formData.categories).some(value => value);
      if (!hasSelectedCategory) {
        throw new Error('Please select at least one category');
      }

      console.log('Submitting form data:', formData);
      const response = await axios.post('http://localhost:5000/onsiteTask', formData, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.data);
      setMessage('Onsite task submitted successfully!');
      
      // Reset form except EID and ename
      setFormData(prev => ({
        ...prev,
        projectname: '',
        shootDate: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        categories: {
          weddingCeremony: false,
          engagementSangeet: false,
          haldiGrahShanti: false,
          preWedding: false,
          birthdayAnniversaryFamily: false,
          corporateEvent: false
        },
        teamNames: '',
        notes: ''
      }));
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit onsite task. Please try again.');
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
        <div className="header-subtitle">Create New Onsite Task</div>
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
              <label htmlFor="projectname">
                <FileText size={18} className="field-icon" />
                Project Name
              </label>
              <select
                id="projectname"
                name="projectname"
                value={formData.projectname}
                onChange={handleChange}
                required
                disabled={isLoadingProjects}
              >
                <option value="">Select Project</option>
                {isLoadingProjects ? (
                  <option disabled>Loading projects...</option>
                ) : projects.length > 0 ? (
                  projects.map((project) => (
                    <option key={project._id} value={project.projectname}>
                      {project.projectname}
                    </option>
                  ))
                ) : (
                  <option disabled>No projects available</option>
                )}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="shootDate">
                <Calendar size={18} className="field-icon" />
                Shoot Date
              </label>
              <input
                type="date"
                id="shootDate"
                name="shootDate"
                value={formData.shootDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="startTime">
                <Clock size={18} className="field-icon" />
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="endTime">
                <Clock size={18} className="field-icon" />
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="teamNames">
                <Users size={18} className="field-icon" />
                Team Names
              </label>
              <input
                type="text"
                id="teamNames"
                name="teamNames"
                value={formData.teamNames}
                onChange={handleChange}
                required
                placeholder="Enter team members' names"
              />
            </div>

            <div className="form-field full-width">
              <label>Categories</label>
              <div className="categories-grid">
                <div className="category-checkbox">
                  <input
                    type="checkbox"
                    id="weddingCeremony"
                    name="categories.weddingCeremony"
                    checked={formData.categories.weddingCeremony}
                    onChange={handleChange}
                  />
                  <label htmlFor="weddingCeremony">Wedding Ceremony</label>
                </div>
                <div className="category-checkbox">
                  <input
                    type="checkbox"
                    id="engagementSangeet"
                    name="categories.engagementSangeet"
                    checked={formData.categories.engagementSangeet}
                    onChange={handleChange}
                  />
                  <label htmlFor="engagementSangeet">Engagement/Sangeet</label>
                </div>
                <div className="category-checkbox">
                  <input
                    type="checkbox"
                    id="haldiGrahShanti"
                    name="categories.haldiGrahShanti"
                    checked={formData.categories.haldiGrahShanti}
                    onChange={handleChange}
                  />
                  <label htmlFor="haldiGrahShanti">Haldi/Grah Shanti</label>
                </div>
                <div className="category-checkbox">
                  <input
                    type="checkbox"
                    id="preWedding"
                    name="categories.preWedding"
                    checked={formData.categories.preWedding}
                    onChange={handleChange}
                  />
                  <label htmlFor="preWedding">Pre-Wedding</label>
                </div>
                <div className="category-checkbox">
                  <input
                    type="checkbox"
                    id="birthdayAnniversaryFamily"
                    name="categories.birthdayAnniversaryFamily"
                    checked={formData.categories.birthdayAnniversaryFamily}
                    onChange={handleChange}
                  />
                  <label htmlFor="birthdayAnniversaryFamily">Birthday/Anniversary/Family</label>
                </div>
                <div className="category-checkbox">
                  <input
                    type="checkbox"
                    id="corporateEvent"
                    name="categories.corporateEvent"
                    checked={formData.categories.corporateEvent}
                    onChange={handleChange}
                  />
                  <label htmlFor="corporateEvent">Corporate Event</label>
                </div>
              </div>
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

export default OnsiteForm;