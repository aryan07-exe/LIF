// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import { Calendar } from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import './EmployeeCalendar.css';

// const EmployeeCalendar = () => {
//   const [taskDates, setTaskDates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [date, setDate] = useState(new Date());
//   const user = JSON.parse(localStorage.getItem('user') || '{}');

//   useEffect(() => {
//     if (user && user.employeeId) {
//       fetchTaskDates();
//     } else {
//       setError('User not logged in');
//       setLoading(false);
//     }
//   }, [user]);

//   const fetchTaskDates = async () => {
//     try {
//       setLoading(true);
//       setError('');
      
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('No authentication token found');
//       }

//       const response = await axios.get(`https://lif.onrender.com/onsiteTask/employee/${user.employeeId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (!response.data || !Array.isArray(response.data)) {
//         throw new Error('Invalid response format');
//       }

//       // Extract unique dates from tasks
//       const dates = [...new Set(response.data.map(task => task.shootDate))];
//       console.log('Unique task dates:', dates);
//       setTaskDates(dates);
//     } catch (err) {
//       console.error('Error fetching task dates:', err);
//       setError(err.response?.data?.message || err.message || 'Failed to fetch task dates');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const tileClassName = ({ date }) => {
//     const dateStr = date.toISOString().split('T')[0];
//     return taskDates.includes(dateStr) ? 'has-task' : 'no-task';
//   };

//   if (loading) {
//     return (
//       <div className="loading">
//         <div className="spinner"></div>
//         <p>Loading calendar...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error">
//         <p>Error: {error}</p>
//         <button onClick={fetchTaskDates}>Retry</button>
//       </div>
//     );
//   }

//   return (
//     <motion.div 
//       className="calendar-container"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       <h2 className="calendar-title">Task Submission Calendar</h2>
//       <div className="calendar-wrapper">
//         <Calendar
//           onChange={setDate}
//           value={date}
//           tileClassName={tileClassName}
//         />
//       </div>
//       <div className="calendar-legend">
//         <div className="legend-item">
//           <span className="legend-color has-task"></span>
//           <span>Task Submitted</span>
//         </div>
//         <div className="legend-item">
//           <span className="legend-color no-task"></span>
//           <span>No Task</span>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default EmployeeCalendar; 