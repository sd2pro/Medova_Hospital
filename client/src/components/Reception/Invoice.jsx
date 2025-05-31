import React, { useState, useEffect } from "react";
import axios from "axios";
import ReceptionNavbar from "./ReceptionNavbar";
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaTooth,
  FaVenusMars,
  FaBirthdayCake,
} from "react-icons/fa";

const Invoice = () => {
  const [aptID, setAptID] = useState("");
  const [searchAptID, setSearchAptID] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoice_date: new Date().toISOString().slice(0, 10),
    payment_status: false,
    items: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}appointments/getAllAppointments`
        );
        setAppointments(response.data.appointment || []);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        alert("Unable to fetch appointments. Please try again.");
      }
    };
    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!searchAptID) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}appointments/details/${searchAptID}`
        );
        setAppointmentDetails(response.data.details);
      } catch (error) {
        console.error("Failed to fetch appointment details:", error);
        alert("Unable to fetch appointment details. Please try again.");
      }
    };
    fetchAppointmentDetails();
  }, [searchAptID]);

  const fetchInvoice = async () => {
    if (!searchAptID) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}invoice/get`, {
        params: { aptID: searchAptID },
      });
      const { data } = response;
      if (data) {
        setInvoiceDetails({
          ...data,
          invoice_date: data.invoice_date
            ? new Date(data.invoice_date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        });
        setIsEditing(true);
      } else {
        alert("No invoice found. Switching to create mode.");
        setInvoiceDetails({
          invoice_date: new Date().toISOString().slice(0, 10),
          payment_status: false,
          items: [],
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      alert("Unable to fetch invoice. Switching to create mode.");
      setInvoiceDetails({
        invoice_date: new Date().toISOString().slice(0, 10),
        payment_status: false,
        items: [],
      });
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (searchAptID) fetchInvoice();
  }, [searchAptID]);

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceDetails.invoice_date || invoiceDetails.items.length === 0) {
      setError("All fields are required.");
      return;
    }
    try {
      const endpoint = isEditing
        ? `${import.meta.env.VITE_API_BASE_URL}invoice/update`
        : `${import.meta.env.VITE_API_BASE_URL}invoice/create`;
      const method = isEditing ? "put" : "post";
      const response = await axios[method](endpoint, {
        aptID: searchAptID,
        ...invoiceDetails,
      });
      alert(response.data.message || "Invoice saved successfully!");
      fetchInvoice();
      setIsEditing(true);
      setError("");
    } catch (error) {
      console.error("Failed to save invoice:", error);
      alert("Failed to save invoice. Please try again.");
    }
  };

  const handleAddItem = () => {
    setInvoiceDetails((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", amount: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setInvoiceDetails((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handlePrint = () => {
    if (!invoiceDetails || !appointmentDetails) {
      alert("No complete details available to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Appointment ID: ${searchAptID}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: #1f2937; /* gray-800 */
              background: #f9fafb; /* gray-50 */
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 30px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 10px 15px -3px rgba(4, 120, 87, 0.5);
            }
            h1, h2 {
              text-align: center;
              color: #047857; /* emerald-600 */
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section ul {
              list-style: none;
              padding-left: 0;
            }
            .section li {
              margin-bottom: 10px;
              font-size: 16px;
            }
            .section li span {
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              padding: 12px 10px;
              border: 1px solid #d1d5db; /* slate-300 */
              text-align: left;
            }
            th {
              background-color: #e6fffa; /* light emerald */
              color: #065f46; /* darker emerald */
            }
            .total {
              font-size: 18px;
              font-weight: 700;
              text-align: right;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Invoice - Appointment ID: ${searchAptID}</h1>

            <div class="section">
              <h2>Appointment Details</h2>
              <ul>
                <li><span>Appointment ID:</span> ${appointmentDetails.appointment.aptID}</li>
                <li><span>Date:</span> ${new Date(appointmentDetails.appointment.date).toLocaleDateString()}</li>
                <li><span>Time:</span> ${appointmentDetails.appointment.time}</li>
              </ul>
            </div>

            <div class="section">
              <h2>Patient Details</h2>
              <ul>
                <li><span>Name:</span> ${appointmentDetails.patient.name}</li>
                <li><span>Age:</span> ${appointmentDetails.patient.age}</li>
                <li><span>Gender:</span> ${appointmentDetails.patient.gender}</li>
              </ul>
            </div>

            <div class="section">
              <h2>Doctor Details</h2>
              <ul>
                <li><span>Name:</span> ${appointmentDetails.doctor.name}</li>
                <li><span>Specialization:</span> ${appointmentDetails.doctor.specialization}</li>
              </ul>
            </div>

            <div class="section">
              <h2>Invoice Details</h2>
              <p><span>Invoice Date:</span> ${new Date(invoiceDetails.invoice_date).toLocaleDateString()}</p>
              <p><span>Payment Status:</span> ${
                invoiceDetails.payment_status ? "Paid" : "Unpaid"
              }</p>

              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount (GBP)</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceDetails.items
                    .map(
                      (item) =>
                        `<tr><td>${item.description}</td><td>£${item.amount.toFixed(
                          2
                        )}</td></tr>`
                    )
                    .join("")}
                </tbody>
              </table>

              <p class="total">Total Amount: £${invoiceDetails.items
                .reduce((sum, item) => sum + item.amount, 0)
                .toFixed(2)}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ReceptionNavbar />
      <div className="flex justify-center px-5 py-10">
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-8 border border-slate-300">
          <h1 className="text-4xl font-extrabold text-emerald-600 mb-10 tracking-tight">
            Invoice
          </h1>

          {/* Appointment Select */}
          <div className="mb-8">
            <label
              htmlFor="appointment"
              className="block text-lg font-semibold text-gray-800 mb-3"
            >
              Select Appointment ID
            </label>
            <select
              id="appointment"
              value={aptID}
              onChange={(e) => {
                setAptID(e.target.value);
                setSearchAptID(e.target.value);
              }}
              className="w-full p-3 rounded-lg border border-slate-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            >
              <option value="" disabled>
                -- Choose Appointment --
              </option>
              {appointments.map((apt) => (
                <option key={apt.aptID} value={apt.aptID}>
                  {apt.aptID}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Details Card */}
          {appointmentDetails && (
            <div className="mb-10 bg-white shadow-md rounded-lg border border-slate-300 p-6">
              <h2 className="text-3xl font-semibold text-emerald-600 mb-6">
                Appointment Details
              </h2>
              <ul className="space-y-5 text-gray-700 text-lg">
                <li className="flex justify-between items-center">
                  <span className="flex items-center space-x-2 font-semibold text-emerald-600">
                    <FaUser />
                    <span>Patient Name:</span>
                  </span>
                  <span>{appointmentDetails.patient.name}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="flex items-center space-x-2 font-semibold text-emerald-600">
                    <FaBirthdayCake />
                    <span>Age:</span>
                  </span>
                  <span>{appointmentDetails.patient.age}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="flex items-center space-x-2 font-semibold text-emerald-600">
                    <FaVenusMars />
                    <span>Gender:</span>
                  </span>
                  <span>{appointmentDetails.patient.gender}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="flex items-center space-x-2 font-semibold text-emerald-600">
                    <FaTooth />
                    <span>Consulted Doctor:</span>
                  </span>
                  <span>{appointmentDetails.doctor.name}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="flex items-center space-x-2 font-semibold text-emerald-600">
                    <FaCalendarAlt />
                    <span>Date:</span>
                  </span>
                  <span>
                    {new Date(appointmentDetails.appointment.date).toLocaleDateString()}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="flex items-center space-x-2 font-semibold text-emerald-600">
                    <FaClock />
                    <span>Time:</span>
                  </span>
                  <span>{appointmentDetails.appointment.time}</span>
                </li>
              </ul>
            </div>
          )}

          {/* Invoice Form */}
          <form onSubmit={handleInvoiceSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="flex-1">
                <label
                  htmlFor="invoice_date"
                  className="block text-lg font-semibold text-gray-800 mb-2"
                >
                  Invoice Date
                </label>
                <input
                  type="date"
                  id="invoice_date"
                  value={invoiceDetails.invoice_date}
                  onChange={(e) =>
                    setInvoiceDetails((prev) => ({
                      ...prev,
                      invoice_date: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-lg border border-slate-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
                  required
                />
              </div>

              <div className="flex items-center mt-6 md:mt-0">
                <input
                  type="checkbox"
                  id="payment_status"
                  checked={invoiceDetails.payment_status}
                  onChange={(e) =>
                    setInvoiceDetails((prev) => ({
                      ...prev,
                      payment_status: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="payment_status"
                  className="ml-3 text-lg font-semibold text-gray-800 select-none"
                >
                  Payment Completed
                </label>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <h3 className="text-2xl font-semibold text-emerald-600 mb-4">
                Invoice Items
              </h3>
              {invoiceDetails.items.length === 0 && (
                <p className="text-gray-500 mb-3">No invoice items added.</p>
              )}

              {invoiceDetails.items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:space-x-4 mb-4 items-center"
                >
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...invoiceDetails.items];
                      newItems[index].description = e.target.value;
                      setInvoiceDetails((prev) => ({
                        ...prev,
                        items: newItems,
                      }));
                    }}
                    className="flex-1 p-3 rounded-lg border border-slate-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition mb-2 md:mb-0"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => {
                      const newItems = [...invoiceDetails.items];
                      newItems[index].amount = parseFloat(e.target.value) || 0;
                      setInvoiceDetails((prev) => ({
                        ...prev,
                        items: newItems,
                      }));
                    }}
                    className="w-32 p-3 rounded-lg border border-slate-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="ml-4 text-red-600 hover:text-red-800 font-semibold"
                    aria-label="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-block px-5 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 transition"
              >
                Add Item
              </button>
            </div>

            {error && (
              <p className="text-red-600 font-semibold mt-2" role="alert">
                {error}
              </p>
            )}

            <div className="mt-8 flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-700">
                Total Amount: £
                {invoiceDetails.items
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toFixed(2)}
              </p>

              <div className="space-x-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 transition"
                >
                  {isEditing ? "Update Invoice" : "Create Invoice"}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 transition"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Invoice;