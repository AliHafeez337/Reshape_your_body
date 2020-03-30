var express = require('express');
var router = express.Router();
const passport = require('passport');
const _ = require('lodash');

var {User} = require('../models/user');
var {Requests} = require('../models/requests');
var {usercustomerauthenticate,adminauthenticate,authenticate} = require('../middleware/authenticate');


router.post('/newRequest',usercustomerauthenticate ,async (req, res) =>
      {
          console.log('user type'+req.person)
        var body = {
            madeBy:req.person._id,
            status:"pending"

            }
        var newrequest = new Requests(body);
    try 
    {
        var doc1=await newrequest.save();
        res.status(200).send(doc1);
          // res.send("ok")
        // var body1={
        //     madeBy:doc1.madeBy,
        //     status:doc1.status,
        //     createdAt:doc1.createdAt,

        //  }
    } 

    catch {
        res.status(400).send({
            errmsg: "Unable to send request"
        });
    }
});
router.get('/AllRequests',adminauthenticate, async (req, res) =>
        {
            try {
                var all_requests = await Requests.find({});
                res.status(200).send(all_requests);
            } catch (e) {
                res.status(400).send({
                    errmsg: "Unable to find any requests"
                });
            }

        });
router.put('/updateRequestStatus', adminauthenticate,async (req, res) =>
{
    try {
        var update_status = await Requests.findByIdAndUpdate(
            req.query.keyId, {
                status: req.body.status
            }, {
                new: true
            }
        );
        res.status(200).send(update_status);
    } catch {
        res.status(400).send({
            errmsg: "Sorry,Could not update status"
        });
    }
});
router.get('/viewMyRequests', usercustomerauthenticate, async (req, res) =>
    {
       
        try {
            var my_requests = await Requests.find({madeBy:req.person._id});
            // console.log('usertype'+user_type)
            res.status(200).send(my_requests);
        }catch (e) {
            res.status(400).send({
                errmsg: "Sorry, no user exists"
            });
        }

    });
router.delete('/delete',adminauthenticate ,async (req, res) =>
{
    try {
        var delet_user = await Requests.findByIdAndDelete(
            req.query.keyId
        );
        res.status(200).send(delet_user);
    } catch (e) {
        console.log(e)
        res.status(400).send({
            errmsg: "could not delet user"
        });
    }

});
router.delete('/deleteMyRequest',authenticate ,async (req, res) =>
{
    try {
        var delet_user = await Requests.deleteOne({
                                                    madeBy:req.person._id,
                                                    _id:req.query.keyId
                                                }
            
        );
        res.status(200).send(delet_user);
    } catch (e) {
        console.log(e)
        res.status(400).send({
            errmsg: "could not delet user"
        });
    }

});
module.exports = router;