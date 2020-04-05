var express = require('express');
var router = express.Router();
const passport = require('passport');
const _ = require('lodash');

var {
    User
} = require('../models/user');
var {
    Key
} = require('../models/key');
var {
    authenticate
} = require('../middleware/authenticate');
var {
    adminpartnerauthenticate
} = require('../middleware/authenticate');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProductKey() {
    var tokens = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        chars = 5,
        segments = 4,
        keyString = "";

    for (var i = 0; i < segments; i++) {
        var segment = "";

        for (var j = 0; j < chars; j++) {
            var k = getRandomInt(0, 35);
            segment += tokens[k];
        }

        keyString += segment;

        if (i < (segments - 1)) {
            keyString += "-";
        }
    }
    return keyString;
}

router.post('/generateKey', adminpartnerauthenticate, async function (req, res) {
    var keyGen = generateProductKey();
    var body = {
        key: keyGen,
    }
    var keyM = new Key(body);
    try {
        await keyM.save();
        res.send(keyM);
    } catch {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

router.put('/useKey', adminpartnerauthenticate, async function (req, res) {
    var body = {
        used: true,
        owner: req.person
    }
    try {
        var doc1 = await Key.findOneAndUpdate({
                key: req.body.key
            },
            body, {
                new: true
            }
        );
        res.status(200).send(doc1);
    } catch {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

router.delete('/deleteKey', adminpartnerauthenticate, async function (req, res) {
    try {
        var doc1 = await Key.findByIdAndDelete(
            req.query.keyId
        );
        res.status(200).send(doc1);
    } catch (e) {
        console.log(e)
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

router.get('/getKeys', adminpartnerauthenticate, async function (req, res) {
    try {
        var doc1 = await Key.find({}).sort({
            creadtedAt: -1
        }).populate('owner');
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

router.get('/getKeyByOwner', authenticate, async function (req, res) {
    try {
        var doc1 = await Key.find({
            owner: req.person
        }).populate('owner');
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

router.get('/getKeyById', adminpartnerauthenticate, async function (req, res) {
    try {
        var doc1 = await Key.findById(req.query.keyId).populate('owner');
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

module.exports = router;