import React, { useState } from 'react';
import axios from 'axios';

const Task3Form = () => {
  const [formData, setFormData] = useState({
    eid: user.employeeId || '',
    ename: user.name || '',
    date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    projectname: '',
    projecttype: '',
    projectstatus: '',
    category: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Validate required fields
      if (!formData.projectname || !formData.date || !formData.projecttype || 
          !formData.projectstatus || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      // Convert date to ISO string
      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString()
      };

      console.log('Submitting form data:', submitData);
      const response = await axios.post('http://localhost:5000/task3', submitData, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.data);
      setMessage('Task3 submitted successfully!');
      
      // Reset form except EID and ename
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
        projectname: '',
        projecttype: '',
        projectstatus: '',
        category: '',
        notes: ''
      }));
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit task3. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your form components here */}
    </div>
  );
};

export default Task3Form; 