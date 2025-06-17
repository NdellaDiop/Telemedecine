import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Badge,
  Spinner,
  Alert,
  InputGroup,
  FormControl,
  Dropdown,
  DropdownButton
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaPrint } from 'react-icons/fa';

const DoctorPrescriptions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    medications: [],
    instructions: '',
        duration: '',
    notes: ''
  });
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadPrescriptions = async () => {
    try {
      const response = await api.get('/doctor/prescriptions');
      setPrescriptions(response.data.prescriptions || []);
    } catch (err) {
      console.error('Erreur lors du chargement des prescriptions:', err);
      toast.error('Erreur lors du chargement des prescriptions');
      setError(err.response?.data?.error || 'Erreur de connexion au serveur');
    }
  };

  const loadPatients = async () => {
    try {
      const response = await api.get(`/doctor/${user.id}/patients`);
      setPatients(response.data.patients || []);
    } catch (err) {
      console.error('Erreur lors du chargement des patients:', err);
      toast.error('Erreur lors du chargement des patients');
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await api.get('/doctor/appointments');
      setAppointments(response.data.filter(apt => apt.status === 'completed'));
    } catch (err) {
      console.error('Erreur lors du chargement des rendez-vous:', err);
      toast.error('Erreur lors du chargement des rendez-vous');
    }
  };

  useEffect(() => {
    loadPrescriptions();
    loadPatients();
    loadAppointments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleNewPrescription = () => {
    setFormData({
      patient_id: '',
      appointment_id: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      instructions: '',
      duration: '',
      notes: ''
    });
    setSelectedPatient(null);
    setShowNewPrescriptionModal(true);
  };

  const handleEditPrescription = (prescription) => {
    setFormData({
      patient_id: prescription.patient_id,
      appointment_id: prescription.appointment_id,
      medications: prescription.medications,
      instructions: prescription.instructions,
      duration: prescription.duration,
      notes: prescription.notes
    });
    setSelectedPatient(prescription.patient_id);
    setShowNewPrescriptionModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPatient) {
        await api.put(`/doctor/prescriptions/${selectedPatient}`, formData);
        toast.success('Prescription mise à jour avec succès');
      } else {
        await api.post('/doctor/prescriptions', formData);
        toast.success('Prescription créée avec succès');
      }
      setShowNewPrescriptionModal(false);
      loadPrescriptions();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la prescription:', err);
      toast.error(err.error || 'Erreur lors de la sauvegarde de la prescription');
    }
  };

  const filteredPrescriptions = prescriptions
    .filter(prescription => {
      const matchesSearch = prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const handlePrint = (prescription) => {
    toast.info('Fonctionnalité d\'impression à venir');
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">Chargement des prescriptions...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Gestion des Prescriptions</h2>
          <p className="text-muted">Créez et gérez les prescriptions médicales de vos patients</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleNewPrescription}>
            <FaPlus className="me-2" />
            Nouvelle Prescription
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Rechercher par patient ou médicament..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <DropdownButton
                id="sort-dropdown"
                title={`Trier par: ${sortBy === 'created_at' ? 'Date' : 'Patient'}`}
                variant="outline-secondary"
              >
                <Dropdown.Item
                  onClick={() => {
                    setSortBy('created_at');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setSortBy('patient_name');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Patient {sortBy === 'patient_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Dropdown.Item>
              </DropdownButton>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
            <div className="table-responsive">
            <Table hover>
              <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                  <th>Médicaments</th>
                  <th>Instructions</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {filteredPrescriptions.map(prescription => (
                    <tr key={prescription.id}>
                    <td>{prescription.patient_name}</td>
                    <td>{new Date(prescription.created_at).toLocaleDateString()}</td>
                    <td>
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="mb-1">
                          <strong>{med.name}</strong>
                          <br />
                          {med.dosage} - {med.frequency}
                        </div>
                      ))}
                      </td>
                    <td>{prescription.instructions}</td>
                    <td>
                      <Badge bg={
                        prescription.status === 'active' ? 'success' :
                        prescription.status === 'completed' ? 'info' :
                        'danger'
                      }>
                        {prescription.status === 'active' ? 'Active' :
                         prescription.status === 'completed' ? 'Terminée' :
                         'Annulée'}
                        </Badge>
                      </td>
                      <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                        className="me-2"
                        onClick={() => handleEditPrescription(prescription)}
                          >
                        <FaEdit />
                          </Button>
                          <Button 
                        variant="outline-secondary"
                            size="sm" 
                        onClick={() => handlePrint(prescription)}
                      >
                        <FaPrint />
                          </Button>
                      </td>
                    </tr>
                  ))}
                {filteredPrescriptions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Aucune prescription trouvée
                    </td>
                  </tr>
                )}
                </tbody>
              </Table>
            </div>
        </Card.Body>
      </Card>

      <Modal show={showNewPrescriptionModal} onHide={() => setShowNewPrescriptionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedPatient ? 'Modifier la Prescription' : 'Nouvelle Prescription'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
        <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Patient</Form.Label>
                  <Form.Select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleInputChange}
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
                <Form.Group>
                  <Form.Label>Rendez-vous</Form.Label>
                  <Form.Select
                    name="appointment_id"
                    value={formData.appointment_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner un rendez-vous (optionnel)</option>
                    {appointments
                      .filter(apt => !formData.patient_id || apt.patient_id === parseInt(formData.patient_id))
                      .map(appointment => (
                        <option key={appointment.id} value={appointment.id}>
                          {new Date(appointment.appointment_datetime).toLocaleString()}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Médicaments</Form.Label>
              {formData.medications.map((medication, index) => (
                <Card key={index} className="mb-3">
                    <Card.Body>
                      <Row>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Nom</Form.Label>
                            <Form.Control
                              type="text"
                              value={medication.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                            required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                        <Form.Group>
                            <Form.Label>Dosage</Form.Label>
                            <Form.Control
                              type="text"
                              value={medication.dosage}
                              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                        <Form.Group>
                            <Form.Label>Fréquence</Form.Label>
                            <Form.Control
                              type="text"
                              value={medication.frequency}
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            required
                            />
                          </Form.Group>
                        </Col>
                      <Col md={2}>
                        <Form.Group>
                            <Form.Label>Durée</Form.Label>
                            <Form.Control
                              type="text"
                              value={medication.duration}
                              onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                            required
                            />
                          </Form.Group>
                        </Col>
                      <Col md={1} className="d-flex align-items-end">
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                          onClick={() => removeMedication(index)}
                          disabled={formData.medications.length === 1}
                          >
                          <FaTrash />
                          </Button>
                      </Col>
                    </Row>
                    </Card.Body>
                  </Card>
                ))}
                            <Button 
                variant="outline-primary"
                              size="sm"
                onClick={addMedication}
                className="mt-2"
                            >
                <FaPlus className="me-2" />
                Ajouter un médicament
                            </Button>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Instructions</Form.Label>
                            <Form.Control
                              as="textarea"
                rows={3}
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Durée totale</Form.Label>
              <Form.Control
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                            />
                          </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewPrescriptionModal(false)}>
            Annuler
          </Button>
            <Button variant="primary" type="submit">
              {selectedPatient ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default DoctorPrescriptions;