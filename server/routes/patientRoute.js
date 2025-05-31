// const express = require("express");
// const router = express.Router();
// const {createPatient,getAllPatients,getPatientById,deletePatientById,updatePatient}=require('../controllers/patientController');


// router.post("/create", createPatient);

// router.get("/list", getAllPatients);

// router.get("/getPatientById",getPatientById)

// router.delete("/deletePatientById",deletePatientById)

// router.post("/update", updatePatient);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createPatient,
  getAllPatients,
  getPatientById,
  deletePatientById,
  updatePatient,
} = require("../controllers/patientController");

// Create new patient - POST /api/patients
router.post("/", createPatient);

// Get all patients - GET /api/patients
router.get("/", getAllPatients);

// Get single patient by pID - GET /api/patients/:pID
router.get("/:pID", getPatientById);

// Update patient by pID - PUT /api/patients/:pID
router.put("/:pID", updatePatient);

// Delete patient by pID - DELETE /api/patients/:pID
router.delete("/:pID", deletePatientById);

module.exports = router;