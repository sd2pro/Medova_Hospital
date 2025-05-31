import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import Navbar from './PatientNavbar';

const PatientProfile = () => {
  const { patientId } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    phone_no: "",
    past_history: "",
    current_status: "",
    address: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}patient/${patientId}`);
        if (response.data?.patient) {
          const p = response.data.patient;
          setFormData({
            name: p.name || "",
            dob: p.dob?.split("T")[0] || "",
            gender: p.gender || "",
            phone_no: p.phone_no || "",
            past_history: p.past_history || "",
            current_status: p.current_status || "",
            address: p.address || "",
          });
          setIsUpdating(true);
        }
      } catch (error) {
        toast.error(`Error fetching profile: ${error.response?.data?.message || error.message}`);
      }
    };
    if (patientId) fetchPatient();
  }, [patientId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const age = calculateAge(formData.dob);

    if (
      !formData.name || !formData.dob || !formData.gender || !formData.phone_no ||
      !formData.past_history || !formData.current_status || !formData.address
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone_no)) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    try {
      let res;
      if (isUpdating) {
        res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}patient/${patientId}`, { ...formData, age });
      } else {
        res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}patient`, { ...formData, age, pID: patientId });
      }

      if (res.data?.message) {
        toast.success(res.data.message);
        setIsUpdating(true);
      }
    } catch (error) {
      toast.error(`Failed to ${isUpdating ? "update" : "create"} profile: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center py-10 px-4">
        <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-emerald-600 mb-8">
            {isUpdating ? "Update" : "Create"} Patient Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-gray-800 font-medium mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-gray-800 font-medium mb-1">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-800 font-medium mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-800 font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                name="phone_no"
                value={formData.phone_no}
                maxLength={10}
                onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Past History */}
            <div>
              <label className="block text-gray-800 font-medium mb-1">Past Medical History *</label>
              <textarea
                name="past_history"
                value={formData.past_history}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Current Status */}
            <div>
              <label className="block text-gray-800 font-medium mb-1">Current Medical Status *</label>
              <textarea
                name="current_status"
                value={formData.current_status}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-800 font-medium mb-1">Residential Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-10 rounded-lg shadow-md transition"
              >
                {isUpdating ? "Update Profile" : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;