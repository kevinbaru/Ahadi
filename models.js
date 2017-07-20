var mongoose = require('mongoose');
mongoose.Promise=global.Promise;
var connect = process.env.MONGODB_URI;

var userSchema = mongoose.Schema({
  slackID:{
    type:String,
    required:true
  },
  slackDMId:{
    type:String,
    required:true
  },
  google: {},
  pendingExist:{
    type:Boolean,
    default:false
  },
  parameters:{},
});

var reminderSchema = mongoose.Schema({
user:{
  type:mongoose.Schema.ObjectId,
  ref:'User'
},
date:Date,
reminder:{},
});



User = mongoose.model('User', userSchema);

Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = {
    User:User,
    Reminder:Reminder,
};
