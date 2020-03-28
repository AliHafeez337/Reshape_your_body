var express = require('express');
var router = express.Router();
const passport = require('passport');
const _ = require('lodash');

var {User} = require('../models/user');
var {authenticate} = require('../middleware/authenticate');

router.post('/login', 
    passport.authenticate('local', 
    { failureRedirect: '/error' }),
    async function(req, res) {
        // console.log(req.user)
        const token = await req.user.generateAuthToken();
        // var decoded = jwt_decode(token);
        
        var body1 = {
            userid: req.user._id,
            email: req.user.email,
            token: token,
            // tokenexp: decoded.exp
        }
        // console.log(body1);
        res.send(body1);
    }
);

router.post('/register', async (req, res) => {
    console.log('reached')
    try {
        var body = _.pick(req.body, [
            'email',
            'firstname',
            'lastname',
            'birthdate',
            'phone',
            'address1',
            'address2',
            'city',
            'postal',
            'country',
            'password'
        ]);
        var user = new User(body);
        console.log(user);
        
        var doc1 = await user.save();
        res.status(200).send(doc1);
    }
    catch(e) {
        if ("errmsg" in e){
        res.status(400).send(e.errmsg);
        }
        res.status(400).send(e);
    }
});

router.post('/logout', authenticate, async (req, res) => {
    try {
    //   const user = await User.findByToken(req.token);
      var doc = await req.person.removeToken(req.token);
      if (doc != null){
        res.status(200).send({
          message: "You loged out successfully."
        })
      }
      else{
        res.status(401).send({
          errmsg: "Unable to log you out."
        })
      }
    } catch (e) {
      res.status(400).send(e);
    }
});

router.get("/auth/facebook", 
    passport.authenticate("facebook", 
        { scope : [
            // 'id',
            // 'first_name',
            // 'last_name',
            // 'middle_name',
            // 'name',
            // 'name_format',
            // 'picture',
            // 'short_name',
            'email',
        ] }
    )
);

router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", 
    { failureRedirect: '/user/error' }),
    async function(req, res) {
        // console.log(req.user._json);
        // const doc = await User.findOne({'email':req.user._json.email});
        const doc = await User.findByEmail(req.user._json.email);
        // console.log(doc);
        if (doc == null){
            var user = new User({
                'email': req.user._json.email,
                'lastname': req.user._json.last_name,
                'firstname': req.user._json.first_name,
            });
            // console.log(user);
            
            var doc1 = await user.save();
            console.log(doc1);
            const token = await doc1.generateAuthToken();
            // var decoded = jwt_decode(token);
            
            var body1 = {
                userid: doc1._id,
                email: doc1.email,
                token: token,
                // tokenexp: decoded.exp
            }
            // console.log(body1);
            res.status(200).send(body1);
        }
        else{
            console.log(doc);
            const token = await doc.generateAuthToken();
            // var decoded = jwt_decode(token);
            
            var body1 = {
                userid: doc._id,
                email: doc.email,
                token: token,
                // tokenexp: decoded.exp
            }
            // console.log(body1);
            res.status(200).send(body1);
            // generate token...
            // res.send the token to the user for their local storage
            // if you get the token on a request, match the token
            // if it matches, then the user is already login
        }
    }
);

router.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
    ]})
);

router.get(
    '/auth/google/callback',
    passport.authenticate("google", 
    { failureRedirect: '/user/fail' }),
    async function(req, res) {
        console.log(req.user._json.email);
        if(req.user._json.email_verified){
            const doc = await User.findByEmail(req.user._json.email);
            // console.log(doc);
            if (doc == null){
                var user = new User({
                    'email': req.user._json.email,
                    'firstname': req.user._json.given_name,
                    'lastname':req.user._json.family_name
                });
                // console.log(user);
                
                var doc1 = await user.save();
                console.log(doc1);
                const token = await doc1.generateAuthToken();
                // var decoded = jwt_decode(token);
                
                var body1 = {
                    userid: doc1._id,
                    email: doc1.email,
                    token: token,
                    // tokenexp: decoded.exp
                }
                // console.log(body1);
                res.status(200).send(body1);
            }
            else{
                console.log(doc);
                const token = await doc.generateAuthToken();
                
                var body1 = {
                    userid: doc._id,
                    email: doc.email,
                    token: token,
                    // tokenexp: decoded.exp
                }
                res.status(200).send(body1);
            }
        }
        else{
            res.status(401).send({
                'errmsg': "Email is not verified on google..."
            });
        }
    }
);

router.get("/fail", (req, res) => {
  res.send("Failed attempt");
});

module.exports = router;