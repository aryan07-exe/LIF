
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeeProfile.module.css';

const OnsiteCalendar = () => {
  const [calendar, setCalendar] = useState([]);
  const [eid, setEid] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.employeeId) {
      const empId = user.employeeId;
      setEid(empId);
      fetchCalendar(empId);
    } else {
      console.error("employeeId not found in localStorage 'user' object.");
      setLoading(false);
    }
  }, []);

  const fetchCalendar = async (eid) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/onsite/last7days/${eid}`);
      setCalendar(res.data);
    } catch (error) {
      console.error("Error fetching onsite calendar data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calendarCard">
      <div className="employee-calendar-container">
        <div className="calendar-header">
          <h2>Onsite Attendance - Last 7 Days </h2>
        </div>
        {loading ? (
          <p className="calendar-empty-msg">Loading...</p>
        ) : eid ? (
          <div className="calendar-table-wrapper">
            <table className="calendar-table">
              <thead>
                <tr>
                  {calendar.map((day, idx) => (
                    <th key={idx}>{day.date}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {calendar.map((day, idx) => (
                    <td
                      key={idx}
                      className={day.status === '✅' ? 'calendar-status-success' : 'calendar-status-fail'}
                    >
                      {day.status}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="calendar-empty-msg">Please log in or ensure the 'user' object exists in localStorage.</p>
        )}
      </div>
    </div>
  );
};
export default OnsiteCalendar;
