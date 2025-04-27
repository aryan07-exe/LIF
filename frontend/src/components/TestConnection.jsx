import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestConnection = () => {
  const [status, setStatus] = useState('Checking...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing connection to backend...');
        const response = await axios.get('http://localhost:5000/api/projects');
        console.log('Backend response:', response.data);
        setStatus('Connected successfully!');
        setData(response.data);
      } catch (err) {
        console.error('Connection error:', err);
        setStatus('Connection failed!');
        setError(err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Frontend-Backend Connection Test</h2>
      <div style={{ margin: '20px 0' }}>
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div style={{ color: 'red', margin: '20px 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {data && (
        <div style={{ margin: '20px 0' }}>
          <strong>Data received:</strong>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestConnection; 