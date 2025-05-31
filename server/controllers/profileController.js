// server/controllers/profileController.js
const Doctor = require("../models/doctorModel");
const Reception = require("../models/receptionModel");
const User = require("../models/userModel");
const DoctorSchedule = require('../models/doctorScheduleModel');

// To create a new doctor profile
exports.createDoctorProfile = async (req, res) => {
  const { doctorId, name, specialization, phone_no, experience } = req.body;

  try {
    const user = await User.findOne({ doctorId });
    if (!user || user.role !== "Doctor") {
      return res
        .status(404)
        .json({ message: "User not found or not a doctor" });
    }

      const doctorProfile = new Doctor({
        doctorId: doctorId, // Use doctorId as doctorId
        name,
        specialization,
        phone_no,
        experience,
        email: user.email, // Use the email from the user
      });

      await doctorProfile.save(); // Save the new profile
      return res.status(201).json({
        message: "Doctor profile created successfully",
        doctorProfile,
      });
  } catch (error) {
    res.status(500).json({
      message: "Error creating or updating doctor profile",
      error: error.message,
    });
  }
};

// To get a doctor profile from doctorId
exports.getDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.query; // Retrieve doctorId from query parameters
    const doctor = await Doctor.findOne({ doctorId });

    if (!doctor) {
      return res.status(200).json({
        message: "No profile found. Please create a doctor profile.",
        doctor: null
      });
    }

    res.status(200).json({
      message: "Doctor profile retrieved successfully",
      doctor
    });

  } catch (error) {
    res.status(500).json({
      message: "Error retrieving doctor profile",
      error: error.message
    });
  }
};

// To update a doctor profile
exports.updateDoctorProfile = async (req, res) => {
  const { doctorId } = req.body;

  try {
    // Find the existing doctor profile
    let doctorProfile = await Doctor.findOne({ doctorId: doctorId });
    if (!doctorProfile) {
      return res.status(400).json({
        message: "No Existing Doctor Profile",
      });
    }

    // Update only the fields provided in the request body
    const fieldsToUpdate = ['name', 'specialization', 'phone_no', 'experience'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        doctorProfile[field] = req.body[field];
      }
    });

    await doctorProfile.save(); // Save the updated profile

    return res.status(200).json({
      message: "Doctor profile updated successfully",
      doctorProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating doctor profile",
      error: error.message,
    });
  }
};

// To get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    
    if (doctors.length === 0) {
      return res.status(200).json({
        message: "No doctor profiles found. Please create doctor profiles.",
        doctors: []
      });
    }

    res.status(200).json({
      message: "Doctor profiles retrieved successfully",
      doctors
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving doctor profiles",
      error: error.message
    });
  }
};

// To create a new receptionist profile 
exports.createReceptionistProfile = async (req, res) => {
  const { receptionistId, name, phone_no, salary } = req.body;

  try {
    // Find the user by receptionistId
    const user = await User.findOne({ receptionistId });
    if (!user || user.role !== "Receptionist") {
      return res
        .status(404)
        .json({ message: "User not found or not a receptionist" });
    }

    // Check if a receptionist profile already exists
    let receptionistProfile = await Reception.findOne({
      repID: receptionistId,
    });

    if (receptionistProfile) {
      // Update existing profile
      receptionistProfile.name = name;
      receptionistProfile.phone_no = phone_no;
      receptionistProfile.salary = salary;
      receptionistProfile.email = user.email; // Use the email from the user

      await receptionistProfile.save(); // Save the updated profile
      return res.status(200).json({
        message: "Receptionist profile updated successfully",
        receptionistProfile,
      });
    } else {
      // Create a new receptionist profile
      receptionistProfile = new Reception({
        repID: receptionistId, // Use receptionistId as repID
        name,
        phone_no,
        email: user.email, // Use the email from the user
        salary,
      });

      await receptionistProfile.save(); // Save the new profile
      return res.status(201).json({
        message: "Receptionist profile created successfully",
        receptionistProfile,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error creating or updating receptionist profile",
      error: error.message,
    });
  }
};

// To create a new doctor schedule
exports.createDoctorSchedule = async (req, res) => {
  try {
    const { doctorId, availableTime } = req.body;

    const doctor = await Doctor.findOne({ doctorId: doctorId });
    if (!doctor) {
      return res.status(404).json({
        message: `Doctor with ID ${doctorId} does not exist`
      });
    }

    // Create new doctor schedule
    const newSchedule = new DoctorSchedule({
      doctorId,
      availableTime
    });

    await newSchedule.save();
    res.status(201).json({
      message: "Doctor schedule created successfully",
      schedule: newSchedule
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating doctor schedule",
      error: error.message
    });
  }
};