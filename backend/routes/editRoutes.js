const OnsiteTask = require('../models/OnsiteTask');

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');


// GET all onsite tasks (for edit page)
router.get('/onsite/all', async (req, res) => {
  try {
    const tasks = await OnsiteTask.find({}).sort({ shootDate: -1, _id: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch onsite tasks.' });
  }
});

// PUT update an onsite task by ID
router.put('/onsite/update/:id', async (req, res) => {
  try {
    const updatedTask = await OnsiteTask.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: 'Onsite task not found.' });
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update onsite task.' });
  }
});
// GET all tasks (for edit page)
router.get('/all', async (req, res) => {
  try {
    // Sort by date descending, then by _id descending for same-date tasks
    const tasks = await Task.find({}).sort({ date: -1, _id: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});


// PUT update a task by ID
router.put('/update/:id', async (req, res) => {
  try {
    let updateData = { ...req.body };
    // Only assign points if status is 'complete'
    if (updateData.projectstatus && updateData.projectstatus.toLowerCase() === 'complete') {
      const ProjectTypePoints = require('../models/ProjectTypePoints');
      const entry = await ProjectTypePoints.findOne({ type: updateData.projecttype });
      updateData.points = entry ? entry.points : 0;
    }
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

module.exports = router;
