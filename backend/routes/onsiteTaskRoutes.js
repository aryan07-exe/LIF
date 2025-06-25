const express = require('express');
const router = express.Router();
const OnsiteTask = require('../models/OnsiteTask');
const auth = require('../middleware/auth');

// Helper function to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// Create a new onsite task
router.post('/', auth, async (req, res) => {
  try {
    const {
      eid,
      ename,
      projectname,
      shootDate,
      startTime,
      endTime,
      categories,
      teamNames,
      notes
    } = req.body;

    // Validate required fields
    if (!eid || !ename || !projectname || !shootDate || !startTime || !endTime || !teamNames) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const onsiteTask = new OnsiteTask({
      eid,
      ename,
      projectname,
      shootDate,
      startTime,
      endTime,
      categories: {
        weddingCeremony: categories.includes('weddingCeremony'),
        engagementSangeet: categories.includes('engagementSangeet'),
        haldiGrahShanti: categories.includes('haldiGrahShanti'),
        preWedding: categories.includes('preWedding'),
        birthdayAnniversaryFamily: categories.includes('birthdayAnniversaryFamily'),
        corporateEvent: categories.includes('corporateEvent')
      },
      teamNames,
      notes: notes || ''
    });

    await onsiteTask.save();
    res.status(201).json({ message: 'Onsite task created successfully', task: onsiteTask });
  } catch (error) {
    console.error('Error creating onsite task:', error);
    res.status(500).json({ message: 'Error creating onsite task', error: error.message });
  }
});

// Get all onsite tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await OnsiteTask.find().sort({ shootDate: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching onsite tasks:', error);
    res.status(500).json({ message: 'Error fetching onsite tasks', error: error.message });
  }
});

// Get onsite tasks by employee ID
router.get('/employee/:eid', auth, async (req, res) => {
  try {
    const tasks = await OnsiteTask.find({ eid: req.params.eid }).sort({ shootDate: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching employee onsite tasks:', error);
    res.status(500).json({ message: 'Error fetching employee onsite tasks', error: error.message });
  }
});

// Get onsite tasks by date range
router.get('/date-range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const tasks = await OnsiteTask.find({
      shootDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ shootDate: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching onsite tasks by date range:', error);
    res.status(500).json({ message: 'Error fetching onsite tasks by date range', error: error.message });
  }
});

// Update an onsite task
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      projectname,
      shootDate,
      startTime,
      endTime,
      categories,
      teamNames,
      notes
    } = req.body;

    const updatedTask = await OnsiteTask.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          projectname,
          shootDate,
          startTime,
          endTime,
          'categories.weddingCeremony': categories.includes('weddingCeremony'),
          'categories.engagementSangeet': categories.includes('engagementSangeet'),
          'categories.haldiGrahShanti': categories.includes('haldiGrahShanti'),
          'categories.preWedding': categories.includes('preWedding'),
          'categories.birthdayAnniversaryFamily': categories.includes('birthdayAnniversaryFamily'),
          'categories.corporateEvent': categories.includes('corporateEvent'),
          teamNames,
          notes
        }
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Onsite task not found' });
    }

    res.json({ message: 'Onsite task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Error updating onsite task:', error);
    res.status(500).json({ message: 'Error updating onsite task', error: error.message });
  }
});

// Delete an onsite task
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedTask = await OnsiteTask.findByIdAndDelete(req.params.id);
    
    if (!deletedTask) {
      return res.status(404).json({ message: 'Onsite task not found' });
    }

    res.json({ message: 'Onsite task deleted successfully', task: deletedTask });
  } catch (error) {
    console.error('Error deleting onsite task:', error);
    res.status(500).json({ message: 'Error deleting onsite task', error: error.message });
  }
});

module.exports = router; 