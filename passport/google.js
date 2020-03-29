
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const {
  google_clientID,
  google_clientSecret,
  google_callbackURL
} = require('../config/config');

passport.use(new GoogleStrategy({
  clientID: google_clientID,
  clientSecret: google_clientSecret,
  callbackURL: google_callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(`access token is`);
    console.log(accessToken);
    console.log(`refresh token is`);
    console.log(refreshToken);
    console.log(`profile is`);
    console.log(profile);
    done(null, profile);
  }
));