import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, User, Search, Trash2, Award, Download } from 'lucide-react';
import './OnsiteMonthlyView.css';
import Navbar from './Navbar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
};

const formatMonthYear = (monthYear) => {
  const [year, month] = monthYear.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const exportToExcel = (tasks, month) => {
  try {
    if (!tasks || !Array.isArray(tasks)) {
      throw new Error('Invalid tasks data');
    }

    // Format the tasks data
    const formattedTasks = tasks.map(task => ({
      'Employee ID': task.eid || 'N/A',
      'Employee Name': task.ename || 'N/A',
      'Date': formatDate(task.shootDate),
      'Project Name': task.projectname || 'N/A',
      'Start Time': task.startTime || 'N/A',
      'End Time': task.endTime || 'N/A',
      'Categories': Object.entries(task.categories)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
        .join(', ') || 'N/A',
      'Team Members': task.teamNames || 'N/A',
      'Notes': task.notes || 'N/A'
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
      'E': 15, // Start Time
      'F': 15, // End Time
      'G': 30, // Categories
      'H': 20, // Team Members
      'I': 30  // Notes
    };
    
    worksheet['!cols'] = Object.values(columnWidths).map(width => ({ wch: width }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Onsite Tasks");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = `Onsite-Tasks-${month}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert(`Error exporting to Excel: ${error.message}`);
  }
};

const OnsiteMonthlyView = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ 
    eid: '', 
    month: new Date().toISOString().slice(0, 7),
    category: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://lif.onrender.com/onsite/tasks', {
        headers: { Authorization: token }
      });
      
      let filteredTasks = response.data.tasks || [];
      
      // Filter by month
      if (filters.month) {
        const [selectedYear, selectedMonth] = filters.month.split('-').map(Number);
        filteredTasks = filteredTasks.filter(task => {
          const taskDate = new Date(task.shootDate);
          return taskDate.getFullYear() === selectedYear && 
                 taskDate.getMonth() + 1 === selectedMonth;
        });
      }
      
      // Apply other filters
      if (filters.eid) {
        filteredTasks = filteredTasks.filter(task => task.eid === filters.eid);
      }
      if (filters.category) {
        filteredTasks = filteredTasks.filter(task => 
          Object.entries(task.categories)
            .some(([key, value]) => key === filters.category && value)
        );
      }
      
      setTasks(filteredTasks);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(
        filteredTasks.flatMap(task => 
          Object.entries(task.categories)
            .filter(([_, value]) => value)
            .map(([key]) => key)
        )
      )].filter(Boolean);
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://lif.onrender.com/api/users/eids');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
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
      month: new Date().toISOString().slice(0, 7),
      category: ''
    });
  };

  return (
    <>
      <Navbar />
      <div className="monthly-task-view">
        <motion.h2 
          className="dashboard-title"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Onsite Monthly Tasks
        </motion.h2>

        <form className="filter-form" onSubmit={handleSearch}>
          <div className="input-group">
            <div className="form-field">
              <label htmlFor="eid">
                <User size={18} className="field-icon" />
                Employee ID
              </label>
              <select
                id="eid"
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
            </div>
            <div className="form-field">
              <label htmlFor="month">
                <Calendar size={18} className="field-icon" />
                Month
              </label>
              <input
                type="month"
                id="month"
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="category">
                <Award size={18} className="field-icon" />
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="button-group">
            <button type="submit">
              <Search size={16} style={{ marginRight: '8px' }} />
              Search
            </button>
            <button type="button" className="clear-btn" onClick={handleClear}>
              <Trash2 size={16} style={{ marginRight: '8px' }} />
              Clear
            </button>
          </div>
        </form>

        <div className="table-container">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length > 0 ? (
            <>
              <div className="export-section">
                <motion.button
                  className="download-btn"
                  onClick={() => exportToExcel(tasks, filters.month)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={18} />
                  <span>Download Excel</span>
                </motion.button>
              </div>
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Date</th>
                    <th>Project Name</th>
                    <th>Time</th>
                    <th>Categories</th>
                    <th>Team Members</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr key={idx}>
                      <td>{task.eid}</td>
                      <td>{task.ename}</td>
                      <td>{formatDate(task.shootDate)}</td>
                      <td>{task.projectname}</td>
                      <td>{task.startTime} - {task.endTime}</td>
                      <td>
                        {Object.entries(task.categories)
                          .filter(([_, value]) => value)
                          .map(([key]) => (
                            <span key={key} className="category-badge">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                      </td>
                      <td>{task.teamNames}</td>
                      <td>{task.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="no-tasks-msg">
              {filters.eid ? (
                <>
                  <p>No onsite tasks found for Employee {filters.eid} in {formatMonthYear(filters.month)}.</p>
                  <p className="no-tasks-subtitle">Try a different month or employee ID.</p>
                </>
              ) : (
                <p>No onsite tasks found for {formatMonthYear(filters.month)}.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OnsiteMonthlyView; 