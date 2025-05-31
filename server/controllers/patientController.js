// const Patient = require("../models/patientModel");
// const Doctor = require("../models/doctorModel");
// const Appointment = require("../models/appointmentModel");
// const Invoice = require('../models/invoiceModel')
// const Report = require('../models/reportModel')

// // Create a new patient
// exports.createPatient = async (req, res) => {
//   try {
//     const {
//       name,
//       dob,
//       age,
//       gender,
//       phone_no,
//       past_history,
//       current_status,
//       address,
//       doctorId,
//     } = req.body;

//     // Validate required fields
//     if (
//       !name ||
//       !dob ||
//       !age ||
//       !gender ||
//       !phone_no ||
//       !past_history ||
//       !current_status ||
//       !address ||
//       !doctorId
//     ) {
//       return res.status(400).json({
//         message:
//           "Please provide all required fields: name, dob, age, gender, phone_no, past_history, current_status, address",
//       });
//     }

//     const doctorExists = await Doctor.findOne({ doctorId: doctorId });

//     if (!doctorExists) {
//       return res.status(400).json({
//         message: `Doctor Profile with ID ${doctorId} does not exist`,
//       });
//     }

//     // Create a new Patient instance with provided details
//     const newPatient = new Patient({
//       name,
//       dob,
//       age,
//       gender,
//       phone_no,
//       past_history,
//       current_status,
//       address,
//       doctorId,
//     });

//     // Save the new patient to the database
//     await newPatient.save();
//     console.log("New Patient saved:", newPatient);

//     res.status(201).json({
//       message: "Patient data saved successfully",
//       patient: newPatient,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error saving patient data",
//       error: error.message,
//     });
//   }
// };

// // Get all patients with their respective doctor's name using aggregate
// exports.getAllPatients = async (req, res) => {
//   try {
//     const patients = await Patient.aggregate([
//       {
//         $lookup: {
//           from: "doctors", // Name of the doctor collection in MongoDB
//           localField: "doctorId", // The field in Patient document
//           foreignField: "doctorId", // The field in Doctor document (assuming it's doctorId)
//           as: "doctorDetails", // Alias for the result of the lookup
//         },
//       },
//       {
//         $unwind: {
//           path: "$doctorDetails", // Unwind the doctorDetails array to get each doctor name
//           preserveNullAndEmptyArrays: true, // Allow patients with no doctor to be returned
//         },
//       },
//       {
//         $project: {
//           name: 1,
//           dob: 1,
//           age: 1,
//           gender: 1,
//           phone_no: 1,
//           past_history: 1,
//           current_status: 1,
//           address: 1,
//           doctorId:1,
//           doctorName: { $ifNull: ["$doctorDetails.name", "No Doctor Assigned"] }, // Default to 'No Doctor Assigned' if doctor is not found
//           pID: 1,
//         },
//       },
//     ]);

//     if (patients.length === 0) {
//       return res.status(404).json({ message: "No patients found" });
//     }

//     res.status(200).json({
//       message: "Patients retrieved successfully",
//       patients,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error retrieving patients",
//       error: error.message,
//     });
//   }
// };

// // Get a single patient by pID
// exports.getPatientById = async (req, res) => {
//   try {
//     const { pID } = req.query;

//     const patient = await Patient.findOne({ pID });
//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     res.status(200).json({
//       message: "Patient retrieved successfully",
//       patient,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error retrieving patient",
//       error: error.message,
//     });
//   }
// };

// // Update a patient's details by pID
// exports.updatePatient = async (req, res) => {
//   try {
//     const { pID } = req.query;
//     const {
//       name,
//       dob,
//       age,
//       gender,
//       phone_no,
//       past_history,
//       current_status,
//       address,
//     } = req.body;

//     // Validate required fields
//     if (
//       !name ||
//       !dob ||
//       !age ||
//       !gender ||
//       !phone_no ||
//       !past_history ||
//       !current_status ||
//       !address
//     ) {
//       return res.status(400).json({
//         message:
//           "Please provide all required fields: name, dob, age, gender, phone_no, past_history, current_status, address",
//       });
//     }

//     // Validate phone number format (10 digits)
//     if (!/^\d{10}$/.test(phone_no)) {
//       return res.status(400).json({
//         message: "Phone number must be a 10-digit number",
//       });
//     }

