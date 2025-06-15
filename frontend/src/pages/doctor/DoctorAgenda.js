import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, faPlus, faEdit, faTrash, faClock, faCheck, faTimes,
  faCalendarPlus, faUsers, faStethoscope, faPhone,
  faChevronLeft, faChevronRight, faHome, faSync
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function DoctorAgenda() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [agenda, setAgenda] = useState({
    slots: [],
    appointments: []
  });

  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    duration: 30,
    type: 'consultation'
  });

  useEffect(() => {
    loadAgenda();
  }, [currentDate, viewMode]);

  const loadAgenda = async () => {
    try {
      // Simulation des données pour la démo
      const slots = [
        {
          id: 1,
          date: '2025-01-15',
          startTime: '08:00',
          endTime: '12:00',
          duration: 30,
          type: 'consultation',
          status: 'available',
          totalSlots: 8,
          bookedSlots: 5
        },
        {
          id: 2,
          date: '2025-01-15',
          startTime: '14:00',
          endTime: '18:00',
          duration: 30,
          type: 'consultation',
          status: 'available',
          totalSlots: 8,
          bookedSlots: 3
        },
        {
          id: 3,
          date: '2025-01-16',
          startTime: '08:30',
          endTime: '12:30',
          duration: 30,
          type: 'consultation',
          status: 'available',
          totalSlots: 8,
          bookedSlots: 7
        }
      ];

      const appointments = [
        {
          id: 1,
          patientName: 'Aminata Diallo',
          patientPhone: '77 123 45 67',
          date: '2025-01-15',
          time: '08:30',
          duration: 30,
          type: 'Consultation générale',
          status: 'confirmed',
          isUrgent: false,
          notes: 'Suivi hypertension'
        },
        {
          id: 2,
          patientName: 'Mamadou Sow',
          patientPhone: '70 987 65 43',
          date: '2025-01-15',
          time: '09:00',
          duration: 30,
          type: 'Suivi cardiologie',
          status: 'confirmed',
          isUrgent: true,
          notes: 'Contrôle ECG'
        },
        {
          id: 3,
          patientName: 'Fatou Ndiaye',
          patientPhone: '76 555 44 33',
          date: '2025-01-15',
          time: '10:00',
          duration: 30,
          type: 'Consultation pédiatrie',
          status: 'pending',
          isUrgent: false,
          notes: 'Vaccination'
        },
        {
          id: 4,
          patientName: 'Ibrahima Fall',
          patientPhone: '78 222 11 99',
          date: '2025-01-15',
          time: '14:30',
          duration: 30,
          type: 'Consultation générale',
          status: 'confirmed',
          isUrgent: false,
          notes: 'Bilan de santé'
        },
        {
          id: 5,
          patientName: 'Aissatou Ba',
          patientPhone: '77 888 99 00',
          date: '2025-01-16',
          time: '09:30',
          duration: 30,
          type: 'Suivi gynécologie',
          status: 'confirmed',
          isUrgent: false,
          notes: 'Consultation de routine'
        }
      ];

      setAgenda({ slots, appointments });
    } catch (error) {
      console.error('Erreur chargement agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
    }
    setCurrentDate(newDate);
  };

  const getWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Commence le lundi
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return agenda.appointments.filter(apt => apt.date === dateStr);
  };

  const getSlotsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return agenda.slots.filter(slot => slot.date === dateStr);
  };

  const handleAddSlot = () => {
    setNewSlot({
      date: currentDate.toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      duration: 30,
      type: 'consultation'
    });
    setSelectedSlot(null);
    setShowSlotModal(true);
  };

  const handleEditSlot = (slot) => {
    setNewSlot({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      type: slot.type
    });
    setSelectedSlot(slot);
    setShowSlotModal(true);
  };

  const handleSaveSlot = () => {
    // Ici, vous feriez l'appel API pour sauvegarder le créneau
    console.log('Sauvegarde créneau:', newSlot);
    setShowSlotModal(false);
    loadAgenda(); // Recharger les données
  };

  const handleDeleteSlot = (slotId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      // Ici, vous feriez l'appel API pour supprimer le créneau
      console.log('Suppression créneau:', slotId);
      loadAgenda(); // Recharger les données
    }
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleConfirmAppointment = (appointmentId) => {
    // Ici, vous feriez l'appel API pour confirmer le RDV
    console.log('Confirmation RDV:', appointmentId);
    loadAgenda(); // Recharger les données
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      // Ici, vous feriez l'appel API pour annuler le RDV
      console.log('Annulation RDV:', appointmentId);
      loadAgenda(); // Recharger les données
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement de l'agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-agenda">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
            Mon Agenda
          </h2>
          <p className="text-muted mb-0">
            Gérez vos créneaux de disponibilité et consultations
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleAddSlot}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Ajouter créneaux
          </Button>
          <Button variant="primary" onClick={() => navigate('/doctor/appointments')}>
            <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
            Voir les RDV
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <h3 className="fw-bold">{agenda.appointments.filter(a => a.status === 'confirmed').length}</h3>
              <p className="text-muted mb-0">RDV confirmés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-warning mb-2">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3 className="fw-bold">{agenda.appointments.filter(a => a.status === 'pending').length}</h3>
              <p className="text-muted mb-0">En attente</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3 className="fw-bold">{agenda.slots.reduce((acc, slot) => acc + (slot.totalSlots - slot.bookedSlots), 0)}</h3>
              <p className="text-muted mb-0">Créneaux libres</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">
                <FontAwesomeIcon icon={faStethoscope} />
              </div>
              <h3 className="fw-bold">{agenda.slots.reduce((acc, slot) => acc + slot.bookedSlots, 0)}</h3>
              <p className="text-muted mb-0">Consultations prévues</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navigation et contrôles */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigateDate(-1)}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </Button>
                <div className="mx-3">
                  <h5 className="mb-0">{formatDate(currentDate)}</h5>
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigateDate(1)}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  className="ms-3"
                  onClick={() => setCurrentDate(new Date())}
                >
                  <FontAwesomeIcon icon={faHome} className="me-1" />
                  Aujourd'hui
                </Button>
              </div>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value)}
                size="sm"
              >
                <option value="day">Vue jour</option>
                <option value="week">Vue semaine</option>
                <option value="month">Vue mois</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Button variant="outline-info" size="sm" onClick={loadAgenda}>
                <FontAwesomeIcon icon={faSync} className="me-1" />
                Actualiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Vue semaine */}
      {viewMode === 'week' && (
        <Row>
          {getWeekDates().map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const daySlots = getSlotsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <Col lg={12} className="mb-4" key={index}>
                <Card className={`border-0 shadow-sm ${isToday ? 'border-primary' : ''}`}>
                  <Card.Header className={`${isToday ? 'bg-primary text-white' : 'bg-white'} border-0 py-3`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="fw-bold mb-0">
                        {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        {isToday && <Badge bg="light" text="primary" className="ms-2">Aujourd'hui</Badge>}
                      </h6>
                      <div className="d-flex gap-2">
                        <Button 
                          variant={isToday ? "light" : "outline-primary"} 
                          size="sm"
                          onClick={handleAddSlot}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </Button>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {/* Créneaux de disponibilité */}
                    {daySlots.length > 0 && (
                      <div className="mb-4">
                        <h6 className="fw-bold mb-3 text-success">
                          <FontAwesomeIcon icon={faClock} className="me-2" />
                          Créneaux de disponibilité
                        </h6>
                        <Row>
                          {daySlots.map((slot) => (
                            <Col md={6} key={slot.id} className="mb-3">
                              <Card className="border border-success">
                                <Card.Body className="py-2">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <div className="fw-medium">
                                        {slot.startTime} - {slot.endTime}
                                      </div>
                                      <small className="text-muted">
                                        {slot.bookedSlots}/{slot.totalSlots} réservés
                                      </small>
                                    </div>
                                    <div className="d-flex gap-1">
                                      <OverlayTrigger 
                                        overlay={<Tooltip>Modifier</Tooltip>}
                                        placement="top"
                                      >
                                        <Button 
                                          variant="outline-primary" 
                                          size="sm"
                                          onClick={() => handleEditSlot(slot)}
                                        >
                                          <FontAwesomeIcon icon={faEdit} />
                                        </Button>
                                      </OverlayTrigger>
                                      <OverlayTrigger 
                                        overlay={<Tooltip>Supprimer</Tooltip>}
                                        placement="top"
                                      >
                                        <Button 
                                          variant="outline-danger" 
                                          size="sm"
                                          onClick={() => handleDeleteSlot(slot.id)}
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                      </OverlayTrigger>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}

                    {/* Rendez-vous */}
                    {dayAppointments.length > 0 ? (
                      <div>
                        <h6 className="fw-bold mb-3 text-primary">
                          <FontAwesomeIcon icon={faUsers} className="me-2" />
                          Consultations ({dayAppointments.length})
                        </h6>
                        <div className="table-responsive">
                          <Table size="sm" className="mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Heure</th>
                                <th>Patient</th>
                                <th>Type</th>
                                <th>Statut</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dayAppointments.map((appointment) => (
                                <tr key={appointment.id} className={appointment.isUrgent ? 'table-warning' : ''}>
                                  <td>
                                    <div className="fw-medium">{appointment.time}</div>
                                    {appointment.isUrgent && (
                                      <Badge bg="danger" className="mt-1">Urgent</Badge>
                                    )}
                                  </td>
                                  <td>
                                    <div className="fw-medium">{appointment.patientName}</div>
                                    <small className="text-muted">{appointment.patientPhone}</small>
                                  </td>
                                  <td>{appointment.type}</td>
                                  <td>
                                    <Badge bg={getStatusColor(appointment.status)}>
                                      {getStatusText(appointment.status)}
                                    </Badge>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <OverlayTrigger 
                                        overlay={<Tooltip>Voir détails</Tooltip>}
                                        placement="top"
                                      >
                                        <Button 
                                          variant="outline-info" 
                                          size="sm"
                                          onClick={() => handleViewAppointment(appointment)}
                                        >
                                          <FontAwesomeIcon icon={faStethoscope} />
                                        </Button>
                                      </OverlayTrigger>
                                      {appointment.status === 'pending' && (
                                        <OverlayTrigger 
                                          overlay={<Tooltip>Confirmer</Tooltip>}
                                          placement="top"
                                        >
                                          <Button 
                                            variant="outline-success" 
                                            size="sm"
                                            onClick={() => handleConfirmAppointment(appointment.id)}
                                          >
                                            <FontAwesomeIcon icon={faCheck} />
                                          </Button>
                                        </OverlayTrigger>
                                      )}
                                      <OverlayTrigger 
                                        overlay={<Tooltip>Appeler</Tooltip>}
                                        placement="top"
                                      >
                                        <Button 
                                          variant="outline-primary" 
                                          size="sm"
                                          href={`tel:${appointment.patientPhone}`}
                                        >
                                          <FontAwesomeIcon icon={faPhone} />
                                        </Button>
                                      </OverlayTrigger>
                                      <OverlayTrigger 
                                        overlay={<Tooltip>Annuler</Tooltip>}
                                        placement="top"
                                      >
                                        <Button 
                                          variant="outline-danger" 
                                          size="sm"
                                          onClick={() => handleCancelAppointment(appointment.id)}
                                        >
                                          <FontAwesomeIcon icon={faTimes} />
                                        </Button>
                                      </OverlayTrigger>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="text-muted mb-2" />
                        <h6 className="text-muted">Aucune consultation prévue</h6>
                        <p className="text-muted mb-0">Cette journée est libre</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal ajout/modification créneau */}
      <Modal show={showSlotModal} onHide={() => setShowSlotModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2 text-success" />
            {selectedSlot ? 'Modifier le créneau' : 'Ajouter un créneau'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={newSlot.type}
                    onChange={(e) => setNewSlot({...newSlot, type: e.target.value})}
                  >
                    <option value="consultation">Consultation</option>
                    <option value="urgence">Urgence</option>
                    <option value="suivi">Suivi</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Heure de début</Form.Label>
                  <Form.Control
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Heure de fin</Form.Label>
                  <Form.Control
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Durée par consultation (minutes)</Form.Label>
              <Form.Select
                value={newSlot.duration}
                onChange={(e) => setNewSlot({...newSlot, duration: parseInt(e.target.value)})}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 heure</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSlotModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleSaveSlot}>
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            {selectedSlot ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal détails rendez-vous */}
      <Modal show={showAppointmentModal} onHide={() => setShowAppointmentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faStethoscope} className="me-2 text-primary" />
            Détails du rendez-vous
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              <Row className="mb-3">
                <Col xs={12}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">{selectedAppointment.patientName}</h5>
                      <Row>
                        <Col md={6}>
                          <div className="mb-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                            <strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="mb-2">
                            <FontAwesomeIcon icon={faClock} className="me-2 text-info" />
                            <strong>Heure:</strong> {selectedAppointment.time}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-2">
                            <FontAwesomeIcon icon={faPhone} className="me-2 text-success" />
                            <strong>Téléphone:</strong> {selectedAppointment.patientPhone}
                          </div>
                          <div className="mb-2">
                            <FontAwesomeIcon icon={faStethoscope} className="me-2 text-warning" />
                            <strong>Type:</strong> {selectedAppointment.type}
                          </div>
                        </Col>
                      </Row>
                      {selectedAppointment.notes && (
                        <div className="mt-3">
                          <strong>Notes:</strong>
                          <Alert variant="info" className="mt-2 py-2">
                            {selectedAppointment.notes}
                          </Alert>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAppointmentModal(false)}>
            Fermer
          </Button>
          {selectedAppointment?.status === 'pending' && (
            <Button 
              variant="success" 
              onClick={() => {
                handleConfirmAppointment(selectedAppointment.id);
                setShowAppointmentModal(false);
              }}
            >
              <FontAwesomeIcon icon={faCheck} className="me-2" />
              Confirmer
            </Button>
          )}
          <Button 
            variant="primary" 
            href={`tel:${selectedAppointment?.patientPhone}`}
          >
            <FontAwesomeIcon icon={faPhone} className="me-2" />
            Appeler
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DoctorAgenda;