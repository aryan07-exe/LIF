import React, { useState } from 'react';

const FrontPage = () => {
  const [eid, setEid] = useState('');
  const [month, setMonth] = useState('');
  const [tasks, setTasks] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEidChange = (e) => {
    setEid(e.target.value);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const handleFetchTasks = async () => {
    setLoading(true);
    setError(null);
    setTasks([]);
    setTotalPoints(0);

    try {
      const params = new URLSearchParams();
      if (eid) params.append('eid', eid);
      if (month) params.append('month', month);

      const response = await fetch(`/monthly/tasks?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error fetching tasks');
      }

      const data = await response.json();
      setTasks(data.tasks);
      setTotalPoints(data.totalPoints);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Task Management</h1>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Enter Employee ID"
          value={eid}
          onChange={handleEidChange}
        />
        <input
          type="month"
          value={month}
          onChange={handleMonthChange}
        />
        <button onClick={handleFetchTasks} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Tasks'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="results">
        <h2>Total Points: {totalPoints}</h2>
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>
              <strong>{task.name}</strong> - {task.date} - Points: {task.points}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FrontPage;
