// Package imports...
var express = require("express");
var router = express.Router();
const passport = require("passport");
const _ = require("lodash");
const cryptoRandomString = require("crypto-random-string");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcryptjs");
const multer = require("multer");

// Local imports...
var { User } = require("../models/user");
var { Faq } = require("../models/faq");
var { Key } = require("../models/key");
var { Requests } = require("../models/requests");

var { authenticate, adminauthenticate } = require("../middleware/authenticate");
const { email, password, forgetSecret, address } = require("../config/config");

// Email sending setup
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: password,
  },
});

// Storage configuration...
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, Date.now() + "_" + file.originalname);
  },
});

// File filter for photos...
const fileFilter = (req, file, cb) => {
  console.log(file);
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter,
});

// Admin's home page
// router.get('/home', adminauthenticate, async (req, res) => {
router.get('/home', async (req, res) => {
    var d = new Date();
     
    var date = d.getDate();
    var month = d.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
    var year = d.getFullYear();
    var dateStr = date + "/" + month + "/" + year;
    console.log(dateStr)
    
    // var inYear = await User.find(
    //     {"createdAt": {"$gte": new Date(year-1, month, date), 
    //                     "$lt": new Date(year, month, date)}})

    var userArray = [], customerArray  = [], partnerArray = []
    var y = year
    var m, nexty, nextm
    const change  = 12 - month
    const m1 = change
    for (let i = 0; i < 13; i++){ // getting last 12 to 13 months data
        if (i <= change){
            y = year - 1
            m = 12 - change + i
        }
        else {
            y = year
            m = i - m1
        }
        if (m + 1 > 12){
            nexty = y + 1
            nextm = 1
        }
        else{
            nexty = y
            nextm = m + 1
        }
        var pm1 = m
        var pm2 = m
        var pm3 = m
        // console.log(i)
        // console.log(y + " / " + pm1-- + " / " + 2)
        // console.log(nexty + " / " + nextm + " / " + 1)
        var usersInMonth = await User.countDocuments(
            {"createdAt": {"$gte": new Date(y, pm2--, 2), 
                            "$lt": new Date(nexty, nextm, 1)}
                ,'usertype': 'user'
            })
        var customersInMonth = await User.countDocuments(
            {"createdAt": {"$gte": new Date(y, pm1--, 2), 
                            "$lt": new Date(nexty, nextm, 1)}
                ,'usertype': 'customer'
            })
        var partnersInMonth = await User.countDocuments(
            {"createdAt": {"$gte": new Date(y, pm3--, 2), 
                            "$lt": new Date(nexty, nextm, 1)}
                ,'usertype': 'partner'
            })
        userArray.push(usersInMonth) 
        customerArray.push(customersInMonth) 
        partnerArray.push(partnersInMonth) 
    }
    console.log(userArray)
    console.log(customerArray)
    console.log(partnerArray)
    var countUsers = await User.countDocuments({'usertype': 'user'})
    var countCustomers = await User.countDocuments({'usertype': 'customer'})
    var countPartners = await User.countDocuments({'usertype': 'partner'})
    console.log(countUsers)
    console.log(countCustomers)
    console.log(countPartners)
    res.status(200).send({
        msg: 'good'
    });
})

// Login with local strategy...
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/user/fail" }),
  async function (req, res) {
    console.log("user is here...");
    // console.log(req.user)
    if (req.user.verification == "") {
      const token = await req.user.generateAuthToken();
      // var decoded = jwt_decode(token);

      var body1 = {
        _id: req.user._id,
        email: req.user.email,
        photo: req.user.photo,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        token: token,
        usertype: req.user.usertype,
        // tokenexp: decoded.exp
      };
      console.log(body1.photo);

      if (body1.photo !== undefined && body1.photo !== null) {
        if (body1.photo.slice(0, 4) !== "http") {
          body1.photo = address + body1.photo;
        }
      } else {
        delete body1.photo;
      }
      // console.log(body1);
      res.send(body1);
    } else {
      res.status(401).send({
        errmsg: "You have to confirm your email address first.",
      });
    }
  }
);

