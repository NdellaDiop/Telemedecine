// App.js - Version corrigée avec seulement les composants existants
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Composants existants
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Professionnel from './components/Professionnel';
import NosMedecin from './components/NosMedecin';
import ProtectedRoute, {PublicRoute, UnauthorizedPage} from './components/ProtectedRoute';
// Admin (que nous venons de créer)
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';

// Doctor (que nous venons de créer)
import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAgenda from './pages/doctor/DoctorAgenda';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorSettings from './pages/doctor/DoctorSettings';

//Patient (que nous n'avons pas encore créé)
import PatientLayout from './layouts/PatientLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientProfile from './pages/patient/PatientProfile';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecord';
import PatientHealthTracking from './pages/patient/PatientHealthTracking';
// import PatientNotifications from './pages/patient/PatientNotifications';
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
            {/* 
              
              <Route path="notifications" element={<PatientNotifications />} />
              
            </Route>
            */}

            {/* Routes protégées */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Route par défaut pour éviter les erreurs */}
            <Route path="*" element={<div>Page non trouvée</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;