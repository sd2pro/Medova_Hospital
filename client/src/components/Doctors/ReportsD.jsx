import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaTooth,
  FaVenusMars,
  FaBirthdayCake,
} from "react-icons/fa";
import DoctorNavbar from "./DoctorNavbar";

const ReportD = () => {
  const { doctorId } = useAuth(); // get doctorId from context
  const [aptID, setAptID] = useState("");
  const [searchAptID, setSearchAptID] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [reportDetails, setReportDetails] = useState({
    primaryDiagnosis: "",
    prescription: "",
    procedures: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  // Fetch all appointments for this doctor on mount or doctorId change
  useEffect(() => {
    if (!doctorId) return;

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }appointments/getAllAppointmentsByDoctorId`,
          {
            params: { doctorId },
          }
        );
        const fetchedAppointments = response.data.appointments || [];

        setAppointments(fetchedAppointments);

        if (fetchedAppointments.length === 0) {
          toast.info("You have no appointment history yet.");
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast.error("Something went wrong while loading your appointments.");
      }
    };

    fetchAppointments();
  }, [doctorId]);

  // Fetch appointment details when searchAptID changes
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!searchAptID) return;

      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }appointments/details/${searchAptID}`
        );

        if (response.data?.details) {
          setAppointmentDetails(response.data.details);
        } else {
          toast.info("No details found for the selected appointment.");
        }
      } catch (error) {
        console.error("Failed to fetch appointment details:", error);
        toast.error("Couldn't load appointment details. Please try again.");
      }
    };

    fetchAppointmentDetails();
  }, [searchAptID]);

  // Fetch report details for selected appointment
  useEffect(() => {
    const fetchReport = async () => {
      if (!searchAptID) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}report/get`, {
          params: { aptID: searchAptID },
        });
        const { report, message } = response.data;

        if (report) {
          setReportDetails(report);
          setIsEditing(true);
        } else {
          setReportDetails({
            primaryDiagnosis: "",
            prescription: "",
            procedures: "",
          });
          setIsEditing(false);
          alert(message || "No report found. Please create one.");
        }
      } catch (error) {
        console.error("Failed to fetch report:", error);
        alert("Unable to fetch report. Please try again.");
      }
    };

    fetchReport();
  }, [searchAptID]);

  // Submit new or updated report
  const handleReportSubmit = async (e) => {
    e.preventDefault();

    if (
      !reportDetails.primaryDiagnosis ||
      !reportDetails.prescription ||
      !reportDetails.procedures
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      const endpoint = isEditing
        ? `${import.meta.env.VITE_API_BASE_URL}report/update`
        : `${import.meta.env.VITE_API_BASE_URL}report/create`;
      const method = isEditing ? "put" : "post";

      const response = await axios[method](endpoint, {
        aptID: searchAptID,
        primaryDiagnosis: reportDetails.primaryDiagnosis,
        prescription: reportDetails.prescription,
        procedures: reportDetails.procedures,
      });

      alert(response.data.message || "Report saved successfully!");
      setIsEditing(true);
      setError("");
    } catch (error) {
      console.error("Failed to save report:", error);
      alert("Failed to save report. Please try again.");
    }
  };

  const handlePrint = () => {
    if (!reportDetails || !appointmentDetails) {
      alert("No complete details available to print.");
      return;
    }

    const { appointment, patient, doctor } = appointmentDetails;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Report - Appointment ID: ${searchAptID}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; }
            .container { width: 80%; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fff; }
            h1, h2 { text-align: center; color: #007bff; }
            .section { margin-bottom: 20px; }
            .section ul { list-style-type: none; padding: 0; }
            .section li { margin-bottom: 10px; }
            .section li span { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Report - Appointment ID: ${searchAptID}</h1>
            <div class="section">
              <h2>Appointment Details</h2>
              <ul>
                <li><span>Appointment ID:</span> ${appointment.aptID}</li>
                <li><span>Date:</span> ${new Date(appointment.date).toLocaleDateString()}</li>
                <li><span>Time:</span> ${appointment.time}</li>
              </ul>
            </div>
            <div class="section">
              <h2>Patient Details</h2>
              <ul>
                <li><span>Name:</span> ${patient.name}</li>
                <li><span>Age:</span> ${patient.age}</li>
                <li><span>Gender:</span> ${patient.gender}</li>
              </ul>
            </div>
            <div class="section">
              <h2>Doctor Details</h2>
              <ul>
                <li><span>Name:</span> ${doctor.name}</li>
                <li><span>Specialization:</span> ${doctor.specialization}</li>
              </ul>
            </div>
            <div class="section">
              <h2>Report Details</h2>
              <ul>
                <li><span>Primary Diagnosis:</span> ${reportDetails.primaryDiagnosis}</li>
                <li><span>Prescription:</span> ${reportDetails.prescription}</li>
                <li><span>Procedures:</span> ${reportDetails.procedures}</li>
              </ul>
            </div>
            <div class="text-center mt-12">
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const validateForm = () =>
    reportDetails.primaryDiagnosis &&
    reportDetails.prescription &&
    reportDetails.procedures;

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold text-emerald-600 mb-10 text-center tracking-tight">
          Medova Hospital - Patient's Report
        </h1>

        {/* Appointment Dropdown */}
        <div className="mb-8">
          <label
            htmlFor="appointment"
            className="block text-gray-800 text-lg font-semibold mb-3"
          >
            Select Appointment ID
          </label>
          <select
            id="appointment"
            className="w-full p-3 border border-slate-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            value={aptID}
            onChange={(e) => {
              setAptID(e.target.value);
              setSearchAptID(e.target.value);
            }}
          >
            <option value="">Select Appointment ID</option>
            {appointments.map((apt) => (
              <option key={apt.aptID} value={apt.aptID}>
                {apt.aptID} - {apt.patientName}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment Details Card */}
        {appointmentDetails && (
          <section className="mb-10 bg-white rounded-xl shadow-2xl border border-slate-200 p-8">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-6 border-b border-slate-200 pb-2">
              Appointment Details
            </h2>
            <ul className="space-y-5 text-gray-700 text-lg">
              <li className="flex justify-between items-center">
                <span className="flex items-center gap-3 font-medium text-emerald-600">
                  <FaUser /> Patient Name:
                </span>
                <span>{appointmentDetails.patient.name}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="flex items-center gap-3 font-medium text-emerald-600">
                  <FaBirthdayCake /> Age:
                </span>
                <span>{appointmentDetails.patient.age}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="flex items-center gap-3 font-medium text-emerald-600">
                  <FaVenusMars /> Gender:
                </span>
                <span>{appointmentDetails.patient.gender}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="flex items-center gap-3 font-medium text-emerald-600">
                  <FaTooth /> Doctor:
                </span>
                <span>{appointmentDetails.doctor.name}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="flex items-center gap-3 font-medium text-emerald-600">
                  <FaCalendarAlt /> Date:
                </span>
                <span>
                  {new Date(appointmentDetails.appointment.date).toLocaleDateString()}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="flex items-center gap-3 font-medium text-emerald-600">
                  <FaClock /> Time:
                </span>
                <span>{appointmentDetails.appointment.time}</span>
              </li>
            </ul>
          </section>
        )}

        {/* Report Form */}
        {searchAptID && (
          <form onSubmit={handleReportSubmit} className="space-y-6 mb-10 bg-white p-8 rounded-xl shadow-2xl border border-slate-200">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-6 border-b border-slate-200 pb-2">
              {isEditing ? "Update Patient Report" : "Create Patient Report"}
            </h2>

            {[
              { id: "primaryDiagnosis", label: "Primary Diagnosis", value: reportDetails.primaryDiagnosis },
              { id: "prescription", label: "Prescription", value: reportDetails.prescription },
              { id: "procedures", label: "Procedures", value: reportDetails.procedures },
            ].map(({ id, label, value }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block text-gray-800 text-lg font-semibold mb-2"
                >
                  {label}
                </label>
                <textarea
                  id={id}
                  rows={4}
                  className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none transition"
                  value={value}
                  onChange={(e) =>
                    setReportDetails({ ...reportDetails, [id]: e.target.value })
                  }
                  required
                />
              </div>
            ))}

            {error && (
              <p className="text-red-600 font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={!validateForm()}
              className={`w-full py-3 rounded-lg text-white font-bold transition ${
                validateForm()
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-emerald-300 cursor-not-allowed"
              }`}
            >
              {isEditing ? "Update Report" : "Create Report"}
            </button>
          </form>
        )}

        {/* Print Button */}
        {isEditing && (
          <button
            onClick={handlePrint}
            className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Print Report
          </button>
        )}
      </main>
    </div>
  );
};

export default ReportD;