const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Get all active projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'active' })
      .select('projectname')
      .sort({ projectname: 1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Add a new project
router.post('/', async (req, res) => {
  try {
    const { projectname } = req.body;
    
    if (!projectname) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = new Project({
      projectname,
      status: 'active'
    });

    await project.save();
    res.status(201).json({ message: 'Project added successfully', project });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Error adding project' });
  }
});

module.exports = router; 