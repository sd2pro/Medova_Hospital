import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/contexts/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Doctor from "./components/Doctors/Doctor";
import Receptionist from "./components/Reception/Receptionist";
import Patient from "./components/Patients/Patient";
import DoctorProfile from "./components/Doctors/DoctorProfile";
import Invoice from "./components/Reception/Invoice";
import DoctorSchedule from "./components/Doctors/DoctorSchedule";
import Profile from "./components/Patients/Profile";
import PatientReport from "./components/Patients/PatientReport";
import Payments from "./components/Patients/Payments";
import ReportD from "./components/Doctors/ReportsD";
import DoctorRecords from "./components/Reception/DoctorRecords";
import Footer from "./components/Footer";  

const App = () => {
  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {/* Main content area will grow to fill available space */}
          <div className="flex-grow">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" />} />

              <Route
                path="/doctor"
                element={<PrivateRoute role="Doctor" Component={Doctor} />}
              />
              <Route
                path="/doctor-profile"
                element={<PrivateRoute role="Doctor" Component={DoctorProfile} />}
              />
              <Route
                path="/doctorschedule"
                element={<PrivateRoute role="Doctor" Component={DoctorSchedule} />}
              />
              <Route
                path="/reportsd"
                element={<PrivateRoute role="Doctor" Component={ReportD} />}
              />

              <Route
                path="/patient"
                element={<PrivateRoute role="Patient" Component={Patient} />}
              />
              <Route
                path="/profile"
                element={<PrivateRoute role="Patient" Component={Profile} />}
              />
              <Route
                path="/patient-reports"
                element={<PrivateRoute role="Patient" Component={PatientReport} />}
              />
              <Route
                path="/patient-payments"
                element={<PrivateRoute role="Patient" Component={Payments} />}
              />

              <Route
                path="/receptionist"
                element={<PrivateRoute role="Receptionist" Component={Receptionist} />}
              />
              <Route
                path="/doctor-records"
                element={<PrivateRoute role="Receptionist" Component={DoctorRecords} />}
              />
              <Route
                path="/invoice"
                element={<PrivateRoute role="Receptionist" Component={Invoice} />}
              />
            </Routes>
          </div>

          {/* Footer always at bottom */}
          <Footer />

        </div>

        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
};

// Private Route Component
const PrivateRoute = ({ role, Component }) => {
  const { userRole } = useAuth();

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  return userRole === role ? <Component /> : <Navigate to="/login" />;
};

export default App;
