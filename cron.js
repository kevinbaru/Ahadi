"use strict"

console.log('Hello I am runnin!!')

var{User, Reminder}= require('./models');
var {web}= require('./slackBot');
var moment= require('moment');


Reminder.find({date: moment(Date.now()).format('YYYY-MM-DD')}).populate('user')
.then(function(reminders){

  
  web.chat.postMessage(reminders[0].user.slackDMId,'TODAY\'S REMINDERS',function(){
    reminders.map((reminder,index)=>{
  
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


