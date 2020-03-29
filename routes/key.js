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

router.post('/generateKey', async function (req, res) {
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

router.put('/useKey', async function (req, res) {
    var body = {
        used: true,
        owner: "5e7f331c24e379222421d026"
    }
    try {
        var doc1 = await Key.findByIdAndUpdate(
            req.body.keyId,
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

router.delete('/deleteKey', async function (req, res) {
    try {
        var doc1 = await Key.findByIdAndDelete(
            req.query.keyId
        );
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

router.get('/getKeys', async function (req, res) {
    try {
        var doc1 = await Key.find({});
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

router.get('/getKeyByOwner', async function (req, res) {
    try {
        var doc1 = await Key.find({
            owner: "5e7f331c24e379222421d026"
        });
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

router.get('/getKeyById', async function (req, res) {
    try {
        var doc1 = await Key.findById(req.query.keyId);
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

module.exports = router;