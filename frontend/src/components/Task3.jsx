import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Film, Save, X, User, Calendar, FileText, AlertCircle } from 'lucide-react';
import './TaskForm.css';
import Navbar from './EmployeeNavbar';

const Taskname = () => {
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

  const [projects, setProjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const projectTypes = [
    'Reel',
    'Teaser',
    'Wedding Highlight',
    'Wedding Long Film',
    'Wedding Cine Film',
    'Event Highlight',
    'Event Film',
    'Wedding Photo Edit',
    'Event Photo Edit',
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
  const categories = [
    'Haldi',
    'Mehendi',
    'Wedding'
  ];

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

      const response = await axios.get('https://lif.onrender.com/api/projects', {
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

  const handleProjectNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      projectname: value
    }));

    if (value.length >= 2) {
      const filteredProjects = projects.filter(project => 
        project.projectname.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredProjects.map(project => project.projectname));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      projectname: suggestion
    }));
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    if (e.target.name === 'eid') return; // Prevent manual EID changes
    if (e.target.name === 'projectname') {
      handleProjectNameChange(e);
      return;
    }
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

      console.log('Submitting form data:', formData);
      const response = await axios.post('https://lif.onrender.com/task', formData, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.data);
      alert('Task submitted successfully!');
      // Reset form except EID and date
      setFormData(prev => ({
        ...prev,
        projectname: '',
        projecttype: '',
        projectstatus: '',
        category: '',
        notes: ''
      }));
    } catch (err) {
      console.error('Submission error:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || err.response.data || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check if the server is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
    <div className="task3-container">
     
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
            {/* <Film size={32} className="logo-icon" /> */}
           <div className="header-subtitle"><h2>DAILY WORK</h2></div>
            {/* <Camera size={32} className="logo-icon" /> */}
          </div>
          <div className="header-divider"></div>
          {/* <div className="header-subtitle">Create New Task</div> */}
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
                <div className="suggestion-container">
                  <input
                    type="text"
                    id="projectname"
                    name="projectname"
                    value={formData.projectname}
                    onChange={handleProjectNameChange}
                    required
                    placeholder="Enter Project Name"
                    autoComplete="off"
                    disabled={isLoadingProjects}
                  />
                  {isLoadingProjects && (
                    <div className="loading-text">Loading Projects...</div>
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="suggestions-list">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="suggestion-item"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
                  <option value="">Select Project Type</option>
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
                  <option value="">Select Project Status</option>
                  {projectStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="category">
                  <AlertCircle size={18} className="field-icon" />
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
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
                  placeholder="Enter Project Status/Notes"
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
    </div></> 
  );
};

export default Taskname;