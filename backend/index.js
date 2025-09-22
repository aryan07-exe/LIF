const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const app=express();
// ...existing code...


// Configure CORS with multiple allowed origins
const allowedOrigins = [
  'http://localhost:3000',  // Local development
  'https://liffrontend.vercel.app',  // Your deployed frontend URL
  'https://lifclone.onrender.com',  // Another possible frontend URL
  'https://lif.onrender.com' // Production frontend domain
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
const moment = require('moment');

const port=process.env.PORT || 5000;
require('dotenv').config();
const ProjectDetails = require('./models/ProjectDetails');
const editRoutes = require('./routes/editRoutes');
app.use('/api/edit', editRoutes);
const Task=require('./models/Task');
const pointsConfig = require('./config/pointsConfig');
const User = require('./models/User');
const OnsiteTask = require('./models/OnsiteTask');


// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects')
app.use(express.json());

  

// Import users route
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// Mount employee profile route
const employeeProfileRouter = require('./routes/employeeProfile');
app.use('/api/employee', employeeProfileRouter);

const userManagementRoutes = require('./routes/userManagement');
app.use('/api/user-management', userManagementRoutes);


const taskRoutes = require('./routes/taskRoutes');
app.use('/api/task', taskRoutes);

// Mount routes
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
const projectDetailsRouter = require('./routes/projectDetails');
app.use('/api/projectdetails', projectDetailsRouter);

const projectnameRoutes = require('./routes/projectname');
app.use('/api/projectname', projectnameRoutes);

const pointsRoutes = require('./routes/pointsRoutes');
app.use('/api/points', pointsRoutes);

// Monthly task routes
const monthlyTaskRoutes = require('./routes/monthlyTaskRoutes');
app.use('/api/monthly-task', monthlyTaskRoutes);


// Ensure MongoDB connection string is provided
const mongoUri = process.env.MONGO_URL;
if (!mongoUri) {
  console.error('❌ Missing MongoDB connection string. Set `Mongo_URL` in your environment or in a .env file.');
  console.error('Example .env entry: Mongo_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority');
  // Exit so the server doesn't run without a DB connection
  process.exit(1);
}

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.log("Error details:", err);
    process.exit(1);
  });

  
// Calculate points based on project type only
// Calculate points based on project type from DB
const ProjectTypePoints = require('./models/ProjectTypePoints');
const calculatePoints = async (projectType) => {
  const entry = await ProjectTypePoints.findOne({ type: projectType });
  return entry ? entry.points : 0;
};

app.post("/task",async(req,res)=>{
    try{
        // Validate required fields
        const { eid, ename, date, projectname, projecttype, projectstatus, category } = req.body;
        
        if (!eid || !ename || !date || !projectname || !projecttype || !projectstatus || !category) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ message: "Invalid date format. Please use YYYY-MM-DD format" });
        }

    // Only assign points if projectstatus is 'Complete'
    let points = 0;
    if (projectstatus && projectstatus.toLowerCase() === 'complete') {
      points = await calculatePoints(projecttype);
    }
    const task = new Task({
      eid,
      ename,
      date: date, // Store date as string
      projectname,
      projecttype,
      projectstatus,
      // Approval flag defaults to pending for review
      approval: 'pending',
      category,
      points,
      notes: req.body.notes || ''
    });
    await task.save();
    res.status(201).json({message:"Task created successfully"});
    }catch(error){
        console.error('Task creation error:', error);
        res.status(500).json({message: "Error creating task", error: error.message});
    }
});

