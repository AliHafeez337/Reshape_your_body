var express = require('express');
var router = express.Router();
const passport = require('passport');
const _ = require('lodash');
const cryptoRandomString = require('crypto-random-string');
var nodemailer = require('nodemailer');
 
var {User} = require('../models/user');
var {authenticate} = require('../middleware/authenticate');
const {
    email, 
    password
  } = require('../config/config');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: email,
           pass: password
       }
});

router.post('/login', 
    passport.authenticate('local', 
    { failureRedirect: '/user/fail' }),
    async function(req, res) {
        // console.log(req.user)
        if (req.user.verification == ""){
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
        else{
            res.status(401).send({
                errmsg: "You have to confirm your email address first."
            })
        }
    }
);

router.post('/register', async (req, res) => {
    // 2 ways to generate confirmation link
    // generate a token with email, secret and expire time...
    // or
    // generate a random string of some length
    // I think it is more good because you can generate again
    // while in case of token, it will remain the same if not for the expire time

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
        const doc1 = await User.findByEmail(body.email);
        console.log(doc1);
        if (doc1 != null && doc1.verification != ""){
            // resend him the confirmation email...
            var randomstring = cryptoRandomString({length: 1000, type: 'url-safe'});
            
            var body = {
                'verification': randomstring
            }
            var doc2 = await User.findOneAndUpdate({
                _id: doc1.id
              }, 
              body, 
              {new: true});
            console.log(doc2);

            var mailBody = `
            <div style="
                background-color:#fafafa;
                padding-left: 20px;"><br />
                <h1>Hi, ${doc1.firstname}&nbsp;${doc1.lastname}</h1>
                <h3>You are one step away from joining our community.</h3>
                <h5>Please confirm your email by clicking the button below</h5>
                <a 
                    href="http://localhost:3000/user/${randomstring}/email/${doc1.email}"
                    style="color: white;
                    text-decoration: none;">
                    <button style="
                    background-color:#4CAF50;
                    border: none;
                    color: white;
                    padding: 16px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    transition-duration: 0.4s;
                    cursor: pointer;
                    border-radius: 10px;"
                >Welcome...
                </button></a><br />
                <h5>Or request a new email by clicking the button below.</h5>
                <a 
                    href="http://localhost:3000/user/email/${doc1.email}"
                    style="color: white;
                    text-decoration: none;">
                    <button style="
                    padding: 16px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    transition-duration: 0.4s;
                    cursor: pointer;
                    background-color: white;
                    color: black;
                    border: 2px solid #e7e7e7;
                    border-radius: 10px;"
                >Request a new code
                </button></a><br /><br />
            </div>
            `;

            const mailOptions = {
                from: '"CodeCrafterz 👻" <codecrafterz@gmail.com>', // sender address
                to: doc1.email, // list of receivers
                subject: 'Confirm Your Email', // Subject line
                html: mailBody
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(info);
            });

            res.status(200).send({
                errmsg: "You were alread registered but we have created a new confirmation email for you... but  for security reasons, we can not update the information you provided now for the registration... Please check your mail inbox."
            });
        }
        else if (doc1 != null && doc1.verification == ""){
            res.status(401).send({
                errmsg: "Your are already registered..."
            })
        }
        else{
            var randomstring = cryptoRandomString({length: 1000, type: 'url-safe'});
            body.verification = randomstring;
            var user = new User(body);
            // console.log(user);

            var mailBody = `
            <div style="
                background-color:#fafafa;
                padding-left: 20px;"><br />
                <h1>Hi, ${user.firstname}&nbsp;${user.lastname}</h1>
                <h3>You are one step away from joining our community.</h3>
                <h5>Please confirm your email by clicking the button below</h5>
                <a 
                    href="http://localhost:3000/user/${randomstring}/email/${user.email}"
                    style="color: white;
                    text-decoration: none;">
                    <button style="
                    background-color:#4CAF50;
                    border: none;
                    color: white;
                    padding: 16px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    transition-duration: 0.4s;
                    cursor: pointer;
                    border-radius: 10px;"
                >Welcome...
                </button></a><br />
                <h5>Or request a new email by clicking the button below.</h5>
                <a 
                    href="http://localhost:3000/user/email/${user.email}"
                    style="color: white;
                    text-decoration: none;">
                    <button style="
                    padding: 16px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    transition-duration: 0.4s;
                    cursor: pointer;
                    background-color: white;
                    color: black;
                    border: 2px solid #e7e7e7;
                    border-radius: 10px;"
                >Request a new code
                </button></a><br /><br />
            </div>
            `;

            var doc2 = await user.save();
            // console.log(doc2);
            const mailOptions = {
                from: '"CodeCrafterz 👻" <codecrafterz@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'Confirm Your Email', // Subject line
                html: mailBody
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(info);
            });
            doc2.msg = "Please, also confirm your email."
            res.status(200).send(doc2);
        }
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
    { failureRedirect: '/user/fail' }),
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
                'verification': ''
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
                    'lastname':req.user._json.family_name,
                    'verification': ''
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
  res.send("Failed login attempt...!");
});

