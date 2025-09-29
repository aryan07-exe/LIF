const mongoose = require('mongoose');

const AssignedTaskSchema = new mongoose.Schema({
  eid: { type: String, required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  // tasks array holds multiple projectType entries for that eid+month+year
  tasks: [
    {
      projectType: { type: String, required: true },
      assigned: { type: Number, default: 0 },
      completed: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

// Unique index per eid/month/year (one document groups many tasks)
AssignedTaskSchema.index({ eid: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('AssignedTask', AssignedTaskSchema);
