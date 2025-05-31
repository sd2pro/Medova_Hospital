// models/patientModel.js
const mongoose = require("mongoose");
const { generateNextPatientId } = require("../utils/idGenerator");

const patientSchema = new mongoose.Schema({
  pID: { type: String, unique: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  phone_no: { type: String, required: true },
  past_history: { type: String, required: true },
  current_status: { type: String, required: true },
  address: { type: String, required: true },
}, { timestamps: true });

// Pre-save hook: only generate pID if not provided
patientSchema.pre("save", async function (next) {
  if (!this.pID) {
    this.pID = await generateNextPatientId();
  }
  next();
});

module.exports = mongoose.model("Patient", patientSchema);