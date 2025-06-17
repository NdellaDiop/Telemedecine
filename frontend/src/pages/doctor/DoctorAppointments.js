import React, { useState, useEffect, useContext } from 'react';
import { 
  Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, 
  InputGroup, Tabs, Tab, Dropdown, ButtonGroup 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, faSearch, faFilter, faPlus, faEdit, faTrash, 
  faVideo, faPhone, faCheckCircle, faTimesCircle, faClock,
  faUser, faStethoscope, faExclamationTriangle, faEye,
  faCalendarCheck, faUserMd, faPrescription
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function DoctorAppointments() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  
  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Formulaire nouveau rendez-vous
  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    appointment_date: '',
    motif: '',
    duration: 30,
    is_video: false,
    notes: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.id) {
      loadPatients().then(() => {
    loadAppointments();
      });
    }
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateFilter, typeFilter]);

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/appointments/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (Array.isArray(response.data)) {
        // Transformer les données pour correspondre au format attendu par l'interface
        const formattedAppointments = response.data.map(apt => {
          // Trouver les informations du patient dans la liste des patients déjà chargée
          const patient = patients.find(p => p.id === apt.patient_id);
          return {
            id: apt.id,
            patient_id: apt.patient_id,
            patient_name: patient ? patient.name : 'Patient inconnu',
            patient_phone: patient ? patient.phone : '',
            appointment_date: apt.appointment_datetime,
            motif: apt.reason,
            status: apt.status || 'scheduled',
            is_video: apt.is_video || false,
            duration: apt.duration || 30,
            notes: apt.notes
          };
        });
        setAppointments(formattedAppointments);
      } else {
        setError('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
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

  const loadPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Chargement des patients pour le docteur:', user.id);
      const response = await axios.get(`${API_BASE_URL}/doctor/${user.id}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Réponse API patients:', response.data);

      if (response.data && Array.isArray(response.data.patients)) {
        // Transformer les données pour correspondre au format attendu
        const formattedPatients = response.data.patients.map(patient => {
          console.log('Patient brut:', patient);
          const formatted = {
            id: patient.id,
            name: patient.name || patient.full_name || 'Nom inconnu',
            email: patient.email || '',
            phone: patient.phone || patient.phone_number || '',
            birthdate: patient.birthdate || patient.date_of_birth || ''
          };
          console.log('Patient formaté:', formatted);
          return formatted;
        });
        console.log('Liste finale des patients:', formattedPatients);
        setPatients(formattedPatients);
      } else {
        console.error('Format de réponse invalide pour les patients:', response.data);
        setError('Erreur lors du chargement des patients');
      }
    } catch (error) {
      console.error('Erreur chargement patients:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        if (error.response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else if (error.response.status === 403) {
          setError('Vous n\'êtes pas autorisé à accéder à cette liste de patients.');
        } else {
          setError(`Erreur serveur (${error.response.status}): ${error.response.data?.error || 'Erreur inconnue'}`);
        }
      } else if (error.request) {
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      } else {
        setError('Erreur inattendue lors du chargement des patients.');
      }
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.motif.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filtre par date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(apt => 
          new Date(apt.appointment_date).toDateString() === today.toDateString()
        );
        break;
      case 'tomorrow':
        filtered = filtered.filter(apt => 
          new Date(apt.appointment_date).toDateString() === tomorrow.toDateString()
        );
        break;
      case 'week':
        filtered = filtered.filter(apt => 
          new Date(apt.appointment_date) >= today && 
          new Date(apt.appointment_date) <= nextWeek
        );
        break;
    }

    // Filtre par type
    if (typeFilter === 'video') {
      filtered = filtered.filter(apt => apt.is_video);
    } else if (typeFilter === 'physical') {
      filtered = filtered.filter(apt => !apt.is_video);
    }

    // Trier par date
    filtered.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

    setFilteredAppointments(filtered);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/appointments`,
        {
        patient_id: parseInt(newAppointment.patient_id),
          doctor_id: user.id,
          appointment_datetime: newAppointment.appointment_date,
          reason: newAppointment.motif,
          duration: newAppointment.duration,
        is_video: newAppointment.is_video,
        notes: newAppointment.notes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.appointment_id) {
        // Recharger les rendez-vous pour avoir les données à jour
        await loadAppointments();
      setShowCreateModal(false);
      setNewAppointment({
        patient_id: '',
        appointment_date: '',
        motif: '',
        duration: 30,
        is_video: false,
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
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/doctor/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Recharger les rendez-vous pour avoir les données à jour
      await loadAppointments();
    setMessage(`✅ Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePrescribeMedication = (appointmentId) => {
    navigate(`/doctor/prescriptions/new?appointment=${appointmentId}`);
  };

  const handleViewMedicalRecord = (patientId) => {
    navigate(`/doctor/patients/${patientId}/medical-record`);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Recharger les rendez-vous pour avoir les données à jour
        await loadAppointments();
      setMessage('✅ Rendez-vous supprimé');
      } catch (error) {
        console.error('Erreur suppression rendez-vous:', error);
        setError('Erreur lors de la suppression du rendez-vous');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const startTeleconsultation = (appointmentId) => {
    window.open(`${API_BASE_URL}/teleconsultation/${appointmentId}`, '_blank');
  };

  const getStatusBadge = (status) => {
    const variants = {
      'scheduled': { bg: 'primary', text: 'Programmé' },
      'completed': { bg: 'success', text: 'Terminé' },
      'cancelled': { bg: 'danger', text: 'Annulé' },
      'in_progress': { bg: 'warning', text: 'En cours' },
      'no_show': { bg: 'secondary', text: 'Absent' }
    };
    const config = variants[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAppointmentsByStatus = () => {
    const today = appointments.filter(apt => 
      new Date(apt.appointment_date).toDateString() === new Date().toDateString()
    );
    
    return {
      scheduled: today.filter(apt => apt.status === 'scheduled').length,
      completed: today.filter(apt => apt.status === 'completed').length,
      cancelled: today.filter(apt => apt.status === 'cancelled').length,
      total: today.length
    };
  };

  const todayStats = getAppointmentsByStatus();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement des consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-appointments">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
            Mes consultations
          </h2>
          <p className="text-muted mb-0">Gérez vos rendez-vous et consultations</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nouveau rendez-vous
        </Button>
      </div>

      {/* Messages d'alerte */}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistiques rapides */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faCalendarCheck} size="2x" className="text-primary mb-2" />
              <h4>{todayStats.scheduled}</h4>
              <small className="text-muted">Programmés aujourd'hui</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-success mb-2" />
              <h4>{todayStats.completed}</h4>
              <small className="text-muted">Terminés</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faTimesCircle} size="2x" className="text-danger mb-2" />
              <h4>{todayStats.cancelled}</h4>
              <small className="text-muted">Annulés</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faStethoscope} size="2x" className="text-info mb-2" />
              <h4>{todayStats.total}</h4>
              <small className="text-muted">Total aujourd'hui</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres et recherche */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Recherche</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher par patient ou motif..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-2">
                <Form.Label>Période</Form.Label>
                <Form.Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">Toutes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="tomorrow">Demain</option>
                  <option value="week">Cette semaine</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-2">
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="scheduled">Programmés</option>
                  <option value="completed">Terminés</option>
                  <option value="cancelled">Annulés</option>
                  <option value="in_progress">En cours</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-2">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="physical">Présentiel</option>
                  <option value="video">Téléconsultation</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                  setTypeFilter('all');
                }}
              >
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                Réinitialiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table des rendez-vous */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">
            Liste des consultations ({filteredAppointments.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredAppointments.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0" hover>
                <thead className="table-light">
                  <tr>
                    <th>Date/Heure</th>
                    <th>Patient</th>
                    <th>Motif</th>
                    <th>Type</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <div className="fw-medium">{formatDateTime(appointment.appointment_date)}</div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{appointment.patient_name}</div>
                          <small className="text-muted">{appointment.patient_phone}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          {appointment.motif}
                          {appointment.notes && (
                            <div>
                              <small className="text-muted">{appointment.notes}</small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {appointment.is_video ? (
                          <Badge bg="info">
                            <FontAwesomeIcon icon={faVideo} className="me-1" />
                            Téléconsultation
                          </Badge>
                        ) : (
                          <Badge bg="secondary">
                            <FontAwesomeIcon icon={faUserMd} className="me-1" />
                            Présentiel
                          </Badge>
                        )}
                      </td>
                      <td>{appointment.duration} min</td>
                      <td>{getStatusBadge(appointment.status)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUpdateStatus(appointment.id, 'in_progress')}
                                title="Marquer en cours"
                              >
                                <FontAwesomeIcon icon={faClock} />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                title="Marquer comme terminé"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </Button>
                            </>
                          )}
                          {appointment.status === 'in_progress' && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                              title="Marquer comme terminé"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </Button>
                          )}
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handlePrescribeMedication(appointment.id)}
                            title="Prescrire des médicaments"
                          >
                            <FontAwesomeIcon icon={faPrescription} />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleViewMedicalRecord(appointment.patient_id)}
                            title="Voir dossier médical"
                          >
                            <FontAwesomeIcon icon={faStethoscope} />
                          </Button>
                          {appointment.is_video && appointment.status === 'scheduled' && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => startTeleconsultation(appointment.id)}
                              title="Démarrer la téléconsultation"
                            >
                              <FontAwesomeIcon icon={faVideo} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FontAwesomeIcon icon={faCalendarAlt} size="4x" className="text-muted mb-3" />
              <h4>Aucune consultation trouvée</h4>
              <p className="text-muted">Aucune consultation ne correspond à vos critères de recherche</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Créer un nouveau rendez-vous
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal création rendez-vous */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nouveau rendez-vous
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateAppointment}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={newAppointment.patient_id}
                    onChange={(e) => setNewAppointment({...newAppointment, patient_id: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients && patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.phone || 'Pas de téléphone'})
                      </option>
                    ))}
                  </Form.Select>
                  {patients.length === 0 && (
                    <Form.Text className="text-danger">
                      Aucun patient disponible. Veuillez d'abord ajouter des patients.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date et heure <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newAppointment.appointment_date}
                    onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Durée (minutes)</Form.Label>
                  <Form.Select
                    value={newAppointment.duration}
                    onChange={(e) => setNewAppointment({...newAppointment, duration: parseInt(e.target.value)})}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 heure</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de consultation</Form.Label>
                  <Form.Check
                    type="switch"
                    id="video-switch"
                    label="Téléconsultation"
                    checked={newAppointment.is_video}
                    onChange={(e) => setNewAppointment({...newAppointment, is_video: e.target.checked})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Motif de consultation <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Consultation générale, Suivi..."
                value={newAppointment.motif}
                onChange={(e) => setNewAppointment({...newAppointment, motif: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (optionnel)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Notes ou observations particulières..."
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
              Créer le rendez-vous
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default DoctorAppointments;