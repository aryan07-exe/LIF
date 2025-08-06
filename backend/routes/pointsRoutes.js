const express = require('express');
const router = express.Router();
const ProjectTypePoints = require('../models/ProjectTypePoints');

// Get all project type points
router.get('/', async (req, res) => {
  try {
    const points = await ProjectTypePoints.find({});
    res.json({ points });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch points.' });
  }
});

// Get points for a specific project type
router.get('/:type', async (req, res) => {
  try {
    const type = decodeURIComponent(req.params.type);
    const entry = await ProjectTypePoints.findOne({ type });
    if (!entry) return res.status(404).json({ error: 'Type not found.' });
    res.json({ points: entry.points });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch points.' });
  }
});

// Update or create points for a project type
router.put('/:type', async (req, res) => {
  try {
    const type = decodeURIComponent(req.params.type);
    const { points } = req.body;
    if (typeof points !== 'number') {
      return res.status(400).json({ error: 'Points must be a number.' });
    }
    const entry = await ProjectTypePoints.findOneAndUpdate(
      { type },
      { $set: { points } },
      { new: true, upsert: true }
    );
    res.json({ success: true, points: entry.points });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update points.' });
  }
});

module.exports = router;
