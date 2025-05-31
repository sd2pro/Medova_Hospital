// utils/idGenerator.js
const mongoose = require("mongoose");

async function generateNextPatientId() {
  const User = mongoose.model("User");
  const Patient = mongoose.model("Patient");

  const prefix = "p";

  const latestUser = await User.findOne({ role: 'Patient', patientId: { $exists: true } })
    .sort({ patientId: -1 })
    .select('patientId');

  const latestPatient = await Patient.findOne({ pID: { $exists: true } })
    .sort({ pID: -1 })
    .select('pID');

  const getNumeric = (id) => parseInt(id?.slice(1) || '0', 10);
  const userNum = getNumeric(latestUser?.patientId);
  const patientNum = getNumeric(latestPatient?.pID);

  const nextNumber = Math.max(userNum, patientNum) + 1;
  return prefix + String(nextNumber).padStart(3, '0');
}

module.exports = { generateNextPatientId };