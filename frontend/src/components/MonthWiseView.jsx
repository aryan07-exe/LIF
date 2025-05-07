import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper function to format the date to M-D-YYYY format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // Months are zero-indexed
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

const MonthlyTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchTasks = async (month) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks?month=${month}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks(selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Monthly Tasks</h2>
      
      <label className="block mb-2">
        Filter by Month:
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="ml-2 p-1 border rounded"
        />
      </label>

      {tasks.length === 0 ? (
        <p>No tasks found for this month.</p>
      ) : (
        <ul className="space-y-4 mt-4">
          {tasks.map((task) => (
            <li key={task._id} className="border p-4 rounded shadow-sm">
              <h3 className="text-lg font-bold">{task.title}</h3>
              <p>{task.description}</p>
              <small>Submitted By: {task.submittedBy}</small><br/>
              <small>Date: {formatDate(task.date)}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MonthlyTaskPage;
