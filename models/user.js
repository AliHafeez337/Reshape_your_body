// const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const phone = require('phone');
const bcrypt = require('bcryptjs');

const {
  secret,
  address
} = require('../config/config');
const {
  mongoose
} = require('../db/mongoose');

var UserSchema = new mongoose.Schema({
  verification: {
    required: false,
    type: String
  },
  forgetToken: {
    type: String,
    required: false,
    default: ''
  },
  emailToBe: {
    type: String,
    required: false,
    default: ''
  },
  photo: {
    type: String,
    required: false
  },
  usertype: {
    type: String,
    required: true,
    enum: ['admin', 'partner', 'customer', 'user'],
    default: 'user'
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  firstname: {
    type: String,
    trim: true
  },
  lastname: {
    type: String,
    trim: true
  },
  birthdate: {
    type: Date
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    minlength: 1,
    unique: true,
    sparse: true,
    validate: {
      validator: function () {
        if (phone(this.phone).length == 0) {
          return false;
        } else {
          return true;
        }
      },
      message: '{VALUE} is not a valid phone number.'
    }
  },
  languages: [{
    type: String,
    trim: true
  }],
  address1: {
    type: String,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  postal: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();
  var picked = _.pick(userObject,
    ['_id',
      'usertype',
      'email',
      'firstname',
      'lastname',
      'birthdate',
      'phone',
      'languages',
      'address1',
      'address2',
      'city',
      'postal',
      'country',
      'photo',
      'createdAt'
    ]);

  if (picked.photo !== undefined && picked.photo !== null) {
    if (picked.photo.slice(0, 4) !== "http") {
      picked.photo = address + picked.photo
    }
  } else {
    delete picked.photo
  }

  return picked;
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({
      _id: user._id.toHexString(),
      access
    },
    secret,
    // { expiresIn: '24h' // expires in 24 hours
    // }
  ).toString();
  // console.log(token);
  // user.tokens.concat([{access, token}]);
  user.tokens.push({
    access,
    token
  });

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;
  return user.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
};

// UserSchema.methods.removeAllToken = function (token) {
//   var user = this;
//   return user.update({
//     $pullAll: {
//       tokens: user.tokens
//     }
//   });
// };

UserSchema.statics.findByToken = async function (token) {
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, secret);
  } catch (e) {
    return Promise.reject(e);
  }

  return await User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': decoded.access
  });
};

UserSchema.statics.findByEmail = function (email) {
  var User = this;

  return User.findOne({
    email
  }).then((user) => {
    // console.log(user)
    return user;
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this; //it is just a reservation of a variable, that a user would be this from a group of all the users

  return User.findOne({
    email
  }).then((user) => {
    if (!user) {
      return Promise.reject('User not found');
    }

    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      // console.log(password);
      // console.log(user.password);
      bcrypt.compare(password, user.password, (err, res) => {
        console.log(`password matches ? ${res}`);
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(9, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// THE FUNCTION BELOW IS ALMOST CORRECT, I REACHED PRETTY FAR BUT DON'T KNOW IS WHICH FIELD TO PUT THE NEW PASSWORD... NO FIELD IS WORKING

// UserSchema.pre('findOneAndUpdate', function(next){
//   var user = this;
//   console.log(user.getUpdate());
//   if (user.getUpdate().password != null){
//     try {
//       bcrypt.genSalt(9, (err, salt) => {
//         // console.log("password is here...");
//         // console.log(this.getUpdate());
//         bcrypt.hash(user.getUpdate().$set.password, salt, (err, hash) => {
//           console.log('hash');
//           user.getUpdate().$set.password = hash;
//           user.password = hash;
//           // console.log(user.getUpdate().$set.password);
//           console.log(user);
//           next();
//         });
//       });
//     } catch (error) {
//         return next(error);
//     }
//   }
//   next();
// });

var User = mongoose.model('User', UserSchema);

module.exports = {
  User
}