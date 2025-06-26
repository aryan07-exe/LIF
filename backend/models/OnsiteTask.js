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
  // Category is now a free-form string provided by user input
  category: {
    type: String,
    required: true
  },
  teamNames: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  },
  eventType: {
    type: String,
    required: true,
    enum: ['micro', 'small', 'wedding half day', 'wedding full day', 'commercial']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Method to calculate points based only on eventType
onsiteTaskSchema.methods.calculatePoints = function() {
  if (this.eventType) {
    switch (this.eventType) {
      case 'micro': return 2;
      case 'small': return 3.5;
      case 'wedding half day': return 4;
      case 'wedding full day': return 10;
      case 'commercial': return 0;
      default: return 0;
    }
  }
  return 0;
};

// Pre-save middleware to calculate points before saving
onsiteTaskSchema.pre('save', function(next) {
  if (this.eventType) {
    this.eventType = this.eventType.toLowerCase();
  }
  this.points = this.calculatePoints();
  next();
});

module.exports = mongoose.model('OnsiteTask', onsiteTaskSchema); 