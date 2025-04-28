import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, Award, Download } from 'lucide-react';
import './MonthWiseView.css';
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

const exportToExcel = (tasks, fileName) => {
  try {
    if (!tasks || !Array.isArray(tasks)) {
      throw new Error('Invalid tasks data');
    }

    // Flatten the nested tasks structure
    const flattenedTasks = tasks.flatMap(employeeData => {
      if (!employeeData || !employeeData.tasks || !Array.isArray(employeeData.tasks)) {
        console.warn('Invalid employee data:', employeeData);
        return [];
      }
      
      return employeeData.tasks.map(task => ({
        'Employee ID': employeeData.eid || 'N/A',
        'Employee Name': employeeData.ename || 'N/A',
        'Date': formatDate(task.date),
        'Project Name': task.projectname || 'N/A',
        'Project Type': task.projecttype || 'N/A',
        'Project Status': task.projectstatus || 'N/A',
        'Category': task.category || 'N/A',
        'Points': task.points || 0,
        'Total Points': employeeData.totalPoints || 0
      }));
    });

    if (flattenedTasks.length === 0) {
      throw new Error('No valid tasks to export');
    }

    // Create worksheet with the flattened data
    const worksheet = XLSX.utils.json_to_sheet(flattenedTasks);
    
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
      'I': 12  // Total Points
    };
    
    worksheet['!cols'] = Object.values(columnWidths).map(width => ({ wch: width }));

    // Create workbook and append sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    
    // Save the file
    saveAs(data, `${fileName || 'Monthly-Tasks-Export'}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert(`Error exporting to Excel: ${error.message}`);
  }
};

const MonthWiseView = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchMonthlyData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/monthly/tasks', {
        params: {
          month: selectedMonth
        }
      });
      
      // Group tasks by employee
      const groupedTasks = response.data.tasks.reduce((acc, task) => {
        if (!acc[task.eid]) {
          acc[task.eid] = {
            eid: task.eid,
            ename: task.ename,
            tasks: [],
            totalPoints: 0
          };
        }
        acc[task.eid].tasks.push(task);
        acc[task.eid].totalPoints += task.points || 0;
        return acc;
      }, {});

      setMonthlyData(Object.values(groupedTasks));
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setMonthlyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMonth]);

  const formatMonthYear = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <>
      <Navbar />
      <div className="month-wise-view">
        <motion.h2 
          className="dashboard-title"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Monthly Task Overview
        </motion.h2>

        <div className="month-selector">
          <div className="form-field">
            <label htmlFor="month">
              <Calendar size={18} className="field-icon" />
              Select Month
            </label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="month-input"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : monthlyData.length > 0 ? (
          <div className="monthly-cards">
            {monthlyData.map((employeeData, idx) => (
              <motion.div
                key={employeeData.eid}
                className="employee-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="employee-header">
                  <h3>{employeeData.ename}</h3>
                  <span className="employee-id">ID: {employeeData.eid}</span>
                  <div className="points-summary">
                    <Award size={24} className="points-icon" />
                    <span className="total-points">{employeeData.totalPoints} Points</span>
                  </div>
                </div>

                <div className="tasks-list">
                  <table className="task-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Project Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeData.tasks.map((task, taskIdx) => (
                        <tr key={taskIdx}>
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
                            <span className="points-badge">
                              {task.points || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="no-data-message">
            <p>No tasks found for {formatMonthYear(selectedMonth)}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MonthWiseView; 