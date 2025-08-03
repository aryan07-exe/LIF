
import React, { useState, useEffect } from 'react';
import LifFooter from './LifFooter';
import axios from 'axios';
import Navbar from './NewNavbar';
import './OnsiteMonthlyView.css';
import './PostProductionMonthlyView.css';

const CombinedAdminPanel = () => {
  const [onsiteTasks, setOnsiteTasks] = useState([]);
  const [postTasks, setPostTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Onsite tasks fetch (same as OnsiteAdminPanel)
        const onsiteRes = await axios.get('https://lif.onrender.com/onsite/tasks', {
          headers: { Authorization: token }
        });
        setOnsiteTasks(onsiteRes.data.tasks || []);

        // Fetch all post-production tasks using new API
        const postRes = await axios.get('https://localhot:5000/api/task/all', {
          headers: { Authorization: token }
        });
        setPostTasks(postRes.data.tasks || []);
        setError('');
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to robustly parse date string (YYYY-MM-DD or DD-MM-YYYY)
  function parseDateString(dateStr) {
    if (!dateStr) return '';
    // If already YYYY-MM-DD, use as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr);
    }
    // If DD-MM-YYYY, convert to YYYY-MM-DD
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('-');
      return new Date(`${y}-${m}-${d}`);
    }
    // Fallback
    return new Date(dateStr);
  }

  // Debug: log postTasks date values
  if (postTasks && postTasks.length > 0) {
    // Only log once per render
    // eslint-disable-next-line no-console
    console.log('PostProduction task.date values:', postTasks.map(t => t.date));
  }

  return (
    <>
      <Navbar />
      <div className="monthly-task-view">
        <h2 style={{marginBottom: '1.5rem', color: '#a80a3c'}}>Combined Onsite & Post-Production Tasks</h2>
        {loading ? (
          <div style={{textAlign: 'center', padding: '2rem'}}>Loading...</div>
        ) : error ? (
          <div style={{color: 'red', textAlign: 'center'}}>{error}</div>
        ) : (
          <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
            <div style={{flex: 1, minWidth: 400}}>
              <h3 style={{color: '#6c0428'}}>Onsite Tasks</h3>
              <div className="table-container">
                <table className="task-table clean-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>ID</th>
                      <th>Project</th>
                      <th>Shoot Date</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Category</th>
                      <th>Team</th>
                      <th>Points</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onsiteTasks.map((task) => (
                      <tr key={task._id}>
                        <td>{task.ename}</td>
                        <td>{task.eid}</td>
                        <td>{task.projectname}</td>
                        <td>{task.shootDate ? new Date(task.shootDate).toLocaleDateString() : ''}</td>
                        <td>{task.startTime}</td>
                        <td>{task.endTime}</td>
                        <td>{task.category}</td>
                        <td>{task.teamNames}</td>
                        <td>{task.points}</td>
                        <td>{task.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{flex: 1, minWidth: 400}}>
              <h3 style={{color: '#6c0428'}}>Post-Production Tasks</h3>
              <div className="table-container">
                <table className="task-table clean-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>ID</th>
                      <th>Project</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Points</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postTasks.map((task) => (
                      <tr key={task._id}>
                        <td>{task.ename}</td>
                        <td>{task.eid}</td>
                        <td>{task.projectname}</td>
                        <td>{task.date ? parseDateString(task.date).toLocaleDateString() : ''}</td>
                        <td>{task.projecttype}</td>
                        <td>{task.projectstatus}</td>
                        <td>{task.category}</td>
                        <td>{task.points}</td>
                        <td>{task.notes || task.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <LifFooter />
    </>
  );
};

export default CombinedAdminPanel;
