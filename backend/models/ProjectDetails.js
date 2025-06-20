
const mongoose = require('mongoose');

const DayRequirementSchema = new mongoose.Schema({
  date: Date,
  traditionalPhotographers: { type: Number, default: 0 },
  traditionalCinematographers: { type: Number, default: 0 },
  candidPhotographers: { type: Number, default: 0 },
  candidcinematographers: { type: Number, default: 0 },
  aerialCinematography: { type: Boolean, default: false },
  additionalNotes: String,
});

const ProjectDetailsSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  dayWiseRequirements: [DayRequirementSchema],
  deliverables: [String], // store selected deliverable keys
});

module.exports = mongoose.model('ProjectDetails', ProjectDetailsSchema);
