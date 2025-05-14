import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, User, Search, Trash2, Award, Download } from 'lucide-react';
import './MonthlyTaskView.css';
import Navbar from './NewNavbar';
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
    category: '',
    projectType: '',
    projectStatus: ''
  });

  // Helper to get start and end date of a month
  const getMonthDateRange = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };
  const [isLoading, setIsLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [users, setUsers] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState([]);

  const categories = [
    'Haldi',
    'Mehendi',
    'Wedding'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#2E7D32'; // Green
      case 'In Progress':
        return '#F57C00'; // Orange
      case 'Pending':
        return '#D32F2F'; // Red
      default:
        return '#1976D2'; // Blue
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching monthly tasks with filters:", filters);
      const { startDate, endDate } = getMonthDateRange(filters.month);
      const response = await axios.get('https://lif.onrender.com/monthly/tasks', { 
        params: { 
          eid: filters.eid || undefined,
          startDate, // send as YYYY-MM-DD
          endDate,
          category: filters.category || undefined,
          projectType: filters.projectType || undefined,
          projectStatus: filters.projectStatus || undefined
        } 
      });
      
      console.log("Monthly tasks response:", response.data);
      
      // Filter the tasks based on all selected criteria
      let filteredTasks = response.data.tasks || [];
      
      // Apply filters in memory if needed (as a backup to server-side filtering)
      if (filters.eid) {
        filteredTasks = filteredTasks.filter(task => task.eid === filters.eid);
      }
      if (filters.category) {
        filteredTasks = filteredTasks.filter(task => task.category === filters.category);
      }
      if (filters.projectType) {
        filteredTasks = filteredTasks.filter(task => task.projecttype === filters.projectType);
      }
      if (filters.projectStatus) {
        filteredTasks = filteredTasks.filter(task => task.projectstatus === filters.projectStatus);
      }
      
      setTasks(filteredTasks);
      setTotalPoints(filteredTasks.reduce((sum, task) => sum + (task.points || 0), 0));
      
      // Extract unique project types and statuses from the filtered tasks
      const uniqueTypes = [...new Set(filteredTasks.map(task => task.projecttype))].filter(Boolean);
      const uniqueStatuses = [...new Set(filteredTasks.map(task => task.projectstatus))].filter(Boolean);
      
      setProjectTypes(uniqueTypes);
      setProjectStatuses(uniqueStatuses);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setTotalPoints(0);
      setProjectTypes([]);
      setProjectStatuses([]);
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
      category: '',
      projectType: '',
      projectStatus: ''
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
            <div className="form-field">
              <label htmlFor="projectType">
                <Award size={18} className="field-icon" />
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                value={filters.projectType}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Types</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="projectStatus">
                <Award size={18} className="field-icon" />
                Project Status
              </label>
              <select
                id="projectStatus"
                name="projectStatus"
                value={filters.projectStatus}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
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
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(task.projectstatus) }}>
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