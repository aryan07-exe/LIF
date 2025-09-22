import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewNavbar from './NewNavbar';
import styles from './AssignMonthlyTask.module.css';

const API_BASE = 'https://lif.onrender.com';

const emptyRow = () => ({ projectname: '', projecttype: '', month: new Date().toISOString().slice(0,7) });

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
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/projectname/names`, { headers: token ? { Authorization: token } : {} });
      setProjects(res.data.projectNames || []);
      const res2 = await axios.get(`${API_BASE}/api/task/projecttypes`);
      setProjectTypes(res2.data.projectTypes || []);
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
      const res = await axios.post(`${API_BASE}/api/monthly-task/bulk`, payload, { headers: token ? { Authorization: token } : {} });
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

  const handleApprovalChange = async (id, approval) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/monthly-task/${id}`, { approval }, { headers: token ? { Authorization: token } : {} });
      // refresh assignments for current user
      if (selectedUser) fetchAssignments(selectedUser);
    } catch (err) {
      console.error('Failed to update approval', err);
      alert('Failed to update approval');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_BASE}/api/monthly-task/${id}`, { headers: token ? { Authorization: token } : {} });
      if (res.status === 200) {
        // refresh list
        if (selectedUser) fetchAssignments(selectedUser);
      } else {
        alert('Failed to delete assignment');
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete request failed');
    }
  };

  return (
    <>
      <NewNavbar />
      <div className={styles.pageWrap}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <div className={styles.title}>Assign Monthly Task</div>
              <div className={styles.controls}>
                <select className={styles.select} value={selectedUser} onChange={e => { setSelectedUser(e.target.value); fetchAssignments(e.target.value); }}>
                  <option value="">Select Employee</option>
                  {users.map(u => (
                    <option key={u.employeeId || u.eid} value={u.employeeId || u.eid}>{(u.employeeId || u.eid)} - {(u.name || u.ename)}</option>
                  ))}
                </select>
                <button className={styles.primaryBtn} onClick={handleBulkAssign} disabled={loading}>{loading ? 'Assigning...' : 'Assign Tasks'}</button>
              </div>
            </div>

            <div className={styles.gridRows}>
              {rows.map((row, idx) => (
                <div key={idx} className={styles.row}>
                  <div>
                    <label>Project Name</label>
                    <input list="project-list" className={styles.input} value={row.projectname} onChange={e => { const newRows = [...rows]; newRows[idx].projectname = e.target.value; setRows(newRows); }} />
                    <datalist id="project-list">
                      {projects.map((p,i) => (<option key={i} value={p} />))}
                    </datalist>
                  </div>
                  <div>
                    <label>Project Type</label>
                    <select className={styles.input} value={row.projecttype} onChange={e => { const newRows = [...rows]; newRows[idx].projecttype = e.target.value; setRows(newRows); }}>
                      <option value="">Select Type</option>
                      {projectTypes.map((pt,i) => (<option key={i} value={pt}>{pt}</option>))}
                    </select>
                  </div>
                  <div>
                    <label>Month</label>
                    <input type="month" className={styles.input} value={row.month} onChange={e => { const newRows = [...rows]; newRows[idx].month = e.target.value; setRows(newRows); }} />
                  </div>
                  <div className={styles.rowActions}>
                    <button type="button" className={styles.ghostBtn} onClick={() => handleRemoveRow(idx)}>Remove</button>
                    {idx === rows.length - 1 && <button type="button" className={styles.ghostBtn} onClick={handleAddRow}>Add Row</button>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10 }}>
              <h3>Assigned Tasks</h3>
              {assignments.length === 0 ? <p className={styles.mutedText}>No assignments</p> : (
                <table className={styles.assignTable}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Project</th>
                      <th>Type</th>
                      <th>Approval</th>
                      <th>Month</th>
                      <th>Count</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={a._id}>
                        <td>{a.eid} - {a.ename}</td>
                        <td>{a.projectname}</td>
                        <td>{a.projecttype}</td>
                        <td>{a.approval === 'approved' ? <span className={`${styles.badge} ${styles.approved}`}>approved</span> : <span className={`${styles.badge} ${styles.pending}`}>{a.approval || 'pending'}</span>}</td>
                        <td>{a.month}</td>
                        <td>{a.count}</td>
                        <td>
                          <button className={styles.dangerBtn} onClick={() => handleDeleteAssignment(a._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignMonthlyTask;
