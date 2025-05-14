import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AddProject.css';
import Navbar from './NewNavbar';

const AddProject = () => {
  const [projectName, setProjectName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!projectName.trim()) {
      setError('Project name is required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://lif.onrender.com/api/projects', {
        projectname: projectName.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        }
      });

      if (response.status === 201) {
        setMessage('Project added successfully!');
        setProjectName('');
        // Redirect to task page after 2 seconds
        setTimeout(() => {
          navigate('/task3');
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding project:', err);
      if (err.response?.status === 409) {
        setError('A project with this name already exists.');
      } else {
        setError(err.response?.data?.message || 'Failed to add project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
      <motion.div 
        className="add-project-container"
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
        <h2>Add New Project</h2>
        <div className="header-divider"></div>
      </motion.div>

      {message && (
        <motion.div 
          className="success-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      <motion.form 
        className="add-project-form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="projectName">
            <FileText size={18} className="field-icon" />
            Project Name
          </label>
          <input
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            required
          />
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
            <span>{loading ? 'Adding Project...' : 'Add Project'}</span>
          </motion.button>
          <motion.button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/task3')}
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

export default AddProject; 