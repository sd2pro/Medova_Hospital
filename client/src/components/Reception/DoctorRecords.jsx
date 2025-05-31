import { useState, useEffect } from "react";
import axios from "axios";
import ReceptionNavbar from "./ReceptionNavbar";
import { FaSearch } from "react-icons/fa";

const DoctorRecords = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}profiles/getAllDoctors`);
      setDoctors(response.data.doctors);
      setFilteredDoctors(response.data.doctors);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch doctors");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const result = doctors.filter((doctor) =>
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.doctorId?.toString().includes(searchTerm)
    );
    setFilteredDoctors(result);
  }, [searchTerm, doctors]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });

    const sorted = [...filteredDoctors].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredDoctors(sorted);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-semibold text-emerald-600">Loading doctor records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <ReceptionNavbar />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        <h1 className="text-4xl font-bold text-center text-emerald-700 mb-4">Doctor Records</h1>

        {/* Search Input */}
        <div className="flex justify-end">
          <div className="relative w-full max-w-sm">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by Name or Doctor ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-md shadow focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full text-sm divide-y divide-slate-300">
            <thead className="bg-emerald-100 uppercase text-gray-800 tracking-wider">
              <tr>
                {["doctorId", "name", "specialization", "experience", "phone_no", "email"].map((key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-6 py-4 font-semibold text-left cursor-pointer hover:text-emerald-700 transition"
                  >
                    {key === "doctorId" ? "ID" :
                      key === "phone_no" ? "Phone" :
                      key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortConfig.key === key && (
                      <span className="ml-1 text-emerald-600">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor._id} className="hover:bg-emerald-50 transition">
                  <td className="px-6 py-4">{doctor.doctorId}</td>
                  <td className="px-6 py-4">{doctor.name}</td>
                  <td className="px-6 py-4">{doctor.specialization}</td>
                  <td className="px-6 py-4">{doctor.experience} yrs</td>
                  <td className="px-6 py-4">{doctor.phone_no}</td>
                  <td className="px-6 py-4">{doctor.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default DoctorRecords;