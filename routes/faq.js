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
    authenticate,
    adminpartnerauthenticate,
    adminauthenticate,
    partnerauthenticate
} = require('../middleware/authenticate');
// 1
router.post('/addQuestion', adminpartnerauthenticate, async function (req, res) {
    try {
        var body = {
            category: req.body.category,
            question: req.body.question,
            answer: req.body.answer,
            askedBy: req.person
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
// router.put('/addComment', adminpartnerauthenticate, async function (req, res) {
//     try {
//         var body = {
//             reply: req.body.reply,
//             by: req.person,
//             createdAt: Date.now(),
//             likes: 0
//         }
//         var doc1 = await Faq.findByIdAndUpdate(
//             req.query.faqId, {
//                 $push: {
//                     discussion: body
//                 }
//             }, {
//                 new: true
//             }
//         );
//         res.send(doc1);
//     } catch (e) {
//         console.log(e);
//         res.status(400).send({
//             errmsg: "Somethin bad happened"
//         });
//     }
// });
// 3
router.put('/faqLike', adminpartnerauthenticate, async function (req, res) {
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
// router.put('/commentLike', adminpartnerauthenticate, async function (req, res) {
//     try {
//         var doc1 = await Faq.findOneAndUpdate({
//             'discussion._id': req.query.replyId
//         }, {
//             $inc: {
//                 'discussion.$.clikes': 1
//             }
//         });
//         res.send(doc1);
//     } catch {
//         res.status(400).send({
//             errmsg: "Somethin bad happened"
//         });
//     }
// });

// 5
router.put('/updateFaq', adminpartnerauthenticate, async function (req, res) {
    try {
        var doc1 = await Faq.findByIdAndUpdate(
            req.body.faqId, {
                question: req.body.question,
                answer: req.body.answer,
                category: req.body.category
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
router.delete('/deleteQuestion', adminauthenticate, async function (req, res) {
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

router.delete('/deleteQuestionByOwner', authenticate, async function (req, res) {
    try {
        var doc1 = await Faq.findOneAndDelete({
            'askedBy': req.person,
            '_id': req.query.faqId
        });
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});
// 7
// router.put('/deleteComment', adminpartnerauthenticate, async function (req, res) {
//     try {
//         var doc1 = await Faq.findByIdAndUpdate(
//             req.query.faqId, {
//                 $pull: {
//                     discussion: {
//                         '_id': req.query.replyId
//                     }
//                 }
//             }, {
//                 new: true
//             }
//         );
//         res.send(doc1);
//     } catch {
//         res.status(400).send({
//             errmsg: "Somethin bad happened"
//         });
//     }
// });

// 8
router.get('/getFaqs', adminpartnerauthenticate, async function (req, res) {
    try {
        var doc1 = await Faq.find({}).populate('askedBy');
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

// 9
router.get('/getFaqByCatogory', adminpartnerauthenticate, async function (req, res) {
    try {
        var doc1 = await Faq.find({
            category: req.body.category
        }).populate('askedBy');
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

// 10
router.get('/geFaqById', adminpartnerauthenticate, async function (req, res) {
    try {
        var doc1 = await Faq.findById(req.query.FaqId).populate('askedBy');
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

// 11
router.get('/getFaqByOwner', adminpartnerauthenticate, async function (req, res) {
    try {
        var doc1 = await Faq.find({
            askedBy: req.person
        }).populate('askedBy');
        res.status(200).send(doc1);
    } catch (e) {
        res.status(400).send({
            errmsg: "Somethin bad happened"
        });
    }

});

module.exports = router;