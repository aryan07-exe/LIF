const express = require('express');
const router = express.Router();
const ProjectDetails = require('../models/ProjectDetails');

// GET all project names from ProjectDetails
router.get('/names', async (req, res) => {
  try {
    const projects = await ProjectDetails.find({}, 'projectName');
    const projectNames = projects.map(p => p.projectName);
    res.json({ projectNames });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project names.' });
  }
});

module.exports = router;