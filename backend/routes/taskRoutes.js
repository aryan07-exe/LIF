
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Option = require('../models/Option');


// Helper to initialize options if not present
async function ensureOptions() {
	const types = await Option.findOne({ key: 'projectTypes' });
	if (!types) {
		await Option.create({ key: 'projectTypes', values: Task.PROJECT_TYPE_OPTIONS });
	}
	const statuses = await Option.findOne({ key: 'projectStatuses' });
	if (!statuses) {
		await Option.create({ key: 'projectStatuses', values: Task.PROJECT_STATUS_OPTIONS });
	}
}

// GET project type options
router.get('/projecttypes', async (req, res) => {
	await ensureOptions();
	const doc = await Option.findOne({ key: 'projectTypes' });
	res.json({ projectTypes: doc ? doc.values : [] });
});

// GET project status options
router.get('/projectstatuses', async (req, res) => {
	await ensureOptions();
	const doc = await Option.findOne({ key: 'projectStatuses' });
	res.json({ projectStatuses: doc ? doc.values : [] });
});

// ADD project type
router.post('/projecttypes', async (req, res) => {
	await ensureOptions();
	const { value } = req.body;
	if (!value) return res.status(400).json({ error: 'Value required' });
	const doc = await Option.findOne({ key: 'projectTypes' });
	if (doc.values.includes(value)) return res.status(409).json({ error: 'Already exists' });
	doc.values.push(value);
	await doc.save();
	res.json({ projectTypes: doc.values });
});

// DELETE project type
router.delete('/projecttypes/:value', async (req, res) => {
	await ensureOptions();
	const { value } = req.params;
	const doc = await Option.findOne({ key: 'projectTypes' });
	doc.values = doc.values.filter(v => v !== value);
	await doc.save();
	res.json({ projectTypes: doc.values });
});

// UPDATE project type
router.put('/projecttypes/:oldValue', async (req, res) => {
	await ensureOptions();
	const { oldValue } = req.params;
	const { newValue } = req.body;
	if (!newValue) return res.status(400).json({ error: 'New value required' });
	const doc = await Option.findOne({ key: 'projectTypes' });
	const idx = doc.values.indexOf(oldValue);
	if (idx === -1) return res.status(404).json({ error: 'Not found' });
	doc.values[idx] = newValue;
	await doc.save();
	res.json({ projectTypes: doc.values });
});

// ADD project status
router.post('/projectstatuses', async (req, res) => {
	await ensureOptions();
	const { value } = req.body;
	if (!value) return res.status(400).json({ error: 'Value required' });
	const doc = await Option.findOne({ key: 'projectStatuses' });
	if (doc.values.includes(value)) return res.status(409).json({ error: 'Already exists' });
	doc.values.push(value);
	await doc.save();
	res.json({ projectStatuses: doc.values });
});

// DELETE project status
router.delete('/projectstatuses/:value', async (req, res) => {
	await ensureOptions();
	const { value } = req.params;
	const doc = await Option.findOne({ key: 'projectStatuses' });
	doc.values = doc.values.filter(v => v !== value);
	await doc.save();
	res.json({ projectStatuses: doc.values });
});

// UPDATE project status
router.put('/projectstatuses/:oldValue', async (req, res) => {
	await ensureOptions();
	const { oldValue } = req.params;
	const { newValue } = req.body;
	if (!newValue) return res.status(400).json({ error: 'New value required' });
	const doc = await Option.findOne({ key: 'projectStatuses' });
	const idx = doc.values.indexOf(oldValue);
	if (idx === -1) return res.status(404).json({ error: 'Not found' });
	doc.values[idx] = newValue;
	await doc.save();
	res.json({ projectStatuses: doc.values });
});

module.exports = router;
