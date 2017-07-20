"use strict"

console.log('Hello I am runnin!!')

var{User, Reminder}= require('./models');
var {web}= require('./slackBot');
var moment= require('moment');

Reminder.find({date:{$gt:moment(new Date()),format, $lt:  moment(new Date()).add(1,'day').format()}})
.then(function(reminders){
  console.log('reeem',reminders)
  reminders.map((reminder)=>{
    web.chat.postMessage(reminder.user.slackDMId,'REMINDER: '+ reminder.subject,function() {
      process.exit(0)
    });

  })


})

 // User.findOne()
 // .then(function(user){
 //   web.chat.postMessage(user.slackDMId,'Current time is '+ new Date(),function() {
 //     process.exit(0)
 //   });
 //
 // })
