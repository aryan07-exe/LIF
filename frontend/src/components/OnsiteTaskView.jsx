import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnsiteTaskView.css';

const OnsiteTaskView = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    eid: '',
    shootDate: '',
    projectname: '',
    teamNames: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    eids: [],
    projectNames: [],
    teamNames: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`http://localhost:5000/onsite/tasks?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data.tasks);
      setAvailableFilters(data.filters);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      eid: '',
      shootDate: '',
      projectname: '',
      teamNames: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryPoints = (categories) => {
    const pointsConfig = {
      weddingCeremony: 2,
      engagementSangeet: 1,
      reception: 1,
      preWedding: 1,
      maternity: 1,
      babyShower: 1,
      birthday: 1,
      anniversary: 1,
      corporate: 1,
      product: 1,
      fashion: 1,
      food: 1,
      realEstate: 1,
      travel: 1,
      event: 1,
      other: 1
    };

    return Object.entries(categories)
      .filter(([_, value]) => value)
      .reduce((total, [category]) => total + (pointsConfig[category] || 0), 0);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="onsite-task-view">
      <div className="header">
        <h1>Onsite Tasks</h1>
        <button onClick={() => navigate('/onsite')} className="add-task-btn">
          Add New Task
        </button>
      </div>

      <div className="filters">
        <select
          name="eid"
          value={filters.eid}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All EIDs</option>
          {availableFilters.eids.map(eid => (
            <option key={eid} value={eid}>{eid}</option>
          ))}
        </select>

        <input
          type="date"
          name="shootDate"
          value={filters.shootDate}
          onChange={handleFilterChange}
          className="filter-input"
        />

        <select
          name="projectname"
          value={filters.projectname}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Projects</option>
          {availableFilters.projectNames.map(project => (
            <option key={project} value={project}>{project}</option>
          ))}
        </select>

        <select
          name="teamNames"
          value={filters.teamNames}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Teams</option>
          {availableFilters.teamNames.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>

        <button onClick={handleClearFilters} className="clear-filters-btn">
          Clear Filters
        </button>
      </div>

      <div className="tasks-grid">
        {tasks.map(task => (
          <div key={task._id} className="task-card">
            <div className="task-header">
              <h3>{task.projectname}</h3>
              <span className="points">{getCategoryPoints(task.categories)} points</span>
            </div>
            
            <div className="task-details">
              <p><strong>EID:</strong> {task.eid}</p>
              <p><strong>Name:</strong> {task.ename}</p>
              <p><strong>Shoot Date:</strong> {formatDate(task.shootDate)}</p>
              <p><strong>Time:</strong> {task.startTime} - {task.endTime}</p>
              <p><strong>Team:</strong> {task.teamNames}</p>
              
              <div className="categories">
                <strong>Categories:</strong>
                <ul>
                  {Object.entries(task.categories)
                    .filter(([_, value]) => value)
                    .map(([category]) => (
                      <li key={category}>{category}</li>
                    ))}
                </ul>
              </div>

              {task.notes && (
                <div className="notes">
                  <strong>Notes:</strong>
                  <p>{task.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnsiteTaskView; 