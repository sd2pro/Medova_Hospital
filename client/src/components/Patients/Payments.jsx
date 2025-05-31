import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser,
  FaBirthdayCake,
  FaVenusMars,
  FaTooth,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import Navbar from "./PatientNavbar";

const Payments = () => {
  const { patientId } = useAuth();

  const [aptIds, setAptIds] = useState([]);
  const [selectedAptID, setSelectedAptID] = useState("");
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [invoiceError, setInvoiceError] = useState(false);

  useEffect(() => {
    const fetchAppointmentIDs = async () => {
      if (!patientId) return;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}appointments/getAllAppointmentsByPID`,
          {
            params: { pID: patientId },
          }
        );
        const ids = res.data.appointment.map((apt) => apt.aptID);
        setAptIds(ids);
      } catch (err) {
        console.error("Error fetching appointment IDs", err);
      }
    };

    fetchAppointmentIDs();
  }, [patientId]);

  useEffect(() => {
    if (!selectedAptID) {
      setAppointmentDetails(null);
      setInvoice(null);
      setInvoiceError(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const [aptRes, invoiceRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}appointments/details/${selectedAptID}`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}invoice/get`, {
            params: { aptID: selectedAptID },
          }),
        ]);
        setAppointmentDetails(aptRes.data.details);
        setInvoice(invoiceRes.data);
        setInvoiceError(false);
      } catch (error) {
        console.error("Error fetching details", error);
        setAppointmentDetails(null);
        setInvoice(null);
        setInvoiceError(true);
      }
    };

    fetchDetails();
  }, [selectedAptID]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!invoice || !invoice.items || !selectedAptID) return;

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Failed to load Razorpay SDK.");
      return;
    }

    const amount = invoice.items.reduce((acc, item) => acc + item.amount, 0);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}razorpay/order`, {
        amount: amount * 100, // in smallest currency unit (pence)
        currency: "GBP",
      });

      const { id: order_id } = res.data;

      const options = {
        key: "rzp_test_iYFDSVHVLuJcMw", // Your Razorpay test/live key
        amount: amount * 100,
        currency: "GBP",
        name: "Medova Hospital",
        description: "Invoice Payment",
        order_id,
        handler: async () => {
          try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}invoice/pay`, {
              aptID: selectedAptID,
            });

            const [aptRes, invoiceRes] = await Promise.all([
              axios.get(`${import.meta.env.VITE_API_BASE_URL}appointments/details/${selectedAptID}`),
              axios.get(`${import.meta.env.VITE_API_BASE_URL}invoice/get`, {
                params: { aptID: selectedAptID },
              }),
            ]);

            setAppointmentDetails(aptRes.data.details);
            setInvoice(invoiceRes.data);
            setInvoiceError(false);

            alert("Payment successful!");
          } catch (err) {
            console.error("Error updating after payment", err);
            alert("Payment succeeded but invoice update failed.");
          }
        },
        theme: { color: "#059669" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed", error);
    }
  };

  // Improved print handler
  const handlePrint = () => {
    if (!invoice || !appointmentDetails) {
      alert("No complete details available to print.");
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Invoice - Appointment ID: ${selectedAptID}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: #1f2937;
              background: #f9fafb;
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
              color: #047857;
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
              border: 1px solid #d1d5db;
              text-align: left;
            }
            th {
              background-color: #e6fffa;
              color: #065f46;
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
            <h1>Invoice - Appointment ID: ${selectedAptID}</h1>

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
                <li><span>Specialization:</span> ${appointmentDetails.doctor.specialization || "N/A"}</li>
              </ul>
            </div>

            <div class="section">
              <h2>Invoice Details</h2>
              <p><span>Invoice Date:</span> ${new Date(invoice.invoice_date).toLocaleDateString()}</p>
              <p><span>Payment Status:</span> ${
                invoice.payment_status ? "Paid" : "Unpaid"
              }</p>

              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount (GBP)</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items
                    .map(
                      (item) =>
                        `<tr><td>${item.description}</td><td>£${item.amount.toFixed(
                          2
                        )}</td></tr>`
                    )
                    .join("")}
                </tbody>
              </table>

              <p class="total">Total Amount: £${invoice.items
                .reduce((sum, item) => sum + item.amount, 0)
                .toFixed(2)}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load before triggering print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Close the window after printing with a delay to ensure print dialog shows
      setTimeout(() => printWindow.close(), 300);
    };
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto bg-gray-50 min-h-screen space-y-10">
        <h2 className="text-3xl font-semibold text-emerald-600 text-center">
          Pay Your Invoices
        </h2>

        {/* Dropdown Box */}
        <div className="border rounded-lg shadow p-6 bg-white">
          <label
            htmlFor="apt-select"
            className="block mb-3 text-lg font-medium text-gray-800"
          >
            Select Appointment
          </label>
          <select
            id="apt-select"
            className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            value={selectedAptID}
            onChange={(e) => setSelectedAptID(e.target.value)}
          >
            <option value="">-- Select Appointment --</option>
            {aptIds.map((aptID) => (
              <option key={aptID} value={aptID}>
                {aptID}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment Details Box */}
        {appointmentDetails && (
          <div className="border rounded-lg shadow p-6 bg-white">
            <h3 className="text-2xl font-semibold mb-4 text-emerald-700">
              Appointment Details
            </h3>
            <ul className="space-y-2 text-gray-800 text-lg">
              <li>
                <FaUser className="inline text-emerald-500 mr-2" />{" "}
                {appointmentDetails.patient.name}
              </li>
              <li>
                <FaBirthdayCake className="inline text-emerald-500 mr-2" /> Age:{" "}
                {appointmentDetails.patient.age}
              </li>
              <li>
                <FaVenusMars className="inline text-emerald-500 mr-2" /> Gender:{" "}
                {appointmentDetails.patient.gender}
              </li>
              <li>
                <FaTooth className="inline text-emerald-500 mr-2" /> Doctor:{" "}
                {appointmentDetails.doctor.name}
              </li>
              <li>
                <FaCalendarAlt className="inline text-emerald-500 mr-2" /> Date:{" "}
                {new Date(appointmentDetails.appointment.date).toLocaleDateString()}
              </li>
              <li>
                <FaClock className="inline text-emerald-500 mr-2" /> Time:{" "}
                {appointmentDetails.appointment.time}
              </li>
            </ul>
          </div>
        )}

        {/* Invoice Box */}
        {invoice ? (
          <div
            id="printable"
            className="border rounded-lg shadow p-6 bg-white"
          >
            <h3 className="text-2xl font-semibold mb-5 text-emerald-700">
              Invoice Details
            </h3>
            <p className="mb-1 text-gray-700">
              <strong>Invoice Date:</strong>{" "}
              {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
            <p
              className={`mb-4 font-semibold ${
                invoice.payment_status ? "text-green-600" : "text-red-600"
              }`}
            >
              Payment Status: {invoice.payment_status ? "Paid" : "Unpaid"}
            </p>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-100">
                  <th className="border border-gray-300 p-2">Description</th>
                  <th className="border border-gray-300 p-2">Amount (£)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 p-2">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-right font-bold mt-3 text-lg">
              Total: £
              {invoice.items
                .reduce((acc, item) => acc + item.amount, 0)
                .toFixed(2)}
            </p>

            {!invoice.payment_status && (
              <button
                onClick={handlePayment}
                className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition"
              >
                Pay Now
              </button>
            )}

            <button
              onClick={handlePrint}
              className="mt-6 ml-4 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
            >
              Print Invoice
            </button>
          </div>
        ) : invoiceError ? (
          <p className="text-center text-red-600 font-semibold mt-10">
            Invoice is not posted yet for this appointment.
          </p>
        ) : (
          selectedAptID && (
            <p className="text-center text-gray-600 font-medium mt-10">
              Loading invoice details...
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Payments;