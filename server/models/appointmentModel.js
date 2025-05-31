const mongoose = require('mongoose');

// Helper function to generate the next appointment ID (aptID)
async function generateNextAppointmentId() {
  try {
    // Find the appointment with the highest aptID
    const latestAppointment = await mongoose.model('Appointment').findOne()
      .sort({ aptID: -1 }) // Sort by aptID in descending order
      .select('aptID'); // Only return aptID field

    if (latestAppointment && latestAppointment.aptID) {
      const latestId = latestAppointment.aptID;

      // Ensure ID format (should start with 'a' followed by 3 digits)
      if (/^a\d{3}$/.test(latestId)) {
        const numericPart = parseInt(latestId.slice(1), 10); // Extract numeric part from aptID
        const nextId = 'a' + String(numericPart + 1).padStart(3, '0'); // Increment and pad to 3 digits
        return nextId;
      } else {
        return 'a001'; // Reset if format is invalid
      }
    } else {
      return 'a001'; // Start with a001 if no appointments exist
    }
  } catch (error) {
    console.error('Error generating aptID:', error.message);
    throw error;
  }
}

const appointmentSchema = new mongoose.Schema({
  pID: {
    type: String,  // Reference to Patient's pID
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  aptID: {
    type: String,  // e.g., "a001"
  },
  apt_date: {
    type: Date,
    required: true
  },
  apt_time: {
    type: String,  // Store time in HH:MM format
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["booked", "available"],
    default: "booked",
  },
});

// Pre-save hook to generate the next aptID
appointmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.aptID = await generateNextAppointmentId();
  }
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;