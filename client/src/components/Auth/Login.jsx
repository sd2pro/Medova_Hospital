// src/components/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}users/login`, {
        email,
        password,
      });

      const user = response.data.user;
      const token = response.data.token;

      localStorage.setItem("token", JSON.stringify(token));
      login(user);

      Swal.fire({
        title: "Success!",
        text: "You have logged in successfully.",
        icon: "success",
        position: "top-end",
        showConfirmButton: false,
        timer: 1300,
        toast: true,
        customClass: {
          popup: "rounded-lg p-2",
          title: "text-sm",
          content: "text-xs",
        },
        width: "300px",
      });
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text: "Invalid email or password. Please try again.",
        icon: "error",
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        toast: true,
        customClass: {
          popup: "rounded-lg p-2",
          title: "text-sm",
          content: "text-xs",
        },
        width: "300px",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden">
        {/* Left Banner */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-10 w-1/2">
          <h2 className="text-4xl font-bold mb-3">Medova Hospital</h2>
          <p className="text-lg leading-relaxed">
            Compassionate multi-speciality care you can trust. Your health is our mission.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white w-full md:w-1/2 p-8 md:p-10">
          <h2 className="text-3xl font-bold text-emerald-700 mb-6 text-center">
            Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-gray-800 font-semibold block mb-1">
                Email
              </label>
              <div className="flex items-center border border-slate-300 rounded-md focus-within:ring focus-within:ring-emerald-400 bg-gray-50">
                <FaEnvelope className="ml-3 text-emerald-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 focus:outline-none placeholder-emerald-400 bg-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-800 font-semibold block mb-1">
                Password
              </label>
              <div className="flex items-center border border-slate-300 rounded-md focus-within:ring focus-within:ring-emerald-400 bg-gray-50">
                <FaLock className="ml-3 text-emerald-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 focus:outline-none placeholder-emerald-400 bg-transparent"
                  required
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-md shadow-md hover:bg-emerald-700 transition"
            >
              Login
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-emerald-600 hover:underline text-sm"
            >
              Forgot Password?
            </button>
            <div className="mt-2 text-gray-600 text-sm">
              Don’t have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-emerald-600 font-medium hover:underline"
              >
                Register here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;