const Appointment = require("../models/appointmentModel");
const Patient = require("../models/patientModel");
const DoctorSchedule = require("../models/doctorScheduleModel");
const Doctor = require("../models/doctorModel");
const Invoice = require("../models/invoiceModel");
const Report = require("../models/reportModel");
const moment = require("moment");

// To generate slots of 20 min each
const generateSlots = (startTime, endTime) => {
  const slots = [];
  let start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  while (start < end) {
    const nextSlot = new Date(start.getTime() + 20 * 60 * 1000);
    slots.push(start.toTimeString().substring(0, 5)); // Add HH:mm format
    start = nextSlot;
  }

  return slots;
};

// Create or update doctor's schedule
exports.createDoctorSchedule = async (req, res) => {
  const { doctorId, date, timeRanges } = req.body;

  if (!doctorId || !date || !timeRanges || !Array.isArray(timeRanges)) {
    return res.status(400).json({
      message:
        "Invalid input. Ensure doctorId, date, and timeRanges are provided and correctly formatted.",
    });
  }

  try {
    // Generate 20-minute slots for each time range
    let availableTime = [];
    timeRanges.forEach((range) => {
      const slots = generateSlots(range.startTime, range.endTime);
      availableTime = [...availableTime, ...slots];
    });

    // Find existing schedule for the doctor and date
    let schedule = await DoctorSchedule.findOne({ doctorId, date });

    if (schedule) {
      // Update schedule for the specified date
      schedule.availableTime = availableTime;
      await schedule.save();
      return res.status(200).json({
        message: "Doctor schedule updated successfully.",
        schedule,
      });
    } else {
      // Create a new schedule for the doctor on the specified date
      schedule = new DoctorSchedule({ doctorId, date, availableTime });
      await schedule.save();
      return res.status(201).json({
        message: "Doctor schedule created successfully.",
        schedule,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error creating or updating doctor schedule.",
      error: error.message,
    });
  }
};

// Retrieve a doctor's schedule by doctorId and date
exports.getDoctorSchedule = async (req, res) => {
  const { doctorId, date } = req.query;

  // Validate required inputs
  if (!doctorId || !date) {
    return res.status(400).json({
      message: "Doctor ID and date are required.",
    });
  }

  try {
    // Find schedule for the specific doctor and date
    const schedule = await DoctorSchedule.findOne({ doctorId, date });

    if (!schedule) {
      return res.status(404).json({
        message: `No schedule available for Doctor with ID ${doctorId} on ${date}.`,
      });
    }

    // If schedule exists, return it
    return res.status(200).json({
      message: "Doctor schedule retrieved successfully.",
      schedule,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving doctor schedule.",
      error: error.message,
    });
  }
};

// Get doctorId from patientId (pID)
exports.getDoctorIdByPatientId = async (req, res) => {
  const { pID } = req.params;
  try {
    const patient = await Patient.findOne({ pID });

    if (!patient) {
      return res
        .status(404)
        .json({ message: `Patient with ID ${pID} not found` });
    }

    res.status(200).json({ doctorId: patient.doctorId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching doctorId", error: error.message });
  }
};

// To get available slots by doctorId
exports.getAvailableSlotsByDoctorId = async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    // Retrieve the doctor's schedule for the specific date
    const schedule = await DoctorSchedule.findOne({ doctorId, date });

    if (!schedule) {
      // If the schedule doesn't exist for the given date, return no slots available message
      return res.status(404).json({
        message: `No slots available for Doctor with ID ${doctorId} on ${date}`,
      });
    }

    // Fetch existing appointments for the given doctor and date
    const existingAppointments = await Appointment.find({
      doctorId,
      apt_date: date,
      status: "booked", // You can also include additional status filters like "confirmed" if needed
    });

    // Extract the booked slots from the existing appointments
    const bookedSlots = existingAppointments.map(
      (appointment) => appointment.apt_time
    );

    // Filter available slots by excluding booked ones
    let availableSlots = schedule.availableTime.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    // Get the current time
    const currentTime = moment(); // Current time using moment.js

    // Filter out slots that have already passed
    availableSlots = availableSlots.filter((slot) => {
      const slotTime = moment(`${date} ${slot}`, "YYYY-MM-DD hh:mm A"); // Parse the slot time

      // Only include future slots
      return slotTime.isAfter(currentTime);
    });

    if (availableSlots.length === 0) {
      return res.status(200).json({
        message: `No available slots for Doctor with ID ${doctorId} on ${date}`,
      });
    }

    res.status(200).json({
      message: "Available slots for the given date",
      availableSlots,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching available slots",
      error: error.message,
    });
  }
};

// // To create new appointment

exports.createAppointment = async (req, res) => {
  try {
    const { pID, date, slot, reason, doctorId } = req.body;

    // Validate input
    if (!pID || !date || !slot || !doctorId) {
      return res.status(400).json({
        message: "pID, date, slot, and doctorId are required fields.",
      });
    }

    // Find patient by pID
    const patient = await Patient.findOne({ pID });
    if (!patient) {
      return res.status(404).json({
        message: `Patient with ID ${pID} does not exist.`,
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findOne({ doctorId });
    if (!doctor) {
      return res.status(404).json({
        message: `Doctor with ID ${doctorId} does not exist.`,
      });
    }

    // Retrieve doctor's schedule for the given date
    const doctorSchedule = await DoctorSchedule.findOne({ doctorId, date });
    if (!doctorSchedule) {
      return res.status(404).json({
        message: `No schedule found for Doctor with ID ${doctorId} on ${date}.`,
      });
    }

    // Check if the slot exists in the available time
    if (!doctorSchedule.availableTime.includes(slot)) {
      return res.status(400).json({
        message: `Requested slot "${slot}" is not available. Available slots: ${doctorSchedule.availableTime.join(
          ", "
        )}`,
      });
    }

    // Check for existing appointment
    const existingAppointment = await Appointment.findOne({
      pID,
      doctorId,
      apt_date: date,
      apt_time: slot,
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: `An appointment already exists for patient ${pID} with Doctor ${doctorId} on ${date} at ${slot}.`,
      });
    }

    // Create new appointment
    const newAppointment = new Appointment({
      pID,
      doctorId,
      apt_date: date,
      apt_time: slot,
      reason,
      status: "booked",
    });

    await newAppointment.save();

    // Remove the booked slot from the schedule
    doctorSchedule.availableTime = doctorSchedule.availableTime.filter(
      (time) => time !== slot
    );
    await doctorSchedule.save();

    res.status(201).json({
      message: "Appointment created successfully.",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error.message);
    res.status(500).json({
      message: "Internal server error. Please try again.",
      error: error.message,
    });
  }
};

// exports.createAppointment = async (req, res) => {
//   try {
//     const { pID, date, slot, reason } = req.body;

//     // Validate input
//     if (!pID || !date || !slot) {
//       return res
//         .status(400)
//         .json({ message: "pID, date, and slot are required fields." });
//     }

//     // Find patient by pID
//     const patient = await Patient.findOne({ pID });
//     if (!patient) {
//       return res
//         .status(404)
//         .json({ message: `Patient with ID ${pID} does not exist.` });
//     }

//     const doctorId = patient.doctorId;

//     // Retrieve doctor's schedule for the given date
//     const doctorSchedule = await DoctorSchedule.findOne({ doctorId, date });
//     if (!doctorSchedule) {
//       return res.status(404).json({
//         message: `No schedule found for Doctor with ID ${doctorId} on ${date}.`,
//       });
//     }

//     // Check if the slot exists in the available time
//     if (!doctorSchedule.availableTime.includes(slot)) {
//       return res.status(400).json({
//         message: `Requested slot "${slot}" is not available. Available slots: ${doctorSchedule.availableTime.join(
//           ", "
//         )}`,
//       });
//     }

//     // Check if an appointment already exists for the given details
//     const existingAppointment = await Appointment.findOne({
//       pID,
//       doctorId,
//       apt_date: date,
//       apt_time: slot,
//     });

//     if (existingAppointment) {
//       return res.status(400).json({
//         message: `An appointment already exists for patient ${pID} with Doctor ${doctorId} on ${date} at ${slot}.`,
//       });
//     }

//     // Create new appointment
//     const newAppointment = new Appointment({
//       pID,
//       doctorId,
//       apt_date: date,
//       apt_time: slot,
//       reason,
//       status: "booked",
//     });

//     await newAppointment.save();

//     // Remove the booked slot from the doctor's schedule
//     doctorSchedule.availableTime = doctorSchedule.availableTime.filter(
//       (time) => time !== slot
//     );
//     await doctorSchedule.save();

//     // Respond with the created appointment
//     res.status(201).json({
//       message: "Appointment created successfully.",
//       appointment: newAppointment,
//     });
//   } catch (error) {
//     console.error("Error creating appointment:", error.message);
//     res.status(500).json({
//       message: "Internal server error. Please try again.",
//       error: error.message,
//     });
//   }
// };

// exports.createAppointment = async (req, res) => {
//   try {
//     const { pID, date, slot, reason } = req.body;

//     // Validate input
//     if (!pID || !date || !slot) {
//       return res
//         .status(400)
//         .json({ message: "pID, date, and slot are required fields." });
//     }

//     // Find patient by pID
//     const patient = await Patient.findOne({ pID });
//     if (!patient) {
//       return res
//         .status(404)
//         .json({ message: `Patient with ID ${pID} does not exist.` });
//     }

//     const doctorId = patient.doctorId;

//     // Retrieve doctor's schedule for the given date
//     const doctorSchedule = await DoctorSchedule.findOne({ doctorId, date });
//     if (!doctorSchedule) {
//       return res.status(404).json({
//         message: `No schedule found for Doctor with ID ${doctorId} on ${date}.`,
//       });
//     }

//     // Check if the slot exists in the available time
//     if (!doctorSchedule.availableTime.includes(slot)) {
//       return res.status(400).json({
//         message: `Requested slot "${slot}" is not available. Available slots: ${doctorSchedule.availableTime.join(
//           ", "
//         )}`,
//       });
//     }

//     // Check if an appointment already exists for the given details
//     const existingAppointment = await Appointment.findOne({
//       pID,
//       doctorId,
//       apt_date: date,
//       apt_time: slot,
//     });

//     if (existingAppointment) {
//       return res.status(400).json({
//         message: `An appointment already exists for patient ${pID} with Doctor ${doctorId} on ${date} at ${slot}.`,
//       });
//     }

//     // Create new appointment
//     const newAppointment = new Appointment({
//       pID,
//       doctorId,
//       apt_date: date,
//       apt_time: slot,
//       reason,
//       status: "booked",
//     });

//     await newAppointment.save();

//     // Remove the booked slot from the doctor's schedule
//     doctorSchedule.availableTime = doctorSchedule.availableTime.filter(
//       (time) => time !== slot
//     );
//     await doctorSchedule.save();

//     // Respond with the created appointment
//     res.status(201).json({
//       message: "Appointment created successfully.",
//       appointment: newAppointment,
//     });
//   } catch (error) {
//     console.error("Error creating appointment:", error.message);
//     res.status(500).json({
//       message: "Internal server error. Please try again.",
//       error: error.message,
//     });
//   }
// };

// To get all appointments by pID
exports.getAllAppointmentsByPID = async (req, res) => {
  try {
    const pID = req.query.pID;

    if (!pID) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const appointment = await Appointment.find({ pID: pID });

    res.status(200).json({
      message:
        appointment.length === 0
          ? "No appointments found for this patient yet"
          : "Appointments retrieved successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving appointments",
      error: error.message,
    });
  }
};

// To get all appointments by doctorId
exports.getAllAppointmentsByDoctorId = async (req, res) => {
  try {
    const doctorId = req.query.doctorId;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const appointments = await Appointment.aggregate([
      { $match: { doctorId: doctorId } },
      {
        $lookup: {
          from: "patients",
          localField: "pID",
          foreignField: "pID",
          as: "patientInfo",
        },
      },
      { $unwind: { path: "$patientInfo", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          patientName: "$patientInfo.name",
        },
      },
      {
        $project: {
          patientInfo: 0,
        },
      },
    ]);

    // ✅ Always return 200 with an array
    return res.status(200).json({
      message:
        appointments.length === 0
          ? "No appointments found for this doctor yet"
          : "Appointments retrieved successfully",
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving appointments",
      error: error.message,
    });
  }
};

// To get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointment = await Appointment.find();
    if (appointment.length === 0) {
      return res.status(404).json({ message: "No appointments found" });
    }

    res.status(200).json({
      message: "appointments retrieved successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving appointments",
      error: error.message,
    });
  }
};

// Get appointment details by aptID
exports.getAppointmentDetailsByAptID = async (req, res) => {
  const { aptID } = req.params;

  try {
    // Find the appointment by aptID
    const appointment = await Appointment.findOne({ aptID });

    if (!appointment) {
      return res
        .status(404)
        .json({ message: `No appointment found with ID ${aptID}` });
    }

    // Fetch patient details
    const patient = await Patient.findOne({ pID: appointment.pID });
    if (!patient) {
      return res
        .status(404)
        .json({ message: `No patient found with ID ${appointment.pID}` });
    }

    // Fetch doctor details
    const doctor = await Doctor.findOne({ doctorId: appointment.doctorId });
    if (!doctor) {
      return res
        .status(404)
        .json({ message: `No doctor found with ID ${appointment.doctorId}` });
    }

    // Combine all details into a single response
    const appointmentDetails = {
      appointment: {
        aptID: appointment.aptID,
        date: appointment.apt_date,
        time: appointment.apt_time,
        reason: appointment.reason,
        status: appointment.status,
      },
      patient: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone_no,
        address: patient.address,
        history: patient.past_history,
      },
      doctor: {
        name: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience,
        phone: doctor.phone_no,
        email: doctor.email,
      },
    };

    res.status(200).json({
      message: "Appointment details retrieved successfully",
      details: appointmentDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving appointment details",
      error: error.message,
    });
  }
};

// To delete a appointment by Apt ID
exports.deleteAppointmentByAptID = async (req, res) => {
  const aptID = req.query.aptID;
  const appointment = await Appointment.findOneAndDelete({ aptID: aptID });
  if (!appointment)
    return res.json({ message: `No appointment found with ID ${aptID}` });
  Invoice.deleteMany({ aptID: aptID });
  Report.deleteMany({ aptID: aptID });
  res
    .status(200)
    .json({
      message:
        "Appointment,associated invoice, and report are deleted successfully",
      appointment,
    });
};
