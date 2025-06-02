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
      const res = await axios.get(`http://localhost:5000/api/tasks/last7days/${eid}`);
      setCalendar(res.data);
    } catch (error) {
      console.error("Error fetching calendar data", error);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{
        textAlign: 'center',
        color: '#fff',
        marginBottom: '1.5rem',
        fontSize: '1.4rem',
        fontWeight: 600,
        letterSpacing: '0.5px',
        textShadow: '0 2px 8px #6366f1cc'
      }}>
        Last 7 Days Task Submission
      </h2>
      {eid ? (
        <table style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: '0',
          marginTop: '10px',
          background: 'rgba(99,102,241,0.07)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px #6366f133',
        }}>
          <thead>
            <tr>
              {calendar.map((day, idx) => (
                <th key={idx} style={{
                  border: 'none',
                  padding: '12px 8px',
                  color: '#a855f7',
                  background: 'rgba(99,102,241,0.13)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textAlign: 'center',
                  letterSpacing: '0.5px',
                }}>
                  {day.date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {calendar.map((day, idx) => (
                <td
                  key={idx}
                  style={{
                    padding: '16px 8px',
                    background: day.status === '✅' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.13)',
                    color: day.status === '✅' ? '#22c55e' : '#ef4444',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    border: 'none',
                    borderRadius: '8px',
                    textAlign: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  {day.status}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#fff', textAlign: 'center', marginTop: '1.5rem' }}>
          Please log in or make sure 'user' is set in localStorage.
        </p>
      )}
    </div>
  );
};

export default TaskCalendar;
