import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TaskForm from './components/TaskForm';
import Monthly from './components/MonthlyTaskView';
import AdminPanel from './components/AdminPanel';
//import LoginPage from './components/LoginPage';

const App = () => {
  return (
    <Router>
      <div>
        {/* Simple Navigation Bar */}
        <nav style={{ padding: '10px', background: '#f5f5f5' }}>
          <Link to="/" style={{ marginRight: '20px' }}>Submit Task</Link>
          <Link to="/admin">Admin Panel</Link>
        </nav>

        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<TaskForm />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/monthly" element={<Monthly />} />
       
        </Routes>
      </div>
    </Router>
  );
};

export default App;
