var express = require("express");
var router = express.Router();
const passport = require("passport");
const _ = require("lodash");
var nodemailer = require("nodemailer");
const { email, password } = require("../config/config");
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: password
  }
});
var { User } = require("../models/user");
var { Requests } = require("../models/requests");
var {
  usercustomerauthenticate,
  adminauthenticate,
  authenticate
} = require("../middleware/authenticate");

router.post("/newRequest", usercustomerauthenticate, async (req, res) => {
  //   console.log('user type'+req._id)
  var body = {
    madeBy: req.person._id,
    status: "pending"
  };
  var newrequest = new Requests(body);
  console.log(body.madeBy);

  check_duplicate = await (await Requests.find({ madeBy: body.madeBy })).length;
  if (check_duplicate >= 1) {
    res.status(200).send({
      "errmsg": "You have already requested."
    });
  } else {
    try {
      var doc1 = await newrequest.save();
      var mailBody = `
                <div style="
                    background-color:#fafafa;
                    padding-left: 20px;"><br />
                    <h1>Hi, Admin</h1>
                    <h3>You got a new request.</h3>
                    <h5>Please click below to view the request</h5>
                    <a 
                        href="http://localhost:3000/request/${doc1._id}"
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
                    >View the request
                    </button></a><br />
                   
                </div>
                `;
      var findadmin = await User.find({ usertype: "admin" });
      to = "";
      for (let i = 0; i < findadmin.length; i++) {
        to += "," + findadmin[i].email;
        // console.log(to)
      }
      to = to.slice(1);

      const mailOptions = {
        from: '"CodeCrafterz 👻"<codecrafterz@gmail.com>', // sender address
        to: to, // list of receivers
        subject: "You've got a new request", // Subject line
        html: mailBody
      };
      transporter.sendMail(mailOptions, function(err, info) {
        if (err) console.log(err);
        else console.log(info);
      });
      res.status(200).send(doc1);
    } catch {
      res.status(400).send({
        errmsg: "Unable to send request"
      });
    }
  }
});
router.get("/AllRequests", adminauthenticate, async (req, res) => {
  try {
    var all_requests = await Requests.find({});
    res.status(200).send(all_requests);
  } catch (e) {
    res.status(400).send({
      errmsg: "Unable to find any requests"
    });
  }
});
//admin view users

router.put("/updateRequestStatus", adminauthenticate, async (req, res) => {
  try {
    var update_status = await Requests.findByIdAndUpdate(
      req.query.reqId,
      {
        status: req.body.status
      },
      {
        new: true
      }
    );
    var user = await User.findOne({ _id: update_status.madeBy });

    console.log(update_status);
    var mailBody = `
                <div style="
                    background-color:#fafafa;
                    padding-left: 20px;"><br />
                    <h1>Hi, ${user.firstname} </h1>
                    <h3>Your request's status is ${req.body.status}.</h3>
                    <h5>Please click below to view the request</h5>
                    <a 
                        href="http://localhost:3000/request/${update_status._id}"
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
                   
                </div>
                `;

    const mailOptions = {
      from: '"CodeCrafterz 👻"<codecrafterz@gmail.com>', // sender address
      to: user.email, // list of receivers
      subject: "Your request status is updated.", // Subject line
      html: mailBody
    };
    transporter.sendMail(mailOptions, function(err, info) {
      if (err) console.log(err);
      else console.log(info);
    });

    res.status(200).send(update_status);
  } catch {
    res.status(400).send({
      errmsg: "Sorry,Could not update status"
    });
  }
});

// router.get('/viewMyRequestStatus',usercustautheomerauthenticate, async (req, res) =>

// {
//     console.log("get id: "+req.person._id)

//     // var url=req.url
//     // console.log(url+'url')
//     try
//     {
//         var my_requests = await Requests.findById(req.query.reqId);
//         res.status(200).send(my_requests);
//     }
//     catch (e)
//     {
//         res.status(400).send
//         ({
//             errmsg: "Unable to find any requests"
//         });
//     }

// });

// router.get('/viewMyRequests', usercustomerauthenticate, async (req, res) =>
//     {

//         try {
//             var my_requests = await Requests.find({madeBy:req.person._id});
//             // console.log('usertype'+user_type)
//             res.status(200).send(my_requests);
//         }catch (e) {
//             res.status(400).send({
//                 errmsg: "Sorry, no user exists"
//             });
//         }
//     });

router.delete("/delete", adminauthenticate, async (req, res) => {
  try {
    var delet_user = await Requests.findByIdAndDelete(req.query.reqId);
    res.status(200).send(delet_user);
  } catch (e) {
    console.log(e);
    res.status(400).send({
      errmsg: "could not delet user"
    });
  }
});

router.delete("/deleteMyRequest",usercustomerauthenticate,async (req, res) =>
 {
    try {
      var delet_user = await Requests.deleteOne({
        madeBy: req.person._id,
        _id: req.query.reqId
      });
      res.status(200).send(delet_user);
    } catch (e) {
      console.log(e);
      res.status(400).send({
        errmsg: "could not delet user"
      });
    }
  }
);

router.get("/:id", authenticate, async (req, res) => {
  console.log("get id: " + req.params.id);

  // var url=req.url
  // console.log(url+'url')
  try {
    var my_requests = await Requests.findById(req.params.id);
    res.status(200).send(my_requests);
  } catch (e) {
    res.status(400).send({
      errmsg: "Unable to find any requests"
    });
  }
});

module.exports = router;
