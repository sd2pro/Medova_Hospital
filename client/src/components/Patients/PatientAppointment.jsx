import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

const PatientAppointment = () => {
  const { patientId } = useAuth();
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");


  // Fetch patient and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, patientRes] = await Promise.allSettled([
          axios.get(
            `${import.meta.env.VITE_API_BASE_URL}profiles/getAllDoctors`
          ),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}patient/${patientId}`),
        ]);

        // Handle doctors
        if (doctorRes.status === "fulfilled") {
          setDoctors(doctorRes.value.data.doctors || []);
        } else {
          toast.error("Failed to fetch doctors list.");
        }

        // Handle patient
        if (patientRes.status === "fulfilled") {
          setPatient(patientRes.value.data.patient);
        } else if (
          patientRes.reason.response &&
          patientRes.reason.response.status === 404
        ) {
          toast.info(
            "Please complete your profile before booking an appointment."
          );
          setPatient(null); // optional, just to be safe
        } else {
          toast.error("Error fetching your profile.");
        }
      } catch (err) {
        toast.error("Unexpected error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  // Fetch available slots
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      setSlotsLoading(true);
      const url = `${import.meta.env.VITE_API_BASE_URL}appointments/${selectedDoctorId}/available-slots/${selectedDate}`;
      console.log("Sending request to:", url);
      axios
        .get(url)
        .then((res) => {
          console.log("Received response:", res.data);
          setAvailableTimeSlots(res.data.availableSlots || []);
        })
        .catch((err) => {
          console.error("Error fetching slots:", err);
          setAvailableTimeSlots([]);
          setError("Could not load slots.");
        })
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedDoctorId, selectedDate]);

  const handleAppointment = () => {
    if (!selectedDoctorId || !selectedDate || !selectedTimeSlot || !reason) {
      toast.error("Please complete all fields.");
      return;
    }

    const appointmentData = {
      pID: patientId,
      doctorId: selectedDoctorId,
      date: selectedDate,
      slot: selectedTimeSlot,
      reason,
    };

    console.log("Creating appointment with:", appointmentData);

    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}appointments/create`, appointmentData)
      .then(() => {
        toast.success("Appointment booked successfully!");
        setSelectedDate("");
        setSelectedTimeSlot("");
        setReason("");
        setAvailableTimeSlots([]);
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message || "Failed to create appointment.";
        Swal.fire({ icon: "error", title: "Error", text: errorMessage });
      });
  };

  if (loading) {
    return (
      <div className="text-center text-lg text-teal-600 font-medium">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start p-6">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-lg p-10 border border-slate-300 mt-10">
        <h2 className="text-4xl font-extrabold text-emerald-600 mb-10 text-center tracking-wide">
          Book Appointment
        </h2>

        {patient && (
          <div className="mb-8 text-gray-800 space-y-1 text-center font-semibold">
            <p>
              <span className="text-gray-500">Patient Name: </span>
              {patient.name}
            </p>
            <p>
              <span className="text-gray-500">Age: </span> {patient.age}
            </p>
          </div>
        )}

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col">
            <label
              htmlFor="doctor"
              className="mb-2 text-lg font-medium text-gray-800"
            >
              Select Doctor:
            </label>
            <select
              id="doctor"
              className="p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedDate("");
                setSelectedTimeSlot("");
                setAvailableTimeSlots([]);
              }}
            >
              <option value="">Select a Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctorId} value={doctor.doctorId}>
                  {doctor.name} ({doctor.doctorId})
                </option>
              ))}
            </select>
          </div>

          {selectedDoctorId && (
            <div className="flex flex-col">
              <label
                htmlFor="date"
                className="mb-2 text-lg font-medium text-gray-800"
              >
                Select Date:
              </label>
              <input
                id="date"
                type="date"
                className="p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeSlot("");
                }}
              />
            </div>
          )}

          {selectedDate && slotsLoading && (
            <p className="text-center text-gray-600 italic">Loading available slots...</p>
          )}

          {selectedDate && !slotsLoading && (
            <>
              {availableTimeSlots.length > 0 ? (
                <div className="flex flex-col">
                  <label
                    htmlFor="timeslot"
                    className="mb-2 text-lg font-medium text-gray-800"
                  >
                    Select Time Slot:
                  </label>
                  <select
                    id="timeslot"
                    className="p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  >
                    <option value="">Choose a time slot</option>
                    {availableTimeSlots.map((slot, idx) => (
                      <option key={idx} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-red-600 font-semibold">
                  Sorry, Doctor is not available on {selectedDate}
                </p>
              )}
            </>
          )}

          {selectedDate && (
            <div className="flex flex-col">
              <label
                htmlFor="reason"
                className="mb-2 text-lg font-medium text-gray-800"
              >
                Reason for Appointment:
              </label>
              <textarea
                id="reason"
                className="p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-y min-h-[100px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-md shadow-md hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAppointment}
            disabled={!selectedTimeSlot || !reason}
          >
            Book your Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientAppointment;
