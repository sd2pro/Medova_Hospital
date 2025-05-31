// // server/controllers/userController.js
// const User = require("../models/userModel");
// const Doctor = require("../models/doctorModel");
// const Reception = require("../models/receptionModel");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // To register a new user
// exports.register = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const user = new User({
//       email,
//       password,
//       role
//     });

//     await user.save();

//     const userDetails = {
//       id: user._id,
//       email: user.email,
//       role: user.role,
//       doctorId: user.doctorId,
//       receptionistId: user.receptionistId,
//     };

//     res.status(201).json({ message: "User registered successfully", user: userDetails });
//   } catch (error) {
//     res.status(500).json({ message: "Error registering user", error: error.message });
//   }
// };

// // To login by a user
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     console.log("Logged in user:", user);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     // Send both user and token in a single json response
//     res.status(200).json({
//       user: {
//         _id: user._id,
//         email: user.email,
//         role: user.role,
//         doctorId: user.doctorId,
//         receptionistId: user.receptionistId,
//       },
//       token, // Include the token here
//       message: "Login successful",
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// };

// server/controllers/userController.js
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// To register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      password,
      role
    });

    await user.save();

    const userDetails = {
      id: user._id,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
      receptionistId: user.receptionistId,
      patientId: user.patientId // ✅ Added
    };

    res.status(201).json({ message: "User registered successfully", user: userDetails });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// To login by a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("Logged in user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        doctorId: user.doctorId,
        receptionistId: user.receptionistId,
        patientId: user.patientId // ✅ Added
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};