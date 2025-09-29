const OnsiteTask = require('../models/OnsiteTask');

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Helper to sync AssignedTask counts when approval transitions to 'approved'
async function syncAssignedOnApproval(prevApproval, task) {
  if (prevApproval === 'approved' || !task || task.approval !== 'approved') return;
  try {
    const AssignedTask = require('../models/AssignedTask');
    // Extract month/year from task.date (expected YYYY-MM-DD)
    let year = null, month = null;
    if (task.date && typeof task.date === 'string') {
      const parts = task.date.split('-');
      if (parts.length >= 2) {
        year = Number(parts[0]);
        month = Number(parts[1]);
      }
    }

    // Find grouped document for this eid+month+year
    const filter = { eid: task.eid };
    if (month) filter.month = month;
    if (year) filter.year = year;

    let doc = await AssignedTask.findOne(filter);
    if (!doc) {
      // Create a doc with this single completed task (assigned 0 -> completed 1)
      doc = new AssignedTask({
        eid: task.eid,
        month: month || (new Date()).getMonth() + 1,
        year: year || (new Date()).getFullYear(),
        tasks: [{ projectType: task.projecttype, assigned: 0, completed: 1 }]
      });
      await doc.save();
      console.log('Created new AssignedTask doc for approved task:', doc._id.toString());
      } else {
        // Find projectType entry
        const tIndex = doc.tasks.findIndex(t => t.projectType === task.projecttype);
        if (tIndex === -1) {
          // add new entry (assigned stays 0, completed becomes 1)
          doc.tasks.push({ projectType: task.projecttype, assigned: 0, completed: 1 });
          await doc.save();
          console.log('Added new projectType entry to AssignedTask doc', doc._id.toString());
        } else {
          // increment completed only; do NOT decrement assigned per product decision
          const entry = doc.tasks[tIndex];
          entry.completed = (Number(entry.completed) || 0) + 1;
          // leave entry.assigned unchanged
          doc.tasks[tIndex] = entry;
          await doc.save();
          console.log('Updated AssignedTask counts for doc', doc._id.toString(), 'entry', entry.projectType, 'assigned->', entry.assigned, 'completed->', entry.completed);
        }
      }
  } catch (syncErr) {
    console.error('Error syncing AssignedTask on approval:', syncErr);
  }
}


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

    const taskId = req.params.id;
    // load current task to compare approval
    const existing = await Task.findById(taskId).lean();
    const prevApproval = existing ? existing.approval : null;
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    );

    // If approval transitioned to 'approved', sync AssignedTask counts
    try {
      await syncAssignedOnApproval(prevApproval, updatedTask);
    } catch (e) {
      console.error('syncAssignedOnApproval failed after PUT update:', e);
    }

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

    const prevApproval = task.approval;
    task.approval = approval;
    await task.save();
    console.log(`Approval updated for ${req.params.id}: from ${prevApproval} to ${approval}`);

    // If approval changed to 'approved' from a different state, sync AssignedTask counts
    if (prevApproval !== 'approved' && approval === 'approved') {
      try {
        await syncAssignedOnApproval(prevApproval, task);
      } catch (syncErr) {
        console.error('Error syncing AssignedTask on approval:', syncErr);
      }
    }

    res.json(task);
  } catch (err) {
    console.error('Error updating approval:', { body: req.body, err });
    res.status(500).json({ error: 'Failed to update approval.' });
  }
});

module.exports = router;
