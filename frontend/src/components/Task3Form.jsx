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
      const response = await axios.post('https://lif.onrender.com/task3', submitData, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.data);
      alert('Task3 submitted successfully!');
      
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
      {message && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            background: 'rgba(0,0,0,0.25)'
          }}
        >
          <div style={{
            background: '#fff',
            color: '#059669',
            padding: '2rem 2.5rem',
            borderRadius: '1.2rem',
            fontSize: '1.25rem',
            fontWeight: 600,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            textAlign: 'center',
            minWidth: '250px'
          }}>
            {message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Task3Form; 