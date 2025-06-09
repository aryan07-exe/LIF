// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from "./components/LoginPage"
import Landing from "./components/Landing"
import Admin from "./components/AdminPanel"
import Task from "./components/TaskForm"
import Task2 from "./components/Task2"
import Monthly from "./components/MonthlyTaskView"
import Task3 from "./components/Task3"
import Taskname from "./components/Taskname"
import Register from "./components/Register"
import TestConnection from "./components/TestConnection"
import AddProject from "./components/AddProject"
import MonthWiseView from "./components/MonthWiseView"
import EmployeeProfile from "./components/EmployeeProfile"
import OnsiteForm from "./components/OnsiteForm"
import AddUser from "./components/AddUser"
import OnsiteAdminPanel from './components/OnsiteAdminPanel';
import OnsiteMonthlyView from './components/OnsiteMonthlyView';
import PostProductionMonthlyView from './components/PostProductionMonthlyView';
import AdminProfile from "./components/AdminProfile";
import EmployeeCalendar from "./components/EmployeeCalendar";
import NewProjecr from "./components/NewProjectform";
import OnsiteCalender from "./components/OnsiteCalender";
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define routes here */}
        <Route path="/" element={<Login />} />
        <Route path="/ne" element={<NewProjecr />} />
        <Route path="/task" element={<Task />} />
        <Route path="/task2" element={<Task2 />} />
        <Route path="/task3" element={<Task3 />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/monthly" element={<Monthly />} />
        <Route path="/month-wise" element={<MonthWiseView />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/taskname" element={<Taskname />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test-connection" element={<TestConnection />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/employee-profile" element={<EmployeeProfile />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/onsite" element={<OnsiteForm />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/onsite-admin" element={<OnsiteAdminPanel />} />
        <Route path="/onsite-monthly" element={<OnsiteMonthlyView />} />
        <Route path="/post-production-monthly" element={<PostProductionMonthlyView />} />
        <Route path="/ecd" element={<EmployeeCalendar />} />

        <Route path="/onsite-calendar" element={<OnsiteCalender />} />
         </Routes>
    </Router>
  );
};

export default App;
