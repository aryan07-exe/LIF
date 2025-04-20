import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TaskForm from './components/TaskForm';
import Monthly from './components/MonthlyTaskView';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  const isAuthenticated = localStorage.getItem('token');

  return (
    <Router>
      <div>
        {/* Define Routes */}
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/monthly" element={
            <ProtectedRoute>
              <Monthly />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