// Just register myself... everyone registers himslef...
router.post("/register", upload.single("photo"), async (req, res) => {
  // 2 ways to generate confirmation link
  // generate a token with email, secret and expire time...
  // or
  // generate a random string of some length
  // I think it is more good because you can generate again
  // while in case of token, it will remain the same if not for the expire time

  // console.log(req.file);
  console.log("reached");

  try {
    var body = _.pick(req.body, [
      "email",
      "firstname",
      "lastname",
      "birthdate",
      "phone",
      "languages",
      "address1",
      "address2",
      "city",
      "postal",
      "country",
      "password",
    ]);
    // if (body.languages.length > 0){

    // }
    console.log(req.file);
    if (req.file != null) {
      body.photo = req.file.path.slice(8);
    }

    const doc1 = await User.findByEmail(body.email);
    console.log(doc1);
    if (doc1 != null && doc1.verification != "") {
      // this means that he forgot that he already registered some time ago but didn't confirmed email
      // resend him the confirmation email again...

      var randomstring = cryptoRandomString({ length: 1000, type: "url-safe" });

      var body = {
        verification: randomstring,
      };
      var doc2 = await User.findOneAndUpdate(
        {
          _id: doc1.id,
        },
        body,
        { new: true }
      );
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
        subject: "Confirm Your Email", // Subject line
        html: mailBody,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });

      res.status(200).send({
        errmsg:
          "You were alread registered but we have created a new confirmation email for you... but  for security reasons, we can not update the information you provided now for the registration... Please check your mail inbox.",
      });
    } else if (doc1 != null && doc1.verification == "") {
      res.status(401).send({
        errmsg: "Your are already registered...",
      });
    } else {
      // a new commer...

      var randomstring = cryptoRandomString({ length: 1000, type: "url-safe" });
      body.verification = randomstring;
      var user = new User(body);
      console.log(user);

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
      console.log(doc2);
      const mailOptions = {
        from: '"CodeCrafterz 👻" <codecrafterz@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: "Confirm Your Email", // Subject line
        html: mailBody,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });
      // res.status(200).send(doc2);
      res.status(200).send({
        msg:
          "You just need to confirm your email address and then you are good to go...",
      });
    }
  } catch (e) {
    if ("errmsg" in e) {
      res.status(400).send(e.errmsg);
    }
    res.status(400).send(e);
  }
});

// Just logout
router.post("/logout", authenticate, async (req, res) => {
  try {
    //   const user = await User.findByToken(req.token);
    var doc = await req.person.removeToken(req.token);
    if (doc != null) {
      res.status(200).send({
        message: "You loged out successfully.",
      });
    } else {
      res.status(401).send({
        errmsg: "Unable to log you out.",
      });
    }
  } catch (e) {
    res.status(400).send({
      errmsg: "Something went wrong in the whole process...",
    });
  }
});

// Who Am I?
router.get("/me", authenticate, async (req, res) => {
  // console.log(req.person)
  res.status(200).send(req.person);
});

// Admin can view all users list...
router.get("/all", adminauthenticate, async (req, res) => {
  var doc = await User.find();
  res.status(200).send(doc);
});

