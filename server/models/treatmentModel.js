const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  treatmentID: {
    type: Number,
    required: true,
    unique: true
  },
  treatment_type: {
    type: String,
    required: true
  },
  treatment_description: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  }
});

const Treatment = mongoose.model('Treatment', treatmentSchema);

module.exports = Treatment;