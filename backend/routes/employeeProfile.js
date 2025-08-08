const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');

// GET /api/employee/profile/:eid
router.get('/profile/:eid', async (req, res) => {
  try {
    const eid = req.params.eid;
    const user = await User.findOne({ employeeId: eid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get all tasks for this employee
    const tasks = await Task.find({ eid }).sort({ date: 1 });
    // Group tasks by month (YYYY-MM)
    const tasksByMonth = {};
    tasks.forEach(task => {
      const d = new Date(task.date);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!tasksByMonth[month]) tasksByMonth[month] = [];
      tasksByMonth[month].push(task);
    });

    res.json({
      profile: {
        name: user.name,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        // add more fields as needed
      },
      tasksByMonth
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
