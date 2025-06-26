const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  formAccess: {
    type: String,
    enum: ['postproduction', 'onsite', 'both'],
    default: 'both'
  }
}, { collection: 'users' });

// Simple password comparison (no hashing)
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return candidatePassword === this.password;
};

module.exports = mongoose.model('User', UserSchema);