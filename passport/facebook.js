
const passport = require('passport');
// const dotenv  = require("dotenv");
const strategy = require("passport-facebook");

const FacebookStrategy = strategy.Strategy;

const {
  facebook_clientID, 
  facebook_clientSecret, 
  facebook_callbackURL
} = require('../config/config');

// dotenv.config();

passport.use(
  new FacebookStrategy(
    {
      clientID: facebook_clientID,
      clientSecret: facebook_clientSecret,
      callbackURL: facebook_callbackURL,
    //   passReqToCallback : true,
      profileFields: [
          'id', 
          'emails', 
          'name', 
          'picture', 
        //   'user_birthday', 
        //   'user_gender'
        ] 
    },
    function(accessToken, refreshToken, profile, done) {
      console.log('reached');
        // console.log(`access token is`);
        // console.log(accessToken);
        // console.log(`refresh token is`);
        // console.log(refreshToken);
        // console.log(`profile is`);
        // console.log(profile);
      // const { email, first_name, last_name } = profile._json;
      // const userData = {
      //   email,
      //   firstName: first_name,
      //   lastName: last_name
      // };
      // console.log(userData);
    //   console.log(profile);
    //   new UserDetails(userData).save();
      done(null, profile);
    }
  )
);