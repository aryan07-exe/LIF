import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { X, FileText, Award, Clock } from 'lucide-react';
import './TaskSubmissionCalendar.css';

const TaskSubmissionCalendar = () => {
  const [taskDates, setTaskDates] = useState([]);
  const [taskDetails, setTaskDetails] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user && user.employeeId) {
      fetchTaskDates();
    } else {
      setError('User not logged in');
      setLoading(false);
    }
  }, [user]);

  const fetchTaskDates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`http://localhost:5000/tasks`, {
        params: {
          eid: user.employeeId,
          startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
          endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
        },
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      // Extract unique dates from tasks and store task details
      const dates = [];
      const details = {};
      response.data.forEach(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        if (!dates.includes(taskDate)) {
          dates.push(taskDate);
        }
        if (!details[taskDate]) {
          details[taskDate] = [];
        }
        details[taskDate].push(task);
      });
      
      setTaskDates(dates);
      setTaskDetails(details);
    } catch (err) {
      console.error('Error fetching task dates:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch task dates');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (taskDates.includes(dateStr)) {
      setSelectedDate(dateStr);
      setShowModal(true);
    }
  };

  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    return taskDates.includes(dateStr) ? 'has-task' : 'no-task';
  };

  const tileContent = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    return taskDates.includes(dateStr) ? (
      <div className="task-indicator">✓</div>
    ) : null;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchTaskDates}>Retry</button>
      </div>
    );
  }

  return (
    <motion.div 
      className="calendar-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="calendar-title">Task Submission Calendar</h2>
      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateClick}
          value={date}
          tileClassName={tileClassName}
          tileContent={tileContent}
          onActiveStartDateChange={({ activeStartDate }) => {
            setDate(activeStartDate);
            fetchTaskDates();
          }}
        />
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color has-task"></span>
          <span>Task Submitted</span>
        </div>
        <div className="legend-item">
          <span className="legend-color no-task"></span>
          <span>No Task</span>
        </div>
      </div>

      <AnimatePresence>
        {showModal && selectedDate && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Tasks for {new Date(selectedDate).toLocaleDateString()}</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {taskDetails[selectedDate]?.map((task, index) => (
                  <div key={index} className="task-detail">
                    <div className="task-header">
                      <h4>{task.projectname}</h4>
                      <span className={`status-badge ${task.projectstatus.toLowerCase()}`}>
                        {task.projectstatus}
                      </span>
                    </div>
                    <div className="task-info">
                      <div className="info-item">
                        <Award size={16} />
                        <span>Type: {task.projecttype}</span>
                      </div>
                      <div className="info-item">
                        <FileText size={16} />
                        <span>Category: {task.category}</span>
                      </div>
                      <div className="info-item">
                        <Clock size={16} />
                        <span>Points: {task.points || 0}</span>
                      </div>
                    </div>
                    {task.note && (
                      <div className="task-notes">
                        <p>{task.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskSubmissionCalendar; 