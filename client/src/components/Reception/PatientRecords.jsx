import { useState, useEffect } from "react";
import axios from "axios";

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}patient`);
      setPatients(response.data.patients);
      setFilteredPatients(response.data.patients);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch patients");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const result = patients.filter((patient) =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.pID?.toString().includes(searchTerm)
    );
    setFilteredPatients(result);
  }, [searchTerm, patients]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    const sortedPatients = [...filteredPatients].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredPatients(sortedPatients);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-emerald-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <h1 className="text-4xl font-bold text-center text-emerald-700">Patient Records</h1>

        {/* Search Bar */}
        <div className="flex justify-end">
          <input
            type="text"
            className="border border-slate-300 p-3 rounded-md w-1/3 shadow-md bg-white text-gray-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            placeholder="Search by Name or Patient ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-2xl bg-white">
          <table className="min-w-full divide-y divide-slate-300 text-sm text-gray-800">
            <thead className="bg-emerald-100 uppercase text-gray-800">
              <tr>
                {[
                  { label: "Patient ID", key: "pID" },
                  { label: "Name", key: "name" },
                  { label: "Age", key: "age" },
                  { label: "Gender", key: "gender" },
                  { label: "Phone", key: "phone_no" },
                  { label: "Address", key: "address" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-4 cursor-pointer hover:underline"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPatients.map((patient, index) => (
                <tr
                  key={patient._id}
                  className="hover:bg-emerald-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">{patient.pID}</td>
                  <td className="px-6 py-4">{patient.name}</td>
                  <td className="px-6 py-4">{patient.age}</td>
                  <td className="px-6 py-4">{patient.gender}</td>
                  <td className="px-6 py-4">{patient.phone_no}</td>
                  <td className="px-6 py-4">{patient.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;