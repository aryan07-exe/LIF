import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LifFooter from './LifFooter';

import './LoginPage.css';
import logoImg from '../images/4.png';
import titleImg from '../images/2.png';

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
      const response = await axios.post(' https://lif-lkgk.onrender.com/api/auth/login', formData);
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
    <div className="login-page" style={{ backgroundColor: '#f4f4f4' }}>
      <div className="login-container">
        <div className="login-card fade-in">
          <div className="login-header login-header-centered">
            <div className="login-logo-wrapper">
              <img src={logoImg} alt="Life in Frames Logo" className="login-logo-img" />
            </div>
            <div className="login-title">
              <img src={titleImg} alt="Login Title" style={{maxWidth: '160px', height: 'auto', display: 'block', margin: '0 auto'}} />
            </div>
            <div className="login-subtitle">User Login</div>
            <div className="login-divider" style={{margin: '1.2rem 0 1.5rem 0', height: 2, background: 'linear-gradient(90deg, #fff 0%, #6c0428 60%, #fff 100%)', opacity: 0.25, borderRadius: 2}}></div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" style={{marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group" style={{width: '100%'}}>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="modern-input"
                autoComplete="username"
                style={{borderRadius: 8, border: '2px solid #6c0428', fontSize: '1.08rem', padding: '0.8rem 1.1rem'}}
              />
              <label htmlFor="employeeId" className={`modern-label${formData.employeeId ? ' filled' : ''}`}>Employee ID</label>
            </div>

            <div className="form-group" style={{width: '100%'}}>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="modern-input"
                autoComplete="current-password"
                style={{borderRadius: 8, border: '2px solid #6c0428', fontSize: '1.08rem', padding: '0.8rem 1.1rem'}}
              />
              <label htmlFor="password" className={`modern-label${formData.password ? ' filled' : ''}`}>Password</label>
            </div>

            <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
              <button 
                type="submit" 
                className={`login-button${loading ? ' loading' : ''}`}
                disabled={loading}
                style={{borderRadius: 8, background: '#6c0428', color: '#fff', border: '2px solid #6c0428', fontWeight: 600, fontSize: '1.08rem', marginTop: 18, boxShadow: '0 2px 8px rgba(108,4,40,0.08)', minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
              >
                {loading ? (
                  <span className="loading-spinner-container" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <span style={{display: 'inline-block', verticalAlign: 'middle'}}>
                      <div className="loader"></div>
                    </span>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          <div style={{ color: '#6c0428', fontSize: '0.95rem', marginTop: 32, whiteSpace: 'nowrap' }}>
  &copy;  Life In Frames. For Authorized Personnel Only.
</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;