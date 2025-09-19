const mongoose = require('mongoose');

// MonthlyTask keeps a per-employee, per-project (name+type), per-month count
// of assigned tasks. This allows quick reporting of how many tasks were
// assigned to an employee for a given project and month. Individual
// assignment details can be implemented separately if needed.
const MonthlyTaskSchema = new mongoose.Schema({
  eid: { type: String, required: true, index: true },
  ename: { type: String },
  projectname: { type: String, required: true },
  projecttype: { type: String, required: true },
  // optional finer-grained type/category
  type: { type: String },
  // month in YYYY-MM format
  month: { type: String, required: true, index: true },
  // count of tasks assigned for this combination
  count: { type: Number, default: 0 },
  assignedBy: { type: String },
  notes: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

MonthlyTaskSchema.index({ eid: 1, projectname: 1, projecttype: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyTask', MonthlyTaskSchema);