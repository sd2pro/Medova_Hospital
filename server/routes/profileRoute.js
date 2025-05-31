const express = require('express');
const { createDoctorProfile,getDoctorProfile,updateDoctorProfile, createReceptionistProfile,createDoctorSchedule,getAllDoctors } = require('../controllers/profileController');
const router = express.Router();

router.post('/doctor', createDoctorProfile);

router.get('/doctor',getDoctorProfile)

router.put('/doctor',updateDoctorProfile)

router.get('/getAllDoctors',getAllDoctors);

router.post('/createDoctorSchedule',createDoctorSchedule)

router.post('/receptionist', createReceptionistProfile);

module.exports = router;