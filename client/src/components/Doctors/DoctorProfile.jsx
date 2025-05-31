import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DoctorNavbar from './DoctorNavbar';
import { useAuth } from "../contexts/AuthContext";
import { FaUser, FaPhone, FaBriefcase, FaMedkit } from "react-icons/fa";

const DoctorProfile = () => {
  const { doctorId } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone_no: '',
    experience: '',
    specialization: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}profiles/doctor`, {
          params: { doctorId }
        });

        if (response.data && response.data.doctor) {
          const profile = response.data.doctor;
          setFormData({
            name: profile.name,
            phone_no: profile.phone_no,
            experience: profile.experience,
            specialization: profile.specialization,
          });
          setIsUpdating(true);
        } else {
          setIsUpdating(false);
        }
      } catch (error) {
        toast.error(`Failed to fetch doctor profile: ${error.response?.data?.message || error.message}`);
      }
    };

    if (doctorId) fetchProfile();
  }, [doctorId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isUpdating) {
        response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}profiles/doctor`, {
          ...formData,
          doctorId,
        });
      } else {
        response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}profiles/doctor`, {
          ...formData,
          doctorId,
        });
      }
      if (response.data && response.data.message) {
        toast.success(response.data.message);
        setIsUpdating(true);
      }
    } catch (error) {
      toast.error(`Failed to ${isUpdating ? 'update' : 'create'} doctor profile: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <>
      <DoctorNavbar />
      <div className="min-h-screen bg-gray-50 flex justify-center items-center px-5 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          <h2 className="text-3xl font-extrabold text-center text-emerald-600 select-none">
            {isUpdating ? 'Update' : 'Create'} Your Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { icon: <FaUser className="text-emerald-600" />, label: "Name", name: "name", type: "text", maxLength: null },
              { icon: <FaPhone className="text-emerald-600" />, label: "Phone Number", name: "phone_no", type: "text", maxLength: 10 },
              { icon: <FaBriefcase className="text-emerald-600" />, label: "Experience", name: "experience", type: "text", maxLength: null },
              { icon: <FaMedkit className="text-emerald-600" />, label: "Specialization", name: "specialization", type: "text", maxLength: null },
            ].map(({ icon, label, name, type, maxLength }) => (
              <div key={name} className="space-y-1">
                <label htmlFor={name} className="flex items-center space-x-2 text-gray-800 font-semibold select-none">
                  {icon}
                  <span>{label}</span>
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  maxLength={maxLength || undefined}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent
                    transition-shadow duration-300"
                />
              </div>
            ))}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-12 rounded-lg font-semibold text-lg shadow-md transition duration-300"
              >
                {isUpdating ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DoctorProfile;