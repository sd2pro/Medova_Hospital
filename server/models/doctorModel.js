const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  specialization: {
    type: String,
    required: true,
    maxlength: 100,
  },
  phone_no: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /\d{10}/.test(v); 
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  experience: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    maxlength: 100,
    unique: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"], 
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
