"use strict"

console.log('Hello I am runnin!!')

var{User, Reminder}= require('./models');
var {web}= require('./slackBot');
 User.findOne()
 .then(function(user){
   web.chat.postMessage(user.slackDMId,'Current time is '+ new Date(),function(){
     process.exit(0)
   });

 })
