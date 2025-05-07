import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Film, Save, X, User, Calendar, FileText, AlertCircle, Search, Trash2 } from 'lucide-react';
import './TaskForm.css';

const Task2 = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    eid: user.employeeId || '',
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
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

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
  const categories = [
    'Haldi',
    'Mehendi',
    'Wedding'
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
      const response = await axios.post('http://localhost:5000/task', formData, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      setMessage('Task submitted successfully!');
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
      setError(err.response?.data?.message || 'Error submitting task');
    } finally {
      setLoading(false);
    }
  };

  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ 
    eid: '', 
    month: new Date().toISOString().slice(0, 7),
    projectname: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      console.log('Fetching projects...');
      const response = await axios.get('http://localhost:5000/api/projects');
      console.log('Projects received:', response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects. Please try again later.');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/tasks', {
        params: {
          eid: filters.eid,
          month: filters.month,
          projectname: filters.projectname
        }
      });
      setTasks(response.data.tasks);
      setTotalPoints(response.data.totalPoints);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({ eid: '', month: new Date().toISOString().slice(0, 7), projectname: '' });
    setTasks([]);
    setTotalPoints(0);
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
                onChange={handleChange}
                disabled
                required
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
                <option value="">Select category</option>
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

export default Task2;