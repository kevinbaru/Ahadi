var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

 var calAuth= function(userId){

  var oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.DOMAIN+'/connect/callback'
  )

  var scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  var url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    //Gets refresh_token
    prompt: 'consent',
 
    scope: scopes,
    // Optional property that passes state parameters to redirect URI
   state:userId

  });

  return url

}
module.exports={
  cal:calAuth
}
