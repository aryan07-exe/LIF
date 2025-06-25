const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Add a new user (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { name, email, password, department, role, formAccess } = req.body;
    if (!name || !email || !password || !department || !role || !formAccess) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const employeeId = `EMP${Date.now().toString().slice(-6)}`;
    const user = new User({ name, email, password, department, role, formAccess, employeeId });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { _id: user._id, name: user.name, email: user.email, department: user.department, role: user.role, formAccess: user.formAccess, employeeId: user.employeeId } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
