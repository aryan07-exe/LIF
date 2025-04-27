const mongoose=require('mongoose');

const Taskschema= new mongoose.Schema({
eid:{
    type:String,
    required:true
    },
ename:{
        type:String,
        required:true
        },
date:{
    type:String,
    required:true
},
projectname:{
    type:String,
    required:true
},
projecttype:{
    type:String,
    required:true
},
projectstatus:{
    type:String,
    required:true 
},
category:{
    type:String,
    required:true 
},
points: {
    type: Number,
    required: true,
    default: 0
},
note:{
    type:String,
    required:false
}
});

module.exports=mongoose.model('Task',Taskschema);