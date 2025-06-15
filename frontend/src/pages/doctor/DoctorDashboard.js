import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Alert, ListGroup, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, faUsers, faBell, faChartLine, faCheckCircle,
  faUserMd, faStethoscope, faClock, faHourglassHalf, faExclamationTriangle,
  faCalendarPlus, faEye, faPhone, faEnvelope, faMapMarkerAlt, faPills, 
  faFileAlt, faBan, faArrowRight, faPlus, faCalendarDay, faUserCheck, 
  faHeartbeat, faChartBar, faRefresh, faArrowUp, faArrowDown, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement 
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState('');
  
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    todayAppointments: [],
    pendingAppointments: [],
    notifications: [],
    patients: [],
    stats: {
      totalAppointments: 0,
      pendingRequests: 0,
      todayAppointments: 0,
      totalPatients: 0,
      completedToday: 0,
      unreadNotifications: 0
    }
  });

  useEffect(() => {
    if (user && user.id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // 1. Charger les rendez-vous du médecin depuis le système patient
      const appointments = await loadDoctorAppointments();
      
      // 2. Charger les notifications
      const notifications = await loadDoctorNotifications();
      
      // 3. Extraire les patients uniques
      const patients = extractUniquePatients(appointments);
      
      // 4. Calculer les statistiques
      const stats = calculateStats(appointments, notifications, patients);
      
      // 5. Filtrer les RDV d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(apt => apt.date === today);
      
      // 6. Filtrer les demandes en attente
      const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

      setDashboardData({
        appointments,
        todayAppointments,
        pendingAppointments,
        notifications,
        patients,
        stats
      });
      
    } catch (error) {
      console.error('Erreur chargement dashboard médecin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les RDV du médecin (intégration avec le système patient)
  const loadDoctorAppointments = async () => {
    try {
      // Charger TOUS les RDV de ce médecin créés par les patients
      const storedAppointments = localStorage.getItem(`appointments_doctor_${user.id}`);
      if (storedAppointments) {
        const appointments = JSON.parse(storedAppointments);
        console.log('RDV médecin chargés:', appointments);
        return appointments;
      }
      return [];
    } catch (error) {
      console.error('Erreur chargement RDV médecin:', error);
      return [];
    }
  };

  // Charger les notifications du médecin
  const loadDoctorNotifications = async () => {
    try {
      const storedNotifications = localStorage.getItem(`notifications_doctor_${user.id}`);
      if (storedNotifications) {
        return JSON.parse(storedNotifications);
      }
      return [];
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      return [];
    }
  };

  // Extraire les patients uniques des RDV
  const extractUniquePatients = (appointments) => {
    const uniquePatients = [];
    const patientIds = new Set();
    
    appointments.forEach(apt => {
      if (!patientIds.has(apt.patient_id)) {
        patientIds.add(apt.patient_id);
        uniquePatients.push({
          id: apt.patient_id,
          name: apt.patient_name || 'Patient',
          lastVisit: apt.date,
          appointmentsCount: appointments.filter(a => a.patient_id === apt.patient_id).length,
          status: 'active'
        });
      }
    });
    
    return uniquePatients;
  };

  // Calculer les statistiques
  const calculateStats = (appointments, notifications, patients) => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalAppointments: appointments.length,
      pendingRequests: appointments.filter(apt => apt.status === 'pending').length,
      todayAppointments: appointments.filter(apt => apt.date === today).length,
      totalPatients: patients.length,
      completedToday: appointments.filter(apt => 
        apt.date === today && apt.status === 'completed'
      ).length,
      unreadNotifications: notifications.filter(notif => !notif.read).length
    };
  };

  // Confirmer un RDV
  const handleConfirmAppointment = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowConfirmModal(true);
  };

  // Confirmer définitivement
  const confirmAppointment = async () => {
    try {
      const updatedAppointments = dashboardData.appointments.map(apt =>
        apt.id === selectedAppointment.id 
          ? { ...apt, status: 'confirmed', confirmedAt: new Date().toISOString() }
          : apt
      );
      
      // 1. Mettre à jour le localStorage médecin
      localStorage.setItem(`appointments_doctor_${user.id}`, JSON.stringify(updatedAppointments));
      
      // 2. IMPORTANT: Mettre à jour le localStorage patient
      const patientAppointments = JSON.parse(localStorage.getItem(`appointments_patient_${selectedAppointment.patient_id}`) || '[]');
      const updatedPatientAppointments = patientAppointments.map(apt =>
        apt.id === selectedAppointment.id 
          ? { ...apt, status: 'confirmed', confirmedAt: new Date().toISOString() }
          : apt
      );
      localStorage.setItem(`appointments_patient_${selectedAppointment.patient_id}`, JSON.stringify(updatedPatientAppointments));
      
      // 3. Créer une notification pour le patient
      await createPatientNotification(selectedAppointment.patient_id, {
        type: 'appointment_confirmed',
        title: 'Rendez-vous confirmé ✅',
        message: `Votre rendez-vous avec Dr. ${user.name} le ${new Date(selectedAppointment.date).toLocaleDateString('fr-FR')} à ${selectedAppointment.time} a été confirmé.`,
        appointmentData: { ...selectedAppointment, status: 'confirmed' }
      });

      // 4. NOUVEAU: Sauvegarder dans un système global pour synchronisation
      await saveToGlobalSystem('appointment_confirmed', {
        appointmentId: selectedAppointment.id,
        patientId: selectedAppointment.patient_id,
        doctorId: user.id,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        appointmentData: { ...selectedAppointment, status: 'confirmed' }
      });
      
      setMessage('✅ Rendez-vous confirmé ! Le patient sera notifié lors de sa prochaine connexion.');
      setShowConfirmModal(false);
      loadDashboardData();
      
      // Masquer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Erreur confirmation RDV:', error);
    }
  };

  // Rejeter un RDV
  const handleRejectAppointment = async (appointment) => {
    setSelectedAppointment(appointment);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Rejeter définitivement
  const rejectAppointment = async () => {
    try {
      const updatedAppointments = dashboardData.appointments.map(apt =>
        apt.id === selectedAppointment.id 
          ? { 
              ...apt, 
              status: 'cancelled', 
              cancellationReason: rejectionReason,
              cancelledBy: 'doctor',
              cancelledAt: new Date().toISOString()
            }
          : apt
      );
      
      // 1. Mettre à jour le localStorage médecin
      localStorage.setItem(`appointments_doctor_${user.id}`, JSON.stringify(updatedAppointments));
      
      // 2. Mettre à jour le localStorage patient
      const patientAppointments = JSON.parse(localStorage.getItem(`appointments_patient_${selectedAppointment.patient_id}`) || '[]');
      const updatedPatientAppointments = patientAppointments.map(apt =>
        apt.id === selectedAppointment.id 
          ? { ...apt, status: 'cancelled', cancellationReason: rejectionReason, cancelledBy: 'doctor' }
          : apt
      );
      localStorage.setItem(`appointments_patient_${selectedAppointment.patient_id}`, JSON.stringify(updatedPatientAppointments));
      
      // 3. Libérer le créneau dans le planning
      const scheduleKey = `doctor_schedule_${user.id}_${selectedAppointment.date}`;
      const currentSchedule = JSON.parse(localStorage.getItem(scheduleKey) || '{}');
      if (currentSchedule.availableSlots) {
        currentSchedule.availableSlots = currentSchedule.availableSlots.map(slot => 
          slot.time === selectedAppointment.time 
            ? { ...slot, available: true, reason: null }
            : slot
        );
        localStorage.setItem(scheduleKey, JSON.stringify(currentSchedule));
      }
      
      // 4. Notifier le patient
      await createPatientNotification(selectedAppointment.patient_id, {
        type: 'appointment_cancelled',
        title: 'Rendez-vous annulé',
        message: `Votre rendez-vous avec Dr. ${user.name} le ${new Date(selectedAppointment.date).toLocaleDateString('fr-FR')} à ${selectedAppointment.time} a été annulé. ${rejectionReason ? 'Raison: ' + rejectionReason : 'Veuillez reprendre rendez-vous.'}`,
        appointmentData: { ...selectedAppointment, status: 'cancelled' }
      });

      // 5. NOUVEAU: Sauvegarder dans le système global
      await saveToGlobalSystem('appointment_cancelled', {
        appointmentId: selectedAppointment.id,
        patientId: selectedAppointment.patient_id,
        doctorId: user.id,
        status: 'cancelled',
        reason: rejectionReason,
        timestamp: new Date().toISOString(),
        appointmentData: { ...selectedAppointment, status: 'cancelled', cancellationReason: rejectionReason }
      });
      
      setMessage('🚫 Rendez-vous annulé. Le patient sera notifié et le créneau est maintenant libre.');
      setShowRejectModal(false);
      loadDashboardData();
      
      // Masquer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Erreur rejet RDV:', error);
    }
  };

  // Créer une notification pour le patient
  const createPatientNotification = async (patientId, notificationData) => {
    try {
      const notification = {
        id: Date.now(),
        userId: patientId,
        ...notificationData,
        read: false,
        createdAt: new Date().toISOString()
      };

      const patientNotifications = JSON.parse(localStorage.getItem(`notifications_patient_${patientId}`) || '[]');
      patientNotifications.unshift(notification);
      localStorage.setItem(`notifications_patient_${patientId}`, JSON.stringify(patientNotifications));
      
    } catch (error) {
      console.error('Erreur création notification patient:', error);
    }
  };

  // NOUVEAU: Système de synchronisation globale
  const saveToGlobalSystem = async (action, data) => {
    try {
      // Créer un événement global dans localStorage
      const globalEvents = JSON.parse(localStorage.getItem('ihealth_global_events') || '[]');
      
      const event = {
        id: Date.now(),
        action: action,
        timestamp: new Date().toISOString(),
        processed: false,
        data: data
      };
      
      globalEvents.unshift(event);
      
      // Garder seulement les 100 derniers événements
      if (globalEvents.length > 100) {
        globalEvents.splice(100);
      }
      
      localStorage.setItem('ihealth_global_events', JSON.stringify(globalEvents));
      
      console.log('📡 Événement global sauvegardé:', event);
      
    } catch (error) {
      console.error('Erreur sauvegarde système global:', error);
    }
  };

  // Marquer une notification comme lue
  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = dashboardData.notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    
    localStorage.setItem(`notifications_doctor_${user.id}`, JSON.stringify(updatedNotifications));
    setDashboardData(prev => ({
      ...prev,
      notifications: updatedNotifications,
      stats: {
        ...prev.stats,
        unreadNotifications: updatedNotifications.filter(n => !n.read).length
      }
    }));
  };

  // Données pour le graphique des RDV de la semaine
  const getWeeklyAppointmentsData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const appointmentsByDay = last7Days.map(date => {
      return dashboardData.appointments.filter(apt => apt.date === date).length;
    });
    
    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })),
      datasets: [{
        label: 'Rendez-vous',
        data: appointmentsByDay,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  };

  // Données pour le graphique en secteurs des statuts
  const getStatusChartData = () => {
    const statusCounts = {
      confirmed: dashboardData.appointments.filter(apt => apt.status === 'confirmed').length,
      pending: dashboardData.appointments.filter(apt => apt.status === 'pending').length,
      cancelled: dashboardData.appointments.filter(apt => apt.status === 'cancelled').length,
      completed: dashboardData.appointments.filter(apt => apt.status === 'completed').length
    };
    
    return {
      labels: ['Confirmés', 'En attente', 'Annulés', 'Terminés'],
      datasets: [{
        data: [statusCounts.confirmed, statusCounts.pending, statusCounts.cancelled, statusCounts.completed],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#17a2b8'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  // Options des graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      {/* En-tête avec informations médecin */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Bonjour Dr. {user?.name} ! 👨‍⚕️
          </h2>
          <p className="text-muted mb-0">
            {user?.speciality} • {dashboardData.stats.pendingRequests} demande(s) en attente • {dashboardData.stats.todayAppointments} consultation(s) aujourd'hui
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={() => loadDashboardData()}
            disabled={refreshing}
          >
            {refreshing ? (
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            ) : (
              <FontAwesomeIcon icon={faRefresh} className="me-2" />
            )}
            Actualiser
          </Button>
          <Button variant="primary" onClick={() => navigate('/doctor/appointments')}>
            <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
            Gérer les RDV
          </Button>
        </div>
      </div>

      {/* Message de feedback */}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')} className="mb-4">
          {message}
        </Alert>
      )}

      {/* Cartes statistiques */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-primary text-white">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="mb-3" />
              <h3 className="fw-bold">{dashboardData.stats.totalAppointments}</h3>
              <p className="mb-0">Total RDV</p>
              <small>Ce mois-ci</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-warning text-white">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faHourglassHalf} size="2x" className="mb-3" />
              <h3 className="fw-bold">{dashboardData.stats.pendingRequests}</h3>
              <p className="mb-0">En attente</p>
              <small>Demandes à traiter</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-success text-white">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faCalendarDay} size="2x" className="mb-3" />
              <h3 className="fw-bold">{dashboardData.stats.todayAppointments}</h3>
              <p className="mb-0">Aujourd'hui</p>
              <small>{dashboardData.stats.completedToday} terminé(s)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-info text-white">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faUsers} size="2x" className="mb-3" />
              <h3 className="fw-bold">{dashboardData.stats.totalPatients}</h3>
              <p className="mb-0">Patients</p>
              <small>Suivis actifs</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Demandes de RDV en attente (PRIORITÉ) */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">
                  <FontAwesomeIcon icon={faHourglassHalf} className="me-2 text-warning" />
                  Demandes de rendez-vous ({dashboardData.pendingAppointments.length})
                  {dashboardData.pendingAppointments.length > 0 && (
                    <Badge bg="warning" className="ms-2">Nouveau</Badge>
                  )}
                </h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/doctor/appointments')}
                >
                  Voir toutes
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {dashboardData.pendingAppointments.length > 0 ? (
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Patient</th>
                        <th>Date & Heure</th>
                        <th>Motif</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.pendingAppointments.slice(0, 5).map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <div className="fw-medium">{appointment.patient_name}</div>
                            <small className="text-muted">
                              Demandé le {new Date(appointment.created_at).toLocaleDateString('fr-FR')}
                            </small>
                          </td>
                          <td>
                            <div className="fw-medium">
                              {new Date(appointment.date).toLocaleDateString('fr-FR')}
                            </div>
                            <small className="text-muted">{appointment.time}</small>
                          </td>
                          <td>
                            <small>{appointment.reason}</small>
                            {appointment.notes && (
                              <div>
                                <small className="text-muted">📝 {appointment.notes}</small>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => handleConfirmAppointment(appointment)}
                                title="Confirmer le RDV"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleRejectAppointment(appointment)}
                                title="Rejeter le RDV"
                              >
                                <FontAwesomeIcon icon={faBan} />
                              </Button>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                title="Voir détails patient"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  {dashboardData.pendingAppointments.length > 5 && (
                    <div className="text-center mt-3">
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/doctor/appointments')}
                      >
                        Voir toutes les demandes ({dashboardData.pendingAppointments.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success mb-3" />
                  <h6 className="text-muted">Aucune demande en attente</h6>
                  <p className="text-muted">Toutes les demandes ont été traitées ! 🎉</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Notifications et planning aujourd'hui */}
        <Col lg={4} className="mb-4">
          {/* Notifications */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">
                  <FontAwesomeIcon icon={faBell} className="me-2 text-info" />
                  Notifications
                </h5>
                {dashboardData.stats.unreadNotifications > 0 && (
                  <Badge bg="danger">{dashboardData.stats.unreadNotifications}</Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboardData.notifications.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.notifications.slice(0, 4).map((notification) => (
                    <ListGroup.Item 
                      key={notification.id}
                      className={`d-flex align-items-start ${!notification.read ? 'bg-light border-start border-primary border-4' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex-grow-1">
                        <div className="fw-medium">{notification.title}</div>
                        <small className="text-muted">{notification.message}</small>
                        <div>
                          <small className="text-muted">
                            {new Date(notification.createdAt).toLocaleString('fr-FR')}
                          </small>
                        </div>
                      </div>
                      {!notification.read && (
                        <Badge bg="primary" className="ms-2">Nouveau</Badge>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-3">
                  <FontAwesomeIcon icon={faBell} size="2x" className="text-muted mb-2" />
                  <h6 className="text-muted">Aucune notification</h6>
                </div>
              )}
              <div className="p-3 border-top text-center">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/doctor/notifications')}
                >
                  Voir toutes les notifications
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Planning d'aujourd'hui */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faCalendarDay} className="me-2 text-success" />
                Planning d'aujourd'hui
              </h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.todayAppointments.length > 0 ? (
                <div>
                  {dashboardData.todayAppointments.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="d-flex align-items-center mb-3 p-2 rounded bg-light">
                      <div className="me-3">
                        <div className="bg-primary text-white rounded text-center p-2" style={{width: '50px'}}>
                          <small className="fw-bold">{appointment.time}</small>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-medium">{appointment.patient_name}</div>
                        <small className="text-muted">{appointment.reason}</small>
                      </div>
                      <div>
                        {appointment.status === 'confirmed' ? (
                          <Badge bg="success">Confirmé</Badge>
                        ) : appointment.status === 'pending' ? (
                          <Badge bg="warning">En attente</Badge>
                        ) : appointment.status === 'completed' ? (
                          <Badge bg="info">Terminé</Badge>
                        ) : (
                          <Badge bg="secondary">Annulé</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <FontAwesomeIcon icon={faCalendarDay} size="2x" className="text-muted mb-2" />
                  <h6 className="text-muted">Aucun RDV aujourd'hui</h6>
                  <p className="text-muted">Profitez de cette journée plus calme ! ☕</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Actions rapides */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">Actions rapides</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="primary" 
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => navigate('/doctor/appointments')}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Gérer les RDV
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="success" 
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => navigate('/doctor/patients')}
                  >
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="info" 
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => navigate('/doctor/schedule')}
                  >
                    <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
                    Mon agenda
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="warning" 
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => navigate('/doctor/notifications')}
                  >
                    <FontAwesomeIcon icon={faBell} className="me-2" />
                    Notifications
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Graphiques et analyses */}
      {dashboardData.appointments.length > 0 && (
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="fw-bold mb-0">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
                  Évolution des rendez-vous (7 derniers jours)
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <Line data={getWeeklyAppointmentsData()} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="fw-bold mb-0">
                  <FontAwesomeIcon icon={faChartBar} className="me-2 text-info" />
                  Répartition des statuts
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <Doughnut data={getStatusChartData()} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal de confirmation de RDV */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
            Confirmer le rendez-vous
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              <Alert variant="info">
                <h6>Détails du rendez-vous :</h6>
                <ul className="mb-0">
                  <li><strong>Patient :</strong> {selectedAppointment.patient_name}</li>
                  <li><strong>Date :</strong> {new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}</li>
                  <li><strong>Heure :</strong> {selectedAppointment.time}</li>
                  <li><strong>Motif :</strong> {selectedAppointment.reason}</li>
                  {selectedAppointment.notes && (
                    <li><strong>Notes :</strong> {selectedAppointment.notes}</li>
                  )}
                </ul>
              </Alert>
              <p>
                Êtes-vous sûr de vouloir <strong className="text-success">confirmer</strong> ce rendez-vous ? 
                Le patient recevra une notification de confirmation.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={confirmAppointment}>
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            Confirmer le RDV
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de rejet de RDV */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faBan} className="me-2 text-danger" />
            Rejeter le rendez-vous
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              <Alert variant="warning">
                <h6>Rendez-vous à rejeter :</h6>
                <ul className="mb-0">
                  <li><strong>Patient :</strong> {selectedAppointment.patient_name}</li>
                  <li><strong>Date :</strong> {new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}</li>
                  <li><strong>Heure :</strong> {selectedAppointment.time}</li>
                  <li><strong>Motif :</strong> {selectedAppointment.reason}</li>
                </ul>
              </Alert>
              
              <Form.Group className="mb-3">
                <Form.Label>Raison du rejet (optionnel)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Expliquez pourquoi vous ne pouvez pas accepter ce rendez-vous..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Cette information sera communiquée au patient pour l'aider à comprendre.
                </Form.Text>
              </Form.Group>
              
              <Alert variant="danger">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <strong>Attention :</strong> Le patient sera notifié du rejet et le créneau sera libéré.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={rejectAppointment}>
            <FontAwesomeIcon icon={faBan} className="me-2" />
            Rejeter le RDV
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Message d'accueil pour nouveaux médecins */}
      {dashboardData.appointments.length === 0 && (
        <Row>
          <Col xs={12}>
            <Alert variant="primary" className="border-0 shadow-sm">
              <div className="text-center">
                <FontAwesomeIcon icon={faUserMd} size="3x" className="text-primary mb-3" />
                <h4 className="fw-bold">Bienvenue sur votre espace médecin ! 🏥</h4>
                <p className="mb-3">
                  Votre tableau de bord est prêt à recevoir vos premiers patients. 
                  Les demandes de rendez-vous apparaîtront ici dès qu'un patient réservera un créneau.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Button variant="primary" onClick={() => navigate('/doctor/schedule')}>
                    <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
                    Configurer mon agenda
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate('/doctor/patients')}>
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Voir mes patients
                  </Button>
                </div>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Performance du mois */}
      {dashboardData.appointments.length > 0 && (
        <Row className="mt-4">
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="fw-bold mb-0">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-success" />
                  Performance ce mois-ci
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="text-center mb-3">
                    <div className="border-end">
                      <h3 className="text-primary fw-bold">{dashboardData.stats.totalAppointments}</h3>
                      <p className="text-muted mb-0">Rendez-vous</p>
                      <small className="text-success">
                        <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                        Total ce mois
                      </small>
                    </div>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <div className="border-end">
                      <h3 className="text-success fw-bold">
                        {dashboardData.stats.totalAppointments > 0 
                          ? Math.round((dashboardData.appointments.filter(apt => apt.status === 'confirmed').length / dashboardData.stats.totalAppointments) * 100)
                          : 0
                        }%
                      </h3>
                      <p className="text-muted mb-0">Taux de confirmation</p>
                      <small className="text-success">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                        Excellent
                      </small>
                    </div>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <div className="border-end">
                      <h3 className="text-info fw-bold">{dashboardData.stats.totalPatients}</h3>
                      <p className="text-muted mb-0">Patients uniques</p>
                      <small className="text-info">
                        <FontAwesomeIcon icon={faUsers} className="me-1" />
                        Suivi actif
                      </small>
                    </div>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <h3 className="text-warning fw-bold">{dashboardData.stats.pendingRequests}</h3>
                    <p className="text-muted mb-0">En attente</p>
                    <small className="text-warning">
                      <FontAwesomeIcon icon={faHourglassHalf} className="me-1" />
                      À traiter
                    </small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default DoctorDashboard;