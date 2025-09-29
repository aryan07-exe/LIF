import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TaskEdit.css';



const Task3AdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});

 useEffect(() => {
  axios.get(' https://lif-lkgk.onrender.com/api/edit/all')
    .then(res => {
      const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTasks(sortedData);
      setLoading(false);
    })
    .catch(err => {
      setError('Error fetching task3 entries.');
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
      const res = await axios.put(` https://lif-lkgk.onrender.com/api/edit/update/${id}`, editForm);
      const updated = res.data;
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      setEditIdx(null);
    } catch (err) {
      alert('Failed to update task.');
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
  };

  return (
    <div className="task-edit-container">
      <div className="task-edit-header">
        <h1 className="task-edit-title">Task3 Submitted Entries</h1>
      </div>
      {loading ? (
        <div className="task-message loading">Loading tasks...</div>
      ) : error ? (
        <div className="task-message error">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="task-message empty">No task3 entries found.</div>
      ) : (
        <div className="task-table-container">
          <table className="task-table">
            <thead className="task-header">
              <tr>
                <th className="table-cell">EID</th>
                <th className="table-cell">Employee Name</th>
                <th className="table-cell">Date</th>
                <th className="table-cell">Project Name</th>
                <th className="table-cell">Project Type</th>
                <th className="table-cell">Project Status</th>
                <th className="table-cell">Category</th>
                <th className="table-cell">Points</th>
                <th className="table-cell">Notes</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, idx) => (
                <tr key={task._id || idx} className={editIdx === idx ? 'editing' : ''}>
                  {editIdx === idx ? (
                    <>
                      <td><input className="task-edit-input" name="eid" value={editForm.eid} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="ename" value={editForm.ename} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="date" type="date" value={editForm.date ? editForm.date.slice(0,10) : ''} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="projectname" value={editForm.projectname} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="projecttype" value={editForm.projecttype} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="projectstatus" value={editForm.projectstatus} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="category" value={editForm.category} onChange={handleEditChange} /></td>
                      <td><input className="task-edit-input" name="points" value={editForm.points} onChange={handleEditChange} /></td>
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
                      <td>{task.eid}</td>
                      <td>{task.ename}</td>
                      <td>{task.date ? (() => { const d = new Date(task.date); return d.toLocaleDateString('en-GB'); })() : ''}</td>
                      <td>{task.projectname}</td>
                      <td>{task.projecttype}</td>
                      <td>{task.projectstatus}</td>
                      <td>{task.category}</td>
                      <td>{task.points}</td>
                      <td>{task.notes}</td>
                      <td>
                        <button onClick={() => handleEditClick(idx)}>Edit</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Task3AdminPanel;
