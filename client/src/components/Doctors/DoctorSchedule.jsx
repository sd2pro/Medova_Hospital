import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // Access doctorId from context
import { toast } from "react-toastify";
import DoctorNavbar from "./DoctorNavbar";

// Helper function to generate 20-minute time slots
const generateSlots = (startTime, endTime) => {
  const slots = [];
  let start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  while (start < end) {
    const nextSlot = new Date(start.getTime() + 20 * 60 * 1000);
    slots.push(start.toTimeString().substring(0, 5)); // Add HH:mm format
    start = nextSlot;
  }

  return slots;
};

const DoctorSchedule = () => {
  const { doctorId } = useAuth(); // Get doctorId from the context
  const [timeRanges, setTimeRanges] = useState([
    { startTime: "", endTime: "" },
  ]); // For handling multiple time ranges
  const [loading, setLoading] = useState(false); // For loading state
  const [error, setError] = useState(""); // For error state
  const [availableTime, setAvailableTime] = useState([]); // Store generated time slots
  const [availableSlots, setAvailableSlots] = useState([]); // Store available slots from API
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // returns 'YYYY-MM-DD'
};

const [date, setDate] = useState(getTodayDate());

  // Fetch available slots when component mounts or doctorId/date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId || !date) return; // Avoid unnecessary API calls

      setLoading(true);
      setError(""); // Clear previous errors

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}appointments/${doctorId}/available-slots/${date}`
        );

        const { availableSlots } = response.data; // Extract available slots from the API response
        if (availableSlots && availableSlots.length > 0) {
          setAvailableSlots(availableSlots);
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error(err);
        // setError(err.response?.data?.message || "Failed to fetch available slots.");
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, date]);

  // Fetch existing schedule when the component mounts or doctorId changes
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}appointments/schedule?doctorId=${doctorId}&date=${date}`
        );
        if (
          response.data.schedule &&
          response.data.schedule.availableTime.length > 0
        ) {
          setAvailableTime(response.data.schedule.availableTime); // Set available times
        } else {
          setAvailableTime([]); // If no schedule, show empty
        }
      } catch (err) {
        setAvailableTime([]); // If error, assume no schedule
        // setError("Error fetching schedule.");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchSchedule();
    }
  }, [doctorId, date]);

  // Handle form submission to create or update schedule
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error state

    // Generate slots for all time ranges
    const generatedSlots = timeRanges.flatMap((range) =>
      generateSlots(range.startTime, range.endTime)
    );

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}appointments/schedule`,
        {
          doctorId,
          date, // Use the selected date
          timeRanges: timeRanges, // Send time ranges to the backend
        }
      );
      toast.success(response.data.message); // Show success message
      setAvailableTime(generatedSlots); // Update the UI with generated slots
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Error updating schedule.");
      toast.error(error);
    }
  };

  // Handle adding/removing time ranges
  const handleTimeRangeChange = (index, field, value) => {
    const newRanges = [...timeRanges];
    newRanges[index][field] = value;
    setTimeRanges(newRanges);
  };

  const handleAddTimeRange = () => {
    setTimeRanges([...timeRanges, { startTime: "", endTime: "" }]);
  };

  const handleRemoveTimeRange = (index) => {
    const newRanges = [...timeRanges];
    newRanges.splice(index, 1);
    setTimeRanges(newRanges);
  };

  return (
  <>
    <DoctorNavbar />
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-5 py-12">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 space-y-8">
        <h2 className="text-3xl font-extrabold text-center text-emerald-600 select-none">
          Manage Your Schedule
        </h2>

        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-md">
            {error}
          </div>
        )}

        {availableTime.length === 0 && !loading && (
          <div className="p-4 mb-4 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md">
            No schedule found on {date}. Please create a new one.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="date"
              className="block mb-2 text-emerald-600 font-semibold"
            >
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-3 border border-slate-300 rounded-lg text-gray-800
                focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent
                transition duration-300"
            />
          </div>

          {timeRanges.map((range, index) => (
            <div key={index} className="flex flex-wrap gap-6 items-end">
              <div className="flex-1 min-w-[140px]">
                <label
                  htmlFor={`startTime-${index}`}
                  className="block mb-2 text-emerald-600 font-semibold"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  id={`startTime-${index}`}
                  value={range.startTime}
                  onChange={(e) =>
                    handleTimeRangeChange(index, "startTime", e.target.value)
                  }
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent
                    transition duration-300"
                />
              </div>

              <div className="flex-1 min-w-[140px]">
                <label
                  htmlFor={`endTime-${index}`}
                  className="block mb-2 text-emerald-600 font-semibold"
                >
                  End Time
                </label>
                <input
                  type="time"
                  id={`endTime-${index}`}
                  value={range.endTime}
                  onChange={(e) =>
                    handleTimeRangeChange(index, "endTime", e.target.value)
                  }
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent
                    transition duration-300"
                />
              </div>

              {timeRanges.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTimeRange(index)}
                  className="text-red-600 hover:text-red-700 font-semibold mb-1"
                  aria-label="Remove time range"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <div>
            <button
              type="button"
              onClick={handleAddTimeRange}
              className="text-emerald-600 font-semibold hover:underline"
            >
              + Add Another Time Range
            </button>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`bg-emerald-600 text-white py-3 px-12 rounded-lg font-semibold shadow-md transition duration-300
                hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Updating..." : "Save"}
            </button>
          </div>
        </form>

        {availableSlots.length > 0 && !loading && (
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-emerald-600 select-none">
              Available Slots:
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {availableSlots.map((slot, index) => (
                <div
                  key={index}
                  className="bg-emerald-100 text-emerald-800 text-center py-2 rounded-lg shadow-md
                    hover:bg-emerald-200 transition"
                >
                  <span className="text-xl font-semibold">{slot}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </>
);
};

export default DoctorSchedule;