app.get('/tasks/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include the full end day

    const tasks = await Task.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/api/tasks/last7days/:eid', async (req, res) => {
    const { eid } = req.params;
    const today = moment();
    const startDate = moment().subtract(6, 'days');

    try {
        // Fetch tasks submitted by the employee in the last 7 days
        const tasks = await Task.find({
            eid,
            date: {
                $gte: startDate.format('YYYY-MM-DD'),
                $lte: today.format('YYYY-MM-DD')
            }
        });

        // Build a set of submitted dates
        const submittedDates = new Set(tasks.map(task => task.date));

        // Generate status for each of the last 7 days
        const calendar = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = startDate.clone().add(i, 'days').format('YYYY-MM-DD');
            calendar.push({
                date: currentDate,
                status: submittedDates.has(currentDate) ? '✅' : '❌'
            });
        }

        res.json(calendar);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

  


app.get('/api/onsite/last7days/:eid', async (req, res) => {
    const { eid } = req.params;
    const today = new Date();
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7.push(d.toISOString().slice(0, 10));
    }
    try {
        // Fetch onsite tasks for eid in last 7 days using shootDate
        const onsiteEntries = await OnsiteTask.find({
            eid,
            shootDate: {
                $gte: new Date(last7[0]),
                $lte: new Date(last7[6] + 'T23:59:59.999Z')
            }
        });
        // Map to status per day
        const calendar = last7.map(date => {
          const found = onsiteEntries.some(t => t.shootDate.toISOString().slice(0, 10) === date);
          return { date, status: found ? '✅' : '❌' };
        });
        res.json(calendar);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post("/task3",async(req,res)=>{
    try{
        // Validate required fields
        const { eid, ename, date, projectname, projecttype, projectstatus, category } = req.body;
        
        if (!eid || !ename || !date || !projectname || !projecttype || !projectstatus || !category) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Convert date string to Date object
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        // Only assign points if projectstatus is 'Complete'
        let points = 0;
        if (projectstatus && projectstatus.toLowerCase() === 'complete') {
            points = calculatePoints(projecttype);
        }
        const task3 = new Task3({
            eid,
            ename,
            date: dateObj,
            projectname,
            projecttype,
            projectstatus,
            category,
            points,
            note: req.body.notes || ''
        });
        
        await task3.save();
        res.status(201).json({message:"Task3 created successfully"});
    }catch(error){
        console.error('Task3 creation error:', error);
        res.status(500).json({message: "Error creating task3", error: error.message});
    }
});

// Helper function to escape regex special characters
 

// GET endpoint for AdminPanel with filters
app.get('/admin/tasks', async (req, res) => {
  const { eid, date, projecttype, projectstatus, category } = req.query;
  const query = {};

  // Use regex for case-insensitive search with escaped patterns
  if (eid) query.eid = { $regex: new RegExp(escapeRegex(eid), 'i') };
  // Robust date filtering: match all tasks for the selected day
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }
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
  const { eid, month, category } = req.query;

  try {
    // Parse the month string (format: YYYY-MM)
    const [year, monthNum] = month.split('-').map(Number);
    
    // Create start date (first day of the month)
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    
    // Create end date (last day of the month)
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    console.log('Date range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Add filters if provided
    if (eid) {
      query.eid = { $regex: new RegExp(escapeRegex(eid), 'i') };
    }

    if (category) {
      query.category = { $regex: new RegExp(escapeRegex(category), 'i') };
    }

    // Get tasks with sorting by date
    const tasks = await Task.find(query).sort({ date: 1 });
    
    // Calculate total points
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    
    // Get unique categories for filter dropdown
    const uniqueCategories = await Task.distinct('category', query);
    
    res.json({ 
      tasks, 
      totalPoints,
      categories: uniqueCategories
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

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


app.get('/api/users/eids', async (req, res) => {
  try {
    const users = await User.find({}, 'employeeId name');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

 

// Mount onsiteTaskRoutes for all /onsiteTask endpoints
const onsiteTaskRoutes = require('./routes/onsiteTaskRoutes');
app.use('/onsiteTask', onsiteTaskRoutes);


// GET endpoint for OnsiteTaskView
app.get('/onsite/tasks', async (req, res) => {
  const { eid, shootDate, projectname, teamNames } = req.query;
  const query = {};

  // Use regex for case-insensitive search with escaped patterns
  if (eid) query.eid = { $regex: new RegExp(escapeRegex(eid), 'i') };
  if (shootDate) query.shootDate = shootDate;
  if (projectname) query.projectname = { $regex: new RegExp(escapeRegex(projectname), 'i') };
  if (teamNames) query.teamNames = { $regex: new RegExp(escapeRegex(teamNames), 'i') };

  try {
    const tasks = await OnsiteTask.find(query).sort({ shootDate: -1 });
    
    // Get unique values for filters
    const uniqueEids = await OnsiteTask.distinct('eid');
    const uniqueProjectNames = await OnsiteTask.distinct('projectname');
    const uniqueTeamNames = await OnsiteTask.distinct('teamNames');

    res.json({
      tasks,
      filters: {
        eids: uniqueEids,
        projectNames: uniqueProjectNames,
        teamNames: uniqueTeamNames
      }
    });
  } catch (error) {
    console.error('Error fetching onsite tasks:', error);
    res.status(500).json({ message: 'Error fetching onsite tasks' });
  }
});

// GET endpoint for Task3 AdminPanel with filters
app.get('/task3/admin', async (req, res) => {
  const { eid, date, projecttype, projectstatus, category } = req.query;
  const query = {};

  // Use regex for case-insensitive search with escaped patterns
  if (eid) query.eid = { $regex: new RegExp(escapeRegex(eid), 'i') };
  if (date) query.date = date; // Keep date as exact match
  if (projecttype) query.projecttype = { $regex: new RegExp(escapeRegex(projecttype), 'i') };
  if (projectstatus) query.projectstatus = { $regex: new RegExp(escapeRegex(projectstatus), 'i') };
  if (category) query.category = { $regex: new RegExp(escapeRegex(category), 'i') };

  try {
    const tasks = await Task3.find(query).sort({ date: -1 });
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    
    // Get unique values for filters
    const uniqueEids = await Task3.distinct('eid');
    const uniqueProjectTypes = await Task3.distinct('projecttype');
    const uniqueProjectStatuses = await Task3.distinct('projectstatus');
    const uniqueCategories = await Task3.distinct('category');

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
    console.error('Error fetching Task3:', error);
    res.status(500).json({ message: 'Error fetching Task3' });
  }
});

// GET endpoint for Task3 MonthlyTaskView
app.get('/task3/date-range', async (req, res) => {
  const { startDate, endDate, eid, category, projectType, projectStatus } = req.query;
  
  try {
    const query = {
      date: { 
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Add other filters if provided
    if (eid) query.eid = { $regex: new RegExp(escapeRegex(eid), 'i') };
    if (category) query.category = { $regex: new RegExp(escapeRegex(category), 'i') };
    if (projectType) query.projecttype = { $regex: new RegExp(escapeRegex(projectType), 'i') };
    if (projectStatus) query.projectstatus = { $regex: new RegExp(escapeRegex(projectStatus), 'i') };

    // Get tasks with sorting by date
    const tasks = await Task3.find(query).sort({ date: 1 });
    
    // Calculate total points
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    
    // Return tasks and total points
    res.json({
      tasks,
      totalPoints
    });
  } catch (error) {
    console.error('Error fetching Task3:', error);
    res.status(500).json({ message: 'Error fetching Task3' });
  }
});

// GET endpoint for current day's Task3 (default for AdminPanel)
app.get('/task3/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Fetching Task3 for today: ${today}`);
    
    const tasks = await Task3.find({ date: today }).sort({ date: -1 });
    console.log(`Found ${tasks.length} Task3 for today`);
    
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    console.log(`Total points for today: ${totalPoints}`);
    
    // Get unique values for filters
    const uniqueEids = await Task3.distinct('eid');
    const uniqueProjectTypes = await Task3.distinct('projecttype');
    const uniqueProjectStatuses = await Task3.distinct('projectstatus');
    const uniqueCategories = await Task3.distinct('category');

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
    console.error('Error fetching today\'s Task3:', error);
    res.status(500).json({ message: 'Error fetching Task3', error: error.message });
  }
});

// GET endpoint for Post Production Monthly Tasks
app.get('/postproduction/monthly', async (req, res) => {
  const { startDate, endDate, eid, category, projectstatus } = req.query;

  try {
    console.log('Received date parameters:', {
      startDate,
      endDate,
      startDateType: typeof startDate,
      endDateType: typeof endDate
    });

    // Create date range query using string dates
    const query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Add filters if provided
    if (eid) {
      query.eid = { $regex: new RegExp(escapeRegex(eid), 'i') };
    }

    if (category) {
      query.category = { $regex: new RegExp(escapeRegex(category), 'i') };
    }

    if (projectstatus) {
      query.projectstatus = { $regex: new RegExp(escapeRegex(projectstatus), 'i') };
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    // Get tasks with sorting by date
    const tasks = await Task.find(query).sort({ date: 1 });
    
    console.log(`Found ${tasks.length} tasks`);
    if (tasks.length > 0) {
      console.log('First few tasks dates:', tasks.slice(0, 3).map(task => ({
        taskId: task._id,
        date: task.date
      })));
    }
    
    // Calculate total points
    const totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    
    // Get unique categories and project statuses for filter dropdowns
    const uniqueCategories = await Task.distinct('category', query);
    const uniqueProjectStatuses = await Task.distinct('projectstatus', query);
    
    res.json({ 
      tasks, 
      totalPoints,
      categories: uniqueCategories,
      projectStatuses: uniqueProjectStatuses
    });
  } catch (error) {
    console.error('Error fetching post-production tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Delete an onsite task by ID (new API for frontend)
app.delete('/api/onsite/delete/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;
    // Optionally, add authentication/authorization check here if needed
    const deletedTask = await OnsiteTask.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Onsite task not found' });
    }
    res.json({ message: 'Onsite task deleted successfully', task: deletedTask });
  } catch (error) {
    console.error('Error deleting onsite task:', error);
    res.status(500).json({ message: 'Error deleting onsite task', error: error.message });
  }
});

// Delete a post-production task by ID (for PostProduction page)
app.delete('/api/postproduction/delete/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;
    // Optionally, add authentication/authorization check here if needed
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Post-production task not found' });
    }
    res.json({ message: 'Post-production task deleted successfully', task: deletedTask });
  } catch (error) {
    console.error('Error deleting post-production task:', error);
    res.status(500).json({ message: 'Error deleting post-production task', error: error.message });
  }
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
