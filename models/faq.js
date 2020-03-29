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
    askedBy: {
        type: ObjectId,
        ref: 'users',
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['reviewed', 'pending', 'rejected', 'acepted', 'closed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    discussion: [{
        reply: {
            type: String
        },
        by: {
            type: ObjectId,
            ref: 'users'
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        clikes: {
            type: Number,
            default: 0
        },
        required: false
    }]
});

FaqSchema.methods.toJSON = function () {
    var faq = this;
    var faqObject = faq.toObject();

    return _.pick(faqObject,
        ['_id',
            'category',
            'question',
            'askedBy',
            'likes',
            'status',
            'createdAt',
            'discussion'
        ]);
};

var Faq = mongoose.model('Faq', FaqSchema);

module.exports = {
    Faq
}