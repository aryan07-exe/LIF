
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

// ADD project type
router.post('/projecttypes', (req, res) => {
	const { value } = req.body;
	if (!value) return res.status(400).json({ error: 'Value required' });
	if (Task.PROJECT_TYPE_OPTIONS.includes(value)) return res.status(409).json({ error: 'Already exists' });
	Task.PROJECT_TYPE_OPTIONS.push(value);
	res.json({ projectTypes: Task.PROJECT_TYPE_OPTIONS });
});

// DELETE project type
router.delete('/projecttypes/:value', (req, res) => {
	const { value } = req.params;
	Task.PROJECT_TYPE_OPTIONS = Task.PROJECT_TYPE_OPTIONS.filter(v => v !== value);
	res.json({ projectTypes: Task.PROJECT_TYPE_OPTIONS });
});

// UPDATE project type
router.put('/projecttypes/:oldValue', (req, res) => {
	const { oldValue } = req.params;
	const { newValue } = req.body;
	if (!newValue) return res.status(400).json({ error: 'New value required' });
	const idx = Task.PROJECT_TYPE_OPTIONS.indexOf(oldValue);
	if (idx === -1) return res.status(404).json({ error: 'Not found' });
	Task.PROJECT_TYPE_OPTIONS[idx] = newValue;
	res.json({ projectTypes: Task.PROJECT_TYPE_OPTIONS });
});

// ADD project status
router.post('/projectstatuses', (req, res) => {
	const { value } = req.body;
	if (!value) return res.status(400).json({ error: 'Value required' });
	if (Task.PROJECT_STATUS_OPTIONS.includes(value)) return res.status(409).json({ error: 'Already exists' });
	Task.PROJECT_STATUS_OPTIONS.push(value);
	res.json({ projectStatuses: Task.PROJECT_STATUS_OPTIONS });
});

// DELETE project status
router.delete('/projectstatuses/:value', (req, res) => {
	const { value } = req.params;
	Task.PROJECT_STATUS_OPTIONS = Task.PROJECT_STATUS_OPTIONS.filter(v => v !== value);
	res.json({ projectStatuses: Task.PROJECT_STATUS_OPTIONS });
});

// UPDATE project status
router.put('/projectstatuses/:oldValue', (req, res) => {
	const { oldValue } = req.params;
	const { newValue } = req.body;
	if (!newValue) return res.status(400).json({ error: 'New value required' });
	const idx = Task.PROJECT_STATUS_OPTIONS.indexOf(oldValue);
	if (idx === -1) return res.status(404).json({ error: 'Not found' });
	Task.PROJECT_STATUS_OPTIONS[idx] = newValue;
	res.json({ projectStatuses: Task.PROJECT_STATUS_OPTIONS });
});

module.exports = router;
