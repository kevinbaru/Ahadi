

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');


var timeConflict= function(user,startTime, endTime){
  console.log('dsfdhgfdhjfghdfgdjfdjf checking time conflicts')
  let oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.DOMAIN+'/connect/callback'
  );

  let rtoken={}
  rtoken.refresh_token=user.google.refresh_token;
  rtoken.access_token=user.google.access_token;
  rtoken.id_token=user.google.id_token;
  rtoken.token_type=user.google.token_type;
  rtoken.expiry_date=user.google.expiry_date;
  oauth2Client.setCredentials(rtoken);


  console.log(rtoken, 'rtoken');
  console.log(startTime,'startTime')
  console.log(endTime,'endTime')

  return new Promise(function(resolve, reject) {
    calendar.freebusy.query({
      auth: oauth2Client,
      resource: {
        timeMin: startTime,
        timeMax: endTime,
        timeZone:'America/Los_Angeles',
        items: [{ "id":"primary" }]
      }
    },
    (err,resp)=>{
      if(err){
        console.log('ERR', err)
        reject(err);
      }else{
        // Look for more available times if there is a conflict
        // if(resp.busy.length!==0){
        //   let endTime= moment(endTime).add(7,'days').format();
        //   calendar.freebusy.query({
        //     "auth": oauth2Client,
        //     "timeMin":startTime,
        //     "timeMax":endTime,
        //     "timeZone":'America/Los_Angeles',
        //     "items": [{"id":"primary"}],
        //
        //   },function(err,times){
        //     if(err){
        //       console.log(err)
        //     }else{
        //       return times;
        //       console.log('There is a conflict timesssssss',times)
        //     }
        //   })
        // }else
       
        // return resp;
        resolve(resp.calendars.primary);


      }
    })
  });
}



module.exports={
  timeConflict:timeConflict
}
