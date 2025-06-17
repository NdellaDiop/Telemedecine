import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Badge, Modal, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faCalendarPlus, faUserMd, faMapMarkerAlt, faPhone,
  faStethoscope, faCalendarAlt, faClock, faCheck, faTimes,
  faFilter, faHeart, faBrain, faEye, faBaby, faUser, faExclamationTriangle,
  faCheckCircle, faHourglassHalf, faBan, faArrowRight, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function PatientAppointments() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingData, setBookingData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Debug de l'état utilisateur
  useEffect(() => {
    console.log('🔍 PatientAppointments - État auth:', {
      user: user,
      authLoading: authLoading,
      hasUserId: user?.id,
      userName: user?.firstName
    });
  }, [user, authLoading]);

  // Spécialités disponibles avec icônes
  const specialties = [
    { value: '', label: 'Toutes les spécialités', icon: faUserMd },
    { value: 'Cardiologie', label: 'Cardiologie', icon: faHeart },
    { value: 'Médecine générale', label: 'Médecine générale', icon: faStethoscope },
    { value: 'Pédiatrie', label: 'Pédiatrie', icon: faBaby },
    { value: 'Neurologie', label: 'Neurologie', icon: faBrain },
    { value: 'Ophtalmologie', label: 'Ophtalmologie', icon: faEye },
    { value: 'Gynécologie', label: 'Gynécologie', icon: faUser },
    { value: 'Dermatologie', label: 'Dermatologie', icon: faUser }
  ];

  // Motifs de consultation par spécialité
  const consultationReasons = {
    'Médecine générale': [
      'Consultation de routine', 'Fièvre/Grippe', 'Douleurs', 'Bilan de santé', 'Renouvellement ordonnance'
    ],
    'Cardiologie': [
      'Consultation cardiologique', 'Douleurs thoraciques', 'ECG', 'Écho-doppler', 'Suivi hypertension'
    ],
    'Pédiatrie': [
      'Consultation pédiatrique', 'Vaccination', 'Croissance', 'Fièvre enfant', 'Bilan développement'
    ],
    'Neurologie': [
      'Consultation neurologique', 'Maux de tête', 'Vertiges', 'Troubles mémoire', 'EEG'
    ],
    'Ophtalmologie': [
      'Examen de vue', 'Troubles vision', 'Glaucome', 'Cataracte', 'Fond d\'œil'
    ]
  };

  useEffect(() => {
    // Toujours charger la liste des médecins (pas besoin d'auth)
    loadDoctors();
  }, []);

  useEffect(() => {
    // Charger les RDV seulement si l'utilisateur est complètement chargé
    if (user && user.id && !authLoading) {
      loadAppointments();
    }
  }, [user, authLoading]); // Dépendre de user ET authLoading

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchSpecialty, searchLocation]);

  // Charger la liste des médecins
  const loadDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Médecins trouvés:', response.data.doctors);
      setDoctors(response.data.doctors || []);
      
      if (response.data.doctors && response.data.doctors.length === 0) {
        setError('Aucun médecin trouvé dans la base de données.');
      }
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
      setError('Erreur lors du chargement des médecins.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les RDV du patient
  const loadAppointments = async () => {
    if (!user || !user.id) {
      console.log('🔍 User pas encore chargé, skip loadAppointments');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/appointments/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data)) {
        const formattedAppointments = response.data.map(apt => ({
          id: apt.id,
          date: apt.appointment_datetime.split('T')[0],
          time: apt.appointment_datetime.split('T')[1].substring(0, 5),
          doctor_id: apt.doctor_id,
          doctor_name: apt.doctor_name,
          specialty: apt.specialty,
          reason: apt.reason,
          status: apt.status || 'pending',
          notes: apt.notes
        }));
        setAppointments(formattedAppointments);
      } else {
        setError('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError('Session expirée. Veuillez vous reconnecter.');
            break;
          case 403:
            setError('Vous n\'êtes pas autorisé à voir ces rendez-vous.');
            break;
          default:
            setError('Erreur lors du chargement des rendez-vous.');
        }
      } else {
        setError('Erreur de connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les créneaux disponibles d'un médecin
  const loadDoctorSchedule = async (doctorId, date) => {
    setLoadingSchedule(true);
    try {
      const token = localStorage.getItem('token');
      
      // TODO: Remplacer par votre vraie API de disponibilités
      // const response = await axios.get(`${API_BASE_URL}/doctors/${doctorId}/schedule/${date}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // Pour l'instant, simulation avec données stockées
      const scheduleKey = `doctor_schedule_${doctorId}_${date}`;
      const storedSchedule = localStorage.getItem(scheduleKey);
      
      if (storedSchedule) {
        const schedule = JSON.parse(storedSchedule);
        setAvailableSlots(schedule.availableSlots || []);
      } else {
        // Générer des créneaux par défaut (à remplacer par l'API)
        const slots = generateDefaultSchedule(date, doctorId);
        setAvailableSlots(slots);
        
        // Sauvegarder pour la démo
        localStorage.setItem(scheduleKey, JSON.stringify({ availableSlots: slots }));
      }
      
    } catch (error) {
      console.error('Erreur chargement planning médecin:', error);
      setError('Impossible de charger les créneaux disponibles.');
      setAvailableSlots([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Générer des créneaux par défaut (simulation)
  const generateDefaultSchedule = (date, doctorId) => {
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) {
      return []; // Pas de créneaux le weekend pour la démo
    }

    const morningSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    const afternoonSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    
    const allSlots = [...morningSlots, ...afternoonSlots];
    
    // Simuler quelques créneaux déjà pris
    const takenSlots = getTakenSlots(doctorId, date);
    
    return allSlots.map(time => ({
      time,
      available: !takenSlots.includes(time),
      reason: takenSlots.includes(time) ? 'Déjà réservé' : null
    }));
  };

  // Récupérer les créneaux déjà pris
  const getTakenSlots = (doctorId, date) => {
    const existingAppointments = JSON.parse(localStorage.getItem(`appointments_doctor_${doctorId}`) || '[]');
    return existingAppointments
      .filter(apt => apt.date === date)
      .map(apt => apt.time);
  };

  // Filtrer les médecins
  const filterDoctors = () => {
    let filtered = doctors;
    
    if (searchSpecialty) {
      filtered = filtered.filter(doctor => 
        doctor.speciality && doctor.speciality.toLowerCase().includes(searchSpecialty.toLowerCase())
      );
    }
    
    if (searchLocation) {
      filtered = filtered.filter(doctor => 
        doctor.work_location && doctor.work_location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }
    
    setFilteredDoctors(filtered);
  };

  // Ouvrir le modal de réservation
  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingData({
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: ''
    });
    setSelectedDate('');
    setAvailableSlots([]);
    setShowBookingModal(true);
  };

  // Gérer la sélection de date
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setBookingData({ ...bookingData, appointmentDate: date, appointmentTime: '' });
    if (date && selectedDoctor) {
      loadDoctorSchedule(selectedDoctor.id, date);
    }
  };

  // Confirmer la réservation
  const handleConfirmBooking = async () => {
    if (!user || !user.id) {
      setError('Erreur : informations utilisateur manquantes. Veuillez vous reconnecter.');
      return;
    }

    if (!bookingData.appointmentDate || !bookingData.appointmentTime || !bookingData.reason) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const appointmentDateTime = `${bookingData.appointmentDate}T${bookingData.appointmentTime}:00`;
      
      const response = await axios.post(
        `${API_BASE_URL}/appointments`,
        {
          patient_id: parseInt(user.id),
          doctor_id: parseInt(selectedDoctor.id),
          appointment_datetime: appointmentDateTime,
          reason: bookingData.reason,
          notes: bookingData.notes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.appointment_id) {
        await loadAppointments();
      setShowBookingModal(false);
        setBookingData({
          appointmentDate: '',
          appointmentTime: '',
          reason: '',
          notes: ''
        });
        setMessage('✅ Rendez-vous créé avec succès !');
      } else {
        setError('Erreur lors de la création du rendez-vous');
      }
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError('Session expirée. Veuillez vous reconnecter.');
            break;
          case 403:
            setError('Vous n\'êtes pas autorisé à créer ce rendez-vous.');
            break;
          default:
            setError('Erreur lors de la création du rendez-vous.');
        }
      } else {
        setError('Erreur de connexion au serveur.');
      }
    }
  };

  // Obtenir l'icône de spécialité
  const getSpecialtyIcon = (specialty) => {
    const found = specialties.find(s => s.value === specialty);
    return found ? found.icon : faStethoscope;
  };

  // Obtenir la couleur du statut
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" />Confirmé</Badge>;
      case 'pending':
        return <Badge bg="warning"><FontAwesomeIcon icon={faHourglassHalf} className="me-1" />En attente</Badge>;
      case 'cancelled':
        return <Badge bg="danger"><FontAwesomeIcon icon={faBan} className="me-1" />Annulé</Badge>;
      case 'rescheduled':
        return <Badge bg="info"><FontAwesomeIcon icon={faArrowRight} className="me-1" />Reporté</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
  };

  // Obtenir la date minimale (aujourd'hui + 1 jour)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Obtenir la date maximale (dans 3 mois)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  // Nettoyer les RDV avec dates invalides
  const cleanInvalidAppointments = () => {
    const validAppointments = appointments.filter(apt => {
      const date = new Date(apt.date);
      return !isNaN(date.getTime()) && apt.date && apt.time;
    });
    
    if (validAppointments.length !== appointments.length) {
      localStorage.setItem(`appointments_patient_${user.id}`, JSON.stringify(validAppointments));
      setAppointments(validAppointments);
      setMessage('✅ Rendez-vous invalides supprimés.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Nettoyer complètement les données corrompues
  const resetAllAppointments = () => {
    if (window.confirm('Voulez-vous supprimer TOUS vos rendez-vous et recommencer ? Cette action est irréversible.')) {
      localStorage.removeItem(`appointments_patient_${user.id}`);
      setAppointments([]);
      setMessage('✅ Tous les rendez-vous ont été supprimés.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Supprimer un RDV
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await loadAppointments();
      setMessage('✅ Rendez-vous annulé avec succès');
    } catch (error) {
      console.error('Erreur suppression RDV:', error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError('Session expirée. Veuillez vous reconnecter.');
            break;
          case 403:
            setError('Vous n\'êtes pas autorisé à annuler ce rendez-vous.');
            break;
          default:
      setError('Erreur lors de l\'annulation du rendez-vous.');
    }
      } else {
        setError('Erreur de connexion au serveur.');
      }
    }
  };

  // Si l'authentification est en cours de chargement
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur après le chargement
  if (!user || !user.id) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <h5 className="text-muted">Session expirée</h5>
          <p className="text-muted mb-3">Veuillez vous reconnecter pour accéder à vos rendez-vous.</p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Se reconnecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-appointments">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faCalendarPlus} className="me-2 text-primary" />
            Prendre un rendez-vous
          </h2>
          <p className="text-muted mb-0">
            Trouvez un médecin et réservez un créneau disponible
          </p>
        </div>
        <Button variant="outline-primary" onClick={() => navigate('/patient')}>
          Retour au tableau de bord
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')}>
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      )}

      <Row>
        {/* Filtres de recherche */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faFilter} className="me-2 text-primary" />
                Rechercher un médecin
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Spécialité</Form.Label>
                  <Form.Select
                    value={searchSpecialty}
                    onChange={(e) => setSearchSpecialty(e.target.value)}
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Filtrez par spécialité médicale
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Localisation</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Ville ou quartier..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                <div className="d-grid">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      setSearchSpecialty('');
                      setSearchLocation('');
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </Form>

              {/* Statistiques */}
              <div className="mt-4 p-3 bg-light rounded">
                <div className="text-center">
                  <h4 className="fw-bold text-primary">{filteredDoctors.length}</h4>
                  <small className="text-muted">
                    médecin(s) trouvé(s)
                    {searchSpecialty && ` en ${searchSpecialty}`}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Liste des médecins */}
        <Col lg={8}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <p>Recherche des médecins disponibles...</p>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div>
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="border-0 shadow-sm mb-4">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col md={2} className="text-center mb-3 mb-md-0">
                        <div 
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                          style={{ width: '80px', height: '80px' }}
                        >
                          <FontAwesomeIcon 
                            icon={getSpecialtyIcon(doctor.speciality)} 
                            size="2x" 
                          />
                        </div>
                      </Col>
                      <Col md={7}>
                        <h5 className="fw-bold mb-2">Dr. {doctor.name}</h5>
                        <div className="mb-2">
                          <Badge bg="primary" className="me-2">
                            <FontAwesomeIcon icon={getSpecialtyIcon(doctor.speciality)} className="me-1" />
                            {doctor.speciality}
                          </Badge>
                          <Badge bg="success" className="me-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                            Disponible
                          </Badge>
                        </div>
                        <div className="mb-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
                          <small>{doctor.work_location}</small>
                        </div>
                        <div className="mb-1">
                          <FontAwesomeIcon icon={faClock} className="me-2 text-info" />
                          <small>Créneaux disponibles dans les 3 prochains mois</small>
                        </div>
                      </Col>
                      <Col md={3} className="text-center">
                        <div className="d-grid gap-2">
                          <Button 
                            variant="primary"
                            onClick={() => handleBookAppointment(doctor)}
                          >
                            <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
                            Voir créneaux
                          </Button>
                          <Button variant="outline-info" size="sm">
                            <FontAwesomeIcon icon={faPhone} className="me-1" />
                            Contacter
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <FontAwesomeIcon icon={faUserMd} size="3x" className="text-muted mb-3" />
                <h5 className="text-muted">Aucun médecin trouvé</h5>
                <p className="text-muted mb-4">
                  {searchSpecialty || searchLocation ? (
                    'Essayez de modifier vos critères de recherche'
                  ) : (
                    'Aucun médecin disponible pour le moment'
                  )}
                </p>
                {(searchSpecialty || searchLocation) && (
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      setSearchSpecialty('');
                      setSearchLocation('');
                    }}
                  >
                    Voir tous les médecins
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Mes rendez-vous */}
          {appointments.length > 0 && (
            <Card className="border-0 shadow-sm mt-4">
              <Card.Header className="bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                    Mes rendez-vous ({appointments.length})
                  </h5>
                  <div>
                    <Badge bg="info" className="me-2">
                      {appointments.filter(apt => apt.status === 'pending').length} en attente
                    </Badge>
                  <div>
                    <Badge bg="info" className="me-2">
                      {appointments.filter(apt => apt.status === 'pending').length} en attente
                    </Badge>
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={cleanInvalidAppointments}
                      title="Nettoyer les RDV invalides"
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faTimes} className="me-1" />
                      Nettoyer
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={resetAllAppointments}
                      title="Supprimer TOUS les RDV"
                    >
                      <FontAwesomeIcon icon={faBan} className="me-1" />
                      Reset
                    </Button>
                  </div>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date & Heure</th>
                        <th>Médecin</th>
                        <th>Motif</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <div className="fw-medium">
                              {appointment.date && !isNaN(new Date(appointment.date).getTime()) 
                                ? new Date(appointment.date).toLocaleDateString('fr-FR')
                                : <span className="text-danger">Date invalide</span>
                              }
                            </div>
                            <small className="text-muted">{appointment.time || 'Heure manquante'}</small>
                          </td>
                          <td>
                            <div className="fw-medium">Dr. {appointment.doctor_name}</div>
                            <small className="text-muted">{appointment.specialty}</small>
                          </td>
                          <td>
                            <small>{appointment.reason || 'Non spécifié'}</small>
                          </td>
                          <td>
                            {getStatusBadge(appointment.status)}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button variant="outline-primary" size="sm" title="Voir détails">
                                <FontAwesomeIcon icon={faInfoCircle} />
                              </Button>
                              {appointment.status === 'pending' && (
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                  title="Annuler le RDV"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal de prise de rendez-vous amélioré */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faCalendarPlus} className="me-2 text-primary" />
            Réserver un créneau
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <div>
              {/* Informations du médecin */}
              <Card className="border-0 bg-light mb-4">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                      style={{ width: '60px', height: '60px' }}
                    >
                      <FontAwesomeIcon 
                        icon={getSpecialtyIcon(selectedDoctor.speciality)} 
                        size="lg" 
                      />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Dr. {selectedDoctor.name}</h6>
                      <div className="mb-1">
                        <Badge bg="primary">{selectedDoctor.speciality}</Badge>
                      </div>
                      <small className="text-muted">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                        {selectedDoctor.work_location}
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Formulaire de réservation */}
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date souhaitée *</Form.Label>
                      <Form.Control
                        type="date"
                        min={getMinDate()}
                        max={getMaxDate()}
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        required
                      />
                      <Form.Text className="text-muted">
                        Réservation possible jusqu'à 3 mois à l'avance
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Motif de consultation *</Form.Label>
                      <Form.Select
                        value={bookingData.reason}
                        onChange={(e) => setBookingData({
                          ...bookingData, 
                          reason: e.target.value
                        })}
                        required
                      >
                        <option value="">Sélectionner un motif</option>
                        {consultationReasons[selectedDoctor.speciality]?.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        )) || (
                          <option value="Consultation">Consultation</option>
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Sélection des créneaux */}
                {selectedDate && (
                  <div className="mb-4">
                    <Form.Label className="fw-bold">
                      Créneaux disponibles le {new Date(selectedDate).toLocaleDateString('fr-FR')} *
                    </Form.Label>
                    
                    {loadingSchedule ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Chargement des créneaux disponibles...
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div>
                        <div className="row g-2 mt-2">
                          {availableSlots.map((slot) => (
                            <div key={slot.time} className="col-6 col-md-3">
                              <Button
                                variant={
                                  bookingData.appointmentTime === slot.time 
                                    ? "primary" 
                                    : slot.available 
                                      ? "outline-primary" 
                                      : "outline-secondary"
                                }
                                className="w-100"
                                size="sm"
                                disabled={!slot.available}
                                onClick={() => setBookingData({
                                  ...bookingData, 
                                  appointmentTime: slot.time
                                })}
                              >
                                <FontAwesomeIcon 
                                  icon={
                                    slot.available 
                                      ? faClock 
                                      : faTimes
                                  } 
                                  className="me-1" 
                                />
                                {slot.time}
                              </Button>
                              {!slot.available && (
                                <small className="text-muted d-block text-center">
                                  {slot.reason || 'Indisponible'}
                                </small>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 p-3 bg-light rounded">
                          <div className="row text-center">
                            <div className="col-4">
                              <FontAwesomeIcon icon={faClock} className="text-primary me-1" />
                              <small className="text-muted">Disponible</small>
                            </div>
                            <div className="col-4">
                              <FontAwesomeIcon icon={faCheck} className="text-success me-1" />
                              <small className="text-muted">Sélectionné</small>
                            </div>
                            <div className="col-4">
                              <FontAwesomeIcon icon={faTimes} className="text-danger me-1" />
                              <small className="text-muted">Occupé</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Alert variant="warning" className="mt-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        Aucun créneau disponible ce jour-là. Veuillez choisir une autre date.
                      </Alert>
                    )}
                  </div>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Notes complémentaires (optionnel)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Décrivez vos symptômes ou précisions importantes pour le médecin..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({
                      ...bookingData, 
                      notes: e.target.value
                    })}
                  />
                  <Form.Text className="text-muted">
                    Ces informations aideront le médecin à mieux préparer votre consultation.
                  </Form.Text>
                </Form.Group>

                {/* Résumé de la réservation */}
                {bookingData.appointmentDate && bookingData.appointmentTime && bookingData.reason && (
                  <Alert variant="info">
                    <h6><FontAwesomeIcon icon={faInfoCircle} className="me-2" />Résumé de votre demande</h6>
                    <ul className="mb-0">
                      <li><strong>Médecin :</strong> Dr. {selectedDoctor.name} ({selectedDoctor.speciality})</li>
                      <li><strong>Date :</strong> {new Date(bookingData.appointmentDate).toLocaleDateString('fr-FR')}</li>
                      <li><strong>Heure :</strong> {bookingData.appointmentTime}</li>
                      <li><strong>Motif :</strong> {bookingData.reason}</li>
                    </ul>
                    <small className="text-muted d-block mt-2">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                      Votre demande sera envoyée au médecin qui la confirmera ou proposera un autre créneau.
                    </small>
                  </Alert>
                )}
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmBooking}
            disabled={
              !bookingData.appointmentDate || 
              !bookingData.appointmentTime || 
              !bookingData.reason ||
              loadingSchedule
            }
          >
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            Envoyer la demande
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Aide et conseils */}
      <Row className="mt-4">
        <Col xs={12}>
          <Card className="border-0 bg-light">
            <Card.Body>
              <h6 className="fw-bold mb-3">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-info" />
                Comment ça marche ?
              </h6>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    1
                  </div>
                  <h6>Choisissez</h6>
                  <small className="text-muted">Sélectionnez un médecin selon vos besoins</small>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    2
                  </div>
                  <h6>Réservez</h6>
                  <small className="text-muted">Choisissez un créneau disponible</small>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    3
                  </div>
                  <h6>Confirmez</h6>
                  <small className="text-muted">Le médecin valide votre demande</small>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    4
                  </div>
                  <h6>Consultez</h6>
                  <small className="text-muted">Rendez-vous au cabinet à l'heure convenue</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default PatientAppointments;