import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, User, Search, Trash2, Award, Download } from 'lucide-react';
import './MonthlyTaskView.css';
import Navbar from './Navbar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const formatDate = (dateInput) => {
  try {
    // Handle case where dateInput is already in YYYY-MM-DD format
    if (typeof dateInput === 'string' && dateInput.includes('-')) {
      const [year, month, day] = dateInput.split('-');
      return `${day}/${month}/${year}`;
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      console.error('Invalid date input:', dateInput);
      return 'Invalid date';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
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
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = `Monthly-Tasks-${month}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert(`Error exporting to Excel: ${error.message}`);
  }
};

const MonthlyTaskView = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ 
    eid: '', 
    month: new Date().toISOString().slice(0, 7), // Default to current month (YYYY-MM)
    category: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [users, setUsers] = useState([]);

  const categories = [
    'Haldi',
    'Mehendi',
    'Wedding'
  ];

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching monthly tasks with filters:", filters);
      const response = await axios.get('http://localhost:5000/monthly/tasks', { 
        params: { 
          eid: filters.eid || undefined,
          month: filters.month,
          category: filters.category
        } 
      });
      
      console.log("Monthly tasks response:", response.data);
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/eids');
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
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
    setTasks([]);
    setTotalPoints(0);
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
          Monthly Task Performance
        </motion.h2>

        <div className="points-summary">
          <div className="points-card">
            <Award size={40} className="points-icon" />
            <div className="points-info">
              <h3>Total Points for {formatMonthYear(filters.month)}</h3>
              <p>{totalPoints}</p>
            </div>
            {tasks.length > 0 && (
              <motion.button
                className="download-btn"
                onClick={() => exportToExcel(tasks, filters.month)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={18} />
                <span>Download Excel</span>
              </motion.button>
            )}
          </div>
        </div>

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
            <table className="task-table">
              <thead>
                <tr>
                <th>Eid</th>
                <th>E Name</th>
                  <th>Date</th>
                  <th>Project Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={idx}>
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
                      <span className="status-badge">
                        {task.projectstatus}
                      </span>
                    </td>
                    <td>
                      <span className="category-badge">
                        {task.category}
                      </span>
                    </td>
                    <td>
                      <span className="points-badge">
                        {task.points || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-tasks-msg">
              {filters.eid ? (
                <>
                  <p>No tasks found for Employee {filters.eid} in {formatMonthYear(filters.month)}.</p>
                  <p className="no-tasks-subtitle">Try a different month or employee ID.</p>
                </>
              ) : (
                <p>No tasks found for {formatMonthYear(filters.month)}.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MonthlyTaskView; 