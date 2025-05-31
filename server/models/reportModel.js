const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    aptID: {
      type: String,
      required: true,
    },
    apt_date: {
      type: Date,
    },
    consultedDoctor:{
        type: String,
    },
    reason: {
        type: String,
    },
    primaryDiagnosis: {
        type: String,
        required:true
    },
    prescription:{
        type: String,
        required:true
    },
    procedures:{
        type: String,
        required : true
    }
});

const report = mongoose.model('report',reportSchema);

module.exports = report