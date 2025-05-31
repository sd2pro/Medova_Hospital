import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaUserShield,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Swal from "sweetalert2";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Passwords do not match!",
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      return;
    }

    try {
      const payload = {
        email,
        password,
        confirm_password: confirmPassword,
        role,
      };

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}users/register`, payload);

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You can now log in!",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      navigate("/login");
    } catch (error) {
      const msg =
        error.response?.data?.email ||
        error.response?.data?.username ||
        error.response?.data?.detail ||
        "Registration failed. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: msg,
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden">
        {/* Branding Section (Left) */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-10 w-1/2">
          <h2 className="text-4xl font-bold mb-3">Medova Hospital</h2>
          <p className="text-lg leading-relaxed">
            Compassionate multi-speciality care you can trust. Your health is our mission.
          </p>
        </div>

        {/* Register Form (Right) */}
        <div className="bg-white w-full md:w-1/2 p-8 md:p-10">
          <h2 className="text-3xl font-bold text-emerald-700 mb-6 text-center">
            Join Us Here
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block mb-1 text-gray-800 font-semibold">Email</label>
              <div className="flex items-center border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-emerald-400">
                <FaEnvelope className="ml-3 text-emerald-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full p-3 bg-gray-50 focus:outline-none rounded-r-md placeholder-emerald-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-gray-800 font-semibold">Password</label>
              <div className="flex items-center border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-emerald-400">
                <FaLock className="ml-3 text-emerald-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  className="w-full p-3 bg-gray-50 focus:outline-none rounded-r-md placeholder-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="mr-3 text-emerald-500 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-1 text-gray-800 font-semibold">
                Confirm Password
              </label>
              <div className="flex items-center border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-emerald-400">
                <FaLock className="ml-3 text-emerald-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  className="w-full p-3 bg-gray-50 focus:outline-none rounded-r-md placeholder-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="mr-3 text-emerald-500 focus:outline-none"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block mb-1 text-gray-800 font-semibold">Role</label>
              <div className="flex items-center border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-emerald-400">
                <FaUserShield className="ml-3 text-emerald-500" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-50 text-emerald-800 focus:outline-none rounded-r-md"
                >
                  <option value="">Select Role</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Patient">Patient</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-md shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition duration-300"
            >
              Register
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-5 text-center">
            <p className="text-gray-700">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;