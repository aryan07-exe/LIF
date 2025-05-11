import React, { useState } from 'react';
import "./Neww.css"


const WeddingForm = () => {
  const [days, setDays] = useState([
    {
      date: '',
      role: 'Both',
      traditionalPhotographer: 0,
      traditionalCinematographer: 0,
      candidPhotographer: 0,
      candidCinematographer: 0
    }
  ]);

  const [formData, setFormData] = useState({
    projectName: '',
    startDate: '',
    endDate: '',
    deliverables: {
      photoAlbum: false,
      digitalAlbum: false,
      teaser: false,
      fullVideo: false
    }
  });

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...days];
    updatedDays[index][field] = value;
    setDays(updatedDays);
  };

  const addDay = () => {
    setDays([
      ...days,
      {
        date: '',
        role: 'Both',
        traditionalPhotographer: 0,
        traditionalCinematographer: 0,
        candidPhotographer: 0,
        candidCinematographer: 0
      }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...formData, days });
    // Send to backend
  };

  return (
    <form className="invoice-form" onSubmit={handleSubmit}>
      <h2>Wedding Photography Project Form</h2>

      <div className="form-group">
        <label>Project Name</label>
        <input
          type="text"
          value={formData.projectName}
          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Start Date</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>End Date</label>
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        />
      </div>

      <h3>Day-wise Manpower</h3>
      {days.map((day, index) => (
        <div key={index} className="day-row">
          <input
            type="date"
            value={day.date}
            onChange={(e) => handleDayChange(index, 'date', e.target.value)}
          />
          <select
            value={day.role}
            onChange={(e) => handleDayChange(index, 'role', e.target.value)}
          >
            <option value="Both">Both</option>
            <option value="Photographer">Only Photographer</option>
            <option value="Cinematographer">Only Cinematographer</option>
          </select>
          <input
            type="number"
            placeholder="Traditional Photographer"
            value={day.traditionalPhotographer}
            onChange={(e) => handleDayChange(index, 'traditionalPhotographer', e.target.value)}
          />
          <input
            type="number"
            placeholder="Traditional Cinematographer"
            value={day.traditionalCinematographer}
            onChange={(e) => handleDayChange(index, 'traditionalCinematographer', e.target.value)}
          />
          <input
            type="number"
            placeholder="Candid Photographer"
            value={day.candidPhotographer}
            onChange={(e) => handleDayChange(index, 'candidPhotographer', e.target.value)}
          />
          <input
            type="number"
            placeholder="Candid Cinematographer"
            value={day.candidCinematographer}
            onChange={(e) => handleDayChange(index, 'candidCinematographer', e.target.value)}
          />
        </div>
      ))}
      <button type="button" className="add-item-button" onClick={addDay}>
        + Add Day
      </button>

      <h3>Deliverables</h3>
      <div className="form-group checkbox-group">
        {Object.keys(formData.deliverables).map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={formData.deliverables[key]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deliverables: {
                    ...formData.deliverables,
                    [key]: e.target.checked
                  }
                })
              }
            />
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          </label>
        ))}
      </div>

      <button type="submit" className="submit-button">
        Submit
      </button>
    </form>
  );
};

export default WeddingForm;

