import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const DoctorNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-50 shadow-md border-b border-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <img
            src="/src/assets/Images/logo.png"
            alt="Medova Logo"
            className="h-12 w-12 rounded-full shadow-md"
          />
          <div className="text-2xl font-semibold text-gray-800 select-none">Medova</div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-10 items-center">
          {["/doctor", "/doctor-profile", "/doctorschedule", "/reportsd"].map((path, idx) => {
            const label = {
              "/doctor": "Home",
              "/doctor-profile": "Profile",
              "/doctorschedule": "Schedule",
              "/reportsd": "Patients",
            }[path];
            return (
              <Link
                key={idx}
                to={path}
                className={`text-gray-800 text-lg font-medium transition duration-200 px-3 py-2 rounded-md
                  ${
                    isActive(path)
                      ? "underline decoration-emerald-600 decoration-2"
                      : "hover:text-emerald-600 hover:bg-gray-100"
                  }`}
                tabIndex={0}
              >
                {label}
              </Link>
            );
          })}

          {/* Logout Button */}
          <Link
            to="/"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md font-semibold shadow-md transition duration-200"
            tabIndex={0}
          >
            Logout
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="absolute top-16 right-4 w-48 bg-white rounded-md shadow-2xl ring-1 ring-black ring-opacity-5 z-20">
              {["/doctor", "/doctor-profile", "/doctorschedule", "/reportsd"].map((path, idx) => {
                const label = {
                  "/doctor": "Home",
                  "/doctor-profile": "Profile",
                  "/doctorschedule": "Schedule",
                  "/reportsd": "Patients",
                }[path];
                return (
                  <Link
                    key={idx}
                    to={path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-6 py-3 text-gray-800 text-lg font-medium rounded-t-md transition duration-200
                      ${
                        isActive(path)
                          ? "underline decoration-emerald-600 decoration-2 bg-gray-50"
                          : "hover:bg-emerald-50"
                      }`}
                    tabIndex={0}
                  >
                    {label}
                  </Link>
                );
              })}

              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-b-md hover:bg-emerald-700 transition duration-200"
                tabIndex={0}
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavbar;