import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Download, Calendar, User, Clock, Film } from 'lucide-react';
import * as XLSX from 'xlsx';
import Navbar from './Navbar';
import './AdminPanel.css';

const OnsiteAdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const formatDateForFilter = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/onsite/tasks', {
        headers: { Authorization: token }
      });
      setTasks(response.data.tasks);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch onsite tasks');
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.ename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projectname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.eid?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      formatDateForFilter(task.shootDate) === formatDateForFilter(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  // Calculate total points whenever filtered tasks change
  useEffect(() => {
    const total = filteredTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    setTotalPoints(total);
  }, [filteredTasks]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTasks.map(task => ({
      'Employee Name': task.ename,
      'Employee ID': task.eid,
      'Project Name': task.projectname,
      'Shoot Date': formatDateForDisplay(task.shootDate),
      'Start Time': task.startTime,
      'End Time': task.endTime,
      'Categories': Object.entries(task.categories)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
        .join(', '),
      'Team Members': task.teamNames,
      'Points': task.points || 0,
      'Notes': task.notes
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Onsite Tasks');
    XLSX.writeFile(workbook, 'onsite_tasks.xlsx');
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
      <motion.div 
        className="admin-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-section">
          <div className="header-title">
            <h1>Onsite Tasks</h1>
            <div className="total-points">
              <span className="points-label">Total Points:</span>
              <span className="points-value">{totalPoints}</span>
            </div>
          </div>
          <div className="controls">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name, project, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <Calendar size={20} />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
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
                <th>Categories</th>
                <th>Team Members</th>
                <th>Points</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task._id} onClick={() => handleTaskClick(task)}>
                  <td>{task.ename}</td>
                  <td>{task.eid}</td>
                  <td>{task.projectname}</td>
                  <td>{formatDateForDisplay(task.shootDate)}</td>
                  <td>{task.startTime} - {task.endTime}</td>
                  <td>
                    {Object.entries(task.categories)
                      .filter(([_, value]) => value)
                      .map(([key]) => (
                        <span key={key} className="category-tag">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                  </td>
                  <td>{task.teamNames}</td>
                  <td>
                    <span className="points-badge">
                      {task.points || 0}
                    </span>
                  </td>
                  <td>{task.notes}</td>
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
                  <span>{selectedTask.startTime} - {selectedTask.endTime}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Points:</span>
                  <span className="points-badge">{selectedTask.points || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Categories:</span>
                  <div className="categories-list">
                    {Object.entries(selectedTask.categories)
                      .filter(([_, value]) => value)
                      .map(([key]) => (
                        <span key={key} className="category-tag">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                  </div>
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