// Delete a user...
// All can delete themseleves only while admin can delete anyone...
router.delete("/delete", authenticate, async (req, res) => {
  //   console.log(req.person);
  try {
    console.log(req.person);
    console.log(req.body);
    if (req.person.usertype == "admin") {
      var body = _.pick(req.body, ["id", "password"]);
      if (body.id != null && req.person._id != body.id) {
        try {
          Faq.deleteMany({ askedBy: body.id });
        } catch (e) {}
        try {
          Key.deleteMany({ owner: body.id });
        } catch (e) {}
        try {
          Requests.deleteMany({ madeBy: body.id });
        } catch (e) {}
        try {
          var doc = await User.findByIdAndDelete(body.id);
          // console.log(doc);
          res.send(doc);
        } catch (e) {
          res.status(400).send({
            errmsg: "Unable to delete this user...",
          });
        }
      } else {
        //admin is deleting himself
        try {
          const user = await User.findByCredentials(
            req.person.email,
            body.password
          );
          // console.log('findByCredentials')
          // console.log(user)

          if (user != null) {
            try {
              Faq.deleteMany({ askedBy: req.person._id });
            } catch (e) {}
            try {
              Key.deleteMany({ owner: req.person._id });
            } catch (e) {}
            try {
              Requests.deleteMany({ madeBy: req.person._id });
            } catch (e) {}
            try {
              var doc = await User.findByIdAndDelete(req.person._id);
              // console.log(doc);
              res.send(doc);
            } catch (e) {
              res.status(400).send({
                errmsg: "Unable to delete this user...",
              });
            }
          } else {
            res.status(401).send({
              errmsg: "Sorry, incorrect password...",
            });
          }
        } catch (e) {
          res.status(400).send({
            errmsg: "Something went wrong...",
          });
        }
      }
    } else {
      // user is deleting himself
      var body = _.pick(req.body, ["password"]);
      console.log(body.password);
      try {
        const user = await User.findByCredentials(
          req.person.email,
          body.password
        );
        console.log("findByCredentials");
        console.log(user);

        if (user != null) {
          try {
            Faq.deleteMany({ askedBy: req.person._id });
          } catch (e) {}
          try {
            Key.deleteMany({ owner: req.person._id });
          } catch (e) {}
          try {
            Requests.deleteMany({ madeBy: req.person._id });
          } catch (e) {}
          try {
            var doc = await User.findByIdAndDelete(req.person._id);
            // console.log(doc);
            res.send(doc);
          } catch (e) {
            res.status(400).send({
              errmsg: "Unable to delete this user...",
            });
          }
        }
      } catch (e) {
        res.status(400).send({
          errmsg: "Something went wrong...",
        });
      }
    }
  } catch (e) {
    res.status(400).send({
      errmsg: "Something went wrong in the whole process...",
    });
  }
});

// First call of "Forget Password"... will send a code to the email...
router.post("/forget", async (req, res) => {
  var body = _.pick(req.body, ["email"]);
  var code = cryptoRandomString({ length: 6, type: "numeric" });
  var token = jwt.sign(
    {
      data: code,
    },
    forgetSecret,
    { expiresIn: 600 }
  );

  try {
    var doc = await User.findOneAndUpdate(
      { email: body.email },
      { forgetToken: token },
      { new: true }
    );
    console.log(doc);

    if (doc != null) {
      var mailBody = `
            <div style="
                background-color:#fafafa;
                padding-left: 20px;"><br />
                <h1>Hi, ${doc.firstname}&nbsp;${doc.lastname}</h1>
                <h3>Please, don't share this code with anyone.</h3>
                <h5>Below is the code you'll need for the password reset.</h5>
                <h3>${code}</h3>
                <h5>This code will expire in 10 minutes.</h5><br />
            </div>
            `;

      const mailOptions = {
        from: '"CodeCrafterz 👻" <codecrafterz@gmail.com>', // sender address
        to: doc.email, // list of receivers
        subject: "Forget password code", // Subject line
        html: mailBody,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });
      // res.status(200).send(doc2);
      res.status(200).send({
        email: doc.email,
        msg:
          "You just need to confirm your email address and then you are good to go...",
      });
    } else {
      res.status(401).send({
        errmsg: "No user exists with this email address...",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("Encountered some error.");
  }
});

// A hash generator promise for password...
var genHash = async (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      bcrypt.genSalt(9, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          // console.log(hash);
          // console.log('hhashhhhhh');
          resolve(hash);
        });
      });
    } catch (e) {
      reject();
    }
  });
};

