
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios');
var routes = require('./routes/routes');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var {refreshToken}=require('./refreshToken')
var {timeConflict}=require('./timeConflict')

var mongoose = require('mongoose');
var models = require('./models');
var User = models.User;
mongoose.Promise=global.Promise;
var connect = process.env.MONGODB_URI;
mongoose.connect(connect)
var moment= require('moment')
var calendar = google.calendar('v3');


var {RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');

// =========================== express ===========================

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', routes);

var pendingExist = false; //link to mongoDB with slackID and pending Variable.



var port = process.env.PORT || 3000
app.listen(port);

// =========================== bot ===========================





var token = process.env.SLACK_API_TOKEN || '';
var web = new WebClient(token);

var rtm = new RtmClient(token);
rtm.start();
let oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN+'/connect/callback'
)

// when I receive message from SlackBot
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  var dm = rtm.dataStore.getDMByUserId(message.user);

  // if it is NOT a direct message between bot and a user
  if (!dm || dm.id !== message.channel || message.type!== 'message'){
    console.log("Message not sent to DM, ignoring");
    return;
  }



  // if pending is true, alert user to finish the pending task.


  let valid = true;

  User.findOne({slackID: message.user})
  .then((user)=>{
    if(!user){
      return new User({
        slackID:message.user,
        slackDMId:message.channel,
      }).save()
    }else{
      return user
    }
  })
  .then((user)=>{
    if(!user.google){
      rtm.sendMessage(`Please click on the link below to authorize access to your google Calendar ${process.env.DOMAIN}/connect?auth=${user.slackID}` , user.slackDMId)
    }else{
      refreshToken(user)
      if (user.pendingExist) {
        rtm.sendMessage("I think you're trying to create a new reminder. If so, please press `cancel` first to about the current reminder", user.slackDMId)
        // web.chat.postMessage(message.channel, `Scheduling a meeting with ${data.result.parameters.invitees} on ${data.result.parameters.date} at ${data.result.parameters.time} `, jsonBtn)
        return;
      }
      //// Creating promises
      // function postMessage(channelId,msg){
      //   return new Promise(function(resolve,reject){
      //     web.chat.postMessage(channelId, 'The current time is',function(err){
      //       if(err){
      //         reject(err)
      //       }else{
      //         resolve()
      //       }
      //     })
      //   })
      // }
      // //Or use bluebird= require('bluebird')
      //var postMessage= bluebird.promisify(web.chat.postMessage.bind(web.chat))



      var regex= /<@\w+>/g
      let users=[]
      message.text=message.text.replace(regex,(match)=>{
        var userId=match.slice(2,-1);
        var invitee=rtm.dataStore.getUserById(userId);
        console.log('inviteeeeeee',invitee)
        users.push({displayName:invitee.profile.real_name, email:invitee.profile.email, userId:userId});
        return invitee.profile.first_name||invitee.profile.real_name;
      })

      console.log('menebebfewhrerh',message.text)

      let timeSchedules=[] // Busy times for the user

      let startTime;
      let duration;
      let endTime;
      let data;
      // curl 'https://api.api.ai/api/query?v=20150910&query=remind%20me&lang=en&sessionId=13756478-6ee1-48f8-9953-7f53da5e2206&timezone=2017-07-17T16:55:51-0700' -H 'Authorization:Bearer e637efb67d9e44abbb260b09b472af21'
      axios.get('https://api.api.ai/api/query', {
        params: {
          v: 20150910,
          lang: 'en',
          timezone: '2017-07-17T16:55:51-0700',
          query: message.text,
          sessionId: message.user
        },
        headers : {
          Authorization: `Bearer ${process.env.API_AI_TOKEN}`
        }
      })
      .then(function(temp) {
        data = temp.data
        console.log('ggjgjjgjgjgjgjgggjg_____________________________________________')
        startTime = moment(data.result.parameters.date + 'T' + data.result.parameters.time).format();
        duration = data.result.parameters.duration.amount;
        endTime = moment(data.result.parameters.date + ' '+data.result.parameters.time).add(data.result.parameters.duration.amount,'hours').format();

        // Check if the requester has a time conflict
          var Userschedule = timeConflict(user,startTime,endTime);

          return Userschedule;

      })
      .then(function(resp) {
          console.log('iiiiiiiiiiiiiiiiiiiii',resp)
          if(resp.busy.length!==0){
            valid = false;
            // "There is a time conflict"

            rtm.sendMessage('Alert! You have a time conflict'
            ,user.slackDMId,(err,msg)=>{
              if(err){ console.log('error sending me fedback messsage',err)
            }else{
              console.log(msg)
            }

            })
          }

        // if some input is missing,
        if (data.result.actionIncomplete) {
          rtm.sendMessage(data.result.fulfillment.speech, message.channel);
        }else { //When I have everything what I need. ex. date & todo.
          console.log('dsfdhgfdhjfghdfgdjfdjf')
          console.log(users)

        users.map((invitee,index)=>{
            console.log(index,'indddddddd')
            User.findOne({slackID:invitee.userId})
            .then((fnd)=>{
              if(!fnd){
                web.im.open(invitee.userId,function(err,channel){
                  if(err){
                    console.log('error making direct connection')
                }else{
                  console.log('chanel',channel)
                  return new User({
                    slackID:invitee.userId,
                    slackDMId:channel.channel.id,
                  }).save()
                  .then((saved)=>{
                  let requester=rtm.dataStore.getUserById(message.user)
                  rtm.sendMessage(`${requester.profile.first_name||requester.profile.real_name} wants to schedule a meeting with you.\Click on the following link to authorize access to your Google calendar ${process.env.DOMAIN}/connect?auth=${invitee.userId}`,
                    channel.channel.id,function(err,success){
                      if(err){
                        console.log('errrrggdgfggSending access auth to others users',err)
                      }else{
                        console.log('sseenenntnttnntntntntntntntntn',success)
                        rtm.sendMessage(`Request for access to google calendar sent to ${invitee.displayName} Google\'s calendar, \You can proceed or terminate the scheduling
                        `,user.slackDMId,(err,msg)=>{
                          if(err){ console.log('error sendim me fedback messsage',err)
                        }else{
                          console.log(msg)
                        }

                        })
                      }

                    });

                  })
                  .catch((err)=>{console.log('error')})
                }
                })




              }else if(!fnd.google){
                console.log('ayyayayayayaya found acccess details----------')
                let requester=rtm.dataStore.getUserById(message.user)
                rtm.sendMessage(`${requester.profile.first_name||requester.profile.real_name} wants to schedule a meeting with you.\Click on the following link to authorize access to your Google calendar ${process.env.DOMAIN}/connect?auth=${invitee.userId}`,
                  channel.channel.id,function(err,success){
                    if(err){
                      console.log('errrrggdgfggSending access auth to others users',err)
                    }else{
                      console.log('sseenenntnttnntntntntntntntntn',success)
                      rtm.sendMessage(`Request for access to google calendar sent to ${invitee.displayName} Google\'s calendar, \You can proceed or terminate the scheduling
                      `,user.slackDMId,(err,msg)=>{
                        if(err){ console.log('error sendim me fedback messsage',err)
                      }else{
                        console.log(msg)
                      }

                      })
                    }

                  });


              }


              else{
                console.log('foundUser',fnd)
                // First Check if the access ie expired if so refresh the access tokens
                refreshToken(fnd)
                console.log('startTime',startTime)
                console.log('endTime',endTime)


                // if(schedule.busy.length!==0){
                //   "There is a time conflict"
                //   rtm.sendMessage('Alert! There is a time Conflict with one of the attendeee schedules'
                //   ,user.slackDMId,(err,msg)=>{
                //     if(err){ console.log('error sendim me fedback messsage',err)
                //   }else{
                //     console.log(msg)
                //   }
                //
                //   })
                // }
                timeConflict(fnd,startTime,endTime)
                // timeSchedules.push(schedule)
                .then(function(calendar) {
                  if(calendar.busy.length!==0){
                    // "There is a time conflict"
                    valid = false;
                    rtm.sendMessage('Alert! There is a time Conflict with one of the attendeee schedules'
                    ,user.slackDMId,(err,msg)=>{
                      if(err){ console.log('error sendim me fedback messsage',err)
                    }else{
                      console.log(msg)
                    }

                    })
                  }
                })




                console.log('accesss othe users calendarhdhdhdhdhd')

              }
            })
            .catch(err=>{
              console.log('ErrorFindingInviteeonDatabase',err)
            })




          })





          //  console.log(timeSchedules)

            // if(timeSchedules.length!==0){
            //   "There is a time conflict"
            //   rtm.sendMessage('Alert! There is a time Conflict with one of the attendeee schedules'
            //   ,user.slackDMId,(err,msg)=>{
            //     if(err){ console.log('error sendim me fedback messsage',err)
            //   }else{
            //     console.log(msg)
            //   }
            //
            //   })
            // }

          if (!valid) {
            return;
          }


          var jsonBtn = {
            // "text": "Would you like to play a game?",
            "attachments": [
              {
                // "title": "Is this reminder correct?",
                "fallback": "You are unable to create a schedule",
                "attachment_type": "default",

                "fallback": "You are unable to create ",
                "callback_id": "confirm_or_not",
                "color": "#3AA3E3",
                "attachment_type": "default",


                "actions": [
                  {
                    "name": "confirm",
                    "text": "Confirm",
                    "type": "button",
                    "value": "true"
                  },
                  {
                    "name": "cancel",
                    "text": "Cancel",
                    "type": "button",
                    "style": "danger",
                    "value": "false"
                  }
                ]
              }
            ]
          }

          console.log('params',data.result.parameters)
          console.log(users, 'users');
          user.pendingExist=true;
          user.invitees=users;
          user.parameters=data.result.parameters

          console.log('USERRRR', user);

          user.save(function(err,saved){
            if(err){
              console.log('savingPendingTrueerror',err)
            }
          })


          // if invitees exist
          if (data.result.parameters.invitees) {
            web.chat.postMessage(message.channel, `Scheduling a meeting with ${data.result.parameters.invitees} on ${data.result.parameters.date} at ${data.result.parameters.time} `, jsonBtn)
          } else {
            web.chat.postMessage(message.channel,`Creating a Reminder to ${data.result.parameters.subject} on ${data.result.parameters.date}`, jsonBtn)
          }
        }
      })
      .catch(err=> console.log(err))

    }

  })
  .catch(function(err){
    console.log("ERROR", err);
  })


  console.log('jjjj')

});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
  console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
  console.log('Reaction removed:', reaction);
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  // rtm.sendMessage("Hello!", channel);
  console.log("Bot is online!");
});
module.exports={
  rtm,
  web
}
