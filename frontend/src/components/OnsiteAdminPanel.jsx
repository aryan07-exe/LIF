
 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Download, Calendar, User, Clock, Film } from 'lucide-react';
import * as XLSX from 'xlsx';
import Navbar from './NewNavbar';
import './OnsiteAdminPanel.css';

const toIST = (dateStringOrTime) => {
  if (!dateStringOrTime) return '';
  let date;
  if (/^\d{2}:\d{2}/.test(dateStringOrTime)) {
    const today = new Date();
    const [h, m] = dateStringOrTime.split(':');
    date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m);
  } else {
    date = new Date(dateStringOrTime);
  }
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
const OnsiteAdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const currentdate=today.toISOString().slice(0, 10);
    return {
      eid: '',
      startDate: currentdate,
      endDate:currentdate,
      category: ''
    };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);


  const formatDateForFilter = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Add missing function for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://lif.onrender.com/api/users/eids');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://lif.onrender.com/onsite/tasks', {
        headers: { Authorization: token }
      });
      let fetchedTasks = response.data.tasks || [];
      // Filter by eid
      if (filters.eid) {
        fetchedTasks = fetchedTasks.filter(task => task.eid === filters.eid);
      }
      // Filter by date range
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        fetchedTasks = fetchedTasks.filter(task => {
          const taskDate = new Date(task.shootDate);
          return taskDate >= start && taskDate <= end;
        });
      }
      // Filter by category
      if (filters.category) {
        fetchedTasks = fetchedTasks.filter(task => task.category === filters.category);
      }

      setTasks(fetchedTasks);
      setTotalPoints(fetchedTasks.reduce((sum, t) => sum + (t.points || 0), 0));
      // Gather unique categories
      const allCategories = new Set();
      fetchedTasks.forEach(task => {
        if (task.category) {
          allCategories.add(task.category);
        }
      });
      setCategories(Array.from(allCategories));
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch onsite tasks');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setFilters({
      eid: '',
      startDate: firstDay.toISOString().slice(0, 10),
      endDate: lastDay.toISOString().slice(0, 10),
      category: '',
      projectstatus: ''
    });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks.map(task => ({
      'Employee Name': task.ename || '-',
      'Employee ID': task.eid || '-',
      'Project Name': task.projectname || '-',
      'Shoot Date': formatDateForFilter(task.shootDate),
      'Start Time': task.startTime || '-',
      'End Time': task.endTime || '-',
      'Category': task.category || '-',
      'Team Members': task.teamNames || '-',
      'Points': task.points || 0,
      'Event Type': (() => {
        switch (task.eventType) {
          case 'micro': return 'Micro';
          case 'small': return 'Small';
          case 'wedding half day': return 'Wedding Half Day';
          case 'wedding full day': return 'Wedding Full Day';
          case 'commercial': return 'Commercial';
          default: return '-';
        }
      })(),
      'Notes': task.notes || '-'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Onsite Tasks');
    XLSX.writeFile(workbook, 'onsite_tasks.xlsx');
  };

  const getHoursWorked = (start, end) => {
    if (!start || !end) return '-';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startDate = new Date(0, 0, 0, sh, sm);
    let endDate = new Date(0, 0, 0, eh, em);
    let diff = (endDate - startDate) / (1000 * 60 * 60);
    if (diff < 0) diff += 24; // handle overnight
    return diff.toFixed(2);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading onsite tasks...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div className="admin-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="admin-title">Shoot Records</h1>

        <div className="admin-panel-header">
          <form className="filter-bar" onSubmit={e => { e.preventDefault(); fetchTasks(); }}>
            <div className="filter-fields">
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
                  {users.map(user => (
                    <option key={user.employeeId || user.eid} value={user.employeeId || user.eid}>
                      {(user.employeeId || user.eid)} - {(user.name || user.ename)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="startDate">
                  <Calendar size={18} className="field-icon" />
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </div>
              <div className="form-field">
                <label htmlFor="endDate">
                  <Calendar size={18} className="field-icon" />
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </div>
              <div className="form-field">
                <label htmlFor="category">
                  <Film size={18} className="field-icon" />
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
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
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
                Clear
              </button>
            </div>
          </form>
          <div className="points-export-group">
            <div className="total-points">
              <span className="points-label">Total Points:</span>
              <span className="points-value">{totalPoints}</span>
            </div>
            <button className="export-btn" onClick={exportToExcel}>
              <Download size={20} />
              Export to Excel
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Employee ID</th>
                <th>Project Name</th>
                <th>Shoot Date</th>
                <th>Time</th>
                <th>Hours Worked</th>
                <th>Categories</th>
                <th>Event Type</th>
                <th>Team Members</th>
                <th>Points</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id} onClick={() => handleTaskClick(task)}>
                  <td>{task.ename}</td>
                  <td>{task.eid}</td>
                  <td>{task.projectname}</td>
                  <td>{formatDateForDisplay(task.shootDate)}</td>
                  <td>{toIST(task.startTime)} - {toIST(task.endTime)}</td>
                  <td>{getHoursWorked(task.startTime, task.endTime)}</td>
                  <td>
                    <span className="category-tag">{task.category || '-'}</span>
                  </td>
                  <td>{(() => {
                    switch (task.eventType) {
                      case 'micro': return 'Micro';
                      case 'small': return 'Small';
                      case 'wedding half day': return 'Wedding Half Day';
                      case 'wedding full day': return 'Wedding Full Day';
                      case 'commercial': return 'Commercial';
                      default: return '-';
                    }
                  })()}</td>
                  <td>{task.teamNames || '-'}</td>
                  <td><span className="points-badge">{task.points || 0}</span></td>
                  <td>{task.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && selectedTask && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>Task Details</h2>
              <div className="modal-details">
                <div className="detail-row">
                  <span className="detail-label">Employee Name:</span>
                  <span>{selectedTask.ename}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Employee ID:</span>
                  <span>{selectedTask.eid}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Project Name:</span>
                  <span>{selectedTask.projectname}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Shoot Date:</span>
                  <span>{formatDateForDisplay(selectedTask.shootDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span>{toIST(selectedTask.startTime)} - {toIST(selectedTask.endTime)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Hours Worked:</span>
                  <span>{getHoursWorked(selectedTask.startTime, selectedTask.endTime)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Points:</span>
                  <span className="points-badge">{selectedTask.points || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="category-tag">{selectedTask.category || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Team Members:</span>
                  <span>{selectedTask.teamNames}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span>{selectedTask.notes}</span>
                </div>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default OnsiteAdminPanel;