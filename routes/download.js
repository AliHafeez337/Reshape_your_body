const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');


var {
    Upload
} = require('../models/upload');


router.get('/', (req, res) => {


    var cat = req.query.category;
    console.log(cat)
    Upload.find({
        category: cat
    }).then((dt) => {
        if (!dt) {
            return res.status(404).send();
        }
        console.log(dt);

        res.status(200).send(dt);


        // var file = dt.file;

        // var result = file.find(obj => {
        //     return obj.language === "Arabic"
        // });
        // console.log("result is" + result.file);


    }).catch((e) => {
        res.status(404).send();
    })

});
module.exports = router;