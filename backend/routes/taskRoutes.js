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

// CORS preflight for points-config update
router.options('/points-config/:type', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

// PUT update pointsConfig for a project type and update all tasks in DB
router.put('/points-config/:type', async (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  try {
    const pointsConfig = require('../config/pointsConfig');
    const { points } = req.body;
    const type = decodeURIComponent(req.params.type);
    if (typeof points !== 'number') {
      return res.status(400).json({ error: 'Points must be a number.' });
    }
    // Update in-memory config
    pointsConfig.projectType[type] = points;
    // Write back to file
    const fs = require('fs');
    fs.writeFileSync(
      require.resolve('../config/pointsConfig.js'),
      'const pointsConfig = ' + JSON.stringify(pointsConfig, null, 4) + '\n\nmodule.exports = pointsConfig;\n'
    );
    // Update all tasks in DB with this project type
    const Task = require('../models/Task');
    await Task.updateMany({ projecttype: type }, { $set: { points } });
    res.json({ success: true, pointsConfig: pointsConfig.projectType });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update points config and DB.' });
  }
});

// GET points config for all project types
router.get('/points-config', async (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  try {
    const pointsConfig = require('../config/pointsConfig');
    res.json({ points: pointsConfig.projectType });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch points config.' });
  }
});

// GET all task entries
router.get('/all', async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ date: -1, _id: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

module.exports = router;
