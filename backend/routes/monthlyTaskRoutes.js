const express = require('express');
const router = express.Router();
const MonthlyTask = require('../models/MonthlyTask');
const Task = require('../models/Task');

// helper: compute approved/pending counts via aggregation for a month range
async function computeApprovalCounts(eid, projectname, projecttype, startDate, endDate) {
  try {
    const match = { eid, projectname, projecttype };
    if (startDate && endDate) match.date = { $gte: startDate, $lte: endDate };
    const agg = await Task.aggregate([
      { $match: match },
      { $group: { _id: '$approval', count: { $sum: 1 } } }
    ]);
    let approved = 0, pending = 0;
    for (const row of agg) {
      if (row._id === 'approved') approved = row.count;
      if (row._id === 'pending') pending = row.count;
    }
    return { approved, pending };
  } catch (e) {
    console.error('computeApprovalCounts error', e);
    return { approved: 0, pending: 0 };
  }
}

// Upsert single assignment (increment count)
router.post('/upsert', async (req, res) => {
  try {
    const { eid, ename, projectname, projecttype, type, month, assignedBy, notes, increment = 1 } = req.body;
    if (!eid || !projectname || !projecttype || !month) return res.status(400).json({ message: 'missing fields' });

    const filter = { eid, projectname, projecttype, month };
    const update = { $inc: { count: increment }, $set: { ename, type, assignedBy, notes } };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    const doc = await MonthlyTask.findOneAndUpdate(filter, update, opts);

    // recompute approval for this monthly group
    try {
      const [y, m] = month.split('-');
      const startDate = `${y}-${m}-01`;
      const lastDay = new Date(parseInt(y,10), parseInt(m,10), 0).getDate();
      const endDate = `${y}-${m}-${String(lastDay).padStart(2,'0')}`;
      const { approved, pending } = await computeApprovalCounts(eid, projectname, projecttype, startDate, endDate);
      const computedApproval = approved > 0 ? 'approved' : (pending > 0 ? 'pending' : 'pending');
      await MonthlyTask.updateOne({ _id: doc._id }, { $set: { approval: computedApproval } });
      doc.approval = computedApproval;
    } catch (e) {
      console.error('recompute approval error', e);
    }

    res.json({ message: 'upserted', doc });
  } catch (err) {
    console.error('upsert error', err);
    res.status(500).json({ message: 'upsert error' });
  }
});

// Bulk assign multiple rows
router.post('/bulk', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'body must be array' });
    const results = [];
    for (const it of items) {
      const { eid, ename, projectname, projecttype, type, month, count = 1, assignedBy, notes } = it;
      if (!eid || !projectname || !projecttype || !month) { results.push({ item: it, error: 'missing' }); continue; }
      const filter = { eid, projectname, projecttype, month };
      const update = { $inc: { count }, $set: { ename, type, assignedBy, notes } };
      const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
      const doc = await MonthlyTask.findOneAndUpdate(filter, update, opts);
      // recompute approval for this item
      try {
        const [y, mm] = month.split('-');
        const startDate = `${y}-${mm}-01`;
        const lastDay = new Date(parseInt(y,10), parseInt(mm,10), 0).getDate();
        const endDate = `${y}-${mm}-${String(lastDay).padStart(2,'0')}`;
        const { approved, pending } = await computeApprovalCounts(eid, projectname, projecttype, startDate, endDate);
        const computedApproval = approved > 0 ? 'approved' : (pending > 0 ? 'pending' : 'pending');
        await MonthlyTask.updateOne({ _id: doc._id }, { $set: { approval: computedApproval } });
        doc.approval = computedApproval;
      } catch (e) { console.error('bulk recompute error', e); }
      results.push({ item: it, doc });
    }
    res.json({ message: 'bulk processed', results });
  } catch (err) {
    console.error('bulk error', err);
    res.status(500).json({ message: 'bulk error' });
  }
});

// List monthly tasks (filter by eid or month)
router.get('/', async (req, res) => {
  try {
    const { eid, month } = req.query;
    const q = {};
    if (eid) q.eid = eid;
    if (month) q.month = month;
    const docs = await MonthlyTask.find(q).sort({ month: -1, projectname: 1 });
    // augment with approval summary
    const augmented = await Promise.all(docs.map(async d => {
      const obj = d.toObject();
      try {
        const [y, m] = (obj.month || month).split('-');
        const startDate = `${y}-${m}-01`;
        const lastDay = new Date(parseInt(y,10), parseInt(m,10), 0).getDate();
        const endDate = `${y}-${m}-${String(lastDay).padStart(2,'0')}`;
        const { approved, pending } = await computeApprovalCounts(obj.eid, obj.projectname, obj.projecttype, startDate, endDate);
        obj.approvalSummary = { approvedCount: approved, pendingCount: pending };
        if (approved > 0) obj.approval = 'approved';
        else if (pending > 0) obj.approval = 'pending';
      } catch (e) { console.error('augment error', e); obj.approvalSummary = { approvedCount: 0, pendingCount: 0 }; }
      return obj;
    }));
    res.json(augmented);
  } catch (err) {
    console.error('list error', err);
    res.status(500).json({ message: 'list error' });
  }
});

// Update monthly task by id
router.put('/:id', async (req, res) => {
  try {
    const update = req.body;
    const doc = await MonthlyTask.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ message: 'not found' });
    // recompute approval for updated record
    try {
      const { eid, projectname, projecttype, month } = doc;
      const [y, mm] = month.split('-');
      const startDate = `${y}-${mm}-01`;
      const lastDay = new Date(parseInt(y,10), parseInt(mm,10), 0).getDate();
      const endDate = `${y}-${mm}-${String(lastDay).padStart(2,'0')}`;
      const { approved, pending } = await computeApprovalCounts(eid, projectname, projecttype, startDate, endDate);
      const computedApproval = approved > 0 ? 'approved' : (pending > 0 ? 'pending' : 'pending');
      await MonthlyTask.updateOne({ _id: doc._id }, { $set: { approval: computedApproval } });
      doc.approval = computedApproval;
    } catch (e) { console.error('recompute after put', e); }
    res.json(doc);
  } catch (err) {
    console.error('put error', err);
    res.status(500).json({ message: 'put error' });
  }
});

// Delete monthly task
router.delete('/:id', async (req, res) => {
  try {
    const doc = await MonthlyTask.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'not found' });
    res.json({ message: 'deleted', doc });
  } catch (err) {
    console.error('delete error', err);
    res.status(500).json({ message: 'delete error' });
  }
});

module.exports = router;
