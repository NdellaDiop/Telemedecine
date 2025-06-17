import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, Row, Col, Card, Button, Table, 
  Modal, Form, Alert, Badge, InputGroup 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarPlus, faEdit, faTrash, faSearch,
  faCheck, faTimes, faClock, faFilter
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function AdminAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    doctor_id: '',
    date_from: '',
    date_to: ''
  });
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_datetime: '',
    reason: '',
    status: 'scheduled'
  });

  // Charger les données initiales
  useEffect(() => {
    const initializeData = async () => {
      if (!user || user.role !== 'admin') {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        await Promise.all([
          loadAppointments(),
          loadDoctors(),
          loadPatients()
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement initial:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user, navigate]);

  // Mettre à jour les rendez-vous quand les filtres changent
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAppointments();
    }
  }, [filters]);

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
      setError('Erreur lors du chargement des rendez-vous.');
      return Promise.reject(error);
    }
  };

  const loadDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data.doctors || []);
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
      setError('Erreur lors du chargement des médecins');
      return Promise.reject(error);
    }
  };

  const loadPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data || []);
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur chargement patients:', error);
      setError('Erreur lors du chargement des patients');
      return Promise.reject(error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadAppointments();
  };

  const handleShowModal = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        appointment_datetime: appointment.appointment_datetime.slice(0, 16),
        reason: appointment.reason,
        status: appointment.status
      });
    } else {
      setSelectedAppointment(null);
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_datetime: '',
        reason: '',
        status: 'scheduled'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const url = selectedAppointment 
        ? `${API_BASE_URL}/admin/appointments/${selectedAppointment.id}`
        : `${API_BASE_URL}/admin/appointments`;

      const method = selectedAppointment ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(selectedAppointment 
        ? 'Rendez-vous modifié avec succès'
        : 'Rendez-vous créé avec succès'
      );
      
      setShowModal(false);
      loadAppointments();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError(error.response?.data?.error || 'Erreur lors de la sauvegarde du rendez-vous');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/admin/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Rendez-vous supprimé avec succès');
      loadAppointments();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression du rendez-vous');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: 'primary',
      completed: 'success',
      cancelled: 'danger',
      no_show: 'warning'
    };
    const labels = {
      scheduled: 'Planifié',
      completed: 'Terminé',
      cancelled: 'Annulé',
      no_show: 'Non présenté'
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    const patient = patients.find(p => p.id === appointment.patient_id);
    const doctor = doctors.find(d => d.id === appointment.doctor_id);
    return (
      (patient?.name || '').toLowerCase().includes(searchLower) ||
      (doctor?.name || '').toLowerCase().includes(searchLower) ||
      (appointment.reason || '').toLowerCase().includes(searchLower) ||
      (appointment.status || '').toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faCalendarPlus} className="me-2 text-primary" />
            Gestion des rendez-vous
          </h2>
          <p className="text-muted mb-0">
            Gérez tous les rendez-vous de la plateforme
          </p>
        </div>
        <Button variant="success" onClick={() => handleShowModal()}>
          <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
          Nouveau rendez-vous
        </Button>
      </div>

      {/* Messages */}
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

      {/* Filtres */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleFilterSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                    <option value="no_show">Non présenté</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Médecin</Form.Label>
                  <Form.Select
                    name="doctor_id"
                    value={filters.doctor_id}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous les médecins</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.speciality}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date début</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_from"
                    value={filters.date_from}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date fin</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_to"
                    value={filters.date_to}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => {
                setFilters({
                  status: '',
                  doctor_id: '',
                  date_from: '',
                  date_to: ''
                });
                loadAppointments();
              }}>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Réinitialiser
              </Button>
              <Button variant="primary" type="submit">
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                Filtrer
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Recherche */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher un rendez-vous..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Liste des rendez-vous */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Date/Heure</th>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appointment => {
                const patient = patients.find(p => p.id === appointment.patient_id);
                const doctor = doctors.find(d => d.id === appointment.doctor_id);
                return (
                  <tr key={appointment.id}>
                    <td>
                      <FontAwesomeIcon icon={faClock} className="me-2 text-muted" />
                      {new Date(appointment.appointment_datetime).toLocaleString()}
                    </td>
                    <td>{patient?.name || 'Patient inconnu'}</td>
                    <td>{doctor?.name || 'Médecin inconnu'}</td>
                    <td>{appointment.reason}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(appointment)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de création/modification */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAppointment ? 'Modifier un rendez-vous' : 'Nouveau rendez-vous'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient</Form.Label>
                  <Form.Select
                    value={formData.patient_id}
                    onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Médecin</Form.Label>
                  <Form.Select
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un médecin</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.speciality}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date et heure</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.appointment_datetime}
                    onChange={(e) => setFormData({...formData, appointment_datetime: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="scheduled">Planifié</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                    <option value="no_show">Non présenté</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Motif</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              {selectedAppointment ? 'Modifier' : 'Créer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AdminAppointments; 