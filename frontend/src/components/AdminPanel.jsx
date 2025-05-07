import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, Award, Search, Trash2, Download } from 'lucide-react';
import './AdminPanel.css';
import Navbar from './Navbar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
};

const exportToExcel = (tasks, fileName) => {
  try {
    if (!tasks || !Array.isArray(tasks)) {
      throw new Error('Invalid tasks data');
    }

    // Format the tasks data
    const formattedTasks = tasks.map(task => ({
      'Employee ID': task.eid || 'N/A',
      'Employee Name': task.ename || 'N/A',
      'Date': formatDate(task.date),
      'Project Name': task.projectname || 'N/A',
      'Project Type': task.projecttype || 'N/A',
      'Project Status': task.projectstatus || 'N/A',
      'Category': task.category || 'N/A',
      'Points': task.points || 0,
      'Notes': task.note || 'N/A'
    }));

    if (formattedTasks.length === 0) {
      throw new Error('No tasks to export');
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedTasks);
    
    // Set column widths
    const columnWidths = {
      'A': 15, // Employee ID
      'B': 20, // Employee Name
      'C': 12, // Date
      'D': 25, // Project Name
      'E': 15, // Project Type
      'F': 15, // Project Status
      'G': 15, // Category
      'H': 10, // Points
      'I': 30  // Notes
    };
    
    worksheet['!cols'] = Object.values(columnWidths).map(width => ({ wch: width }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    
    // Save the file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = `${fileName || 'Admin-Tasks-Export'}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert(`Error exporting to Excel: ${error.message}`);
  }
};

const formatDateForFilter = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AdminPanel = () => {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    eid: '',
    date: getCurrentDate()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://lif.onrender.com/api/users/eids');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      let response;
      if (filters.eid) {
        response = await axios.get('https://lif.onrender.com/admin/tasks', {
          params: { eid: filters.eid }
        });
      } else {
        response = await axios.get('https://lif.onrender.com/admin/tasks');
      }
      setTasks(response.data.tasks || []);
      setTotalPoints(response.data.totalPoints || 0);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setTotalPoints(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      date: getCurrentDate()
    });
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

  const filteredTasks = tasks.filter(task => {
    // If no date filter, show all
    if (!filters.date) return true;
    return formatDateForFilter(task.date) === formatDateForFilter(filters.date);
  });

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
            <select
              name="eid"
              value={filters.eid}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Select Employee ID</option>
              {users.map((user) => (
                <option key={user.employeeId} value={user.employeeId}>
                  {user.employeeId} - {user.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              max={getCurrentDate()}
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
              {filteredTasks.length > 0 ? (
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Date</th>
                      <th>Project Name</th>
                      <th>Project Type</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Points</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <td>{task.eid}</td>
                        <td>{task.ename}</td>
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
                          <span className="project-type-badge">
                            {task.category}
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