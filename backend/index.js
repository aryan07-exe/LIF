const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const app=express();
const port=5000;
require('dotenv').config();

const Task=require('./models/Task');

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
    console.log("Error details:", err); // Log the detailed error message
  });
app.post("/task",async(req,res)=>{
    try{
        const task=new Task(req.body);
        await task.save();
        res.status(201).json({message:"Task created successfully"});
    }catch(error){
        console.log(error);
    }
})
app.get("/task",async(req,res)=>{
    try{
        const task=await Task.find();
        res.status(200).json(task);
    }catch
    (error){
        console.log(error);
    }
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})