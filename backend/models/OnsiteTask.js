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
  event: {
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
  category: {
    type: String,
    enum: ['Micro', 'Small', 'Wedding Half Day', 'Wedding Full Day', 'Commercial'],
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Method to calculate points based on category
onsiteTaskSchema.methods.calculatePoints = function() {
  // Define points for each category
  const categoryPoints = {
    micro: 10,
    small: 7,
    weddingHalfDay: 5,
    weddingFullDay: 3,
    commercial: 4
  };
  return categoryPoints[this.category] || 0;
};

// Pre-save middleware to calculate points before saving
onsiteTaskSchema.pre('save', function(next) {
  this.points = this.calculatePoints();
  next();
});

module.exports = mongoose.model('OnsiteTask', onsiteTaskSchema); 