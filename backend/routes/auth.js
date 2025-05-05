const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    
    // Find user by employee ID
    const user = await User.findOne({ employeeId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid employee ID or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid employee ID or password' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, employeeId: user.employeeId, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    // Return user info and token
    res.json({
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        formAccess: user.formAccess
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // This route should be protected by auth middleware
    const token = req.header('Authorization')?.replace('Bearer', '').trim();
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new user (admin only)
router.post('/register', async (req, res) => {
  try {
    const { employeeId, email, password, name, department, role, formAccess } = req.body;
    
    // Validate required fields
    if (!employeeId || !email || !password || !name || !department) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate employee ID format
    if (!/^[A-Za-z0-9]+$/.test(employeeId)) {
      return res.status(400).json({ message: 'Employee ID must contain only letters and numbers' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ employeeId }, { email }] });
    if (existingUser) {
      if (existingUser.employeeId === employeeId) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Create new user
    const user = new User({
      employeeId,
      email,
      password,
      name,
      department,
      role: role || 'employee',
      formAccess: formAccess || 'both'
    });
    
    await user.save();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 