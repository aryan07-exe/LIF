import './TaskEdit.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './NewNavbar';

const EditOnsite = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchEid, setSearchEid] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/edit/onsite/all')
      .then(res => {
        setTasks(res.data);
        setFilteredTasks(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Error fetching onsite tasks.');
        setLoading(false);
      });
  }, []);

  const handleEditClick = (idx) => {
    setEditIdx(idx);
    setEditForm({ ...tasks[idx] });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/edit/onsite/update/${id}`, editForm);
      const updated = res.data;
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      setEditIdx(null);
    } catch (err) {
      alert('Failed to update onsite task.');
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
  };

  useEffect(() => {
    let filtered = [...tasks];
    
    if (searchEid) {
      filtered = filtered.filter(task => 
        task.eid.toLowerCase().includes(searchEid.toLowerCase())
      );
    }
    
    if (searchDate) {
      filtered = filtered.filter(task => 
        task.shootDate && task.shootDate.slice(0,10) === searchDate
      );
    }
    
    setFilteredTasks(filtered);
  }, [searchEid, searchDate, tasks]);

  return (<>
    <Navbar/>
    <div className="task-edit-container">
      <div className="task-edit-header">
        <h1 className="task-edit-title">Onsite Task Entries</h1>
      </div>
      <div className="search-container">
        <div className="search-group">
          <label className="search-label">Search EID:</label>
          <input
            type="text"
            className="search-input"
            placeholder="Enter EID..."
            value={searchEid}
            onChange={(e) => setSearchEid(e.target.value)}
          />
        </div>
        <div className="search-group">
          <label className="search-label">Filter Date:</label>
          <input
            type="date"
            className="search-input"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </div>
      </div>
        {loading ? (
          <div className="task-message loading">Loading tasks...</div>
        ) : error ? (
          <div className="task-message error">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="task-message empty">No onsite tasks found.</div>
        ) : (
          <div className="task-table-container">
          <table className="task-table">
            <thead className="task-header">
              <tr>
                <th className="table-cell">EID</th>
                <th className="table-cell">Employee Name</th>
                <th className="table-cell">Shoot Date</th>
                <th className="table-cell">Start Time</th>
                <th className="table-cell">End Time</th>
                <th className="table-cell">Project Name</th>
                <th className="table-cell">Category</th>
                <th className="table-cell">Notes</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, idx) => (
                <tr key={task._id || idx} className={editIdx === idx ? 'editing' : ''}>
                  {editIdx === idx ? (
                    <>
                      <td><input className="task-edit-input" name="eid" value={editForm.eid} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="ename" value={editForm.ename} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="shootDate" type="date" value={editForm.shootDate ? editForm.shootDate.slice(0,10) : ''} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="startTime" value={editForm.startTime} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="endTime" value={editForm.endTime} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="projectname" value={editForm.projectname} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="category" value={editForm.category} onChange={handleEditChange} /></td>
                      <td className="notes-cell">
                        <textarea 
                          className="task-edit-input notes-textarea"
                          name="notes"
                          value={editForm.notes || ''}
                          onChange={handleEditChange}
                          placeholder="Enter notes here..."
                          rows="3"
                        />
                      </td>
                      <td className="table-cell actions-cell">
                        <button className="task-edit-btn save-btn" onClick={() => handleEditSave(task._id)}>Save</button>
                        <button className="task-edit-btn cancel-btn" onClick={handleEditCancel}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="table-cell">{task.eid}</td>
                      <td className="table-cell">{task.ename}</td>
                      <td className="table-cell">{task.shootDate ? (() => { const d = new Date(task.shootDate); return d.toLocaleDateString('en-GB'); })() : ''}</td>
                      <td className="table-cell">{task.startTime}</td>
                      <td className="table-cell">{task.endTime}</td>
                      <td className="table-cell">{task.projectname}</td>
                      <td className="table-cell">{task.category}</td>
                      <td className="table-cell notes-cell">
                        <div className="notes-content">
                          {task.notes || 'No notes available'}
                        </div>
                      </td>
                      <td className="table-cell actions-cell">
                        <button className="task-edit-btn edit-btn" onClick={() => handleEditClick(idx)}>Edit</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div></>
  );
};

export default EditOnsite;
