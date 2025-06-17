import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, Row, Col, Card, Button, Table, 
  Modal, Form, Alert, Badge, InputGroup 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, faEdit, faTrash, faSearch,
  faCalendarAlt, faFileMedical, faUser
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function AssistantPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    address: '',
    emergency_contact: '',
    medical_history: '',
    allergies: '',
    is_active: true
  });

  useEffect(() => {
    if (!user || user.role !== 'assistant') {
      navigate('/login');
      return;
    }
    loadPatients();
  }, [user, navigate]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Erreur chargement patients:', error);
      setError('Erreur lors du chargement des patients.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (patient = null) => {
    if (patient) {
      setSelectedPatient(patient);
      setFormData({
        name: patient.name,
        email: patient.email,
        phone: patient.phone || '',
        birthdate: patient.birthdate || '',
        address: patient.address || '',
        emergency_contact: patient.emergency_contact || '',
        medical_history: patient.medical_history || '',
        allergies: patient.allergies || '',
        is_active: patient.is_active
      });
    } else {
      setSelectedPatient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthdate: '',
        address: '',
        emergency_contact: '',
        medical_history: '',
        allergies: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedPatient) {
        // Modification
        await axios.put(
          `${API_BASE_URL}/patients/${selectedPatient.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('Patient modifié avec succès !');
      } else {
        // Création
        await axios.post(
          `${API_BASE_URL}/patients`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('Patient créé avec succès !');
      }
      setShowModal(false);
      loadPatients();
    } catch (error) {
      console.error('Erreur sauvegarde patient:', error);
      setError(error.response?.data?.error || 'Erreur lors de la sauvegarde.');
    }
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Patient supprimé avec succès !');
        loadPatients();
      } catch (error) {
        console.error('Erreur suppression patient:', error);
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone || '').includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement des patients...</p>
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
            <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
            Gestion des patients
          </h2>
          <p className="text-muted mb-0">
            Gérez les dossiers des patients
          </p>
        </div>
        <Button variant="success" onClick={() => handleShowModal()}>
          <FontAwesomeIcon icon={faUserPlus} className="me-2" />
          Nouveau patient
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

      {/* Recherche */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Liste des patients */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Date de naissance</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.phone || '-'}</td>
                  <td>{patient.birthdate ? new Date(patient.birthdate).toLocaleDateString() : '-'}</td>
                  <td>
                    <Badge bg={patient.is_active ? 'success' : 'danger'}>
                      {patient.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal(patient)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/assistant/patients/${patient.id}/appointments`)}
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/assistant/patients/${patient.id}/health-metrics`)}
                    >
                      <FontAwesomeIcon icon={faFileMedical} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de création/modification */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedPatient ? 'Modifier un patient' : 'Nouveau patient'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de naissance</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact d'urgence</Form.Label>
              <Form.Control
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Antécédents médicaux</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.medical_history}
                onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Allergies</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="is-active"
                label="Compte actif"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              {selectedPatient ? 'Modifier' : 'Créer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AssistantPatients; 