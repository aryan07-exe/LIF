import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './NewNavbar';

const OptionManager = () => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [newType, setNewType] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [editTypeIdx, setEditTypeIdx] = useState(null);
  const [editStatusIdx, setEditStatusIdx] = useState(null);
  const [editTypeValue, setEditTypeValue] = useState('');
  const [editStatusValue, setEditStatusValue] = useState('');
  const [msg, setMsg] = useState('');
  const [pointsList, setPointsList] = useState({});
  const [editPointsIdx, setEditPointsIdx] = useState(null);
  const [editPointsValue, setEditPointsValue] = useState('');

  useEffect(() => {
    fetchOptions();
    fetchPointsList();
  }, []);

  const fetchOptions = async () => {
    const types = await axios.get('https://lif.onrender.com/api/task/projecttypes');
    setProjectTypes(types.data.projectTypes || []);
    const statuses = await axios.get('https://lif.onrender.com/api/task/projectstatuses');
    setProjectStatuses(statuses.data.projectStatuses || []);
  };

  const fetchPointsList = async () => {
    const res = await axios.get('https://lif.onrender.com/api/points');
    // Convert array to object: { type: points }
    const obj = {};
    (res.data.points || []).forEach(pt => { obj[pt.type] = pt.points; });
    setPointsList(obj);
  };

  // Project Type handlers
  const addType = async () => {
    if (!newType.trim()) return;
    await axios.post('https://lif.onrender.com/api/task/projecttypes', { value: newType });
    setNewType('');
    fetchOptions();
  };
  const deleteType = async (val) => {
    await axios.delete(`https://lif.onrender.com/api/task/projecttypes/${encodeURIComponent(val)}`);
    fetchOptions();
  };
  const startEditType = (idx, val) => {
    setEditTypeIdx(idx);
    setEditTypeValue(val);
  };
  const saveEditType = async (oldVal) => {
    await axios.put(`https://lif.onrender.com/api/task/projecttypes/${encodeURIComponent(oldVal)}`, { newValue: editTypeValue });
    setEditTypeIdx(null);
    setEditTypeValue('');
    fetchOptions();
  };

  const startEditPoints = (idx, type) => {
    setEditPointsIdx(idx);
    setEditPointsValue(pointsList[type] ?? '');
  };
  const saveEditPoints = async (type) => {
    try {
      await axios.put(`https://lif.onrender.com/api/points/${encodeURIComponent(type)}`, { points: Number(editPointsValue) });
      setMsg('Points updated for this project type!');
      setEditPointsIdx(null);
      setEditPointsValue('');
      fetchPointsList();
    } catch (err) {
      setMsg('Failed to update points.');
    }
  };

  // Project Status handlers
  const addStatus = async () => {
    if (!newStatus.trim()) return;
    await axios.post('https://lif.onrender.com/api/task/projectstatuses', { value: newStatus });
    setNewStatus('');
    fetchOptions();
  };
  const deleteStatus = async (val) => {
    await axios.delete(`https://lif.onrender.com/api/task/projectstatuses/${encodeURIComponent(val)}`);
    fetchOptions();
  };
  const startEditStatus = (idx, val) => {
    setEditStatusIdx(idx);
    setEditStatusValue(val);
  };
  const saveEditStatus = async (oldVal) => {
    await axios.put(`https://lif.onrender.com/api/task/projectstatuses/${encodeURIComponent(oldVal)}`, { newValue: editStatusValue });
    setEditStatusIdx(null);
    setEditStatusValue('');
    fetchOptions();
  };

  return (
    <>
    <Navbar/>
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #a80a3c22', padding: 24 }}>
      <h2 style={{ color: '#a80a3c', marginBottom: 16 }}>Project Type & Status Manager</h2>
      <div style={{ marginBottom: 32 }}>
        <h3>Project Types</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {projectTypes.map((type, idx) => (
            <li key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ flex: 1 }}>{type}</span>
              <span style={{ marginRight: 8, color: '#218c5a', fontWeight: 500 }}>Points: {pointsList[type] ?? 0}</span>
              {editPointsIdx === idx ? (
                <>
                  <input type="number" value={editPointsValue} onChange={e => setEditPointsValue(e.target.value)} style={{ width: 60, marginRight: 4 }} />
                  <button onClick={() => saveEditPoints(type)} style={{ marginRight: 4 }}>Save Points</button>
                  <button onClick={() => setEditPointsIdx(null)}>Cancel</button>
                </>
              ) : (
                <button onClick={() => startEditPoints(idx, type)} style={{ marginRight: 4 }}>Edit Points</button>
              )}
              <button onClick={() => startEditType(idx, type)} style={{ marginRight: 4 }}>Edit</button>
              <button onClick={() => deleteType(type)}>Delete</button>
            </li>
          ))}
        </ul>
        <input value={newType} onChange={e => setNewType(e.target.value)} placeholder="Add new type" style={{ marginRight: 8 }} />
        <button onClick={addType}>Add</button>
      </div>
      <div>
        <h3>Project Statuses</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {projectStatuses.map((status, idx) => (
            <li key={status} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              {editStatusIdx === idx ? (
                <>
                  <input value={editStatusValue} onChange={e => setEditStatusValue(e.target.value)} style={{ marginRight: 8 }} />
                  <button onClick={() => saveEditStatus(status)} style={{ marginRight: 4 }}>Save</button>
                  <button onClick={() => setEditStatusIdx(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>{status}</span>
                  <button onClick={() => startEditStatus(idx, status)} style={{ marginRight: 4 }}>Edit</button>
                  <button onClick={() => deleteStatus(status)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
        <input value={newStatus} onChange={e => setNewStatus(e.target.value)} placeholder="Add new status" style={{ marginRight: 8 }} />
        <button onClick={addStatus}>Add</button>
      </div>
      {msg && <div style={{ marginTop: 16, color: '#218c5a' }}>{msg}</div>}
    </div>
</>  );
};

export default OptionManager;
