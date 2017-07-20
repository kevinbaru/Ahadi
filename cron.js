"use strict"

console.log('Hello I am runnin!!')

var{User, Reminder}= require('./models');
var {web}= require('./slackBot');
var moment= require('moment');
console.log('now',moment(Date.now()).format()+'Z')

console.log('tomorrow',moment(Date.now()).add(3,'day').format()+'Z')

Reminder.find({date:{$lt: moment(Date.now()).add(3,'day').format()}}).populate('user')
.then(function(reminders){

  console.log('reeem',reminders)
  reminders.map((reminder)=>{
    console.log(reminder.reminder.subject,'fgggg')
    web.chat.postMessage(reminder.user.slackDMId,`REMINDER: ${reminder.reminder.subject}`,function() {
      process.exit(0)
    });

  })


})
.catch((err)=>{
  console.log('ReminderError',err)
})

 // User.findOne()
 // .then(function(user){
 //   web.chat.postMessage(user.slackDMId,'Current time is '+ new Date(),function() {
 //     process.exit(0)
 //   });
 //
 // })
