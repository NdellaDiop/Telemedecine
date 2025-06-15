import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Alert, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, faStethoscope, faPills, faFileAlt, faHeartbeat,
  faUserMd, faExclamationTriangle, faCheckCircle, faClock, faPlus,
  faPhone, faEnvelope, faMapMarkerAlt, faWeight, faThermometerHalf,
  faArrowUp, faArrowDown, faBell, faEye, faCalendarPlus, faEdit
} from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
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
  Legend
);

function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    recentMedications: [],
    healthMetrics: [],
    doctors: [],
    notifications: [],
    healthSummary: {
      totalAppointments: 0,
      activePrescriptions: 0,
      lastCheckup: null,
      nextAppointment: null
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Simulation de chargement des données depuis vos API
      // TODO: Remplacer par vos vrais appels API
      
      // 1. Charger les rendez-vous
      const appointmentsResponse = await loadAppointments();
      
      // 2. Charger les médecins suivis
      const doctorsResponse = await loadPatientDoctors();
      
      // 3. Charger les données de santé
      const healthResponse = await loadHealthMetrics();
      
      // 4. Charger les notifications
      const notificationsResponse = await loadNotifications();
      
      // 5. Charger les prescriptions
      const prescriptionsResponse = await loadPrescriptions();

      setDashboardData({
        upcomingAppointments: appointmentsResponse || [],
        doctors: doctorsResponse || [],
        healthMetrics: healthResponse || [],
        notifications: notificationsResponse || [],
        recentMedications: prescriptionsResponse || [],
        healthSummary: {
          totalAppointments: (appointmentsResponse || []).length,
          activePrescriptions: (prescriptionsResponse || []).filter(p => p.isActive).length,
          lastCheckup: getLastCheckupDate(appointmentsResponse),
          nextAppointment: getNextAppointment(appointmentsResponse)
        }
      });
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      // En cas d'erreur, charger les données par défaut
      setDashboardData(getDefaultDashboardData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonctions de chargement des données (à connecter à vos vraies API)
  const loadAppointments = async () => {
    // TODO: Remplacer par appel à votre API
    // const response = await fetch(`/api/patients/${user.id}/appointments`);
    // return response.json();
    
    // Simulation avec données stockées localement
    const storedAppointments = localStorage.getItem(`appointments_patient_${user?.id}`);
    if (storedAppointments) {
      try {
        return JSON.parse(storedAppointments);
      } catch (error) {
        console.error('Erreur parsing appointments:', error);
      }
    }
    
    // Données d'exemple si pas de RDV stockés
    return [];
  };

  const loadPatientDoctors = async () => {
    // TODO: Remplacer par appel API
    const storedDoctors = localStorage.getItem(`doctors_patient_${user?.id}`);
    if (storedDoctors) {
      try {
        return JSON.parse(storedDoctors);
      } catch (error) {
        console.error('Erreur parsing doctors:', error);
      }
    }
    return [];
  };

  const loadHealthMetrics = async () => {
    // TODO: Remplacer par appel API
    const storedMetrics = localStorage.getItem(`health_metrics_${user?.id}`);
    if (storedMetrics) {
      try {
        return JSON.parse(storedMetrics);
      } catch (error) {
        console.error('Erreur parsing health metrics:', error);
      }
    }
    
    // Données d'exemple pour la démo
    return [
      { date: '2025-06-10', weight: 72, temperature: 36.7, bloodPressure: '120/80' },
      { date: '2025-06-05', weight: 71.5, temperature: 36.5, bloodPressure: '118/78' },
      { date: '2025-06-01', weight: 72.2, temperature: 36.8, bloodPressure: '122/82' }
    ];
  };

  const loadNotifications = async () => {
    // TODO: Remplacer par appel API
    const storedNotifications = localStorage.getItem(`notifications_${user?.id}`);
    if (storedNotifications) {
      try {
        return JSON.parse(storedNotifications);
      } catch (error) {
        console.error('Erreur parsing notifications:', error);
      }
    }
    
    return [
      { 
        id: 1, 
        message: `Bienvenue ${user?.firstName || 'sur i-health'} ! Prenez votre premier rendez-vous.`, 
        isNew: true, 
        time: 'maintenant',
        type: 'welcome',
        createdAt: new Date().toISOString()
      }
    ];
  };

  const loadPrescriptions = async () => {
    // TODO: Remplacer par appel API
    const storedPrescriptions = localStorage.getItem(`prescriptions_${user?.id}`);
    if (storedPrescriptions) {
      try {
        return JSON.parse(storedPrescriptions);
      } catch (error) {
        console.error('Erreur parsing prescriptions:', error);
      }
    }
    return [];
  };

  // Fonctions utilitaires
  const getDefaultDashboardData = () => ({
    upcomingAppointments: [],
    recentMedications: [],
    healthMetrics: [],
    doctors: [],
    notifications: [
      { 
        id: 1, 
        message: `Bienvenue ${user?.firstName || user?.name} ! Commencez par prendre un rendez-vous.`, 
        isNew: true, 
        time: 'maintenant',
        type: 'welcome'
      }
    ],
    healthSummary: {
      totalAppointments: 0,
      activePrescriptions: 0,
      lastCheckup: null,
      nextAppointment: null
    }
  });

  const getLastCheckupDate = (appointments) => {
    if (!appointments || appointments.length === 0) return null;
    const pastAppointments = appointments.filter(apt => new Date(apt.date) < new Date());
    return pastAppointments.length > 0 ? pastAppointments[pastAppointments.length - 1].date : null;
  };

  const getNextAppointment = (appointments) => {
    if (!appointments || appointments.length === 0) return null;
    const futureAppointments = appointments.filter(apt => new Date(apt.date) > new Date());
    return futureAppointments.length > 0 ? futureAppointments[0] : null;
  };

  // Données pour le graphique de poids
  const weightChartData = {
    labels: dashboardData.healthMetrics.map(m => new Date(m.date).toLocaleDateString('fr-FR')),
    datasets: [{
      label: 'Poids (kg)',
      data: dashboardData.healthMetrics.map(m => m.weight),
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { usePointStyle: true }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
      x: {
        grid: { color: 'rgba(0,0,0,0.1)' }
      }
    }
  };

  const calculateAge = () => {
    if (!user?.birthdate) return 'Non renseigné';
    const today = new Date();
    const birth = new Date(user.birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  // Fonction pour actualiser les données
  const handleRefresh = () => {
    loadDashboardData();
    checkGlobalEvents(); // Vérifier les événements globaux
  };

  // NOUVEAU: Vérifier les événements globaux (communication médecin → patient)
  const checkGlobalEvents = async () => {
    try {
      const globalEvents = JSON.parse(localStorage.getItem('ihealth_global_events') || '[]');
      
      // Filtrer les événements non traités pour ce patient
      const patientEvents = globalEvents.filter(event => 
        !event.processed && 
        event.data.patientId === parseInt(user.id)
      );
      
      console.log('🔍 Événements globaux pour patient:', patientEvents);
      
      for (const event of patientEvents) {
        if (event.action === 'appointment_confirmed' || event.action === 'appointment_cancelled') {
          // Mettre à jour le RDV local
          const currentAppointments = JSON.parse(localStorage.getItem(`appointments_patient_${user.id}`) || '[]');
          const updatedAppointments = currentAppointments.map(apt =>
            apt.id === event.data.appointmentId
              ? { ...apt, ...event.data.appointmentData }
              : apt
          );
          
          localStorage.setItem(`appointments_patient_${user.id}`, JSON.stringify(updatedAppointments));
          
          // Marquer l'événement comme traité
          event.processed = true;
          
          console.log('✅ RDV mis à jour depuis événement global:', event.data.appointmentData);
        }
      }
      
      // Sauvegarder les événements mis à jour
      localStorage.setItem('ihealth_global_events', JSON.stringify(globalEvents));
      
      // Recharger les RDV si des événements ont été traités
      if (patientEvents.length > 0) {
        loadAppointments();
      }
      
    } catch (error) {
      console.error('Erreur vérification événements globaux:', error);
    }
  };

  // Fonctions de navigation (routes corrigées)
  const handleNavigateToAppointments = () => {
    navigate('/patient/appointments');
  };

  const handleNavigateToProfile = () => {
    navigate('/patient/profile');
  };

  const handleNavigateToHealthTracking = () => {
    navigate('/patient/healthtracking');
  };

  const handleNavigateToMedicalRecord = () => {
    navigate('/patient/medicalrecord');
  };

  const handleNavigateToPrescriptions = () => {
    navigate('/patient/prescriptions');
  };

  const handleNavigateToDoctors = () => {
    navigate('/patient/doctors');
  };

  const handleNavigateToMessages = () => {
    navigate('/patient/messages');
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
    <div className="patient-dashboard">
      {/* En-tête de bienvenue avec bouton de rafraîchissement */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              Bonjour {user?.firstName || user?.name} ! 👋
            </h2>
            <p className="text-muted mb-0">
              Voici un aperçu de votre santé et de vos rendez-vous
            </p>
          </div>
          <Button variant="outline-primary" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            ) : (
              <FontAwesomeIcon icon={faArrowDown} className="me-2" />
            )}
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={handleNavigateToAppointments}>
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <h3 className="fw-bold">{dashboardData.healthSummary.totalAppointments}</h3>
              <p className="text-muted mb-0">Rendez-vous</p>
              <small className="text-primary">
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Prendre un RDV
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={handleNavigateToPrescriptions}>
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">
                <FontAwesomeIcon icon={faPills} />
              </div>
              <h3 className="fw-bold">{dashboardData.healthSummary.activePrescriptions}</h3>
              <p className="text-muted mb-0">Prescriptions actives</p>
              <small className="text-success">
                {dashboardData.healthSummary.activePrescriptions > 0 ? 'Voir les ordonnances' : 'Aucune en cours'}
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={handleNavigateToDoctors}>
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">
                <FontAwesomeIcon icon={faUserMd} />
              </div>
              <h3 className="fw-bold">{dashboardData.doctors.length}</h3>
              <p className="text-muted mb-0">Médecins suivis</p>
              <small className="text-info">Chercher un médecin</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={handleNavigateToHealthTracking}>
            <Card.Body className="text-center">
              <div className="display-6 text-warning mb-2">
                <FontAwesomeIcon icon={faHeartbeat} />
              </div>
              <h3 className="fw-bold">{dashboardData.healthMetrics.length}</h3>
              <p className="text-muted mb-0">Mesures santé</p>
              <small className="text-warning">
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Ajouter mesure
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Prochains rendez-vous */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                  Prochains rendez-vous
                </h5>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleNavigateToAppointments}
                >
                  Prendre RDV
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {dashboardData.upcomingAppointments.length > 0 ? (
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date & Heure</th>
                        <th>Médecin</th>
                        <th>Spécialité</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.upcomingAppointments.slice(0, 3).map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <div className="fw-medium">
                              {new Date(appointment.date).toLocaleDateString('fr-FR')}
                            </div>
                            <small className="text-muted">{appointment.time}</small>
                          </td>
                          <td>
                            <div className="fw-medium">{appointment.doctorName}</div>
                          </td>
                          <td>
                            <Badge bg="info">{appointment.specialty}</Badge>
                          </td>
                          <td>
                            <Badge bg={appointment.status === 'confirmed' ? 'success' : 'warning'}>
                              {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm">
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {dashboardData.upcomingAppointments.length > 3 && (
                    <div className="text-center mt-3">
                      <Button variant="outline-primary" onClick={handleNavigateToAppointments}>
                        Voir tous les rendez-vous ({dashboardData.upcomingAppointments.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3">
                  <FontAwesomeIcon icon={faUserMd} size="2x" className="text-muted mb-2" />
                  <h6 className="text-muted">Aucun médecin suivi</h6>
                  <p className="text-muted mb-3">
                    Trouvez et prenez rendez-vous avec un médecin
                  </p>
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={handleNavigateToDoctors}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Chercher un médecin
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Message d'accueil pour les nouveaux patients */}
      {dashboardData.healthSummary.totalAppointments === 0 && (
        <Row>
          <Col xs={12}>
            <Alert variant="info" className="border-0 shadow-sm">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-3" size="2x" />
                <div className="flex-grow-1">
                  <h5 className="alert-heading">Bienvenue sur i-health ! 🎉</h5>
                  <p className="mb-2">
                    Vous venez de créer votre compte patient. Pour commencer à utiliser la plateforme :
                  </p>
                  <ol className="mb-2">
                    <li>Recherchez un médecin par spécialité</li>
                    <li>Prenez votre premier rendez-vous</li>
                    <li>Complétez votre dossier médical</li>
                  </ol>
                  <Button variant="primary" onClick={handleNavigateToAppointments}>
                    <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
                    Commencer - Prendre un RDV
                  </Button>
                </div>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Résumé de la dernière activité */}
      {dashboardData.healthSummary.totalAppointments > 0 && (
        <Row className="mt-4">
          <Col xs={12}>
            <Card className="border-0 shadow-sm bg-light">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-success me-3" size="2x" />
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">Activité récente</h6>
                    <div className="row">
                      <div className="col-md-3">
                        <small className="text-muted">Dernier RDV:</small>
                        <div className="fw-medium">
                          {dashboardData.healthSummary.lastCheckup 
                            ? new Date(dashboardData.healthSummary.lastCheckup).toLocaleDateString('fr-FR')
                            : 'Aucun'
                          }
                        </div>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted">Prochain RDV:</small>
                        <div className="fw-medium">
                          {dashboardData.healthSummary.nextAppointment 
                            ? new Date(dashboardData.healthSummary.nextAppointment.date).toLocaleDateString('fr-FR')
                            : 'Aucun programmé'
                          }
                        </div>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted">Prescriptions actives:</small>
                        <div className="fw-medium">{dashboardData.healthSummary.activePrescriptions}</div>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted">Dernière mesure:</small>
                        <div className="fw-medium">
                          {dashboardData.healthMetrics.length > 0 
                            ? new Date(dashboardData.healthMetrics[0].date).toLocaleDateString('fr-FR')
                            : 'Aucune'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    ) : (
                      <FontAwesomeIcon icon={faArrowDown} />
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default PatientDashboard;