//     // Find and update the patient by pID
//     const patient = await Patient.findOneAndUpdate(
//       { pID },
//       {
//         name,
//         dob,
//         age,
//         gender,
//         phone_no,
//         past_history,
//         current_status,
//         address,
//       },
//       { new: true } // Return the updated document
//     );

//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     res.status(200).json({
//       message: "Patient updated successfully",
//       patient,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error updating patient data",
//       error: error.message,
//     });
//   }
// };

// // To delete a patient by it's ID
// exports.deletePatientById = async (req, res) => {
//   try {
//     const { pID } = req.query;

//     // Find and delete the patient
//     const patient = await Patient.findOneAndDelete({ pID: pID });
//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     // Find all appointments associated with the patient
//     const appointments = await Appointment.find({ pID: pID });
//     if (appointments.length > 0) {
//       const appointmentIds = appointments.map(appointment => appointment._id);

//       // Delete all invoices and reports linked to the appointments
//       await Invoice.deleteMany({ aptID: { $in: appointmentIds } });
//       await Report.deleteMany({ aptID: { $in: appointmentIds } });

//       // Delete all appointments
//       await Appointment.deleteMany({ pID: pID });
//     }

//     res.status(200).json({
//       message: "Patient, associated appointments, invoices, and reports deleted successfully",
//       patient,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error deleting patient and related data",
//       error: error.message,
//     });
//   }
// };

// server/controllers/patientController.js
const Patient = require("../models/patientModel");
const Appointment = require("../models/appointmentModel");
const Invoice = require("../models/invoiceModel");
const Report = require("../models/reportModel");

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

exports.createPatient = async (req, res) => {
  try {
    const {
      pID,          // optional: if provided from frontend/auth, use it
      name,
      dob,
      gender,
      phone_no,
      past_history,
      current_status,
      address,
    } = req.body;

    // Validate required fields except pID (which is optional here)
    if (!name || !dob || !gender || !phone_no || !past_history || !current_status || !address) {
      return res.status(400).json({ message: "Missing required patient details." });
    }

    // If pID is provided, check if patient profile already exists for that pID
    if (pID) {
      const existingPatient = await Patient.findOne({ pID });
      if (existingPatient) {
        return res.status(400).json({ message: "Profile already exists for this patient." });
      }
    }

    const age = calculateAge(dob);

    const newPatient = new Patient({
      pID,  // if undefined, pre-save hook will generate it
      name,
      dob,
      age,
      gender,
      phone_no,
      past_history,
      current_status,
      address,
    });

    await newPatient.save();

    res.status(201).json({ message: "Patient created successfully", patient: newPatient });
  } catch (error) {
    res.status(500).json({ message: "Error creating patient", error: error.message });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    if (patients.length === 0) {
      return res.status(404).json({ message: "No patients found" });
    }
    res.status(200).json({ message: "Patients retrieved successfully", patients });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving patients", error: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const { pID } = req.params;  // now get pID from URL params
    const patient = await Patient.findOne({ pID });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json({ message: "Patient retrieved successfully", patient });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving patient", error: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { pID } = req.params;
    const {
      name,
      dob,
      gender,
      phone_no,
      past_history,
      current_status,
      address,
    } = req.body;

    if (
      !name ||
      !dob ||
      !gender ||
      !phone_no ||
      !past_history ||
      !current_status ||
      !address
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!/^\d{10}$/.test(phone_no)) {
      return res.status(400).json({ message: "Phone number must be a 10-digit number" });
    }

    // Calculate age from dob again on update
    const age = calculateAge(dob);

    const updatedPatient = await Patient.findOneAndUpdate(
      { pID },
      { name, dob, age, gender, phone_no, past_history, current_status, address },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient updated successfully", patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ message: "Error updating patient", error: error.message });
  }
};

exports.deletePatientById = async (req, res) => {
  try {
    const { pID } = req.params;
    const patient = await Patient.findOneAndDelete({ pID });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Delete related appointments, invoices, reports
    const appointments = await Appointment.find({ pID });
    if (appointments.length > 0) {
      const aptIds = appointments.map((a) => a._id);
      await Invoice.deleteMany({ aptID: { $in: aptIds } });
      await Report.deleteMany({ aptID: { $in: aptIds } });
      await Appointment.deleteMany({ pID });
    }

    res.status(200).json({ message: "Patient and related data deleted successfully", patient });
  } catch (error) {
    res.status(500).json({ message: "Error deleting patient", error: error.message });
  }
};