import React, { useState, useEffect } from 'react';
import LifFooter from './LifFooter';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, User, Search, Trash2, Award, Download } from 'lucide-react';
import './OnsiteMonthlyView.css';
import './PostProductionMonthlyView.css';
import Navbar from './NewNavbar';
import * as XLSX from 'xlsx';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
};

const exportToExcel = (tasks, dateRange) => {
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
      'G': 20, // Category
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
    link.download = `Post-Production-Tasks-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert(`Error exporting to Excel: ${error.message}`);
  }
};

const PostProductionMonthlyView = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const currentDate = today.toISOString().slice(0, 10);
    return {
      eid: '',
      startDate: currentDate,
      endDate: currentDate,
      category: '',
      projectstatus: ''
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState(null);

  // Edit handlers
  const handleEditClick = (idx) => {
    setEditIdx(idx);
    // Ensure notes field is present for editing
    setEditForm({ ...tasks[idx], notes: tasks[idx].notes || tasks[idx].note || '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (id) => {
    try {
      const token = localStorage.getItem('token');
      // Use notes field for payload
      const payload = { ...editForm };
      if (editForm.notes !== undefined) {
        payload.note = editForm.notes;
      }
      const res = await axios.put(`https://lif.onrender.com/api/edit/update/${id}`, payload, {
        headers: { Authorization: token }
      });
      const updated = res.data;
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      setEditIdx(null);
    } catch (err) {
      alert('Failed to update post-production task.');
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://lif.onrender.com/postproduction/monthly', {
        headers: { Authorization: token },
        params: {
          eid: filters.eid,
          startDate: filters.startDate,
          endDate: filters.endDate,
          category: filters.category,
          projectstatus: filters.projectstatus
        }
      });

      let fetchedTasks = response.data.tasks || [];
      // Apply frontend filtering for projectstatus if selected
      if (filters.projectstatus) {
        fetchedTasks = fetchedTasks.filter(task => task.projectstatus === filters.projectstatus);
      }
      setTasks(fetchedTasks);
      setTotalPoints(response.data.totalPoints || 0);
      setCategories(response.data.categories || []);
      const uniqueStatuses = [...new Set((response.data.tasks || []).map(task => task.projectstatus))].filter(Boolean);
      setProjectStatuses(uniqueStatuses);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setCategories([]);
      setProjectStatuses([]);
      setTotalPoints(0);
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
    if (name === 'startDate' || name === 'endDate') {
      // Ensure the date is in YYYY-MM-DD format
      const date = new Date(value);
      const formattedDate = date.toISOString().slice(0, 10);
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: formattedDate
      }));
    } else {
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value
      }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleClear = () => {
    const today = new Date();
     const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const currentdate=today.toISOString().slice(0, 10);
    setFilters({ 
      eid: '', 
      startDate: firstDay.toISOString().slice(0, 10),
      endDate: lastDay.toISOString().slice(0, 10),
      category: '',
      projectstatus: ''
    });
  };

  // Modal open handler
  const handleRowClick = (task) => {
    setModalTask(task);
    setModalOpen(true);
  };

  // Modal close handler
  const handleModalClose = () => {
    setModalOpen(false);
    setModalTask(null);
  };

  return (
    <>
    <Navbar />
      <div className="monthly-task-view">
        <motion.div 
          className="dashboard-header"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="dashboard-title">Post-Production Reports</h2>
          <div className="total-points responsive-total-points">
            <span className="points-label">Total Points:</span>
            <span className="points-value">{totalPoints}</span>
          </div>
        </motion.div>

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
                required
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
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="projectstatus">
                <Award size={18} className="field-icon" />
                Project Status
              </label>
              <select
                id="projectstatus"
                name="projectstatus"
                value={filters.projectstatus || ''}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Status</option>
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
              <div className="dot-spinner">
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
              </div>
            </div>
          ) : tasks.length > 0 ? (
            <>
              <div className="export-section">
                <motion.button
                  className="download-btn"
                  onClick={() => exportToExcel(tasks, { 
                    startDate: filters.startDate, 
                    endDate: filters.endDate 
                  })}
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
                    <th>EID</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>P.Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Event</th>
                    <th>Points</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr key={idx} onClick={() => editIdx === idx ? null : handleRowClick(task)} style={{ cursor: editIdx === idx ? 'default' : 'pointer' }}>
                      {editIdx === idx ? (
                        <>
                          <td><input name="eid" value={editForm.eid} onChange={handleEditChange} /></td>
                          <td><input name="ename" value={editForm.ename} onChange={handleEditChange} /></td>
                          <td><input name="date" type="date" value={editForm.date ? editForm.date.slice(0,10) : ''} onChange={handleEditChange} /></td>
                          <td><input name="projectname" value={editForm.projectname} onChange={handleEditChange} /></td>
                          <td><input name="projecttype" value={editForm.projecttype} onChange={handleEditChange} /></td>
                          <td><input name="projectstatus" value={editForm.projectstatus} onChange={handleEditChange} /></td>
                          <td><input name="category" value={editForm.category} onChange={handleEditChange} /></td>
                          <td><input name="points" value={editForm.points} onChange={handleEditChange} /></td>
                          <td>
                            <textarea name="notes" value={editForm.notes || ''} onChange={handleEditChange} rows="3" style={{ width: '100%' }} />
                          </td>
                          <td>
                            <button onClick={() => handleEditSave(task._id)}>Save</button>
                            <button onClick={handleEditCancel}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{task.eid}</td>
                          <td>{task.ename}</td>
                          <td>{formatDate(task.date)}</td>
                          <td>{task.projectname}</td>
                          <td>{task.projecttype}</td>
                          <td>{task.projectstatus}</td>
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
                          <td>
                            <button onClick={(e) => { e.stopPropagation(); handleEditClick(idx); }}>Edit</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Modal for entry details */}
              {modalOpen && modalTask && (
                <div className="modal-overlay" onClick={handleModalClose}>
                  <motion.div 
                    className="modal-content official-modal"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <h3 className="modal-title">Task Details</h3>
                    <div className="modal-details">
                      <div><strong>Employee ID:</strong> {modalTask.eid}</div>
                      <div><strong>Employee Name:</strong> {modalTask.ename}</div>
                      <div><strong>Date:</strong> {formatDate(modalTask.date)}</div>
                      <div><strong>Project Name:</strong> {modalTask.projectname}</div>
                      <div><strong>Project Type:</strong> {modalTask.projecttype}</div>
                      <div><strong>Project Status:</strong> {modalTask.projectstatus}</div>
                      <div><strong>Category:</strong> {modalTask.category}</div>
                      <div><strong>Points:</strong> {modalTask.points || 0}</div>
                      <div><strong>Notes:</strong> {modalTask.notes || modalTask.note || ''}</div>
                    </div>
                    <button className="close-modal-btn" onClick={handleModalClose}>Close</button>
                  </motion.div>
                </div>
              )}
            </>
          ) : (
            <div className="no-tasks-msg">
              <p>No Tasks Found For The Selected Date Range.</p>
              <p className="no-tasks-subtitle">Try A Different Date Range Or Employee ID.</p>
            </div>
          )}
        </div>
      </div>
      <LifFooter />
    </>
  );
};

export default PostProductionMonthlyView;