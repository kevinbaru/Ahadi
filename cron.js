"use strict"

console.log('Hello I am runnin!!')

var{User, Reminder}= require('./models');
var {web}= require('./slackBot');
var moment= require('moment');
console.log('now',moment(Date.now()).format('YYYY-MM-DD'))

console.log('tomorrow',moment(Date.now()).add(1,'day').format())

Reminder.find({date: moment(Date.now()).format('YYYY-MM-DD')}).populate('user')
.then(function(reminders){

  
  web.chat.postMessage(reminders[0].user.slackDMId,'TODAY\'S REMINDERS',function(){
    reminders.map((reminder,index)=>{
      console.log(reminder.reminder.subject,'fgggg')
      web.chat.postMessage(reminder.user.slackDMId,`Remember to ${reminder.reminder.subject}`,function(){
        if(index===reminders.length-1){

          process.exit(0)
        }
      });

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
