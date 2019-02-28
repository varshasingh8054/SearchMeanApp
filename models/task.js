const mongoose = require('mongoose');
const config = require('../config/database');

const TaskSchema = mongoose.Schema({

    taskId: {
        type: Number,
        unique : true,
        required : true
        // unique : true
    },

    taskName: {
        type: String,
        required : true

    },
    taskDesc:{
        type: String,
        require: true
        
    } ,
   taskHandler: {
       type: String,
       required: true
   },
   taskClientName :
   {
    type: String,
    required: true 
   }
     
});

const Task=module.exports=mongoose.model('Task',TaskSchema);
module.exports.addTask= function(newTask, callback)
{
    newTask.save(callback);   
    console.log("added");
}


module.exports.getTask = function(callback){
    Task.find(callback);
}

module.exports.updateTask = function(id, newTask, callback){
    Task.findByIdAndUpdate(id, newTask, callback);
}
// module.exports.deletetask = function(id, callback){
//     Task.findByIdAndRemove(id, callback);
// }