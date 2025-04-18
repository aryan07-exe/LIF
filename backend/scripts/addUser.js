const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.Mongo_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  }
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

// Function to add a user
async function addUser(employeeId, password, name, role = 'employee') {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      employeeId,
      password: hashedPassword,
      name,
      role
    });

    // Save user
    await user.save();
    console.log('User added successfully!');
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error adding user:', error);
    await mongoose.connection.close();
  }
}

// Example usage:
// Replace these values with your desired user details
addUser(
  'EMP001',           // employeeId
  'your_password',    // password
  'John Doe',         // name
  'employee'          // role (optional, defaults to 'employee')
); 