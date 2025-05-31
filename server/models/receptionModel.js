const mongoose = require('mongoose');

const receptionSchema = new mongoose.Schema({
  repID: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  phone_no: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v);  
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
  salary: {
    type: mongoose.Types.Decimal128,  
    required: true
  }
});

const Reception = mongoose.model('Reception', receptionSchema);

module.exports = Reception;