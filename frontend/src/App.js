// App.js - Version corrigée avec seulement les composants existants
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Composants existants
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Professionnel from './components/Professionnel';
import NosMedecin from './components/NosMedecin';
import ProtectedRoute, {PublicRoute, UnauthorizedPage} from './components/ProtectedRoute';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';
import UserManagement from './pages/admin/UserManagement';

// Assistant
import AssistantLayout from './layouts/AssistantLayout';
import AssistantDashboard from './pages/assistant/AssistantDashboard';
import AssistantAppointments from './pages/assistant/AssistantAppointments';
import AssistantPatients from './pages/assistant/AssistantPatients';
import AssistantProfile from './pages/assistant/AssistantProfile';

// Doctor
import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAgenda from './pages/doctor/DoctorAgenda';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorSettings from './pages/doctor/DoctorSettings';
import DoctorImaging from './pages/doctor/DoctorImaging';
import DoctorMedicalRecord from './pages/doctor/DoctorMedicalRecord';

// Patient
import PatientLayout from './layouts/PatientLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientProfile from './pages/patient/PatientProfile';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecord';
import PatientHealthTracking from './pages/patient/PatientHealthTracking';
import PatientDoctor from './pages/patient/PatientDoctors';
import PatientPrescription from './pages/patient/PatientPrescriptions';
import PatientMessages from './pages/patient/PatientMessages';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/professionnel" element={<Professionnel />} />
            <Route path="/nosmedecin" element={<NosMedecin />} />
            
            {/* Routes Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Routes Assistant */}
            <Route path="/assistant" element={<AssistantLayout />}>
              <Route index element={<AssistantDashboard />} />
              <Route path="appointments" element={<AssistantAppointments />} />
              <Route path="patients" element={<AssistantPatients />} />
              <Route path="profile" element={<AssistantProfile />} />
            </Route>

            {/* Routes Doctor */}
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route index element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="agenda" element={<DoctorAgenda />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="settings" element={<DoctorSettings />} />
              <Route path="imaging" element={<DoctorImaging />} />
            </Route>

            {/* Routes Patient */}
            <Route path="/patient" element={<PatientLayout />}>
              <Route index element={<PatientDashboard />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="medicalrecords" element={<PatientMedicalRecords />} />
              <Route path="healthtracking" element={<PatientHealthTracking />} />
              <Route path="doctors" element={<PatientDoctor />} />
              <Route path="prescriptions" element={<PatientPrescription />} />
              <Route path="messages" element={<PatientMessages />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* Routes protégées */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Routes doctor */}
            <Route path="/doctor/prescriptions/new" element={<PrivateRoute role="doctor"><DoctorPrescriptions /></PrivateRoute>} />
            <Route path="/doctor/patients/:patientId/medical-record" element={<PrivateRoute role="doctor"><DoctorMedicalRecord /></PrivateRoute>} />
            
            {/* Route par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;