const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/* MONGOOSE SETUP */
var {User} = require('../models/user');

module.exports = {Local} = passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async function(username, password, done) {
    // async function(username, password, done) {
    try{
        const user = await User.findByCredentials(username, password);
        return done(null, user);
    }
    catch{
        return done(null, false);
    }
  }
));
