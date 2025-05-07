const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Helper function to build the date range based on the selected month
const getDateRange = (month) => {
  const [year, monthNumber] = month.split('-');
  const startDate = new Date(Date.UTC(year, monthNumber - 1, 1)); // First day of the month in UTC
  const endDate = new Date(Date.UTC(year, monthNumber, 0, 23, 59, 59, 999)); // Last moment of the month in UTC

  return { startDate, endDate };
};

// GET tasks by month (format: ?month=YYYY-MM)
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ error: 'Month is required (format YYYY-MM)' });
    }

    const { startDate, endDate } = getDateRange(month);

    // Query the database for tasks within the specified date range
    const tasks = await Task.find({
      date: { $gte: startDate, $lte: endDate } // $gte (greater than or equal to), $lte (less than or equal to)
    }).sort({ date: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
