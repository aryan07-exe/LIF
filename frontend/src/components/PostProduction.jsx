import React, { useState, useEffect } from 'react';
import LifFooter from './LifFooter';
import axios from 'axios';

import { motion } from 'framer-motion';
import { Calendar, User, Search, Trash2, Award, Download } from 'lucide-react';
import './OnsiteMonthlyView.css';
import './PostProductionMonthlyView.css';
import Navbar from './NewNavbar';
import * as XLSX from 'xlsx';
const API_BASE = ' https://lif-lkgk.onrender.com';
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
      'Approval': task.approval || 'pending',
      'Category': task.category || 'N/A',
      'Points': task.points || 0,
  'Notes': task.notes || 'N/A'
    }));

    if (formattedTasks.length === 0) {
      throw new Error('No tasks to export');
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedTasks);
    
    // Set column widths
    // Provide column widths array matching exported columns
    worksheet['!cols'] = [
      { wch: 15 }, // Employee ID
      { wch: 20 }, // Employee Name
      { wch: 12 }, // Date
      { wch: 25 }, // Project Name
      { wch: 15 }, // Project Type
      { wch: 15 }, // Project Status
      { wch: 12 }, // Approval
      { wch: 20 }, // Category
      { wch: 10 }, // Points
      { wch: 30 }  // Notes
    ];

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
  const [projectTypes, setProjectTypes] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  // Calculate total points for visible tasks with status 'complete'
  useEffect(() => {
    const sum = tasks.reduce((acc, task) => {
      if (task.projectstatus && task.projectstatus.toLowerCase() === 'complete') {
        return acc + (Number(task.points) || 0);
      }
      return acc;
    }, 0);
    setTotalPoints(sum);
  }, [tasks]);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // Edit handlers
  const handleEditClick = (idx) => {
    setEditIdx(idx);
    // Always show the stored points from DB for editing
    setEditForm({
      ...tasks[idx],
      points: tasks[idx].points,
      notes: tasks[idx].notes || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (id) => {
    try {
      setSavingId(id);
      let updatedPoints = editForm.points;
      // Always use the points value entered by the user, or the stored value
      if (editForm.points !== undefined && editForm.points !== '' && !isNaN(Number(editForm.points))) {
        updatedPoints = Number(editForm.points);
      } else {
        updatedPoints = tasks.find(t => t._id === id)?.points ?? 0;
      }
      const payload = { ...editForm, points: updatedPoints };
      // Ensure approval is always sent (default to 'pending' if missing)
      payload.approval = editForm.approval !== undefined ? editForm.approval : 'pending';
      // Use 'notes' field as expected by backend
      if (editForm.notes !== undefined) {
        payload.notes = editForm.notes;
        // remove any legacy 'note' field to avoid confusion
        delete payload.note;
      }
      const token = localStorage.getItem('token');
      console.log('Saving payload for id', id, payload);
      // Remove immutable/internal fields before sending to backend
      delete payload._id;
      delete payload.__v;
      delete payload.createdAt;
      delete payload.updatedAt;

      const res = await axios.put(`${API_BASE}/api/edit/update/${id}`, payload, {
        headers: { Authorization: token }
      });
      const updated = res.data;
      console.log('PUT update response:', updated);

      // The server-side PUT handler now runs approval sync when approval changes.
      // Rely on the PUT response as the source of truth and avoid a separate PATCH to prevent races.
      const finalUpdated = updated;
      setTasks((prev) => prev.map((t) => (t._id === id ? finalUpdated : t)));
      setEditIdx(null);
      setSavingId(null);
    } catch (err) {
      setSavingId(null);
      console.error('Update failed:', err.response ? err.response.data : err.message);
      alert(`Failed to update post-production task: ${err.response ? err.response.data.error || JSON.stringify(err.response.data) : err.message}`);
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/postproduction/delete/${id}`, {
        headers: { Authorization: token }
      });
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert('Failed to delete post-production task.');
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/postproduction/monthly`, {
        headers: { Authorization: token },
        params: {
          eid: filters.eid,
          startDate: filters.startDate,
          endDate: filters.endDate,
          // Do not send category to backend, filter by projecttype on frontend
          projectstatus: filters.projectstatus
        }
      });

      let fetchedTasks = response.data.tasks || [];
      // Apply frontend filtering for projectstatus if selected
      if (filters.projectstatus) {
        fetchedTasks = fetchedTasks.filter(task => task.projectstatus === filters.projectstatus);
      }
      // Apply frontend filtering for projecttype if selected
      if (filters.category) {
        fetchedTasks = fetchedTasks.filter(task => task.projecttype === filters.category);
      }
  setTasks(fetchedTasks);
  setCategories(response.data.categories || []);
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
  const response = await axios.get(`${API_BASE}/api/users/eids`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchProjectTypes();
    fetchProjectStatuses();
  }, [filters]);

  // Fetch project types from backend
  const fetchProjectTypes = async () => {
    try {
  const res = await axios.get(`${API_BASE}/api/task/projecttypes`);
      setProjectTypes(res.data.projectTypes || []);
    } catch (error) {
      setProjectTypes([]);
    }
  };

  // Fetch project statuses from backend
  const fetchProjectStatuses = async () => {
    try {
  const res = await axios.get(`${API_BASE}/api/task/projectstatuses`);
      setProjectStatuses(res.data.projectStatuses || []);
    } catch (error) {
      setProjectStatuses([]);
    }
  };

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
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
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
              <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
                <table className="task-table clean-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>P.Name</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th>Category</th>
                    <th>Points</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr
                      key={task._id}
                      className={editIdx === idx ? 'editing' : ''}
                      style={{
                        background: idx % 2 === 0 ? '#f9f6fa' : '#fff',
                        transition: 'background 0.2s',
                        borderBottom: '1px solid #eee',
                        cursor: editIdx === idx ? 'default' : 'pointer'
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#fbeaf4')}
                      onMouseOut={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#f9f6fa' : '#fff')}
                      onClick={
                        editIdx === idx
                          ? undefined
                          : (e) => {
                              // Only open modal if not clicking on a button
                              if (
                                e.target.tagName !== 'BUTTON' &&
                                e.target.tagName !== 'svg' &&
                                e.target.tagName !== 'path' &&
                                e.target.type !== 'submit'
                              ) {
                                handleRowClick(task);
                              }
                            }
                      }
                    >
                      {editIdx === idx ? (
                        <>
                          <td style={{padding:'0.5px'}}><input name="ename" value={editForm.ename} onChange={handleEditChange} style={{ width: '100%' }} /></td>
                          <td style={{padding:'0.5px'}}><input name="eid" value={editForm.eid} onChange={handleEditChange} style={{ width: '100%' }} /></td>
                          <td style={{padding:'0.5px'}}><input name="projectname" value={editForm.projectname} onChange={handleEditChange} style={{ width: '100%' }} /></td>
                          <td style={{padding:'0.5px'}}><input name="date" type="date" value={editForm.date ? editForm.date.slice(0,10) : ''} onChange={handleEditChange} style={{ width: '100%' }} /></td>
                          <td style={{padding:'0.5px'}}><input name="projecttype" value={editForm.projecttype} onChange={handleEditChange} style={{ width: '100%' }} /></td>
                          <td style={{padding:'0.5px'}}>
                            <select
                              name="projectstatus"
                              value={editForm.projectstatus || ''}
                              onChange={handleEditChange}
                              className="filter-select"
                              style={{ width: '100%' }}
                            >
                              <option value="">Select Status</option>
                              {projectStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{padding:'0.5px'}}>
                            <select name="approval" value={editForm.approval || 'pending'} onChange={handleEditChange} style={{ width: '100%' }}>
                              <option value="pending">pending</option>
                              <option value="approved">approved</option>
                            </select>
                          </td>
                          <td style={{padding:'0.5px'}}><input name="category" value={editForm.category} onChange={handleEditChange} style={{ width: '100%' }} /></td>
                          <td style={{padding:'0.5px'}}><input name="points" value={editForm.points} onChange={handleEditChange} style={{ width: '100%' }} /></td>
                          <td style={{ minWidth: 160, width: 180, padding:'0.5px' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <button className="save-btn" style={{ background: '#218c5a', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.7rem' }} onClick={() => handleEditSave(task._id)} disabled={savingId === task._id}>{savingId === task._id ? 'Saving...' : 'Save'}</button>
                              <button className="cancel-btn" style={{ background: '#f3f3f3', color: '#a80a3c', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '0.2rem 0.7rem' }} onClick={handleEditCancel}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{padding:'0.5px'}}>{task.ename}</td>
                          <td style={{padding:'0.5px'}}>{task.eid}</td>
                          <td style={{padding:'0.5px'}}>{task.projectname}</td>
                          <td style={{padding:'0.5px'}}>{formatDate(task.date)}</td>
                          <td style={{padding:'0.5px'}}>{task.projecttype}</td>
                          <td style={{padding:'0.5px'}}>{task.projectstatus}</td>
                          <td style={{padding:'0.5px'}}>{task.approval || 'pending'}</td>
                          <td style={{padding:'0.5px'}}><span style={{ background: '#fbeaf4', color: '#6c0428', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.9em' }}>{task.category}</span></td>
                          <td style={{padding:'0.5px'}}><span style={{ background: '#e5e7eb', borderRadius: '4px', padding: '0.1rem 0.4rem', fontWeight: 600, fontSize: '0.9em' }}>{task.projectstatus && task.projectstatus.toLowerCase() === 'complete' ? (task.points || 0) : 0}</span></td>
                          <td style={{ minWidth: 160, width: 180, padding:'0.5px' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <button className="edit" style={{ background: '#a80a3c', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.7rem' }} onClick={(e) => { e.stopPropagation(); handleEditClick(idx); }}>Edit</button>
                              <button className="delete" style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.7rem' }} onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}>Delete</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
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
                      <div><strong>Points:</strong> {modalTask.projectstatus && modalTask.projectstatus.toLowerCase() === 'complete' ? (modalTask.points || 0) : 0}</div>
                      <div><strong>Notes:</strong> {modalTask.notes || ''}</div>
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