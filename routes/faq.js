var express = require('express');
var router = express.Router();
const passport = require('passport');
const _ = require('lodash');

var {
    User
} = require('../models/user');
var {
    Faq
} = require('../models/faq');
var {
    authenticate
} = require('../middleware/authenticate');
// 1
router.post('/addQuestion', async function (req, res) {
    try {
        var body = {
            category: req.body.category,
            question: req.body.question,
            askedBy: '5e7f331c24e379222421d026'
        }
        var faqM = new Faq(body);
        await faqM.save();
        res.send(faqM);
    } catch {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }
});
// 2
router.put('/addComment', async function (req, res) {
    try {
        var body = {
            reply: req.body.reply,
            by: '5e7f331c24e379222421d026',
            createdAt: Date.now(),
            likes: 0
        }
        var doc1 = await Faq.findByIdAndUpdate(
            req.query.faqId, {
                $push: {
                    discussion: body
                }
            }, {
                new: true
            }
        );
        res.send(doc1);
    } catch (e) {
        console.log(e);
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }
});
// 3
router.put('/faqLike', async function (req, res) {
    try {
        var doc1 = await Faq.findByIdAndUpdate(
            req.query.faqId, {
                $inc: {
                    likes: 1
                }
            }, {
                new: true
            }
        );
        res.send(doc1);
    } catch {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }
});
// 4
router.put('/commentLike', async function (req, res) {
    try {
        var doc1 = await Faq.findOneAndUpdate({
            'discussion._id': req.query.replyId
        }, {
            $inc: {
                'discussion.$.clikes': 1
            }
        });
        res.send(doc1);
    } catch {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }
});

// 5
router.put('/updateStatus', async function (req, res) {
    try {
        var doc1 = await Faq.findByIdAndUpdate(
            req.query.faqId, {
                status: req.body.status
            }, {
                new: true
            }
        );
        res.send(doc1);
    } catch {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }
});
// 6
router.delete('/deleteQuestion', async function (req, res) {
    try {
        var doc1 = await Faq.findByIdAndDelete(
            req.query.faqId
        );
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});
// 7
router.put('/deleteComment', async function (req, res) {
    try {
        var doc1 = await Faq.findByIdAndUpdate(
            req.query.faqId, {
                $pull: {
                    discussion: {
                        '_id': req.query.replyId
                    }
                }
            }, {
                new: true
            }
        );
        res.send(doc1);
    } catch {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }
});

// 8
router.get('/getFaqs', async function (req, res) {
    try {
        var doc1 = await Faq.find({});
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

// 9
router.get('/getFaqByCatogory', async function (req, res) {
    try {
        var doc1 = await Faq.find({
            category: req.body.category
        });
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

// 10
router.get('/geFaqById', async function (req, res) {
    try {
        var doc1 = await Faq.findById(req.query.FaqId);
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

// 11
router.get('/getFaqByOwner', async function (req, res) {
    try {
        var doc1 = await Faq.find({
            askedBy: "5e7f331c24e379222421d026"
        });
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

module.exports = router;