// Admin registers someone... can provide full detail if he likes... without password obviously...
router.post(
  "/adminregister",
  adminauthenticate,
  upload.single("photo"),
  async (req, res) => {
    console.log("admin registers");
    try {
        var body = _.pick(req.body, [
            'email',
            'usertype',
            'firstname',
            'lastname',
            'birthdate',
            'phone',
            'languages',
            'address1',
            'address2',
            'city',
            'postal',
            'country'
        ]);
        if (req.file != null){
            body.photo = req.file.path.slice(8);
        }

      const doc1 = await User.findByEmail(body.email);
      // console.log(doc1);
      if (doc1 != null && doc1.verification != "") {
        // this means that he forgot that he already registered some time ago but didn't confirmed email
        // resend him the confirmation email again...

        var password = cryptoRandomString({ length: 6, type: "base64" });
        var randomstring = cryptoRandomString({
          length: 1000,
          type: "url-safe",
        });

        var body1 = {
          verification: randomstring,
        };
        // body1.password = await genHash(password);
        genHash(password)
          .then(async (hash) => {
            body1.password = hash;

            var doc2 = await User.findOneAndUpdate(
              {
                _id: doc1.id,
              },
              body1,
              { new: true }
            );
            // console.log(doc2);

            var mailBody = `
                <div style="
                    background-color:#fafafa;
                    padding-left: 20px;"><br />
                    <h1>Hi, ${doc1.firstname}&nbsp;${doc1.lastname}</h1>
                    <h3>Your new password is: ${password}</h3>
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
                </div>
                `;

            const mailOptions = {
              from: '"CodeCrafterz 👻" <codecrafterz@gmail.com>', // sender address
              to: body.email, // list of receivers
              subject: "Invitation to join our community", // Subject line
              html: mailBody,
            };
            transporter.sendMail(mailOptions, function (err, info) {
              if (err) {
                console.log(err);
                res.status(400).send({
                  errmsg: "Couldn't send the invitation email...",
                });
              } else {
                console.log(info);
                res.status(200).send({
                  errmsg:
                    "This email was already registered by not verified but we have send the invitation again... but we can not modify the the user data without his/her consent.",
                });
              }
            });
          })
          .catch((e) => {
            console.log(e);
            res.status(400).send({
              errmsg: "Couldn't generate the hash.",
            });
          });
      } else if (doc1 != null && doc1.verification == "") {
        res.status(400).send({
          errmsg: "This email is already registered...",
        });
      } else {
        // a new commer...

        var password = cryptoRandomString({ length: 6, type: "base64" });
        var randomstring = cryptoRandomString({
          length: 1000,
          type: "url-safe",
        });

        body.verification = randomstring;
        body.password = password;

        var noway = new User(body);
        console.log(noway);

        var doc2 = await noway.save();
        console.log(doc2);

        var mailBody = `
            <div style="
                background-color:#fafafa;
                padding-left: 20px;"><br />
                <h1>Hi, ${body.firstname}&nbsp;${body.lastname}</h1>
                <h3>Your new password is: ${password}</h3>
                <h5>Please confirm your email by clicking the button below</h5>
                <a 
                    href="http://localhost:3000/user/${randomstring}/email/${body.email}"
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
          from: '"CodeCrafterz 👻" <codecrafterz@gmail.com>', // sender address
          to: noway.email, // list of receivers
          subject: "Confirm Your Email", // Subject line
          html: mailBody,
        };
        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            console.log(err);
            res.status(200).send({
              msg: "Unable to send email...",
            });
          } else {
            console.log(info);
            res.status(200).send({
              msg: "Done, the user just needs to confirm the email...",
            });
          }
        });
      }
    } catch (e) {
      res.status(400).send({
        errmsg: "Something went wrong in the whole process...",
      });
    }
  }
);

// Edit a user...
// Admin can edit someone witout password, All can edit themselves fully except their email...
router.patch(
  "/edit",
  authenticate,
  upload.single("photo"),
  async (req, res) => {
    try {
      console.log(req.body);
      console.log(req.person.usertype);
      if (req.person.usertype == "admin") {
        var body = _.pick(req.body, [
          "id", // of doc to be edited by admin
          "usertype",
          "firstname",
          "lastname",
          "birthdate",
          "phone",
          "languages",
          "address1",
          "address2",
          "city",
          "postal",
          "country",
        ]);

        if (req.file != null) {
          body.photo = req.file.path.slice(8);
        }
        // body.id = "5e8ac0e2aa1fe6c6b0463ede"
        // req.body.id = "5e8ac0e2aa1fe6c6b0463ede"
        // req.file = {
        //     "name": "famous1.jpg",
        //     "lastModified": 1574948526298,

        //     "webkitRelativePath": "",
        //     "size": 30948,
        //     "type": "image/jpeg"
        // }
        console.log(req.body.id);
        console.log("req.person._id");
        // console.log(req.file)
        if (body.id == req.person._id) {
          if (
            _.pick(req.body, ["oldpassword"]).oldpassword !== undefined &&
            _.pick(req.body, ["oldpassword"]).oldpassword !== null &&
            _.pick(req.body, ["oldpassword"]).oldpassword != "" &&
            _.pick(req.body, ["password"]).password !== undefined &&
            _.pick(req.body, ["password"]).password !== null &&
            _.pick(req.body, ["password"]).password != ""
          ) {
            body.oldpassword = _.pick(req.body, ["oldpassword"]).oldpassword;
            body.password = _.pick(req.body, ["password"]).password;

            if (body.password.length < 6) {
              res.status(400).send({
                errmsg: "Password length can not be less than 6.",
              });
            } else {
              try {
                const user = await User.findByCredentials(
                  req.person.email,
                  body.oldpassword
                );
                console.log("findByCredentials");
                console.log(user);

                if (user != null) {
                  genHash(body.password)
                    .then(async (hash) => {
                      body.password = hash;
                      // console.log(hash)
                      var doc = await User.findByIdAndUpdate(
                        { _id: body.id },
                        body,
                        { new: true }
                      );
                      console.log(doc);
                      if (doc == null) {
                        res.status(400).send({
                          errmsg: "Document to be updated not found.",
                        });
                      } else {
                        res.status(200).send(doc);
                      }
                    })
                    .catch((e) => {
                      res.status(400).send({
                        errmsg: "Sorry, couldn't generate hash...",
                      });
                    });
                } else {
                  res.status(400).send({
                    errmsg: "Sorry, your old password is incorrect...",
                  });
                }
              } catch (e) {
                res.status(400).send({
                  errmsg: "Sorry, unable to find user...",
                });
              }
            }
          } else {
            console.log("body");
            console.log(body);
            var doc = await User.findByIdAndUpdate({ _id: body.id }, body, {
              new: true,
            });
            console.log(doc);
            if (doc == null) {
              res.status(400).send({
                errmsg: "Document to be updated not found.",
              });
            } else {
              res.status(200).send(doc);
            }
          }
        } else {
          var doc = await User.findByIdAndUpdate({ _id: body.id }, body, {
            new: true,
          });
          console.log(doc);
          if (doc == null) {
            res.status(400).send({
              errmsg: "Document to be updated not found.",
            });
          } else {
            res.status(200).send(doc);
          }
        }
      } else {
        console.log("else");
        var body = _.pick(req.body, [
          "firstname",
          "lastname",
          "birthdate",
          "phone",
          "address1",
          "address2",
          "city",
          "postal",
          "country",
          "languages",
        ]);
        if (req.file != null) {
          body.photo = req.file.path.slice(8);
        }

        if (
          _.pick(req.body, ["oldpassword"]).oldpassword !== undefined &&
          _.pick(req.body, ["oldpassword"]).oldpassword !== null &&
          _.pick(req.body, ["oldpassword"]).oldpassword !== "" &&
          _.pick(req.body, ["password"]).password !== undefined &&
          _.pick(req.body, ["password"]).password !== null &&
          _.pick(req.body, ["password"]).password !== ""
        ) {
          body.oldpassword = _.pick(req.body, ["oldpassword"]).oldpassword;
          body.password = _.pick(req.body, ["password"]).password;

          if (body.password.length < 6) {
            res.status(400).send({
              errmsg: "Password length can not be less than 6.",
            });
          } else {
            try {
              const user = await User.findByCredentials(
                req.person.email,
                body.oldpassword
              );
              console.log("findByCredentials");
              console.log(user);
              if (user != null) {
                // body.password = await genHash(body.password);
                genHash(body.password)
                  .then(async (hash) => {
                    body.password = hash;

                    console.log("body");
                    console.log(body);
                    var doc = await User.findByIdAndUpdate(
                      { _id: req.person._id },
                      body,
                      { new: true }
                    );
                    console.log(doc);
                    if (doc == null) {
                      res.status(400).send({
                        errmsg: "Document to be updated not found.",
                      });
                    } else {
                      res.status(200).send(doc);
                    }
                  })
                  .catch((e) => {
                    res.status(400).send({
                      errmsg: "Sorry, couldn't generate hash...",
                    });
                  });
              } else {
                res.status(400).send({
                  errmsg: "Sorry, your old password is incorrect...",
                });
              }
            } catch (e) {
              res.status(400).send({
                errmsg: "Sorry, unable to find user...",
              });
            }
          }
        } else {
          var doc = await User.findByIdAndUpdate(
            { _id: req.person._id },
            body,
            { new: true }
          );
          console.log(doc);
          if (doc == null) {
            res.status(400).send({
              errmsg: "Document to be updated not found.",
            });
          } else {
            res.status(200).send(doc);
          }
        }
      }
    } catch (e) {
      res.status(400).send({
        errmsg: "Something went wrong in the whole process...",
      });
    }
  }
);

// Edit your email... will go a confirmation email from this route...
router.patch("/editEmail", authenticate, async (req, res) => {
  var body = _.pick(req.body, ["email"]);
  var randomstring = cryptoRandomString({ length: 1000, type: "url-safe" });

  var token = jwt.sign(
    {
      code: randomstring,
      email: body.email,
    },
    forgetSecret,
    { expiresIn: 600 }
  );

  try {
    var doc = await User.findOneAndUpdate(
      { _id: req.person._id },
      { emailToBe: token },
      { new: true }
    );
    // console.log(doc);
    console.log(
      `http://localhost:3000/user/change/${randomstring}/email/${req.person.email}/toBe/${body.email}`
    );
    if (doc != null) {
      var mailBody = `
            <div style="
                background-color:#fafafa;
                padding-left: 20px;"><br />
                <h1>Hi, ${req.person.firstname}&nbsp;${req.person.lastname}</h1>
                <h3>You are one step away from updatting your email address.</h3>
                <h5>Please confirm your email by clicking the button below</h5>
                <a 
                    href="http://localhost:3000/user/change/${randomstring}/email/${req.person.email}/toBe/${body.email}"
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
                <h3>This button is valid for next 10 minutes.</h3>
                <h3>If you don't know about this, then you can ignore it.</h3><br />
            </div>
            `;

      const mailOptions = {
        from: '"CodeCrafterz 👻" <codecrafterz@gmail.com>', // sender address
        to: body.email, // list of receivers
        subject: "Confirm Your New Email", // Subject line
        html: mailBody,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
          res.status(401).send({
            errmsg: "Unable to send the confirmation email.",
          });
        } else {
          console.log(info);
          res.status(200).send({
            msg:
              "You can confirm the new email by view the new email and click the 'Welcome...' button. Note: The email will be valid for 10 minutes.",
          });
        }
      });
    } else {
      res.status(401).send({
        errmsg: "Unable to update user, maybe the user doesn't exist.",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(401).send({
      errmsg: "Something went wrong in whole process.",
    });
  }
});

// Like a callback from forget password...
router.patch("/reset", async (req, res) => {
  var body = _.pick(req.body, ["code", "email", "password"]);
  try {
    const doc = await User.findByEmail(body.email);
    // console.log(doc);
    if (doc != null) {
      if (doc.forgetToken != "") {
        var decoded = jwt_decode(doc.forgetToken);
        // console.log('see here...');
        var a = decoded.exp.toString();
        var b = (0).toString();
        // console.log(a);
        // console.log(b);
        // console.log(a+b+b+b);
        // console.log(Date.now());
        if (Date.now() < a + b + b + b) {
          if (body.code == decoded.data) {
            genHash(body.password)
              .then(async (hash) => {
                console.log(hash);
                body.password = hash;
                console.log(body);
                var doc1 = await User.findByIdAndUpdate(
                  { _id: doc._id },
                  {
                    password: body.password,
                    forgetToken: "",
                    verification: "",
                  },
                  { new: true }
                );
                console.log(doc1);
                if (doc != null) {
                  res.status(200).send({
                    msg: "Password updated successfully... enjoy!",
                  });
                } else {
                  res.status(400).send({
                    errmsg: "Document to be updated, not found.",
                  });
                }
              })
              .catch((e) => {
                console.log(e);
                res.status(400).send({
                  errmsg: "Couldn't generate the hash.",
                });
              });
          } else {
            res
              .status(401)
              .send("Sorry, the code you entered is not correct...");
          }
        } else {
          res
            .status(401)
            .send(
              "Sorry, you are late... Try again please by clicking forget password again..."
            );
        }
      } else {
        res
          .status(401)
          .send(
            "You may have already reset your password, please click forget password again."
          );
      }
    } else {
      res.status(401).send("No user exists with this email.");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("Encountered some error.");
  }
});

// const onChange = require('on-change');
// global.object = [{}];
// global.obj1
// obj1 = {
//     i: 0
// }

// global.watchedObject = onChange(object, function (path, value, previousValue) {
//     console.log('Object changed:', obj1.i = obj1.i + 1);
//     console.log('this:', this);
//     console.log('path:', path);
//     console.log('value:', value);
//     console.log('previousValue:', previousValue);
// });

// setInterval(() => {
//     console.log(object)
// }, 5000)

// var ch = async (password) => {
//     return new Promise(async (resolve, reject) => {
//         onChange(obj1, function (path, value, previousValue) {
//             console.log('this:', this);
//             console.log('path:', path);
//             console.log('value:', value);
//             console.log('previousValue:', previousValue);
//             resolve()
//         });
//     })
// }

// router.get("/responseFb/:code", async (req, res) => {
//     setInterval(() => {
//     }, 2000)

// });

// router.get("/callFb/:code", async (req, res) => {
//     const code = req.params.code;
//     object.code = {
//         exp: new Date.now() + 600000
//     }
//     res.redirect('/auth/facebook');
// });

// router.get("/responseGoogle/:code", async (req, res) => {

// });

// router.get("/callGoogle", async (req, res) => {

// });


// router.get("/test", async (req, res) => {
//     obj1.i = 5
//     console.log(obj1)
//     ch().then(() => {
//         console.log("WOW IT WORKED")
//         res.status(200).send(object.str)
//     })
// });

middle = (req, res, next) => {
    console.log('printing')
    // console.log(res)
    next()
}
// Call to facebook...
router.get("/auth/facebook", 
    middle,
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

// Return from facebook...
router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", 
    { failureRedirect: '/user/fail' }),
    async function(req, res) {
        // const doc = await User.findOne({'email':req.user._json.email});
        const doc = await User.findByEmail(req.user._json.email);
        // console.log(doc);
        // console.log('profile is here.');
        // console.log(req.user._json);
        if (doc == null){
            // console.log('picture is here.');
            // console.log(req.user._json.picture);
            var user = new User({
                'email': req.user._json.email,
                'lastname': req.user._json.last_name,
                'firstname': req.user._json.first_name,
                'verification': '',
                // 'photo': `http://graph.facebook.com/${req.user._json.id}/picture?type=large&redirect=true&width=500&height=500`
                'photo': req.user._json.picture.url
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
                // global: globalString
                // tokenexp: decoded.exp
            }
            console.log(body1);


            res.status(200).send(body1);
        }
        else{
            console.log(doc);
            const token = await doc.generateAuthToken();
            // var decoded = jwt_decode(token);
            // watchedObject.str = "This can be accessed anywhere!"
            // console.log(obj1)

            var body1 = {
                userid: doc._id,
                email: doc.email,
                token: token,
                // global: object.str
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

// Call to google...
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

// Return from google...
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/fail" }),
  async function (req, res) {
    // console.log('profile is here.');
    // console.log(req.user._json);
    // console.log(req.user._json.email);
    if (req.user._json.email_verified) {
      const doc = await User.findByEmail(req.user._json.email);
      // console.log(doc);
      if (doc == null) {
        var user = new User({
          email: req.user._json.email,
          firstname: req.user._json.given_name,
          lastname: req.user._json.family_name,
          verification: "",
          photo: req.user._json.picture,
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
        };
        // console.log(body1);
        res.status(200).send(body1);
      } else {
        console.log(doc);
        const token = await doc.generateAuthToken();

        var body1 = {
          userid: doc._id,
          email: doc.email,
          token: token,
          // tokenexp: decoded.exp
        };
        res.status(200).send(body1);
      }
    } else {
      res.status(401).send({
        errmsg: "Email is not verified on google...",
      });
    }
  }
);

// Just a fail message...
router.get("/fail", (req, res) => {
  res.status(401).send({
    errmsg: "Failed login attempt...!",
  });
});

// Requesting a new code...
router.get("/email/:em", async (req, res) => {
  var email = req.params.em;
  const doc = await User.findByEmail(email);
  console.log(doc);
  if (doc != null) {
    if (doc.verification != "") {
      var randomstring = cryptoRandomString({ length: 1000, type: "url-safe" });

      var body = {
        verification: randomstring,
      };
      var doc1 = await User.findOneAndUpdate(
        {
          _id: doc.id,
        },
        body,
        { new: true }
      );
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
        subject: "Confirm Your Email", // Subject line
        html: mailBody,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });

      res.status(200).send({
        errmsg: "Please check your mail inbox.",
      });
    } else {
      res.status(401).send({
        errmsg: "You are already verifies...",
      });
    }
  } else {
    res.status(401).send({
      errmsg: "Unauthorized access.",
    });
  }
});

// change the email...
router.get("/change/:str/email/:email/toBe/:toBe", async (req, res) => {
  var str = req.params.str;
  var email = req.params.email;
  var toBe = req.params.toBe;
  try {
    const doc = await User.findByEmail(email);
    if (doc != null) {
      var decoded = jwt_decode(doc.emailToBe);
      // console.log('see here...');
      var a = decoded.exp.toString();
      var b = (0).toString();
      // console.log(a);
      // console.log(b);
      // console.log(a+b+b+b);
      // console.log(Date.now());
      console.log(decoded);
      if (Date.now() < a + b + b + b) {
        if (decoded.code == str) {
          var doc1 = await User.findOneAndUpdate(
            {
              _id: doc.id,
            },
            {
              email: decoded.email,
              emailToBe: "",
            },
            { new: true }
          );
          // console.log(doc1);
          if (doc1 != null) {
            res.status(200).send({
              msg: "Email changed successfully",
              "New Email": doc1.email,
            });
          } else {
            res.status(401).send({
              errmsg: "Unable to update email address...",
            });
          }
        } else {
          res.status(401).send({
            errmsg: "You provided the wrong code...",
          });
        }
      } else {
        res.status(401).send({
          errmsg: "Time out! You are late...",
        });
      }
    } else {
      res.status(401).send({
        errmsg: "No user exists with this email.",
      });
    }
  } catch (e) {
    res.status(401).send({
      errmsg: "Something went wrong.",
    });
  }
});

//confirm the registration for new commer...
router.get("/:reg/email/:em", async (req, res) => {
  var str = req.params.reg;
  var email = req.params.em;
  const doc = await User.findByEmail(email);
  if (doc != null) {
    if (doc.verification == "") {
      res.status(401).send({
        errmsg: "You have already varified.",
      });
    } else if (doc.verification == str) {
      var body = {
        verification: "",
      };
      var doc1 = await User.findOneAndUpdate(
        {
          _id: doc.id,
        },
        body,
        { new: true }
      );
      // console.log(doc1);
      if (doc1.verification == "") {
        res.status(200).send({
          msg: "Email verified, now go to login page...",
        });
      } else {
        res.status(401).send({
          errmsg: "Couldn't update... don't know why...",
        });
      }
    } else {
      res.status(401).send({
        errmsg:
          "Code is not correct, you may be using older code. please view the latest email or request a new code from any verification email.",
      });
    }
  } else {
    res.status(401).send({
      errmsg: "Unauthorized access.",
    });
  }
});

module.exports = router;
