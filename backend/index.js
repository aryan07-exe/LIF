const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const app=express();
const port=5000;
require('dotenv').config();

const Task=require('./models/Task');
const pointsConfig = require('./config/pointsConfig');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects')

const tasks = require('./routes/tasks')
app.use(cors({
    origin: '*',
  }));
  
app.use(express.json());

// Mount routes
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.Mongo_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.log("Error details:", err);
  });

  
// Calculate points based on project type only
const calculatePoints = (projectType) => {
    return pointsConfig.projectType[projectType] || 0;
};

app.post("/task",async(req,res)=>{
    try{
        // Validate required fields
        const { eid, ename, date, projectname, projecttype, projectstatus, category } = req.body;
        
        if (!eid || !ename || !date || !projectname || !projecttype || !projectstatus || !category) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const points = calculatePoints(projecttype);
        const task = new Task({
            eid,
            ename,
            date,
            projectname,
            projecttype,
            projectstatus,
            category,
            points,
            note: req.body.notes || '' // Handle the notes field
        });
        
        await task.save();
        res.status(201).json({message:"Task created successfully"});
    }catch(error){
        console.error('Task creation error:', error);
        res.status(500).json({message: "Error creating task", error: error.message});
    }
});

// Helper function to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// GET endpoint for AdminPanel with filters
app.get('/admin/tasks', async (req, res) => {
  const { eid, date, projecttype, projectstatus, category } = req.query;
  const query = {};

  // Use regex for case-insensitive search with escaped patterns
  if (eid) query.eid = { $regex: new RegExp(escapeRegex(eid), 'i') };
  if (date) query.date = date; // Keep date as exact match
  if (projecttype) query.projecttype = { $regex: new RegExp(escapeRegex(projecttype), 'i') };
  if (projectstatus) query.projectstatus = { $regex: new RegExp(escapeRegex(projectstatus), 'i') };
  if (category) query.category = { $regex: new RegExp(escapeRegex(category), 'i') };

  try {
    const tasks = await Task.find(query).sort({ date: -1 });
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    
    // Get unique values for filters
    const uniqueEids = await Task.distinct('eid');
    const uniqueProjectTypes = await Task.distinct('projecttype');
    const uniqueProjectStatuses = await Task.distinct('projectstatus');
    const uniqueCategories = await Task.distinct('category');

    res.json({
      tasks,
      totalPoints,
      filters: {
        eids: uniqueEids,
        projectTypes: uniqueProjectTypes,
        projectStatuses: uniqueProjectStatuses,
        categories: uniqueCategories
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// GET endpoint for MonthlyTaskView
app.get('/monthly/tasks', async (req, res) => {
  const { eid, month } = req.query;
  
  try {
    // If month is provided (YYYY-MM format), filter by that month
    const [year, monthNum] = month.split('-');
    const startOfMonth = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endOfMonth = `${year}-${monthNum}-${lastDay}`;
    
    const query = {
      eid: { $regex: new RegExp(escapeRegex(eid), 'i') }, // Case-insensitive search for employee ID
      date: { 
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    };

    // Get tasks with sorting by date
    const tasks = await Task.find(query).sort({ date: 1 });
    
    // Calculate total points
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    
    // Return tasks and total points
    res.json({
      tasks,
      totalPoints
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// GET endpoint for current day's tasks (default for AdminPanel)
app.get('/tasks/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Fetching tasks for today: ${today}`);
    
    const tasks = await Task.find({ date: today }).sort({ date: -1 });
    console.log(`Found ${tasks.length} tasks for today`);
    
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    console.log(`Total points for today: ${totalPoints}`);
    
    // Get unique values for filters
    const uniqueEids = await Task.distinct('eid');
    const uniqueProjectTypes = await Task.distinct('projecttype');
    const uniqueProjectStatuses = await Task.distinct('projectstatus');
    const uniqueCategories = await Task.distinct('category');

    res.json({
      tasks,
      totalPoints,
      filters: {
        eids: uniqueEids,
        projectTypes: uniqueProjectTypes,
        projectStatuses: uniqueProjectStatuses,
        categories: uniqueCategories
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// GET endpoint for all users' EIDs
app.get('/api/users/eids', async (req, res) => {
  try {
    const users = await User.find({}, 'employeeId name');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})

