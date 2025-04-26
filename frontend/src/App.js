// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

 import Login from "./components/LoginPage"
 import Landing from "./components/Landing"
 import Admin from "./components/AdminPanel"
 import Task from "./components/TaskForm"
 import Monthly from "./components/MonthlyTaskView"

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define routes here */}
        <Route path="/" element={<Login />} />
        <Route path="/task" element={<Task />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/monthly" element={<Monthly />} />
        {/* Catch-all route for 404 */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;
