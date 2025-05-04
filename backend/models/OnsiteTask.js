const mongoose = require('mongoose');

const onsiteTaskSchema = new mongoose.Schema({
  eid: {
    type: String,
    required: true,
  },
  ename: {
    type: String,
    required: true,
  },
  projectname: {
    type: String,
    required: true,
  },
  shootDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  categories: {
    weddingCeremony: {
      type: Boolean,
      default: false
    },
    engagementSangeet: {
      type: Boolean,
      default: false
    },
    haldiGrahShanti: {
      type: Boolean,
      default: false
    },
    preWedding: {
      type: Boolean,
      default: false
    },
    birthdayAnniversaryFamily: {
      type: Boolean,
      default: false
    },
    corporateEvent: {
      type: Boolean,
      default: false
    }
  },
  teamNames: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('OnsiteTask', onsiteTaskSchema); 