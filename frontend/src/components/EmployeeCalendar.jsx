import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TaskCalendar = () => {
  const [calendar, setCalendar] = useState([]);
  const [eid, setEid] = useState('');

  useEffect(() => {
    // Get the user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.employeeId) {
      const empId = user.employeeId;
      setEid(empId);
      fetchCalendar(empId);
    } else {
      console.error("employeeId not found in localStorage 'user' object.");
    }
  }, []);

  const fetchCalendar = async (eid) => {
    try {
      const res = await axios.get(`https://lif.onrender.com/api/tasks/last7days/${eid}`);
      setCalendar(res.data);
    } catch (error) {
      console.error("Error fetching calendar data", error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Post Production Task Submission</h2>
      {eid ? (
        <table className="employee-vertical-table" style={{ width: '100%', maxWidth: 400, margin: '20px auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '10px', background: '#f1f5f9', color: '#6366f1', fontWeight: 700 }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', background: '#f1f5f9', color: '#6366f1', fontWeight: 700 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {calendar.map((day, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ccc', padding: '10px', fontWeight: 600 }}>{day.date}</td>
                <td
                  style={{
                    border: '1px solid #ccc',
                    padding: '10px',
                    backgroundColor: day.status === '✅' ? '#d4edda' : '#f8d7da',
                    color: day.status === '✅' ? '#155724' : '#721c24',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                  }}
                >
                  {day.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Please log in or make sure 'user' is set in localStorage.</p>
      )}
    </div>
  );
};

export default TaskCalendar;