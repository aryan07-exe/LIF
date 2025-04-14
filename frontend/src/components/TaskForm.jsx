import React, { useState } from 'react';
import axios from 'axios';
import './TaskForm.css'; // Optional: for styling

const TaskForm = () => {
  const [formData, setFormData] = useState({
    eid: '',
    date: '',
    projectname: '',
    projecttype: '',
    projectstatus: '',
    note: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/task', formData);
      alert('Task submitted successfully!');
      setFormData({
        eid: '',
        date: '',
        projectname: '',
        projecttype: '',
        projectstatus: '',
        note: ''
      });
    } catch (error) {
      console.error(error);
      alert('Error submitting task');
    }
  };

  return (
    <div className="task-form-container">
      <h2>Daily Task Submission</h2>
      <form className="task-form" onSubmit={handleSubmit}>
        <label>Employee ID</label>
        <input
          type="text"
          name="eid"
          value={formData.eid}
          onChange={handleChange}
          required
        />

        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <label>Project Name</label>
        <input
          type="text"
          name="projectname"
          value={formData.projectname}
          onChange={handleChange}
          required
        />

        <label>Project Type</label>
        <select
          name="projecttype"
          value={formData.projecttype}
          onChange={handleChange}
          required
        >
          <option value="">--Select Type--</option>
          <option value="Internal">Internal</option>
          <option value="Client">Client</option>
        </select>

        <label>Project Status</label>
        <select
          name="projectstatus"
          value={formData.projectstatus}
          onChange={handleChange}
          required
        >
          <option value="">--Select Status--</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending">Pending</option>
        </select>

        <label>Notes</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Write any additional notes..."
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default TaskForm;
