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
// Category is now a free-form string provided by user input
category:{
    type:String,
    required:true 
},
points: {
    type: Number,
    required: true,
    default: 0
},
// Use 'notes' for consistency with OnsiteTask.js
notes:{
    type:String,
    required:false
}
}, {
    timestamps: true
});

// Static options for projecttype and projectstatus
const PROJECT_TYPE_OPTIONS = [
    "Reel",
    "Teaser",
    "Wedding Highlight",
    "Wedding Long Film",
    "Wedding Cine Film",
    "Event Highlight",
    "Event Film",
    "Wedding Photo Edit",
    "Event Photo Edit",
    "Album Edit",
    "Album Design",
    "Individual Event",
    "Others"
];

const PROJECT_STATUS_OPTIONS = [
    "Complete",
    "In-Process",
    "In House Correction",
    "Client's Correction",
    "New"
];

const Task = mongoose.model('Task',Taskschema);
Task.PROJECT_TYPE_OPTIONS = PROJECT_TYPE_OPTIONS;
Task.PROJECT_STATUS_OPTIONS = PROJECT_STATUS_OPTIONS;

module.exports = Task;