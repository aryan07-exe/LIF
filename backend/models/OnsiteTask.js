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
  },
  points: {
    type: Number,
    default: 0
  },
  eventType: {
    type: String,
    required: true,
    enum: ['micro', 'small', 'wedding', 'half day wedding', 'full day', 'commercial']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Method to calculate points based on eventType or duration
onsiteTaskSchema.methods.calculatePoints = function() {
  // Prefer eventType-based logic
  if (this.eventType) {
    switch (this.eventType) {
      case 'micro': return 2;
      case 'small': return 3.5;
      case 'wedding half day': return 4;
      case 'wedding full day': return 10;
      case 'commercial': return 0;
      default: break;
    }
  }
  // Fallback to duration-based logic
  const start = new Date(`2000-01-01T${this.startTime}`);
  const end = new Date(`2000-01-01T${this.endTime}`);
  const durationInHours = (end - start) / (1000 * 60 * 60);
  if (durationInHours >= 2 && durationInHours < 3) {
    return 2;
  } else if (durationInHours >= 3 && durationInHours < 6) {
    return 4;
  } else if (durationInHours >= 6 && durationInHours <= 10) {
    return 10;
  }
  return 0;
};

// Pre-save middleware to calculate points before saving
onsiteTaskSchema.pre('save', function(next) {
  this.points = this.calculatePoints();
  next();
});

module.exports = mongoose.model('OnsiteTask', onsiteTaskSchema); 