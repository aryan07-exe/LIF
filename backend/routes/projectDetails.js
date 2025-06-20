const express = require('express');
const router = express.Router();
const ProjectDetails = require('../models/ProjectDetails');

// Create new project
router.post('/', async (req, res) => {
  try {
    const project = new ProjectDetails(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  const projects = await ProjectDetails.find();
  res.json(projects);
});

module.exports = router;
