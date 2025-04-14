const mongoose=require('mongoose');

const Taskschema= new mongoose.Schema({
eid:{
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
note:{
    type:String,
    required:false
}
});

module.exports=mongoose.model('Task',Taskschema);