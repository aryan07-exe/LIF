const express = require('express');
const router = express.Router();
const MonthlyTask = require('../models/MonthlyTask');

// Create or increment count for a single assignment (upsert)
router.post('/upsert', async (req, res) => {
  try {
    const { eid, ename, projectname, projecttype, type, month, assignedBy, notes, increment = 1 } = req.body;
    if (!eid || !projectname || !projecttype || !month) return res.status(400).json({ message: 'eid, projectname, projecttype and month are required' });

    const filter = { eid, projectname, projecttype, month };
    const update = { $inc: { count: increment }, $set: { ename, type, assignedBy, notes } };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    const doc = await MonthlyTask.findOneAndUpdate(filter, update, opts);
    res.json({ message: 'Upserted monthly task', task: doc });
  } catch (err) {
    console.error('Upsert error', err);
    res.status(500).json({ message: 'Upsert error', error: err.message });
  }
});

// Bulk assign: accept array of { eid, ename, projectname, projecttype, type, month, count }
router.post('/bulk', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'body must be non-empty array' });

    const results = [];
    for (const it of items) {
      const { eid, ename, projectname, projecttype, type, month, count = 1, assignedBy, notes } = it;
      if (!eid || !projectname || !projecttype || !month) {
        results.push({ item: it, error: 'missing required fields' });
        continue;
      }
      const filter = { eid, projectname, projecttype, month };
      const update = { $inc: { count }, $set: { ename, type, assignedBy, notes } };
      const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
      const doc = await MonthlyTask.findOneAndUpdate(filter, update, opts);
      results.push({ item: it, result: doc });
    }

    res.status(200).json({ message: 'Bulk processed', results });
  } catch (err) {
    console.error('Bulk assign error', err);
    res.status(500).json({ message: 'Bulk assign error', error: err.message });
  }
});

// Get tasks, filterable by eid or month
router.get('/', async (req, res) => {
  try {
    const { eid, month } = req.query;
    const q = {};
    if (eid) q.eid = eid;
    if (month) q.month = month;
    const tasks = await MonthlyTask.find(q).sort({ month: -1, projectname: 1 });
    res.json(tasks);
  } catch (err) {
    console.error('Fetch error', err);
    res.status(500).json({ message: 'Fetch error', error: err.message });
  }
});

// Update a monthly task by id (set count or fields)
router.put('/:id', async (req, res) => {
  try {
    const update = req.body;
    const doc = await MonthlyTask.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('Update error', err);
    res.status(500).json({ message: 'Update error', error: err.message });
  }
});

// Delete by id
router.delete('/:id', async (req, res) => {
  try {
    const doc = await MonthlyTask.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted', doc });
  } catch (err) {
    console.error('Delete error', err);
    res.status(500).json({ message: 'Delete error', error: err.message });
  }
});

module.exports = router;
