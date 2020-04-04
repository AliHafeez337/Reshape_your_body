const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {
    secret
} = require('../config/config');
const {
    mongoose
} = require('../db/mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var FaqSchema = new mongoose.Schema({
    category: {
        type: String,
        required: false
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    askedBy: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

FaqSchema.methods.toJSON = function () {
    var faq = this;
    var faqObject = faq.toObject();

    return _.pick(faqObject,
        ['_id',
            'category',
            'question',
            'answer',
            'askedBy',
            'likes',
            'createdAt'
        ]);
};

var Faq = mongoose.model('Faq', FaqSchema);

module.exports = {
    Faq
}