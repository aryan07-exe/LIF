import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user || !user.role) {
    // Not logged in
    return <Navigate to="/" replace />;
  }
  if (user.role !== 'admin') {
    // Not admin
    return <Navigate to="/employee-profile" replace />;
  }
  return children;
};

export default AdminRoute;
