const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  key: {
    type: String,
    enum: ['projectTypes', 'projectStatuses'],
    required: true,
    unique: true
  },
  values: {
    type: [String],
    default: []
  }
});

const Option = mongoose.model('Option', OptionSchema);

module.exports = Option;
