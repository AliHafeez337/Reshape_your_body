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
var KeySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    owner: {
        type: ObjectId,
        ref: 'users',
        default: null,
        required: false
    },
    used: {
        type: Boolean,
        default: false,
        required: true,
    },
    creadtedAt: {
        type: Date,
        default: Date.now()
    }
});

KeySchema.methods.toJSON = function () {
    var key = this;
    var keyObject = key.toObject();

    return _.pick(keyObject,
        ['_id',
            'key',
            'owner',
            'used',
            'createdAt'
        ]);
};

var Key = mongoose.model('Key', KeySchema);

module.exports = {
    Key
}