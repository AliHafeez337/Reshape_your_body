const {
    mongoose
} = require('../db/mongoose');
var Schema = mongoose.Schema;
const _ = require('lodash');
// var ObjectId = Schema.ObjectId;
const RequestSchema = new mongoose.Schema({
  madeBy:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            enum:['user','customer'],
         },
  status:{
            type:String,
            enum:['reviewed', 'pending', 'rejected', 'acepted'],
         },
  createdAt: {
            type: Date,
            default: Date.now
        },
});
RequestSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, 
    [
    '_id',
    'madeBy',
    'status',
    'createdAt'
  ]);
};
var Requests = mongoose.model('Requests', RequestSchema);

module.exports = {Requests}