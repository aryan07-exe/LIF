const express = require('express');
const router = express.Router();
const AssignedTask = require('../models/AssignedTask');

// Helper: normalize incoming payloads. Accept either grouped docs:
// { eid, month, year, tasks: [{projectType,assigned,completed}] }
// or flat rows: { eid, projectType, assigned, completed, month, year }
const normalizePayload = (items) => {
  const groups = new Map();
  for (const it of items) {
    if (!it || !it.eid) continue;
    if (it.tasks && Array.isArray(it.tasks)) {
      const key = `${it.eid}::${Number(it.month)}::${Number(it.year)}`;
      if (!groups.has(key)) groups.set(key, { eid: it.eid, month: Number(it.month), year: Number(it.year), tasks: [] });
      for (const t of it.tasks) {
        if (!t || !t.projectType) continue;
        groups.get(key).tasks.push({ projectType: t.projectType, assigned: Number(t.assigned||0), completed: Number(t.completed||0) });
      }
    } else {
      // flat row
      const { eid, projectType, assigned = 0, completed = 0, month, year } = it;
      if (!eid || !projectType || month == null || year == null) continue;
      const key = `${eid}::${Number(month)}::${Number(year)}`;
      if (!groups.has(key)) groups.set(key, { eid, month: Number(month), year: Number(year), tasks: [] });
      groups.get(key).tasks.push({ projectType, assigned: Number(assigned), completed: Number(completed) });
    }
  }
  return Array.from(groups.values());
};

// POST /bulk - accept array (flat rows or grouped) and merge into grouped docs
router.post('/bulk', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'body must be non-empty array' });
    const groups = normalizePayload(items);
    const results = [];
    for (const g of groups) {
      // Upsert a document for this eid+month+year. Merge tasks by projectType.
      // We'll build an array of operations: if a task with same projectType exists, replace its assigned/completed; otherwise push it.
      const filter = { eid: g.eid, month: g.month, year: g.year };
      const existing = await AssignedTask.findOne(filter);
      if (!existing) {
        const doc = new AssignedTask({ eid: g.eid, month: g.month, year: g.year, tasks: g.tasks });
        await doc.save();
        results.push({ action: 'created', docId: doc._id, eid: g.eid });
      } else {
        // Merge tasks
        const taskMap = new Map(existing.tasks.map(t => [t.projectType, t]));
        for (const t of g.tasks) {
          if (taskMap.has(t.projectType)) {
            // replace assigned/completed
            taskMap.get(t.projectType).assigned = Number(t.assigned);
            taskMap.get(t.projectType).completed = Number(t.completed);
          } else {
            taskMap.set(t.projectType, { projectType: t.projectType, assigned: Number(t.assigned), completed: Number(t.completed) });
          }
        }
        existing.tasks = Array.from(taskMap.values());
        await existing.save();
        results.push({ action: 'updated', docId: existing._id, eid: g.eid });
      }
    }
    return res.json({ success: true, results });
  } catch (err) {
    console.error('assigned-task bulk error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET assigned tasks (filter by eid, month, year) - return flattened list of tasks
router.get('/', async (req, res) => {
  try {
    const { eid, month, year } = req.query;
    const filter = {};
    if (eid) filter.eid = eid;
    if (month != null) filter.month = Number(month);
    if (year != null) filter.year = Number(year);
    const docs = await AssignedTask.find(filter).sort({ year: -1, month: -1 });
    // Flatten into rows: { _docId, eid, month, year, projectType, assigned, completed }
    const rows = [];
    for (const d of docs) {
      for (const t of d.tasks) {
        rows.push({ _id: d._id, eid: d.eid, month: d.month, year: d.year, projectType: t.projectType, assigned: t.assigned, completed: t.completed });
      }
    }
    console.log('GET /api/assigned-task filter=', filter, 'foundRows=', rows.length);
    return res.json(rows);
  } catch (err) {
    console.error('assigned-task get error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE a specific task within a grouped doc by docId and projectType
router.delete('/:docId/task/:projectType', async (req, res) => {
  try {
    const { docId, projectType } = req.params;
    const doc = await AssignedTask.findById(docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const before = doc.tasks.length;
    doc.tasks = doc.tasks.filter(t => t.projectType !== projectType);
    await doc.save();
    return res.json({ success: true, removed: before - doc.tasks.length });
  } catch (err) {
    console.error('assigned-task delete subtask error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete whole grouped document by id
router.delete('/:id', async (req, res) => {
  try {
    await AssignedTask.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('assigned-task delete error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
