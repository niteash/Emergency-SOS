const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },

  latitude: Number,

  longitude: Number,

  status: {
    type: String,
    default: "active",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SOSAlert", sosSchema);
