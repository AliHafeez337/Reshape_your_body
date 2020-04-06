
var express = require('express');
var router = express.Router();
const _ = require('lodash');
const multer = require('multer');
const fs = require("fs");

var {User} = require('../models/user');
const upload = require("../multer/storage");

var {authenticate, adminauthenticate} = require('../middleware/authenticate');
const {
    email, 
    password,
    forgetSecret, 
    address
  } = require('../config/config');

  // Edit a user...
// Admin can edit someone witout password, All can edit themselves fully except their email...
router.patch('/add', authenticate, async (req, res) => {
    let id= req.query.id;
    console.log(id);
    console.log(req.person._id);
    if (id == req.person._id){
        try {
            upload(req, res, async function (err) {
                if(req.file == null || req.file == undefined || req.file == ""){
                    // res.json('No Image Set');
                    res.status(200).send({
                        errmsg: "Please, select an image of less than 5Mbs."
                    })
                }else{
                    if (err) {
                        console.log(err);
                    }else{
                        console.log(req.file);
                        var doc = await User.findByIdAndUpdate(
                            {_id:  id}, 
                            {photo: req.file.filename}, 
                            {new: true}
                            );
                        console.log(doc);
                        if (doc == null){
                            res.status(400).send({
                                errmsg: "Document to be updated not found."
                            })
                        }
                        else{
                            res.status(200).send(doc);
                        }    
                    }
                }
            });
        }
        catch(e){

        }
    }
    else {
        res.status(400).send({
            "errmsg": "Sorry, You can not upload image for someone..."
        })
    }
})

router.patch("/:id", authenticate, async (req,res)=>{
    let query= req.params.id;
    if (req.person.usertype === "admin" && query != req.person._id){ //admin is removing someone's picture
        
        var doc = await User.findByIdAndUpdate(
            {_id:  query}, 
            {photo: ''}
            );
        console.log(doc);
        let $filePath= "./uploads/" + doc.photo
        fs.unlinkSync($filePath, (err)=>{
            if(err){
                console.log("couldnt delete " + doc.photo + " image");
                res.status(400).send({
                    "errmsg": "Sorry, couldnt delete image..."
                })
            }              
        });
        res.status(200).send({
            "msg": "The image is deleted..."
        })
    }
    else{
        var doc = await User.findByIdAndUpdate(
            {_id:  req.person._id}, 
            {photo: ''}
            );
        // console.log(doc);
        let $filePath= "./uploads/" + doc.photo
        fs.unlinkSync($filePath, (err)=>{
            if(err){
                console.log("couldnt delete " + doc.photo + " image");
                res.status(400).send({
                    "errmsg": "Sorry, couldnt delete image..."
                })
            }              
        });
        res.status(200).send({
            "msg": "The image is deleted..."
        })
    }
});

module.exports = router;