const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  staffID: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  position: {
    type: String,
    required: true
  },
  phone_no: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v); // Validate 10-digit phone number
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    required: true,
    maxlength: 100,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',  // Reference to the doctor who manages this staff member
    required: true
  }
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;