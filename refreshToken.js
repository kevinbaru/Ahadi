var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
let oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN+'/connect/callback'
)




var refreshToken= function(user){
    if(user.google.expiry_date<=Date.now()){
    console.log('expired', user.google.expiry_date);
    let rtoken={}
    rtoken.refresh_token=user.google.refresh_token;
    rtoken.access_token=user.google.access_token;
    rtoken.id_token=user.google.id_token;
    rtoken.token_type=user.google.token_type;
    rtoken.expiry_date=user.google.expiry_date;

    oauth2Client.setCredentials(rtoken);
    oauth2Client.refreshAccessToken(function(err, tokens) {
      if(err){
        console.log('Error',err)
      }else{

        user.google.expiry_date=tokens.expiry_date;
        user.google.id_token=tokens.id_token;
        user.google.refresh_token=tokens.refresh_token;
        user.google.access_token=tokens.access_token;
        user.google.token_type=tokens.token_type;
        user.markModified('google');

        user.save(function(err,saved){
          if(err){
            console.log("----------------------------")
            console.log('SavingRefreshedTokensErr',err)
            console.log("----------------------------")
          } else {

          }
        })
      }

    });
  }

}
module.exports={
  refreshToken:refreshToken,
}
