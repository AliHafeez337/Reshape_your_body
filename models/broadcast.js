const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BroadcastSchema = new Schema({
  adminID:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
        },
  body:{
      type:String,
  },
  createdAt: {
      type: Date,
      default: Date.now
  },
    });
const Broadcasts = mongoose.model('broadcasts', BroadcastSchema);
module.exports = {Broadcasts}

