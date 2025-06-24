
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
      const res = await axios.get(`https://lif.onrender.com/api/onsite/last7days/${eid}`);
      setCalendar(res.data);
    } catch (error) {
      console.error("Error fetching onsite calendar data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>SHOOT REPORT SUBMISSION</h2>
      {loading ? (
        <p>Loading...</p>
      ) : eid ? (
        <table className="onsite-vertical-table" style={{ width: '100%', maxWidth: 400, margin: '20px auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '10px', background: '#f1f5f9', color: '#000000ff', fontWeight: 700 }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', background: '#f1f5f9', color: 'rgba(4, 4, 4, 1)ff', fontWeight: 700 }}>Status</th>
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
        <p>Please log in or ensure the 'user' object exists in localStorage.</p>
      )}
    </div>
  );
};
export default OnsiteCalendar;
