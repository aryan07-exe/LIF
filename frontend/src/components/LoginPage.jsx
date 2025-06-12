import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './LoginPage.css';
import logoImg from '../images/4.png';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://lif.onrender.com/api/auth/login', formData);
      const user = response.data.user;
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin-profile'); // Redirect to new admin profile page
      } else {
        navigate('/employee-profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page modern-bg">
      <div className="login-container">
        <div className="login-card modern-glass fade-in">

          <div className="login-header login-header-centered">
            <div className="login-logo-wrapper">
              <img src={logoImg} alt="Life in Frames Logo" className="login-logo-img" />
            </div>
            <div className="login-title modern-title">Life In Frames</div>
            <div className="login-subtitle modern-subtitle">User Login</div>
            <div className="login-divider modern-divider"></div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group modern-form-group">
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="modern-input"
                autoComplete="username"
              />
              <label htmlFor="employeeId" className={`modern-label${formData.employeeId ? ' filled' : ''}`}>Employee ID</label>
            </div>

            <div className="form-group modern-form-group">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="modern-input"
                autoComplete="current-password"
              />
              <label htmlFor="password" className={`modern-label${formData.password ? ' filled' : ''}`}>Password</label>
            </div>

            <button 
              type="submit" 
              className={`login-button modern-btn${loading ? ' loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner-container">
                  <span className="loading-spinner" /> Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="login-footer modern-footer">
            &copy; {new Date().getFullYear()} Life In Frames. For Authorized Personnel Only.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 