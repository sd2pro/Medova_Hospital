const express = require("express");
const router = express.Router();

const {
  createAppointment,
  createDoctorSchedule,
  getAllAppointmentsByPID,
  getAllAppointments,
  getDoctorSchedule,
  getDoctorIdByPatientId,
  getAllAppointmentsByDoctorId,
  getAvailableSlotsByDoctorId,
  getAppointmentDetailsByAptID,
  deleteAppointmentByAptID
} = require("../controllers/appointmentController");


router.post("/create", createAppointment);

router.post("/schedule", createDoctorSchedule);

router.get("/doctor/:pID", getDoctorIdByPatientId);

router.get("/:doctorId/available-slots/:date", getAvailableSlotsByDoctorId);

router.get("/schedule", getDoctorSchedule);

router.get("/details/:aptID", getAppointmentDetailsByAptID);

router.get("/getAllAppointmentsByDoctorId", getAllAppointmentsByDoctorId);

router.get("/getAllAppointmentsByPID", getAllAppointmentsByPID);

router.get("/getAllAppointments", getAllAppointments);

router.get('/deleteAppointmentByAptID',deleteAppointmentByAptID)

module.exports = router;
