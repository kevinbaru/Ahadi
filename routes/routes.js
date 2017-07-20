var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var Reminder = models.Reminder;
var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
var google = require('googleapis');
mongoose.Promise=global.Promise;
var OAuth2 = google.auth.OAuth2;
var googleCalAuth = require('../googleCal').cal;
var moment=require('moment');
// var gapi = require('gapi');
mongoose.connect(connect)


var token = process.env.SLACK_API_TOKEN || '';

var {RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');


var rtm = new RtmClient(token);
rtm.start();
let oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN+'/connect/callback'
)
//////////////////////////////// PUBLIC ROUTES ////////////////////////////////


// Users who are not logged in can see these routes

router.post('/messageReceive', function(req, res) {
  var payload = JSON.parse(req.body.payload);

  console.log(payload)
  var event = {};





  if (payload.actions[0].value === 'true'){


    var calendar = google.calendar('v3');
    let oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.DOMAIN+'/connect/callback'
    )



    User.findOne({slackID:payload.user.id})
    .then((user)=>{

      if(user.parameters.duration){

        event = {
          'summary': user.parameters.subject,
          'location': user.parameters.location,
          'description': user.parameters.subject,
          'attendees':{'displayName':user.parameters.invitees[0]},
          'start': {
            'dateTime':user.parameters.date + 'T' + user.parameters.time ,
            'timeZone': 'America/Los_Angeles'
          },
          'end': {
            'dateTime':  moment(user.parameters.date + ' '+user.parameters.time).add(user.parameters.duration.amount,'hours').format(),
            'timeZone': 'America/Los_Angeles'
          }
        };

      }else{

        event = {
          'summary': user.parameters.subject,
          'attendees':user.parameters.invitees,
          'location': user.parameters.location,
          'description': user.parameters.subject,
          'start': {
            'date': user.parameters.date,
            'timeZone': 'America/Los_Angeles'
          },
          'end': {
            'date': user.parameters.date,
            'timeZone': 'America/Los_Angeles'
          }
        };


      }

      console.log('useerr',user)
      let rtoken={}
      rtoken.refresh_token=user.google.refresh_token;
      rtoken.access_token=user.google.access_token;
      rtoken.id_token=user.google.id_token;
      rtoken.token_type=user.google.token_type;
      rtoken.expiry_date=user.google.expiry_date;

      oauth2Client.setCredentials(rtoken)
      calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        resource: event
      }, function(err,event){
        if(err){
          console.log('errrrrr',err)


        }else{
          return new Reminder({
            user:user._id,
            date:user.parameters.date,
            reminder:user.parameters
          }).save()
          .then((savedR)=>{
            user.pendingExist=false;
            user.parameters={};
            console.log('userPendingExist',user.pendingExist)
            user.save()
          })
          .then((saved)=>{
            res.send({
              text: 'Created! :white_check_mark:',
            })
          })
          .catch((err)=>{
            console.log('PendFalseerror',err)
          })

        }

      });



    })
    .catch((err)=>{
      console.log('djdjdjdd', err)

    })





  } else if (payload.actions[0].value === 'false'){

    User.findOne({slackID:payload.user.id})
    .then((user)=>{
      user.parameters={};
      user.pendingExist=false;
      user.save(function(err,saved){
        if(err){
          console.log(err)
        }else{

          res.send('Canceled :x:');

        }
      })


    })
  }

})

// GoogleAUthorization


router.get('/connect',function(req,res){
  var url=googleCalAuth(req.query.auth)
  res.redirect(url)

})


router.get('/connect/callback',function(req,res){
  //var userId=req.query.user;
  oauth2Client.getToken(req.query.code, function (err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    console.log('tkkkk',tokens)
    if (err) {
      res.status(500).send({error:err})

    }else{
      oauth2Client.setCredentials(tokens);
      var plus=google.plus('v1')
      plus.people.get({auth:oauth2Client,userId: 'me'}, function(err, googleUser){

        if(err){
          res.status(500).json({error:err})
        }else{
          User.findOne({slackID:req.query.state})
          .then(function(mongoUser){

            mongoUser.google = tokens;
            mongoUser.google.profile_id=googleUser.id;
            mongoUser.google.profile_name=googleUser.displayName;
            mongoUser.google.email=googleUser.emails[0].value;
            return mongoUser.save()
          })
          .then((update)=>{

            res.send('You are connected to Google Calendar');
            rtm.sendMessage('You are connected to Google Calendar', update.slackDMId);
          })
          .catch(err=>{
            res.json({error:err})

          })
        }

      })



    }
  });


})





///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
