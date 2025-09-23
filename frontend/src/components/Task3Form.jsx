import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Film, Save, X, User, Calendar, Clock, Users, FileText } from 'lucide-react';
import './TaskForm.css';
import Navbar from './EmployeeNavbar'; 

const OnsiteForm = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    eid: user.employeeId || '',
    ename: user.name || '',
    projectname: '',
    shootDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    category: '',
    teamNames: '',
    notes: '',
    eventType: '',
  });

  const [projects, setProjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({
      ...prev,
      eid: userData.employeeId || '',
      ename: userData.name || ''
    }));
  }, []);

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

      const response = await axios.get(' https://lif-lkgk.onrender.com/api/projects', {
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
    if (e.target.name === 'eid') return;
    if (e.target.name === 'projectname') {
      handleProjectNameChange(e);
      return;
    }
    
    if (e.target.name === 'eventType') {
      setFormData({
        ...formData,
        eventType: e.target.value
      });
      return;
    }
    if (e.target.name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: e.target.value
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

      if (!formData.eid || !formData.ename || !formData.projectname || !formData.shootDate || !formData.startTime || !formData.endTime || !formData.teamNames) {
        throw new Error('Please fill in all required fields');
      }
      if (!formData.eventType || formData.eventType === '') {
        throw new Error('Please select an event type');
      }
      if (!formData.category || formData.category.trim() === '') {
        throw new Error('Please enter a category');
      }

      const submitData = {
        ...formData,
        shootDate: new Date(formData.shootDate).toISOString(),
      };

      console.log('Submitting onsite task payload:', submitData);
      const response = await axios.post(' https://lif-lkgk.onrender.com/onsiteTask', submitData, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.data);
      alert('Onsite task submitted successfully!');
      
      setFormData(prev => ({
        ...prev,
        projectname: '',
        shootDate: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        category: '',
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
    <>
      <Navbar />
      <div className="form-page">
        <div className="form-container">
          <div className="form-header">
            <h1>Daily Shoot Schedule</h1>
            <p>Submit your daily shooting schedule and task details</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="task-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Employee Information</h2>
              <div className="form-field">
                <label htmlFor="eid">Employee ID</label>
                <input
                  type="text"
                  id="eid"
                  name="eid"
                  value={formData.eid}
                  disabled
                  className="disabled-field"
                />
              </div>
              <div className="form-field">
                <label htmlFor="ename">Employee Name</label>
                <input
                  type="text"
                  id="ename"
                  name="ename"
                  value={formData.ename}
                  disabled
                  className="disabled-field"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Project Details</h2>
              <div className="form-field">
                <label htmlFor="projectname">Project Name *</label>
                <div className="suggestion-wrapper">
                  <input
                    type="text"
                    id="projectname"
                    name="projectname"
                    value={formData.projectname}
                    onChange={handleProjectNameChange}
                    required
                    placeholder="Enter project name"
                    disabled={isLoadingProjects}
                  />
                  {isLoadingProjects && <span className="loading">Loading...</span>}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="suggestions">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Schedule Information</h2>
              <div className="form-field">
                <label htmlFor="shootDate">Shoot Date *</label>
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
                <label htmlFor="startTime">Start Time *</label>
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
                <label htmlFor="endTime">End Time *</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Event Details</h2>
              <div className="form-field">
                <label htmlFor="eventType">Event Type *</label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select event type</option>
                  <option value="micro">Micro</option>
                  <option value="small">Small</option>
                  <option value="wedding half day">Wedding Half Day</option>
                  <option value="wedding full day">Wedding Full Day</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="category">Category *</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter event category"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="teamNames">Team Members *</label>
                <input
                  type="text"
                  id="teamNames"
                  name="teamNames"
                  value={formData.teamNames}
                  onChange={handleChange}
                  placeholder="Enter team members' names"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Additional Information</h2>
              <div className="form-field">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter any additional notes or comments"
                  rows="4"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Schedule'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default OnsiteForm;