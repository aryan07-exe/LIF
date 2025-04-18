const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const app=express();
const port=5000;
require('dotenv').config();

const Task=require('./models/Task');
const pointsConfig = require('./config/pointsConfig');

app.use(cors({
    origin: '*',
  }));
  
app.use(express.json());

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
        const points = calculatePoints(req.body.projecttype);
        const task = new Task({
            ...req.body,
            points
        });
        await task.save();
        res.status(201).json({message:"Task created successfully"});
    }catch(error){
        console.log(error);
        res.status(500).json({message: "Error creating task"});
    }
})

// GET endpoint for AdminPanel with filters
app.get('/admin/tasks', async (req, res) => {
  const { eid, date, projecttype, projectstatus } = req.query;
  const query = {};

  if (eid) query.eid = eid;
  if (date) query.date = date;
  if (projecttype) query.projecttype = projecttype;
  if (projectstatus) query.projectstatus = projectstatus;

  try {
    const tasks = await Task.find(query).sort({ date: -1 });
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    
    // Get unique values for filters
    const uniqueEids = await Task.distinct('eid');
    const uniqueProjectTypes = await Task.distinct('projecttype');
    const uniqueProjectStatuses = await Task.distinct('projectstatus');

    res.json({
      tasks,
      totalPoints,
      filters: {
        eids: uniqueEids,
        projectTypes: uniqueProjectTypes,
        projectStatuses: uniqueProjectStatuses
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
      eid,
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
    const tasks = await Task.find({ date: today }).sort({ date: -1 });
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);

    res.json({
      tasks,
      totalPoints
    });
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})