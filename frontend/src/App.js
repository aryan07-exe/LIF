// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

 import Login from "./components/LoginPage"
 import Landing from "./components/Landing"
 import Admin from "./components/AdminPanel"
 import Task from "./components/TaskForm"
 import Task2 from "./components/Task2"
 import Monthly from "./components/MonthlyTaskView"
 import Task3 from "./components/Taskname"

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define routes here */}
        <Route path="/" element={<Login />} />
        <Route path="/task" element={<Task />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/monthly" element={<Monthly />} />
        <Route path="/task2" element={<Task2 />} />
        <Route path="/task3" element={<Task3 />} />
        {/* Catch-all route for 404 */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;
