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
    required:true,
    validate: {
        validator: function(v) {
            // Validate YYYY-MM-DD format
            return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: props => `${props.value} is not a valid date in YYYY-MM-DD format!`
    }
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
}, {
    timestamps: true
});

module.exports=mongoose.model('Task',Taskschema);