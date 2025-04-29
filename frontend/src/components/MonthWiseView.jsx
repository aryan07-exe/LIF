// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import { Calendar, User, Search, Trash2, Award } from 'lucide-react';
// import './MonthlyTaskView.css';
// import Navbar from './Navbar';

// const MonthlyTaskView = () => {
//   const [tasks, setTasks] = useState([]);
//   const [filters, setFilters] = useState({ 
//     eid: '', 
//     month: new Date().toISOString().slice(0, 7), // Default to current month (YYYY-MM)
//     category: ''
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [totalPoints, setTotalPoints] = useState(0);

//   const categories = [
//     'Haldi',
//     'Mehendi',
//     'Wedding'
//   ];

//   const fetchTasks = async () => {
//     setIsLoading(true);
//     try {
//       console.log("Fetching monthly tasks with filters:", filters);
//       const response = await axios.get('http://localhost:5000/monthly/tasks', { 
//         params: { 
//           eid: filters.eid || undefined,
//           month: filters.month,
//           category: filters.category
//         } 
//       });

//       console.log("Monthly tasks response:", response.data);
//       setTasks(response.data.tasks || []);
//       setTotalPoints(response.data.totalPoints || 0);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//       setTasks([]);
//       setTotalPoints(0);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleFilterChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     fetchTasks();
//   };

//   const handleClear = () => {
//     setFilters({ 
//       eid: '', 
//       month: new Date().toISOString().slice(0, 7),
//       category: ''
//     });
//     setTasks([]);
//     setTotalPoints(0);
//   };

//   const formatDate = (dateInput) => {
//     const date = new Date(dateInput);
//     return date.toLocaleDateString('en-GB');
//   };

//   const formatMonthYear = (monthYear) => {
//     const [year, month] = monthYear.split('-');
//     const date = new Date(year, month - 1);
//     return date.toLocaleString('default', { month: 'long', year: 'numeric' });
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="monthly-task-view">
//         <motion.h2 
//           className="dashboard-title"
//           initial={{ scale: 0.9 }}
//           animate={{ scale: 1 }}
//           transition={{ duration: 0.3 }}
//         >
//           Monthly Task Performance
//         </motion.h2>

//         <div className="points-summary">
//           <div className="points-card">
//             <Award size={40} className="points-icon" />
//             <div className="points-info">
//               <h3>Total Points for {formatMonthYear(filters.month)}</h3>
//               <p>{totalPoints}</p>
//             </div>
//           </div>
//         </div>

//         <form className="filter-form" onSubmit={handleSearch}>
//           <div className="input-group">
//             <div className="form-field">
//               <label htmlFor="eid">
//                 <User size={18} className="field-icon" />
//                 Employee ID
//               </label>
//               <input
//                 type="text"
//                 id="eid"
//                 name="eid"
//                 value={filters.eid}
//                 onChange={handleFilterChange}
//                 placeholder="Enter employee ID (optional)"
//               />
//             </div>
//             <div className="form-field">
//               <label htmlFor="month">
//                 <Calendar size={18} className="field-icon" />
//                 Month
//               </label>
//               <input
//                 type="month"
//                 id="month"
//                 name="month"
//                 value={filters.month}
//                 onChange={handleFilterChange}
//                 required
//               />
//             </div>
//             <div className="form-field">
//               <label htmlFor="category">
//                 <Calendar size={18} className="field-icon" />
//                 Category
//               </label>
//               <select
//                 id="category"
//                 name="category"
//                 value={filters.category}
//                 onChange={handleFilterChange}
//               >
//                 <option value="">All Categories</option>
//                 {categories.map(category => (
//                   <option key={category} value={category}>{category}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <div className="button-group">
//             <button type="submit">
//               <Search size={16} style={{ marginRight: '8px' }} />
//               Search
//             </button>
//             <button type="button" className="clear-btn" onClick={handleClear}>
//               <Trash2 size={16} style={{ marginRight: '8px' }} />
//               Clear
//             </button>
//           </div>
//         </form>

//         <div className="table-container">
//           {isLoading ? (
//             <div className="loading-spinner">
//               <div className="spinner"></div>
//               <p>Loading tasks...</p>
//             </div>
//           ) : tasks.length > 0 ? (
//             <table className="task-table">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Project Name</th>
//                   <th>Type</th>
//                   <th>Status</th>
//                   <th>Category</th>
//                   <th>Points</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tasks.map((task, idx) => (
//                   <tr key={idx}>
//                     <td>{formatDate(task.date)}</td>
//                     <td>{task.projectname}</td>
//                     <td>
//                       <span className="project-type-badge">
//                         {task.projecttype}
//                       </span>
//                     </td>
//                     <td>
//                       <span className="status-badge">
//                         {task.projectstatus}
//                       </span>
//                     </td>
//                     <td>
//                       <span className="category-badge">
//                         {task.category}
//                       </span>
//                     </td>
//                     <td>
//                       <span className="points-badge">
//                         {task.points || 0}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <div className="no-tasks-msg">
//               {filters.eid ? (
//                 <>
//                   <p>No tasks found for Employee {filters.eid} in {formatMonthYear(filters.month)}.</p>
//                   <p className="no-tasks-subtitle">Try a different month or employee ID.</p>
//                 </>
//               ) : (
//                 <p>No tasks found for {formatMonthYear(filters.month)}.</p>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default MonthlyTaskView;