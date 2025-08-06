const mongoose = require('mongoose');

const ProjectTypePointsSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  points: { type: Number, required: true }
});

module.exports = mongoose.model('ProjectTypePoints', ProjectTypePointsSchema);
