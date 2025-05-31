import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser, FaBirthdayCake, FaVenusMars, FaTooth, FaCalendarAlt, FaClock
} from "react-icons/fa";
import Navbar from "./PatientNavbar";

const PatientReport = () => {
  const { patientId } = useAuth();
  const [aptIds, setAptIds] = useState([]);
  const [selectedAptID, setSelectedAptID] = useState("");
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);

  useEffect(() => {
    const fetchAppointmentIDs = async () => {
      if (!patientId) return;

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}appointments/getAllAppointmentsByPID`, {
          params: { pID: patientId },
        });
        const ids = res.data.appointment.map((apt) => apt.aptID);
        setAptIds(ids);
      } catch (err) {
        console.error("Error fetching appointment IDs", err);
      }
    };

    fetchAppointmentIDs();
  }, [patientId]);

  useEffect(() => {
    if (!selectedAptID) return;

    const fetchDetails = async () => {
      try {
        const [aptRes, reportRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}appointments/details/${selectedAptID}`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}report/get`, {
            params: { aptID: selectedAptID },
          }),
        ]);

        setAppointmentDetails(aptRes.data.details);
        setReportDetails(reportRes.data.report);
      } catch (error) {
        console.error("Error fetching appointment or report", error);
        alert("Could not load report.");
        setAppointmentDetails(null);
        setReportDetails(null);
      }
    };

    fetchDetails();
  }, [selectedAptID]);

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
            color: black;
            font-size: 14pt;
          }
          select, button, label[for="apt-select"], #apt-select {
            display: none !important;
          }
          textarea {
            border: none !important;
            background: transparent !important;
            resize: none !important;
            font-family: inherit;
            font-size: 14pt;
          }
          h1, h2 {
            color: #047857; /* emerald-700 */
          }
        }
      `}</style>

      <Navbar />
      <div className="flex justify-center items-start min-h-screen bg-gray-50 px-4 py-10">
        <div
          id="printable-area"
          className="w-full max-w-3xl bg-white rounded-lg shadow-2xl border border-slate-300 p-8 space-y-6"
        >
          <h1 className="text-3xl font-extrabold text-emerald-600 text-center">
            Your Appointment Reports
          </h1>

          {/* Dropdown */}
          <div className="space-y-2">
            <label
              htmlFor="apt-select"
              className="block text-lg font-semibold text-gray-800"
            >
              Select Appointment ID:
            </label>
            <select
              id="apt-select"
              className="w-full p-3 border border-slate-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              value={selectedAptID}
              onChange={(e) => setSelectedAptID(e.target.value)}
            >
              <option value="">-- Select Appointment --</option>
              {aptIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Details */}
          {appointmentDetails && (
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-emerald-700 border-b border-emerald-200 pb-2">
                Appointment Info
              </h2>
              <ul className="text-gray-800 text-lg space-y-2">
                <li>
                  <FaUser className="inline text-emerald-500 mr-2" />
                  {appointmentDetails.patient.name}
                </li>
                <li>
                  <FaBirthdayCake className="inline text-emerald-500 mr-2" />
                  Age: {appointmentDetails.patient.age}
                </li>
                <li>
                  <FaVenusMars className="inline text-emerald-500 mr-2" />
                  Gender: {appointmentDetails.patient.gender}
                </li>
                <li>
                  <FaTooth className="inline text-emerald-500 mr-2" />
                  Doctor: {appointmentDetails.doctor.name}
                </li>
                <li>
                  <FaCalendarAlt className="inline text-emerald-500 mr-2" />
                  Date:{" "}
                  {new Date(appointmentDetails.appointment.date).toLocaleDateString()}
                </li>
                <li>
                  <FaClock className="inline text-emerald-500 mr-2" />
                  Time: {appointmentDetails.appointment.time}
                </li>
              </ul>
            </section>
          )}

          {/* Report Section */}
          {reportDetails ? (
            <section className="space-y-5">
              <h2 className="text-2xl font-semibold text-emerald-700 border-b border-emerald-200 pb-2">
                Report
              </h2>

              {[
                { label: "Primary Diagnosis", value: reportDetails.primaryDiagnosis },
                { label: "Prescription", value: reportDetails.prescription },
                { label: "Procedures", value: reportDetails.procedures },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1">
                  <label className="block font-semibold text-emerald-600">{label}:</label>
                  <textarea
                    readOnly
                    className="w-full p-3 bg-gray-100 border border-slate-300 rounded-md resize-none text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    rows={3}
                    value={value || ""}
                  />
                </div>
              ))}

              {/* Print Button */}
              <div className="flex justify-center mt-6 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded shadow-md transition duration-200"
                >
                  Print Report
                </button>
              </div>
            </section>
          ) : (
            selectedAptID && (
              <p className="text-red-600 font-semibold mt-6 text-center">
                No Report Found. Please wait until doctor uploads your report.
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default PatientReport;