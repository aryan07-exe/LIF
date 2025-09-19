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

// GET single task by ID (debug / verification)
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('Error fetching task by id:', req.params.id, err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});


// PUT update a task by ID
router.put('/update/:id', async (req, res) => {
  try {
    console.log(`PUT /api/edit/update/${req.params.id} payload:`, req.body);
    let updateData = { ...req.body };
    // Only assign points from schema if not provided in request
    if (
      updateData.projectstatus && updateData.projectstatus.toLowerCase() === 'complete' &&
      (updateData.points === undefined || updateData.points === '' || isNaN(Number(updateData.points)))
    ) {
      const ProjectTypePoints = require('../models/ProjectTypePoints');
      const entry = await ProjectTypePoints.findOne({ type: updateData.projecttype });
      updateData.points = entry ? entry.points : 0;
    }
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json(updatedTask);
  } catch (err) {
    console.error('Error in PUT /update/:id, payload:', req.body, err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// PATCH update approval only (admin review)
router.patch('/approval/:id', async (req, res) => {
  try {
    console.log(`PATCH /api/edit/approval/${req.params.id} payload:`, req.body);
    const { approval } = req.body;
    if (!approval || !['pending', 'approved'].includes(approval)) {
      return res.status(400).json({ error: 'Invalid approval value' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    task.approval = approval;
    await task.save();
    console.log(`Approval updated for ${req.params.id}:`, approval);
    res.json(task);
  } catch (err) {
    console.error('Error updating approval:', { body: req.body, err });
    res.status(500).json({ error: 'Failed to update approval.' });
  }
});

module.exports = router;
