import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, Award, Search, Trash2 } from 'lucide-react';
import './AdminPanel.css';
import Navbar from './Navbar';

const AdminPanel = () => {

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    eid: '',
    date: getCurrentDate(),
    projecttype: '',
    projectstatus: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [availableFilters, setAvailableFilters] = useState({
    eids: [],
    projectTypes: [],
    projectStatuses: []
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching tasks with filters:", filters);
      
      // If no filters are applied, fetch today's tasks
      if (!filters.eid && !filters.projecttype && !filters.projectstatus && 
          filters.date === getCurrentDate()) {
        console.log("Fetching today's tasks");
        const response = await axios.get('http://localhost:5000/tasks/today');
        console.log("Today's tasks response:", response.data);
        setTasks(response.data.tasks || []);
        setTotalPoints(response.data.totalPoints || 0);
        setAvailableFilters(response.data.filters || {
          eids: [],
          projectTypes: [],
          projectStatuses: []
        });
        return;
      }

      // Otherwise, fetch filtered tasks
      console.log("Fetching filtered tasks");
      const response = await axios.get('http://localhost:5000/admin/tasks', {
        params: {
          ...filters,
          date: filters.date || undefined
        }
      });
      
      console.log("Filtered tasks response:", response.data);
      setTasks(response.data.tasks || []);
      setTotalPoints(response.data.totalPoints || 0);
      setAvailableFilters(response.data.filters || {
        eids: [],
        projectTypes: [],
        projectStatuses: []
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setTotalPoints(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleClear = () => {
    setFilters({
      eid: '',
      date: getCurrentDate(),
      projecttype: '',
      projectstatus: ''
    });
  };

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    if (isNaN(date)) return 'Invalid date';

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Complete': 'var(--success-color)',
      'In-Process': 'var(--warning-color)',
      'In House Correction': 'var(--info-color)',
      'Client\'s Correction': 'var(--danger-color)'
    };
    return statusColors[status] || 'var(--text-color)';
  };

  return (
    <>
      <Navbar />
      <motion.div 
        className="admin-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="dashboard-title"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Admin Dashboard
        </motion.h2>

        <motion.div 
          className="points-summary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="points-card">
            <Award size={40} className="points-icon" />
            <div className="points-info">
              <h3>Total Points</h3>
              <p>{totalPoints}</p>
            </div>
          </div>
        </motion.div>

        <motion.form 
          className="filter-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
        >
          <div className="input-group">
            <input
              type="text"
              name="eid"
              placeholder="Search by Employee ID"
              value={filters.eid}
              onChange={handleFilterChange}
            />
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="button-group">
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search size={16} style={{ marginRight: '8px' }} />
              Search
            </motion.button>
            <motion.button 
              type="button"
              className="clear-btn"
              onClick={handleClear}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 size={16} style={{ marginRight: '8px' }} />
              Clear
            </motion.button>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              className="loading-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Loading...
            </motion.div>
          ) : (
            <motion.div 
              className="table-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {tasks.length > 0 ? (
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Date</th>
                      <th>Project Name</th>
                      <th>Project Type</th>
                      <th>Status</th>
                      <th>Points</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <td>{task.eid}</td>
                        <td>{formatDate(task.date)}</td>
                        <td>{task.projectname}</td>
                        <td>
                          <span className="project-type-badge">
                            {task.projecttype}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(task.projectstatus) }}
                          >
                            {task.projectstatus}
                          </span>
                        </td>
                        <td>
                          <span className="points-badge">
                            {task.points || 0}
                          </span>
                        </td>
                        <td>{task.note || '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <motion.p 
                  className="no-tasks-msg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  No tasks found matching the filters.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default AdminPanel;