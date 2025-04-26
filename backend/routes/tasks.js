const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const pointsConfig = require('../config/pointsConfig');

// Helper function to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// Calculate points based on project type only
const calculatePoints = (projectType) => {
  return pointsConfig.projectType[projectType] || 0;
};

// Create new task
router.post("/task", async (req, res) => {
  try {
    const points = calculatePoints(req.body.projecttype);
    const task = new Task({
      ...req.body,
      points
    });
    await task.save();
    res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating task" });
  }
});

// GET endpoint for AdminPanel with filters
router.get('/admin/tasks', async (req, res) => {
  const { eid, date, projecttype, projectstatus, category } = req.query;
  const query = {};

  // Use regex for case-insensitive search with escaped patterns
  if (eid) query.eid = { $regex: new RegExp(escapeRegex(eid), 'i') };
  if (date) query.date = date; // Keep date as exact match
  if (projecttype) query.projecttype = { $regex: new RegExp(escapeRegex(projecttype), 'i') };
  if (projectstatus) query.projectstatus = { $regex: new RegExp(escapeRegex(projectstatus), 'i') };
  if (category) query.category = { $regex: new RegExp(escapeRegex(category), 'i') };

  try {
    const tasks = await Task.find(query).sort({ date: -1 });
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    
    // Get unique values for filters
    const uniqueEids = await Task.distinct('eid');
    const uniqueProjectTypes = await Task.distinct('projecttype');
    const uniqueProjectStatuses = await Task.distinct('projectstatus');
    const uniqueCategories = await Task.distinct('category');

    res.json({
      tasks,
      totalPoints,
      filters: {
        eids: uniqueEids,
        projectTypes: uniqueProjectTypes,
        projectStatuses: uniqueProjectStatuses,
        categories: uniqueCategories
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// GET endpoint for MonthlyTaskView
router.get('/monthly/tasks', async (req, res) => {
  const { eid, month, category } = req.query;
  
  try {
    // If month is provided (YYYY-MM format), filter by that month
    const [year, monthNum] = month.split('-');
    const startOfMonth = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endOfMonth = `${year}-${monthNum}-${lastDay}`;
    
    const query = {
      date: { 
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    };

    // Add filters if provided
    if (eid) {
      query.eid = { $regex: new RegExp(escapeRegex(eid), 'i') };
    }
    
    if (category) {
      query.category = { $regex: new RegExp(escapeRegex(category), 'i') };
    }

    // Get tasks with sorting by date
    const tasks = await Task.find(query).sort({ date: 1 });
    
    // Calculate total points
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    
    // Return tasks and total points
    res.json({
      tasks,
      totalPoints
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// GET endpoint for current day's tasks (default for AdminPanel)
router.get('/tasks/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Fetching tasks for today: ${today}`);
    
    const tasks = await Task.find({ date: today }).sort({ date: -1 });
    console.log(`Found ${tasks.length} tasks for today`);
    
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    console.log(`Total points for today: ${totalPoints}`);
    
    // Get unique values for filters
    const uniqueEids = await Task.distinct('eid');
    const uniqueProjectTypes = await Task.distinct('projecttype');
    const uniqueProjectStatuses = await Task.distinct('projectstatus');
    const uniqueCategories = await Task.distinct('category');

    res.json({
      tasks,
      totalPoints,
      filters: {
        eids: uniqueEids,
        projectTypes: uniqueProjectTypes,
        projectStatuses: uniqueProjectStatuses,
        categories: uniqueCategories
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

module.exports = router; 