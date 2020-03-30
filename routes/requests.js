var express = require('express');
var router = express.Router();
const passport = require('passport');
const _ = require('lodash');

var {User} = require('../models/user');
var {Requests} = require('../models/requests');
var {usercustomerauthenticate} = require('../middleware/authenticate');

router.post('/newRequest',usercustomerauthenticate ,async (req, res) => {
    // console.log("id_ "+req.person._id)
    var body = {
        madeBy:req.person._id,
    }
    try {
        var newrequest = new Requests(body);
        var doc1=await newrequest.save();
        res.status(200).send(doc1);
    } 
    catch {
        res.status(400).send({
            errmsg: "Unable to save response"
        });
    }
});

router.get('/view/AllRequests', async (req, res) =>
        {
        
        });
router.put('/acceptRequest', async (req, res) =>
        {
        
        });
router.get('/viewMyRequests', usercustomerauthenticate, async (req, res) =>
        {
        
        });
router.delete('/delete', async (req, res) =>
        {
        
        });

module.exports = router;