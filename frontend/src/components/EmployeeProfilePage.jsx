import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './NewNavbar';
import { Bar } from 'react-chartjs-2';
import LifFooter from './LifFooter';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);


const EmployeeProfilePage = () => {
  const [users, setUsers] = useState([]);
  const [selectedEid, setSelectedEid] = useState('');
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(' https://lif-lkgk.onrender.com/api/users/eids')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
    // Fetch all tasks (no filters)
    setLoading(true);
    axios.get(' https://lif-lkgk.onrender.com/postproduction/monthly', {
      params: {
        startDate: '2000-01-01', // very early date
        endDate: '2100-12-31',   // very late date
      }
    })
      .then(res => setAllTasks(res.data.tasks || []))
      .catch(() => setAllTasks([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEid) {
      setFilteredTasks([]);
      setProfile(null);
      return;
    }
    // Filter tasks by selected employee ID
    const filtered = allTasks.filter(t => t.eid === selectedEid);
    setFilteredTasks(filtered);
    // Find user profile
    const user = users.find(u => u.employeeId === selectedEid);
    setProfile(user || null);
  }, [selectedEid, allTasks, users]);

  // Group filtered tasks by month
  const tasksByMonth = {};
  filteredTasks.forEach(task => {
    const d = new Date(task.date);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!tasksByMonth[month]) tasksByMonth[month] = [];
    tasksByMonth[month].push(task);
  });

  // Prepare data for chart
  const chartData = {
    labels: Object.keys(tasksByMonth),
    datasets: [
      {
        label: 'Total Points (Complete Tasks)',
        data: Object.values(tasksByMonth).map(arr => arr.filter(t => t.projectstatus && t.projectstatus.toLowerCase() === 'complete').reduce((sum, t) => sum + (t.points || 0), 0)),
        backgroundColor: 'rgba(33, 140, 90, 0.7)',
        borderColor: '#218c5a',
        borderWidth: 2,
        type: 'bar',
        yAxisID: 'y',
      },
      {
        label: 'Total Tasks',
        data: Object.values(tasksByMonth).map(arr => arr.length),
        backgroundColor: 'rgba(168, 10, 60, 0.2)',
        borderColor: '#a80a3c',
        borderWidth: 2,
        type: 'line',
        yAxisID: 'y1',
        tension: 0.3,
        pointBackgroundColor: '#a80a3c',
        pointBorderColor: '#fff',
        pointRadius: 5,
      },
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Poppins, Segoe UI, Arial, sans-serif', size: 16 },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Monthly Productivity Overview',
        font: { family: 'Poppins, Segoe UI, Arial, sans-serif', size: 22, weight: 'bold' },
        color: '#a80a3c',
        padding: { top: 10, bottom: 30 },
      },
      tooltip: {
        bodyFont: { family: 'Segoe UI, Arial, sans-serif', size: 15 },
        titleFont: { family: 'Poppins, Segoe UI, Arial, sans-serif', size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Points',
          font: { family: 'Poppins, Segoe UI, Arial, sans-serif', size: 16 },
          color: '#218c5a',
        },
        grid: { color: '#e5e7eb' },
        ticks: { color: '#218c5a', font: { family: 'Segoe UI', size: 14 } },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Total Tasks',
          font: { family: 'Poppins, Segoe UI, Arial, sans-serif', size: 16 },
          color: '#a80a3c',
        },
        grid: { drawOnChartArea: false },
        ticks: { color: '#a80a3c', font: { family: 'Segoe UI', size: 14 } },
      },
      x: {
        ticks: { color: '#333', font: { family: 'Segoe UI', size: 14 } },
        grid: { color: '#e5e7eb' },
      },
    },
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(120deg, #fbeaf4 0%, #fff 100%)', fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', padding: 0, margin: 0 }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '2.5rem 2vw' }}>
          <h2 style={{ color: '#a80a3c', fontWeight: 800, fontSize: '2.5rem', letterSpacing: 1, marginBottom: 32, textAlign: 'center', fontFamily: 'Poppins, Segoe UI, Arial, sans-serif' }}>Employee Productivity Profile</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '2.5rem', marginBottom: 40 }}>
            <div style={{ flex: '0 0 340px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #a80a3c18', padding: '2rem 1.5rem', minHeight: 220 }}>
              <label htmlFor="eid" style={{ fontWeight: 600, color: '#a80a3c', fontSize: 18, marginBottom: 12, display: 'block', letterSpacing: 0.5 }}>Select Employee</label>
              <select id="eid" value={selectedEid} onChange={e => setSelectedEid(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16, marginBottom: 24, background: '#f9f6fa' }}>
                <option value="">-- Select --</option>
                {users.map(emp => (
                  <option key={emp.employeeId} value={emp.employeeId}>{emp.employeeId} - {emp.name}</option>
                ))}
              </select>
              {profile && (
                <div style={{ marginTop: 12, fontSize: 17, color: '#333' }}>
                  <div style={{ marginBottom: 6 }}><b>Name:</b> {profile.name}</div>
                  <div style={{ marginBottom: 6 }}><b>Employee ID:</b> {profile.employeeId}</div>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #a80a3c18', padding: '2rem 1.5rem', minHeight: 220 }}>
              {loading ? <div style={{ fontSize: 20, color: '#a80a3c', fontWeight: 600 }}>Loading...</div> : profile && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
                  <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}>
                    <h3 style={{ color: '#a80a3c', marginBottom: 14, fontWeight: 800, fontSize: 22, letterSpacing: 0.5, textAlign: 'left', fontFamily: 'Poppins, Segoe UI, Arial, sans-serif' }}>Tasks & Points (Month-wise)</h3>
                    <div style={{ background: 'rgba(249,246,250,0.95)', borderRadius: 14, boxShadow: '0 1px 6px #a80a3c11', padding: '0.5rem 0.5rem 0.5rem 0.5rem', marginBottom: 18, overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, fontFamily: 'Segoe UI, Arial, sans-serif', minWidth: 340 }}>
                        <thead>
                          <tr style={{ background: '#fbeaf4', color: '#6c0428', fontWeight: 700, fontSize: 16 }}>
                            <th style={{ padding: '10px 18px', borderTopLeftRadius: 10 }}>Month</th>
                            <th style={{ padding: '10px 18px' }}>Total Tasks</th>
                            <th style={{ padding: '10px 18px', borderTopRightRadius: 10 }}>Total Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(tasksByMonth).map(([month, tasks], idx, arr) => (
                            <tr key={month} style={{ background: idx % 2 === 0 ? '#fff' : '#f9f6fa', borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #eee' }}>
                              <td style={{ padding: '10px 18px', fontWeight: 600 }}>{month}</td>
                              <td style={{ padding: '10px 18px', textAlign: 'center', color: '#a80a3c', fontWeight: 700 }}>{tasks.length}</td>
                              <td style={{ padding: '10px 18px', textAlign: 'center', color: '#218c5a', fontWeight: 700 }}>{tasks.filter(t => t.projectstatus && t.projectstatus.toLowerCase() === 'complete').reduce((sum, t) => sum + (t.points || 0), 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <h4 style={{ color: '#6c0428', margin: '16px 0 6px 0', fontWeight: 700, fontSize: 16, letterSpacing: 0.2 }}>Categories Submitted</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: 8 }}>
                      {[...new Set(filteredTasks.map(t => t.category))].filter(Boolean).map(cat => (
                        <span key={cat} style={{ background: '#a80a3c', color: '#fff', borderRadius: 8, padding: '5px 16px', fontSize: 15, fontWeight: 600, letterSpacing: 0.2 }}>{cat}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ color: '#a80a3c', marginBottom: 16, fontWeight: 700, fontSize: 22, letterSpacing: 0.5 }}>Productivity Chart</h3>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px #a80a3c11', width: '100%', minWidth: 320, minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <LifFooter />
    </>
  );
};

// Export as both default and Seeuser for compatibility
export default EmployeeProfilePage;
export const Seeuser = EmployeeProfilePage;
