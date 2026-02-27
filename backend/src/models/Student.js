const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    ref: "Student",
  },

  name: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  hostel: {
    type: String,
  },

  bloodGroup: {
    type: String,
  },

  emergencyContact: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Student", studentSchema);
