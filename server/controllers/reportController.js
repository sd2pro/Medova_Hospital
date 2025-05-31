const Report = require('../models/reportModel')
const Appointment = require('../models/appointmentModel')
const Doctor = require('../models/doctorModel')

// To create a new report
exports.createReport = async(req,res) =>{
    try {
        const  { aptID,primaryDiagnosis,prescription,procedures} = req.body
        const appointment = await Appointment.findOne({ aptID : aptID })
        if(!appointment){
                return res
                  .status(404)
                  .json({ message: "Appointment does not exist" });
        }
        const reportexists  = await Report.findOne({aptID:aptID});
        if(reportexists) return res.json({message:"Report already exists for this appointment, kindly update the report"})
        const doctor = await Doctor.findOne({doctorId:appointment.doctorId})
        const newreport = new Report({
            aptID,
            consultedDoctor:doctor.name,
            primaryDiagnosis,
            prescription,
            procedures,
            apt_date : appointment.apt_date,
            reason: appointment.reason,
        });
        await newreport.save();
        return res.status(201).json({
            message: "Report created successfully",
            newreport,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating Report",
            error: error.message,
        });
    }
}

// To fetch a report
exports.getReport = async(req,res) =>{
    try {
        const {aptID} = req.query; 
        const report = await Report.findOne({ aptID });
    
        if (!report) {
          return res.status(200).json({
            message: "No report found. Please create a report profile.",
            report: null
          });
        }
    
        res.status(200).json({
          message: "report retrieved successfully",
          report
        });
    
      } catch (error) {
        res.status(500).json({
          message: "Error retrieving report",
          error: error.message
        });
      }
}

// To update a report
exports.updateReport = async (req, res) => {
    const { aptID } = req.body;
  
    try {
      const report = await Report.findOne({ aptID: aptID });
      if (!report) {
        return res.status(400).json({
          message: "No Existing report",
        });
      }
  
      // Update only the fields provided in the request body
      const fieldsToUpdate = ['primaryDiagnosis', 'prescription', 'procedures'];
      fieldsToUpdate.forEach(field => {
        if (req.body[field] !== undefined) {
            report[field] = req.body[field];
        }
      });
  
      await report.save(); // Save the updated report
  
      return res.status(200).json({
        message: "report updated successfully",
        report,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error updating report",
        error: error.message,
      });
    }
};