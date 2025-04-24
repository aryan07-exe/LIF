import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import MonthlyTaskView from './components/MonthlyTaskView';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('token') !== null
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <Navigate to="/admin" replace />
          )
        } />
        <Route path="/*" element={
          isAuthenticated ? (
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/monthly" element={<MonthlyTaskView />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
};

export default App;