router.get('/email/:em', async (req, res) => {
    var email = req.params.em;
    const doc = await User.findByEmail(email);
    console.log(doc);
    if(doc != null){
        if(doc.verification != ""){
            var randomstring = cryptoRandomString({length: 1000, type: 'url-safe'});
            
            var body = {
                'verification': randomstring
            }
            var doc1 = await User.findOneAndUpdate({
                _id: doc.id
              }, 
              body, 
              {new: true});
            console.log(doc1);

            var mailBody = `
            <div style="
                background-color:#fafafa;
                padding-left: 20px;"><br />
                <h1>Hi, ${doc.firstname}&nbsp;${doc.lastname}</h1>
                <h3>You are one step away from joining our community.</h3>
                <h5>Please confirm your email by clicking the button below</h5>
                <a 
                    href="http://localhost:3000/user/${randomstring}/email/${doc.email}"
                    style="color: white;
                    text-decoration: none;">
                    <button style="
                    background-color:#4CAF50;
                    border: none;
                    color: white;
                    padding: 16px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    transition-duration: 0.4s;
                    cursor: pointer;
                    border-radius: 10px;"
                >Welcome...
                </button></a><br />
                <h5>Or request a new email by clicking the button below.</h5>
                <a 
                    href="http://localhost:3000/user/email/${doc.email}"
                    style="color: white;
                    text-decoration: none;">
                    <button style="
                    padding: 16px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    transition-duration: 0.4s;
                    cursor: pointer;
                    background-color: white;
                    color: black;
                    border: 2px solid #e7e7e7;
                    border-radius: 10px;"
                >Request a new code
                </button></a><br /><br />
            </div>
            `;

            const mailOptions = {
                from: '"CodeCrafterz 👻" <codecrafterz@gmail.com>', // sender address
                to: doc.email, // list of receivers
                subject: 'Confirm Your Email', // Subject line
                html: mailBody
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(info);
            });

            res.status(200).send({
                errmsg: "Please check your mail inbox."
            });
        }
        else{
            res.status(401).send({
                errmsg: "You are already verifies..."
            });
        }
    }
    else{
        res.status(401).send({
            errmsg: "Unauthorized access."
        });
    }
});

router.get('/:reg/email/:em', async (req, res) => {
    var str = req.params.reg;
    var email = req.params.em;
    const doc = await User.findByEmail(email);
    if(doc != null){
        if (doc.verification == ""){
            res.status(401).send({
                errmsg: "You have already varified."
            });
        }
        else if(doc.verification == str){
            var body = {
                'verification': ''
            }
            var doc1 = await User.findOneAndUpdate({
                _id: doc.id
              }, 
              body, 
              {new: true});
            // console.log(doc1);
            if (doc1.verification == ""){
                res.status(200).send(doc1);
            }
            else{
                res.status(401).send({
                    errmsg: "Couldn't update... don't know why..."
                });
            }
        }
        else{
            res.status(401).send({
                errmsg: "Code is not correct, you may be using older code. please view the latest email or request a new code from any verification email."
            });
        }
    }
    else{
        res.status(401).send({
            errmsg: "Unauthorized access."
        });
    }
});

module.exports = router;