import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
  Tabs,
  Tab,
  Table,
  Badge,
  Modal
} from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes, FaHistory, FaPills, FaFileMedical } from 'react-icons/fa';

function DoctorMedicalRecord() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    medical_history: '',
    allergies: '',
    medications: '',
    family_history: '',
    social_history: '',
    last_physical_exam: '',
    vital_signs: {},
    lab_results: {},
    imaging_results: {},
    notes: ''
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);

  // Charger le dossier médical
  const loadMedicalRecord = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctor/patients/${patientId}/medical-record`);
      setMedicalRecord(response.data);
      setFormData({
        medical_history: response.data.medical_history || '',
        allergies: response.data.allergies || '',
        medications: response.data.medications || '',
        family_history: response.data.family_history || '',
        social_history: response.data.social_history || '',
        last_physical_exam: response.data.last_physical_exam || '',
        vital_signs: response.data.vital_signs || {},
        lab_results: response.data.lab_results || {},
        imaging_results: response.data.imaging_results || {},
        notes: response.data.notes || ''
      });
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement du dossier médical:', err);
      setError('Erreur lors du chargement du dossier médical. Veuillez réessayer.');
      toast.error('Erreur lors du chargement du dossier médical');
    } finally {
      setLoading(false);
    }
  };

  // Charger l'historique des consultations
  const loadConsultationHistory = async () => {
    try {
      const response = await api.get(`/doctor/patients/${patientId}/consultations`);
      setConsultationHistory(response.data.consultations || []);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique des consultations:', err);
      toast.error('Erreur lors du chargement de l\'historique des consultations');
    }
  };

  // Charger l'historique des prescriptions
  const loadPrescriptionHistory = async () => {
    try {
      const response = await api.get(`/doctor/patients/${patientId}/prescriptions`);
      setPrescriptionHistory(response.data.prescriptions || []);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique des prescriptions:', err);
      toast.error('Erreur lors du chargement de l\'historique des prescriptions');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadMedicalRecord(),
          loadConsultationHistory(),
          loadPrescriptionHistory()
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.response?.data?.error || 'Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer les changements dans les signes vitaux
  const handleVitalSignsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [field]: value
      }
    }));
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    try {
      await api.put(`/doctor/patients/${patientId}/medical-record`, formData);
      setIsEditing(false);
      loadMedicalRecord();
      toast.success('Dossier médical mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du dossier médical:', err);
      toast.error(err.error || 'Erreur lors de la mise à jour du dossier médical');
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">Chargement du dossier médical...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Retour
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Dossier Médical</h2>
          <p className="text-muted">
            Patient: {medicalRecord.patient_name}
          </p>
        </Col>
        <Col xs="auto">
          <Button
            variant={isEditing ? "success" : "primary"}
            className="me-2"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <FaSave className="me-2" />
                Enregistrer
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                Modifier
              </>
            )}
          </Button>
          {isEditing && (
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  medical_history: medicalRecord.medical_history || '',
                  allergies: medicalRecord.allergies || '',
                  medications: medicalRecord.medications || '',
                  family_history: medicalRecord.family_history || '',
                  social_history: medicalRecord.social_history || '',
                  last_physical_exam: medicalRecord.last_physical_exam || '',
                  vital_signs: medicalRecord.vital_signs || {},
                  lab_results: medicalRecord.lab_results || {},
                  imaging_results: medicalRecord.imaging_results || {},
                  notes: medicalRecord.notes || ''
                });
              }}
            >
              <FaTimes className="me-2" />
              Annuler
            </Button>
          )}
          <Button
            variant="info"
            className="ms-2"
            onClick={() => setShowHistoryModal(true)}
          >
            <FaHistory className="me-2" />
            Historique
          </Button>
        </Col>
      </Row>

      <Tabs defaultActiveKey="info" className="mb-4">
        <Tab eventKey="info" title="Informations Générales">
          <Card>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Antécédents Médicaux</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="medical_history"
                      value={formData.medical_history}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Allergies</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Antécédents Familiaux</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="family_history"
                      value={formData.family_history}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Histoire Sociale</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="social_history"
                      value={formData.social_history}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Médicaments en cours</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="vitals" title="Signes Vitaux">
          <Card>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tension Artérielle</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.vital_signs.blood_pressure || ''}
                      onChange={(e) => handleVitalSignsChange('blood_pressure', e.target.value)}
                      disabled={!isEditing}
                      placeholder="ex: 120/80 mmHg"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fréquence Cardiaque</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.vital_signs.heart_rate || ''}
                      onChange={(e) => handleVitalSignsChange('heart_rate', e.target.value)}
                      disabled={!isEditing}
                      placeholder="ex: 72 bpm"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Température</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.vital_signs.temperature || ''}
                      onChange={(e) => handleVitalSignsChange('temperature', e.target.value)}
                      disabled={!isEditing}
                      placeholder="ex: 37.2°C"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Poids</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.vital_signs.weight || ''}
                      onChange={(e) => handleVitalSignsChange('weight', e.target.value)}
                      disabled={!isEditing}
                      placeholder="ex: 70 kg"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Taille</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.vital_signs.height || ''}
                      onChange={(e) => handleVitalSignsChange('height', e.target.value)}
                      disabled={!isEditing}
                      placeholder="ex: 175 cm"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>IMC</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.vital_signs.bmi || ''}
                      onChange={(e) => handleVitalSignsChange('bmi', e.target.value)}
                      disabled={!isEditing}
                      placeholder="ex: 22.5"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Saturation en O2</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.vital_signs.oxygen_saturation || ''}
                      onChange={(e) => handleVitalSignsChange('oxygen_saturation', e.target.value)}
                      disabled={!isEditing}
                      placeholder="ex: 98%"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dernier Examen Physique</Form.Label>
                    <Form.Control
                      type="date"
                      name="last_physical_exam"
                      value={formData.last_physical_exam ? new Date(formData.last_physical_exam).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="results" title="Résultats">
          <Card>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Résultats d'Analyses</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={JSON.stringify(formData.lab_results, null, 2)}
                      onChange={(e) => {
                        try {
                          const value = JSON.parse(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            lab_results: value
                          }));
                        } catch (err) {
                          // Ignorer les erreurs de parsing JSON pendant la saisie
                        }
                      }}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Résultats d'Imagerie</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={JSON.stringify(formData.imaging_results, null, 2)}
                      onChange={(e) => {
                        try {
                          const value = JSON.parse(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            imaging_results: value
                          }));
                        } catch (err) {
                          // Ignorer les erreurs de parsing JSON pendant la saisie
                        }
                      }}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal d'historique */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Historique Médical</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="consultations">
            <Tab eventKey="consultations" title="Consultations">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Motif</th>
                    <th>Diagnostic</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {consultationHistory.map(consultation => (
                    <tr key={consultation.id}>
                      <td>{new Date(consultation.appointment_datetime).toLocaleString()}</td>
                      <td>{consultation.reason}</td>
                      <td>{consultation.diagnosis}</td>
                      <td>
                        <Badge bg={
                          consultation.status === 'completed' ? 'success' :
                          consultation.status === 'cancelled' ? 'danger' :
                          'warning'
                        }>
                          {consultation.status === 'completed' ? 'Terminée' :
                           consultation.status === 'cancelled' ? 'Annulée' :
                           'En attente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {consultationHistory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        Aucune consultation trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="prescriptions" title="Prescriptions">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Médicaments</th>
                    <th>Instructions</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptionHistory.map(prescription => (
                    <tr key={prescription.id}>
                      <td>{new Date(prescription.created_at).toLocaleString()}</td>
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
                    </tr>
                  ))}
                  {prescriptionHistory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        Aucune prescription trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DoctorMedicalRecord; 