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
      const user = await User.findByToken(req.token);
      var doc = await user.removeToken(req.token);
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

module.exports = router;