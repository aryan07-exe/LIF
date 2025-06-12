
import React, { useEffect, useState } from 'react';
import axios from 'axios';
// ...existing code...

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
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Onsite Attendance - Last 7 Days</h2>
      {loading ? (
        <p>Loading...</p>
      ) : eid ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              {calendar.map((day, idx) => (
                <th key={idx} style={{ border: '1px solid #ccc', padding: '10px' }}>
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
                    border: '1px solid #ccc',
                    padding: '10px',
                    backgroundColor: day.status === '✅' ? '#d4edda' : '#f8d7da',
                    color: day.status === '✅' ? '#155724' : '#721c24',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  {day.status}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Please log in or ensure the 'user' object exists in localStorage.</p>
      )}
    </div>
  );
};
export default OnsiteCalendar;
