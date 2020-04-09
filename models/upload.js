const { secret, address } = require("../config/config");
const { mongoose } = require("../db/mongoose");

var UploadSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    max: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userAllowed: {
    type: Array,
    required: true,
  },
  file: { type: Array, default: [] },
});

var Upload = mongoose.model("Upload", UploadSchema);

module.exports = {
  Upload,
};
