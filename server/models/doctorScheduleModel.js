const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorScheduleSchema = new Schema({
  doctorId: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  availableTime: {
    type: [String], // Array of 20-minute slots (e.g., ["10:00", "10:20", "10:40"])
    required: true,
  },
});

// Ensure each doctor can only have one schedule per day
doctorScheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

const DoctorSchedule = mongoose.model('DoctorSchedule', doctorScheduleSchema);

module.exports = DoctorSchedule;