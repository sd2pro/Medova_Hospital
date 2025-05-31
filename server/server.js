const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
const cors = require("cors");

const userRoutes = require("./routes/userRoute");
const profileRoutes = require("./routes/profileRoute"); 
const patientRoutes = require("./routes/patientRoute");
const appointmentRoutes = require("./routes/appointmentRoute");
const reportRoutes = require("./routes/reportRoute");
const invoiceRoutes = require("./routes/invoiceRoute");
const razorpayRoutes = require("./routes/razorpayRoute");

const app = express();
env.config(); // Load .env

// CORS setup: allow both localhost and your Render frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",                 // Dev frontend
      "https://your-frontend.onrender.com",    // Prod frontend (Replace with your actual domain)
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true, // Optional: if using cookies or auth headers
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/razorpay", razorpayRoutes);

// Listen on PORT from env or fallback to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Atlas Database connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });