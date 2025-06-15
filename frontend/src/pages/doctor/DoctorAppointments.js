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
    loadAppointments();
    loadPatients();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateFilter, typeFilter]);

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Simuler les données pour la démo
      const mockAppointments = [
        {
          id: 1,
          patient_name: 'Aminata Diallo',
          patient_id: 101,
          appointment_date: '2025-01-11T09:30:00',
          motif: 'Consultation générale',
          status: 'scheduled',
          is_video: false,
          duration: 30,
          patient_phone: '+221 77 123 45 67',
          notes: 'Première consultation'
        },
        {
          id: 2,
          patient_name: 'Mamadou Sow',
          patient_id: 102,
          appointment_date: '2025-01-11T10:15:00',
          motif: 'Suivi cardiologie',
          status: 'scheduled',
          is_video: true,
          duration: 45,
          patient_phone: '+221 78 234 56 78',
          notes: 'Contrôle tension artérielle'
        },
        {
          id: 3,
          patient_name: 'Fatou Ndiaye',
          patient_id: 103,
          appointment_date: '2025-01-11T14:00:00',
          motif: 'Consultation pédiatrique',
          status: 'completed',
          is_video: false,
          duration: 30,
          patient_phone: '+221 79 345 67 89',
          notes: 'Vaccinations'
        },
        {
          id: 4,
          patient_name: 'Ibrahima Fall',
          patient_id: 104,
          appointment_date: '2025-01-12T11:00:00',
          motif: 'Téléconsultation de suivi',
          status: 'scheduled',
          is_video: true,
          duration: 30,
          patient_phone: '+221 70 456 78 90',
          notes: 'Résultats analyses'
        },
        {
          id: 5,
          patient_name: 'Aissatou Ba',
          patient_id: 105,
          appointment_date: '2025-01-10T16:30:00',
          motif: 'Urgence',
          status: 'cancelled',
          is_video: false,
          duration: 60,
          patient_phone: '+221 76 567 89 01',
          notes: 'Annulé par le patient'
        }
      ];
      
      setAppointments(mockAppointments);
    } catch (err) {
      setError('Erreur lors du chargement des rendez-vous');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      // Simuler la liste des patients
      const mockPatients = [
        { id: 101, name: 'Aminata Diallo', email: 'aminata.diallo@email.com' },
        { id: 102, name: 'Mamadou Sow', email: 'mamadou.sow@email.com' },
        { id: 103, name: 'Fatou Ndiaye', email: 'fatou.ndiaye@email.com' },
        { id: 104, name: 'Ibrahima Fall', email: 'ibrahima.fall@email.com' },
        { id: 105, name: 'Aissatou Ba', email: 'aissatou.ba@email.com' }
      ];
      setPatients(mockPatients);
    } catch (err) {
      console.error('Erreur chargement patients:', err);
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
      // Simuler la création
      const newId = Math.max(...appointments.map(a => a.id)) + 1;
      const patient = patients.find(p => p.id === parseInt(newAppointment.patient_id));
      
      const createdAppointment = {
        id: newId,
        patient_name: patient?.name || 'Patient inconnu',
        patient_id: parseInt(newAppointment.patient_id),
        appointment_date: newAppointment.appointment_date,
        motif: newAppointment.motif,
        status: 'scheduled',
        is_video: newAppointment.is_video,
        duration: newAppointment.duration,
        patient_phone: '+221 XX XXX XX XX',
        notes: newAppointment.notes
      };

      setAppointments([...appointments, createdAppointment]);
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
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Erreur lors de la création du rendez-vous');
    }
  };

  const handleUpdateStatus = (appointmentId, newStatus) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
    setMessage(`✅ Statut mis à jour: ${newStatus}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));
      setMessage('✅ Rendez-vous supprimé');
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
                        <Dropdown as={ButtonGroup}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              // Ici on pourrait ouvrir un modal de détails
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>

                          <Dropdown.Toggle 
                            split 
                            variant="outline-primary" 
                            size="sm"
                          />

                          <Dropdown.Menu>
                            {appointment.status === 'scheduled' && (
                              <>
                                {appointment.is_video && (
                                  <Dropdown.Item onClick={() => startTeleconsultation(appointment.id)}>
                                    <FontAwesomeIcon icon={faVideo} className="me-2" />
                                    Démarrer téléconsultation
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item onClick={() => handleUpdateStatus(appointment.id, 'in_progress')}>
                                  <FontAwesomeIcon icon={faClock} className="me-2" />
                                  Marquer en cours
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleUpdateStatus(appointment.id, 'completed')}>
                                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                  Marquer terminé
                                </Dropdown.Item>
                                <Dropdown.Divider />
                              </>
                            )}
                            
                            <Dropdown.Item onClick={() => navigate(`/doctor/patients/${appointment.patient_id}`)}>
                              <FontAwesomeIcon icon={faUser} className="me-2" />
                              Voir dossier patient
                            </Dropdown.Item>
                            
                            <Dropdown.Item onClick={() => navigate(`/doctor/prescriptions/new?patient=${appointment.patient_id}`)}>
                              <FontAwesomeIcon icon={faPrescription} className="me-2" />
                              Prescrire médicament
                            </Dropdown.Item>
                            
                            <Dropdown.Divider />
                            
                            <Dropdown.Item 
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="text-danger"
                            >
                              <FontAwesomeIcon icon={faTrash} className="me-2" />
                              Supprimer
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
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
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.email}
                      </option>
                    ))}
                  </Form.Select>
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