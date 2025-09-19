import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './NewNavbar';

const API_BASE = 'https://lif.onrender.com';

const emptyRow = () => ({ projectname: '', projecttype: '', date: new Date().toISOString().slice(0,10), month: new Date().toISOString().slice(0,7) });

const AssignMonthlyTask = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [rows, setRows] = useState([ emptyRow() ]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);

  useEffect(() => { fetchUsers(); fetchProjectLists(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/users/eids`);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchProjectLists = async () => {
    try {
      axios.get(`${API_BASE}/api/task/projecttypes`).then(res => setProjectTypes(res.data.projectTypes || [])).catch(() => setProjectTypes([]));
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/projectname/names`, { headers: { Authorization: token } });
      setProjects(res.data.projectNames || []);
    } catch (err) {
      console.error('Failed to fetch project lists', err);
      setProjects([]); setProjectTypes([]);
    }
  };

  const fetchAssignments = async (eid) => {
    try {
      const params = eid ? { eid } : { month: rows[0].month };
      const res = await axios.get(`${API_BASE}/api/monthly-task`, { params });
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch assignments', err);
    }
  };

  const handleAddRow = () => setRows([...rows, emptyRow()]);
  const handleRemoveRow = (idx) => setRows(rows.filter((_, i) => i !== idx));

  const handleBulkAssign = async () => {
    if (!selectedUser) return alert('Please select an employee');
    for (const r of rows) if (!r.projectname || !r.projecttype) return alert('Please complete all rows');

    setLoading(true);
    try {
      const user = users.find(u => (u.employeeId || u.eid) === selectedUser);
      const payload = rows.map(r => ({
        eid: selectedUser,
        ename: user ? (user.name || user.ename) : selectedUser,
        projectname: r.projectname,
        projecttype: r.projecttype,
        type: r.projecttype,
        month: r.month,
        count: 1
      }));

      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/api/monthly-task/bulk`, payload, { headers: { Authorization: token } });
      if (res.status === 200) {
        alert('Assigned successfully');
        setRows([ emptyRow() ]);
        fetchAssignments(selectedUser);
      }
    } catch (err) {
      console.error('Bulk assign failed', err);
      alert('Failed to assign tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>Assign Monthly Task</h2>
        <div style={{ maxWidth: 900 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block' }}>Employee</label>
            <select value={selectedUser} onChange={e => { setSelectedUser(e.target.value); fetchAssignments(e.target.value); }} style={{ width: '100%', padding: 8 }}>
              <option value="">Select Employee</option>
              {users.map(u => (
                <option key={u.employeeId || u.eid} value={u.employeeId || u.eid}>{(u.employeeId || u.eid)} - {(u.name || u.ename)}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
                <div>
                  <label>Project Name</label>
                  <input list="project-list" value={row.projectname} onChange={e => { const newRows = [...rows]; newRows[idx].projectname = e.target.value; setRows(newRows); }} style={{ width: '100%', padding: 8 }} />
                  <datalist id="project-list">
                    {projects.map((p,i) => (<option key={i} value={p} />))}
                  </datalist>
                </div>
                <div>
                  <label>Project Type</label>
                  <select value={row.projecttype} onChange={e => { const newRows = [...rows]; newRows[idx].projecttype = e.target.value; setRows(newRows); }} style={{ width: '100%', padding: 8 }}>
                    <option value="">Select Type</option>
                    {projectTypes.map((pt,i) => (<option key={i} value={pt}>{pt}</option>))}
                  </select>
                </div>
                <div>
                  <label>Date</label>
                  <input type="date" value={row.date} onChange={e => { const newRows = [...rows]; newRows[idx].date = e.target.value; setRows(newRows); }} style={{ width: '100%', padding: 8 }} />
                </div>
                <div>
                  <label>Month</label>
                  <input type="month" value={row.month} onChange={e => { const newRows = [...rows]; newRows[idx].month = e.target.value; setRows(newRows); }} style={{ width: '100%', padding: 8 }} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={() => handleRemoveRow(idx)}>Remove</button>
                  {idx === rows.length - 1 && <button type="button" onClick={handleAddRow}>Add Row</button>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={handleBulkAssign} disabled={loading} style={{ padding: '8px 16px' }}>{loading ? 'Assigning...' : 'Assign Tasks'}</button>
          </div>

          <div style={{ marginTop: 24 }}>
            <h3>Assigned Tasks</h3>
            {assignments.length === 0 ? <p>No assignments</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Employee</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Project</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Type</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Month</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a._id}>
                      <td style={{ padding: 8 }}>{a.eid} - {a.ename}</td>
                      <td style={{ padding: 8 }}>{a.projectname}</td>
                      <td style={{ padding: 8 }}>{a.projecttype}</td>
                      <td style={{ padding: 8 }}>{a.month}</td>
                      <td style={{ padding: 8 }}>{a.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignMonthlyTask;
