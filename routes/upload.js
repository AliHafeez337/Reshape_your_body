const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const uploadImage = require("../helpers/helpers");

var { Upload } = require("../models/upload");

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
});

router.use(multerMid.single("file"));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post("/", async (req, res, next) => {
  try {
    var body = {
      category: req.body.category,
      name: req.body.name,
      description: req.body.description,
      userAllowed: req.body.userAllowed,
    };

    var uploadd = new Upload(body);
    await uploadd.save();

    res.send(uploadd);
  } catch (error) {
    next(error), console.log("i am in catch");
  }
});
router.put("/add", async (req, res, next) => {
  try {
    const myFile = req.file;
    console.log("image data is" + myFile);
    const imageUrl = await uploadImage(myFile);
    language = req.body.language;
    console.log("lan" + language);
    file = imageUrl;

    var up = await Upload.findByIdAndUpdate(
      req.query.prdid,
      {
        $push: {
          file: {
            file: file,
            language: language,
          },
        },
      },
      { new: true }
    );
    res.send(up);
  } catch (error) {
    next(error), res.send(error);
  }
});

//Edit Route
router.get("/edit", (req, res) => {
  var objid = req.query.objid;
  Upload.findById({
    _id: objid,
  })
    .then((dt) => {
      if (!dt) {
        return res.status(404).send();
      }
      res.status(200).send(dt);
    })
    .catch((e) => {
      res.status(404).send();
    });
});

//Update Route
router.put("/update", async (req, res, next) => {
  try {
    const myFile = req.file;
    var imageUrl = "";
    if (myFile) {
      imageUrl = await uploadImage(myFile);
    }

    language = req.body.language;
    file = imageUrl;

    category = req.body.category;
    name = req.body.name;
    description = req.body.description;
    userAllowedd = req.body.userAllowed;

    ua = userAllowedd.split(",");

    console.log("i am for " + ua[0]);
    var i;

    console.log("user alllowed  " + userAllowedd);

    if (language !== undefined && file !== "") {
      console.log("i am in first" + language + file);
      var up = await Upload.findByIdAndUpdate(
        req.query.prdid,

        {
          $push: {
            file: {
              file: file,
              language: language,
            },
          },

          $set: {
            category: category,
            name: name,
            description: description,
            userAllowed: ua,
          },
        },
        { new: true }
      );
      res.send(up);
    }
    if (language === undefined || file === "") {
      console.log("i am in second" + language);

      var up2 = await Upload.findByIdAndUpdate(
        req.query.prdid,

        {
          $set: {
            category: category,
            name: name,
            description: description,
            userAllowed: ua,
          },
        },
        { new: true }
      );
      res.send(up2);
    }
    console.log(up2);
    console.log(up);
  } catch (error) {
    next(error), res.send(error);
  }
});

module.exports = router;
