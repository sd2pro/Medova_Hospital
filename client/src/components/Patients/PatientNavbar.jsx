import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-50 shadow-md border-b border-slate-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo + Title */}
        <div className="flex items-center space-x-3">
          <img
            src="/src/assets/Images/logo.png"
            alt="Medova Logo"
            className="h-12 w-12 rounded-md shadow-md"
          />
          <div className="text-3xl font-extrabold text-gray-800 select-none">
            Medova
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-10 text-gray-800 font-semibold">
          {[
            { name: "Home", path: "/patient" },
            { name: "Profile", path: "/profile" },
            { name: "Reports", path: "/patient-reports" },
            { name: "Payments", path: "/patient-payments" },
          ].map(({ name, path }) => (
            <Link
              key={path}
              to={path}
              className={`relative py-2 text-lg transition duration-200 ${
                isActive(path)
                  ? "text-emerald-600 after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-emerald-600 after:rounded-full"
                  : "hover:text-emerald-600"
              }`}
            >
              {name}
            </Link>
          ))}
          <Link
            to="/"
            className="ml-6 px-5 py-2 bg-emerald-600 text-white rounded-md shadow-md hover:bg-emerald-700 transition duration-200"
          >
            Logout
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
            aria-label="Toggle Menu"
          >
            <svg
              className="w-7 h-7 text-gray-800"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>

          {/* Mobile Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-16 right-4 bg-white border border-slate-300 rounded-lg shadow-md w-48 text-gray-800 font-semibold flex flex-col">
              {[
                { name: "Home", path: "/patient" },
                { name: "Profile", path: "/profile" },
                { name: "Reports", path: "/patient-reports" },
                { name: "Payments", path: "/patient-payments" },
              ].map(({ name, path }, idx, arr) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-6 py-3 text-lg transition duration-200 ${
                    isActive(path)
                      ? "bg-emerald-100 text-emerald-600"
                      : "hover:bg-emerald-50"
                  } ${idx === arr.length - 1 ? "rounded-b-lg" : ""}`}
                >
                  {name}
                </Link>
              ))}

              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-6 py-3 bg-emerald-600 text-white rounded-b-lg hover:bg-emerald-700 transition duration-200"
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

export default Navbar;