import React, { useEffect, useState } from 'react';
import Navbar from './NewNavbar.jsx'
const API_BASE = ' https://lif-lkgk.onrender.com';

export default function AssignedTaskList({ eid: propEid }) {
  const [eid, setEid] = useState(propEid || '');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableEids, setAvailableEids] = useState([]);
  const [completedMap, setCompletedMap] = useState({});

  useEffect(() => {
    // If component receives an eid prop (e.g., from EmployeeProfile), use it and skip dropdown
    if (propEid) {
      setEid(propEid);
      fetchTasks(propEid);
      return;
    }

    // otherwise attempt localStorage fallbacks and load available EIDs for dropdown
    const directEid = localStorage.getItem('eid') || localStorage.getItem('employeeId');
    if (directEid) {
      setEid(directEid);
      fetchTasks(directEid);
    }

    fetchAvailableEids();
  }, [propEid]);

  const fetchAvailableEids = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/users/eids`, { headers });
      if (!res.ok) {
        console.warn('Failed to load eids for dropdown');
        return;
      }
      const data = await res.json();
      // Expecting array of objects with employeeId and name
      setAvailableEids(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching available EIDs', err);
    }
  };

  const fetchTasks = async (selectedEid) => {
    if (!selectedEid) {
      setError('No employee id provided');
      setTasks([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = `${API_BASE}/api/assigned-task?eid=${encodeURIComponent(selectedEid)}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const txt = await res.text();
        console.error('assigned-task fetch failed', res.status, txt);
        setError('Failed to fetch assigned tasks');
        setTasks([]);
        return;
      }
      const data = await res.json();
      console.debug('assigned tasks for', selectedEid, data);
      const rows = Array.isArray(data) ? data : [];
      setTasks(rows);
      // fetch completed project names for this eid
      fetchCompletedProjects(selectedEid, rows);
    } catch (err) {
      console.error('fetch assigned tasks error', err);
      setError('Error fetching assigned tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch approved tasks and build a map of completed project names by year-month-projectType
  const fetchCompletedProjects = async (selectedEid, assignedRows = []) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/edit/all`, { headers });
      if (!res.ok) return;
      const all = await res.json();
      const approved = Array.isArray(all) ? all.filter(t => t.approval === 'approved' && t.eid === selectedEid) : [];

      const map = {};
      approved.forEach(t => {
        let year = '', month = '';
        if (t.date && typeof t.date === 'string') {
          const parts = t.date.split('-');
          if (parts.length >= 2) {
            year = parts[0];
            month = parts[1];
          }
        }
        const key = `${year}-${month}-${(t.projecttype || '').toLowerCase()}`;
        if (!map[key]) map[key] = new Set();
        if (t.projectname) map[key].add(t.projectname);
      });

      const out = {};
      Object.keys(map).forEach(k => { out[k] = Array.from(map[k]); });
      // make sure keys from assignedRows exist
      assignedRows.forEach(r => {
        const k = `${r.year || ''}-${String(r.month).padStart(2, '0')}-${(r.projectType || r.projectType || '').toLowerCase()}`;
        if (!out[k]) out[k] = [];
      });

      setCompletedMap(out);
    } catch (err) {
      console.error('Error fetching completed projects', err);
    }
  };

  const onSelectChange = (e) => {
    const val = e.target.value;
    setEid(val);
    fetchTasks(val);
  };

  return (
    <>
      <Navbar />
      <div className="p-4 sm:p-6 bg-gray-50 min-h-[calc(100vh-60px)]"> {/* Adjusted padding for small screens */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100 mt-6"> {/* Adjusted padding for small screens */}
          <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-3">Assigned Tasks</h2> {/* Adjusted font size for small screens */}
          {propEid ? null : (
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-700">Select Employee</label>
              <select
                value={eid}
                onChange={onSelectChange}
                className="w-full p-2 border rounded-md bg-white text-sm"
              >
                <option value="">-- Select Employee --</option>
                {availableEids.map(u => (
                  <option key={u.employeeId} value={u.employeeId}>{u.employeeId} - {u.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-gray-500">{error}</p>}
          {loading ? (
            <p className="text-sm text-gray-600">Loading...</p>
          ) : (
            tasks.length === 0 ? (
              <p className="text-sm text-gray-500">No assigned tasks found.</p>
            ) : (
              <div className="overflow-x-auto max-h-[60vh] rounded-lg border border-gray-200"> {/* Added border, rounded corners, and overflow-x-auto for responsiveness */}
                <table className="min-w-full table-auto divide-y divide-gray-200 text-sm"> {/* Changed to min-w-full with table-auto */}
                  <thead className="bg-gradient-to-r from-red-700 to-pink-600 text-white sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-semibold whitespace-nowrap">Month</th> {/* Increased padding, added whitespace-nowrap */}
                      <th className="p-3 text-left font-semibold whitespace-nowrap">Project Type</th> {/* Increased padding, added whitespace-nowrap */}
                      <th className="p-3 text-center font-semibold whitespace-nowrap">Assigned</th> {/* Increased padding, added whitespace-nowrap */}
                      <th className="p-3 text-center font-semibold whitespace-nowrap">Completed</th> {/* Increased padding, added whitespace-nowrap */}
                      <th className="p-3 text-left font-semibold whitespace-nowrap">Project Name</th> {/* Increased padding, added whitespace-nowrap */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {tasks.map((t, i) => (
                      <tr key={`${t._id}::${t.projectType}::${i}`} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-700 whitespace-nowrap">{t.year}-{String(t.month).padStart(2, '0')}</td> {/* Increased padding, added whitespace-nowrap */}
                        <td className="p-3 text-gray-800 font-semibold whitespace-nowrap">{t.projectType}</td> {/* Increased padding, added whitespace-nowrap */}
                        <td className="p-3 text-center text-gray-700 whitespace-nowrap">{t.assigned}</td> {/* Increased padding, added whitespace-nowrap */}
                        <td className="p-3 text-center text-gray-700 whitespace-nowrap">{t.completed}</td> {/* Increased padding, added whitespace-nowrap */}
                        <td className="p-3 text-gray-700"> {/* Increased padding */}
                          {(() => {
                            const key = `${t.year || ''}-${String(t.month).padStart(2, '0')}-${(t.projectType || '').toLowerCase()}`;
                            const names = completedMap[key] || [];
                            if (!names || names.length === 0) return <span className="text-sm text-gray-400">—</span>;
                            return (
                              <div className="flex flex-wrap gap-2 justify-start sm:justify-start"> {/* Adjusted alignment for flexibility */}
                                {names.map((n, idx) => (
                                  <span key={idx} className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{n}</span>
                                ))}
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}