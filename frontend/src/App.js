// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ProjectForm  from "./components/ProjectForm"
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
import AdminRoute from "./components/AdminRoute";
import AddUserFull from "./components/AddUserFull";
import ViewUsersFull from "./components/ViewUsersFull";

import EmployeeCalendar from "./components/EmployeeCalendar";
import NewProjecr from "./components/NewProjectform";
import OnsiteCalender from "./components/OnsiteCalender";
import Maintain from "./components/Maintainpage";
import PrivateRoute from "./components/PrivateRoute";
import Removeuser from "./components/Removeuser";
import MaintainUser from "./components/Maintainuser";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define routes here */}
        <Route path="/" element={<Login />} />
        <Route path="/ne" element={<PrivateRoute><NewProjecr /></PrivateRoute>} />
        <Route path="/task" element={<PrivateRoute><Task /></PrivateRoute>} />
        <Route path="/task2" element={<PrivateRoute><Task2 /></PrivateRoute>} />
        <Route path="/task3" element={<PrivateRoute><Task3 /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/monthly" element={<PrivateRoute><Monthly /></PrivateRoute>} />
        <Route path="/month-wise" element={<PrivateRoute><MonthWiseView /></PrivateRoute>} />
        <Route path="/landing" element={<PrivateRoute><Landing /></PrivateRoute>} />
        <Route path="/taskname" element={<PrivateRoute><Taskname /></PrivateRoute>} />
        <Route path="/register" element={<AdminRoute><Register /></AdminRoute>} />
        <Route path="/test-connection" element={<PrivateRoute><TestConnection /></PrivateRoute>} />
        <Route path="/add-project" element={<AdminRoute><AddProject /></AdminRoute>} />
        <Route path="/employee-profile" element={<PrivateRoute><EmployeeProfile /></PrivateRoute>} />
        <Route path="/admin-profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
        <Route path="/onsite" element={<PrivateRoute><OnsiteForm /></PrivateRoute>} />
        <Route path="/add-user" element={<AdminRoute><AddUser /></AdminRoute>} />
        <Route path="/onsite-admin" element={<AdminRoute><OnsiteAdminPanel /></AdminRoute>} />
        <Route path="/onsite-monthly" element={<PrivateRoute><OnsiteMonthlyView /></PrivateRoute>} />
        <Route path="/post-production-monthly" element={<AdminRoute><PostProductionMonthlyView /></AdminRoute>} />
        <Route path="/ecd" element={<PrivateRoute><EmployeeCalendar /></PrivateRoute>} />
        <Route path="/maintain" element={<PrivateRoute><Maintain /></PrivateRoute>} />
        <Route path="/project-form" element={<AdminRoute><ProjectForm /></AdminRoute>} />
        <Route path="/onsite-calendar" element={<PrivateRoute><OnsiteCalender /></PrivateRoute>} />
        <Route path="/add-user-full" element={<AdminRoute><AddUserFull /></AdminRoute>} />
        <Route path="/view-users-full" element={<AdminRoute><ViewUsersFull /></AdminRoute>} />

        <Route path="/remove-user" element={<AdminRoute><Removeuser /></AdminRoute>} />
        <Route path="/maintain-user" element={<AdminRoute><MaintainUser /></AdminRoute>} />
         </Routes>
    </Router>
  );
};

export default App;
