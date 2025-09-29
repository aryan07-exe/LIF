import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NewNavbar from './NewNavbar';
import styles from './AssignTask.module.css';

const API_BASE = ' https://lif-lkgk.onrender.com';

const emptyTaskRow = () => ({ projectType: '', assigned: 1 });
const emptyMonthGroup = () => ({ month: new Date().toISOString().slice(0,7), tasks: [ emptyTaskRow() ] });

export default function AssignTask() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [groups, setGroups] = useState([ emptyMonthGroup() ]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); fetchProjectTypes(); }, []);
  useEffect(() => { if (selectedUser) fetchAssignments(selectedUser); else setAssignments([]); }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/users/eids`);
      setUsers(res.data || []);
    } catch (err) {
      console.error('fetch users', err);
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/task/projecttypes`);
      setProjectTypes(res.data.projectTypes || []);
    } catch (err) {
      console.error('fetch project types', err);
    }
  };

  const fetchAssignments = async (eid) => {
    try {
      const res = await axios.get(`${API_BASE}/api/assigned-task`, { params: { eid } });
      setAssignments(res.data || []);
    } catch (err) {
      console.error('fetch assignments', err);
      setAssignments([]);
    }
  };

  const addGroup = () => setGroups([...groups, emptyMonthGroup()]);
  const removeGroup = (gi) => setGroups(groups.filter((_,i)=>i!==gi));
  const addTaskRow = (gi) => { const copy = [...groups]; copy[gi].tasks.push(emptyTaskRow()); setGroups(copy); };
  const removeTaskRow = (gi, ri) => { const copy = [...groups]; copy[gi].tasks = copy[gi].tasks.filter((_,i)=>i!==ri); setGroups(copy); };

  const handleGroupChange = (gi, field, value) => { const copy = [...groups]; copy[gi][field] = value; setGroups(copy); };
  const handleTaskChange = (gi, ri, field, value) => { const copy = [...groups]; copy[gi].tasks[ri][field] = value; setGroups(copy); };

  const handleSubmit = async () => {
    if (!selectedUser) return alert('Select employee');
    // validate
    for (const g of groups) {
      if (!g.month) return alert('Select month for all groups');
      for (const t of g.tasks) {
        if (!t.projectType) return alert('Select project type for all rows');
        if (!t.assigned || Number(t.assigned) < 0) return alert('Assigned must be >= 0');
      }
    }

    const payload = [];
    groups.forEach(g => {
      const [y,m] = g.month.split('-');
      g.tasks.forEach(t => payload.push({ eid: selectedUser, projectType: t.projectType, assigned: Number(t.assigned), completed: 0, month: Number(m), year: Number(y) }));
    });

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/assigned-task/bulk`, payload, { headers: localStorage.getItem('token') ? { Authorization: localStorage.getItem('token') } : {} });
      alert('Assigned saved');
      setGroups([ emptyMonthGroup() ]);
      fetchAssignments(selectedUser);
    } catch (err) {
      console.error('submit', err);
      alert('Failed to save');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    // id here is an object { docId, projectType }
    if (!window.confirm('Delete this assigned item?')) return;
    try {
      await axios.delete(`${API_BASE}/api/assigned-task/${id.docId}/task/${encodeURIComponent(id.projectType)}`, { headers: localStorage.getItem('token') ? { Authorization: localStorage.getItem('token') } : {} });
      fetchAssignments(selectedUser);
    } catch (err) { console.error('delete', err); alert('Delete failed'); }
  };

  return (
    <div>
      <NewNavbar />
      <div className={styles.pageWrap}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <div className={styles.title}>Assign Tasks</div>
              <div className={styles.controls}>
                <select className={styles.select} value={selectedUser} onChange={e=>setSelectedUser(e.target.value)}>
                  <option value="">Select Employee</option>
                  {users.map(u => (<option key={u.employeeId||u.eid} value={u.employeeId||u.eid}>{(u.employeeId||u.eid)} - {(u.name||u.ename)}</option>))}
                </select>
                <button className={styles.primaryBtn} onClick={handleSubmit} disabled={loading}>{loading? 'Saving...':'Save Assignments'}</button>
                <button className={`${styles.secondaryBtn} bg-red-800`} onClick={() => navigate('/assign-list')} style={{ marginLeft: 8 }}>Get Details</button>
              </div>
            </div>

            <div className={styles.gridRows}>
              {groups.map((g,gi)=> (
                <div key={gi} className={styles.groupCard}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <label>Month</label>
                      <input className={styles.input} type="month" value={g.month} onChange={e=>handleGroupChange(gi,'month',e.target.value)} />
                    </div>
                    <div>
                      <button className={styles.ghostBtn} onClick={()=>removeGroup(gi)}>Remove Month</button>
                    </div>
                  </div>

                  <div style={{marginTop:8}}>
                    {g.tasks.map((t,ri)=>(
                      <div key={ri} className={styles.row}>
                        <div style={{flex:1}}>
                          <label>Project Type</label>
                          <select className={styles.input} value={t.projectType} onChange={e=>handleTaskChange(gi,ri,'projectType',e.target.value)}>
                            <option value="">Select Type</option>
                            {projectTypes.map((pt,i)=>(<option key={i} value={pt}>{pt}</option>))}
                          </select>
                        </div>
                        <div style={{width:120}}>
                          <label>Assigned</label>
                          <input className={styles.input} type="number" value={t.assigned} onChange={e=>handleTaskChange(gi,ri,'assigned',e.target.value)} />
                        </div>
                        <div className={styles.rowActions}>
                          <button className={styles.ghostBtn} onClick={()=>removeTaskRow(gi,ri)}>Remove</button>
                          {ri === g.tasks.length-1 && <button className={styles.ghostBtn} onClick={()=>addTaskRow(gi)}>Add Row</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <button className={styles.ghostBtn} onClick={addGroup}>Add Month Group</button>
              </div>
            </div>

            <div style={{marginTop:12}}>
              <h3>Assigned Items</h3>
              {assignments.length === 0 ? <p className={styles.mutedText}>No assignments</p> : (
                <table className={styles.assignTable}>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Project Type</th>
                      <th>Assigned</th>
                      <th>Completed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={`${a._id}::${a.projectType}`}>
                        <td>{a.year}-{String(a.month).padStart(2,'0')}</td>
                        <td>{a.projectType}</td>
                        <td>{a.assigned}</td>
                        <td>{a.completed}</td>
                        <td><button className={styles.dangerBtn} onClick={()=>handleDelete({ docId: a._id, projectType: a.projectType })}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
