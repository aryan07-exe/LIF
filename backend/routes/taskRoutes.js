const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET project type options
router.get('/projecttypes', (req, res) => {
	res.json({ projectTypes: Task.PROJECT_TYPE_OPTIONS });
});

// GET project status options
router.get('/projectstatuses', (req, res) => {
	res.json({ projectStatuses: Task.PROJECT_STATUS_OPTIONS });
});

module.exports = router;
