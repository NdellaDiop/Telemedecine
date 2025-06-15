import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Alert, Badge, Table, Modal, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, faEdit, faSave, faEye, faDownload, faPlus,
  faAllergies, faHistory, faStethoscope, faFileImage, faPrint,
  faCalendarAlt, faUserMd, faExclamationTriangle, faCheck,
  faHeartbeat, faWeight, faThermometerHalf, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function PatientMedicalRecord() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [medicalRecord, setMedicalRecord] = useState({
    medical_history: '',
    allergies: '',
    consultation_notes: '',
    analysis_results: '',
    updated_at: null
  });

  const [editData, setEditData] = useState({
    medical_history: '',
    allergies: '',
    consultation_notes: '',
    analysis_results: ''
  });

  const [consultationHistory, setConsultationHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [patientProfile, setPatientProfile] = useState({
    blood_type: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    height: null,
    birth_place: null
  });

  useEffect(() => {
    loadMedicalRecord();
    loadConsultationHistory();
    loadAppointments();
  }, []);

  const loadMedicalRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/medical-record/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Dossier médical:', response.data);
      setMedicalRecord(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error('Erreur chargement dossier médical:', error);
      if (error.response?.status !== 404) {
        setError('Erreur lors du chargement du dossier médical.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadConsultationHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/appointments/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filtrer les RDV passés et les transformer en historique de consultations
      const pastAppointments = (response.data || []).filter(appointment => {
        return new Date(appointment.appointment_date) < new Date();
      });
      
      // Transformer les RDV en historique de consultations
      const history = pastAppointments.map(appointment => ({
        id: appointment.id,
        date: appointment.appointment_date,
        doctor_name: appointment.doctor_name,
        specialty: appointment.specialty,
        diagnosis: 'Consultation réalisée', // Par défaut, sera complété par le médecin
        notes: appointment.notes || 'Aucune note disponible'
      }));
      
      console.log('Historique consultations:', history);
      setConsultationHistory(history);
      
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      // En cas d'erreur, garder un tableau vide
      setConsultationHistory([]);
    }
  };

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/appointments/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/medical-record/${user.id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Dossier sauvegardé:', response.data);
      setMedicalRecord(editData);
      setEditing(false);
      setMessage('✅ Dossier médical mis à jour avec succès !');
      
      // Masquer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setError(error.response?.data?.error || 'Erreur lors de la sauvegarde.');
    }
  };

  const handleCancel = () => {
    setEditData(medicalRecord);
    setEditing(false);
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

  useEffect(() => {
    loadMedicalRecord();
    loadConsultationHistory();
    loadAppointments();
    loadPatientProfile();
  }, []);

  const loadPatientProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patient/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profil patient:', response.data);
      // Pour l'instant, on utilise des valeurs par défaut si pas dans la DB
      setPatientProfile({
        blood_type: response.data.blood_type || 'Non renseigné',
        emergency_contact_name: response.data.emergency_contact_name || 'Non renseigné',
        emergency_contact_phone: response.data.emergency_contact_phone || 'Non renseigné',
        height: response.data.height || null,
        birth_place: response.data.birth_place || null
      });
    } catch (error) {
      console.error('Erreur chargement profil patient:', error);
      // Valeurs par défaut si erreur
      setPatientProfile({
        blood_type: 'Non renseigné',
        emergency_contact_name: 'Non renseigné',
        emergency_contact_phone: 'Non renseigné',
        height: null,
        birth_place: null
      });
    }
  };

  const getBloodType = () => {
    return patientProfile.blood_type || 'Non renseigné';
  };

  const getEmergencyContact = () => {
    return {
      name: patientProfile.emergency_contact_name || 'Non renseigné',
      phone: patientProfile.emergency_contact_phone || 'Non renseigné'
    };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement de votre dossier médical...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-medical-record">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faFileAlt} className="me-2 text-primary" />
            Mon dossier médical
          </h2>
          <p className="text-muted mb-0">
            Consultez et gérez vos informations médicales
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate('/patient')}>
            Retour au tableau de bord
          </Button>
          <Button variant="outline-info" onClick={() => setShowHistoryModal(true)}>
            <FontAwesomeIcon icon={faHistory} className="me-2" />
            Historique
          </Button>
          <Button 
            variant="outline-success" 
            onClick={() => window.print()}
          >
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            Imprimer
          </Button>
        </div>
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

      <Row>
        {/* Informations générales */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faUserMd} className="me-2 text-success" />
                Informations générales
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                >
                  {user?.name?.charAt(0) || 'P'}
                </div>
                <h5 className="fw-bold">{user?.name}</h5>
                <p className="text-muted mb-0">Patient</p>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Âge</small>
                  <span className="fw-medium">{calculateAge()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Groupe sanguin</small>
                  {getBloodType() !== 'Non renseigné' ? (
                    <Badge bg="danger">{getBloodType()}</Badge>
                  ) : (
                    <small className="text-muted">Non renseigné</small>
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Email</small>
                  <small>{user?.email}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Téléphone</small>
                  <small>{user?.phone || 'Non renseigné'}</small>
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <h6 className="fw-bold mb-2">Contact d'urgence</h6>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Nom</small>
                  <small>{getEmergencyContact().name}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">Téléphone</small>
                  <small>{getEmergencyContact().phone}</small>
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <h6 className="fw-bold mb-2">Statistiques</h6>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Consultations</small>
                  <Badge bg="info">{consultationHistory.length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">RDV à venir</small>
                  <Badge bg="success">{appointments.length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">Dernière mise à jour</small>
                  <small>
                    {medicalRecord.updated_at ? 
                      new Date(medicalRecord.updated_at).toLocaleDateString('fr-FR') : 
                      'Jamais'
                    }
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Contenu principal */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <Tabs activeKey={activeTab} onSelect={setActiveTab}>
                  <Tab eventKey="general" title="Général">
                  </Tab>
                  <Tab eventKey="allergies" title="Allergies">
                  </Tab>
                  <Tab eventKey="consultations" title="Consultations">
                  </Tab>
                  <Tab eventKey="analyses" title="Analyses">
                  </Tab>
                </Tabs>
                <div>
                  {editing ? (
                    <div className="d-flex gap-2">
                      <Button variant="outline-secondary" size="sm" onClick={handleCancel}>
                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                        Annuler
                      </Button>
                      <Button variant="success" size="sm" onClick={handleSave}>
                        <FontAwesomeIcon icon={faSave} className="me-1" />
                        Sauvegarder
                      </Button>
                    </div>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => setEditing(true)}>
                      <FontAwesomeIcon icon={faEdit} className="me-1" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Onglet Général */}
              {activeTab === 'general' && (
                <div>
                  <h5 className="fw-bold mb-3">
                    <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
                    Antécédents médicaux
                  </h5>
                  
                  {editing ? (
                    <Form.Group className="mb-4">
                      <Form.Label>Antécédents médicaux personnels et familiaux</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        placeholder="Décrivez vos antécédents médicaux, chirurgicaux et familiaux..."
                        value={editData.medical_history || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          medical_history: e.target.value
                        })}
                      />
                      <Form.Text className="text-muted">
                        Incluez les maladies chroniques, opérations, antécédents familiaux importants.
                      </Form.Text>
                    </Form.Group>
                  ) : (
                    <Card className="border-0 bg-light mb-4">
                      <Card.Body>
                        {medicalRecord.medical_history ? (
                          <p className="mb-0">{medicalRecord.medical_history}</p>
                        ) : (
                          <div className="text-center py-3">
                            <FontAwesomeIcon icon={faHistory} size="2x" className="text-muted mb-2" />
                            <p className="text-muted mb-0">Aucun antécédent médical renseigné</p>
                            <small className="text-muted">Cliquez sur "Modifier" pour ajouter vos antécédents</small>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  )}

                  <h5 className="fw-bold mb-3">
                    <FontAwesomeIcon icon={faStethoscope} className="me-2 text-info" />
                    Notes de consultation
                  </h5>
                  
                  {editing ? (
                    <Form.Group className="mb-4">
                      <Form.Label>Notes et observations</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Notes des consultations, observations personnelles..."
                        value={editData.consultation_notes || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          consultation_notes: e.target.value
                        })}
                      />
                    </Form.Group>
                  ) : (
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        {medicalRecord.consultation_notes ? (
                          <p className="mb-0">{medicalRecord.consultation_notes}</p>
                        ) : (
                          <div className="text-center py-3">
                            <FontAwesomeIcon icon={faStethoscope} size="2x" className="text-muted mb-2" />
                            <p className="text-muted mb-0">Aucune note de consultation</p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                </div>
              )}

              {/* Onglet Allergies */}
              {activeTab === 'allergies' && (
                <div>
                  <h5 className="fw-bold mb-3">
                    <FontAwesomeIcon icon={faAllergies} className="me-2 text-warning" />
                    Allergies et intolérances
                  </h5>
                  
                  {editing ? (
                    <Form.Group className="mb-4">
                      <Form.Label>Allergies connues</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Listez vos allergies médicamenteuses, alimentaires, environnementales..."
                        value={editData.allergies || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          allergies: e.target.value
                        })}
                      />
                      <Form.Text className="text-muted">
                        ⚠️ Information cruciale pour votre sécurité. Soyez précis et complet.
                      </Form.Text>
                    </Form.Group>
                  ) : (
                    <div>
                      {medicalRecord.allergies ? (
                        <Alert variant="warning" className="d-flex align-items-start">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 mt-1" />
                          <div>
                            <strong>Allergies déclarées :</strong>
                            <p className="mb-0 mt-2">{medicalRecord.allergies}</p>
                          </div>
                        </Alert>
                      ) : (
                        <Card className="border-warning">
                          <Card.Body className="text-center py-4">
                            <FontAwesomeIcon icon={faAllergies} size="3x" className="text-warning mb-3" />
                            <h6 className="text-warning">Aucune allergie renseignée</h6>
                            <p className="text-muted mb-3">
                              Il est important de renseigner vos allergies pour votre sécurité
                            </p>
                            <Button variant="warning" onClick={() => setEditing(true)}>
                              <FontAwesomeIcon icon={faPlus} className="me-2" />
                              Ajouter des allergies
                            </Button>
                          </Card.Body>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Consultations */}
              {activeTab === 'consultations' && (
                <div>
                  <h5 className="fw-bold mb-3">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                    Historique des consultations
                  </h5>
                  
                  {consultationHistory.length > 0 ? (
                    <div className="table-responsive">
                      <Table>
                        <thead className="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Médecin</th>
                            <th>Spécialité</th>
                            <th>Diagnostic</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consultationHistory.map((consultation) => (
                            <tr key={consultation.id}>
                              <td>{new Date(consultation.date).toLocaleDateString('fr-FR')}</td>
                              <td className="fw-medium">{consultation.doctor_name}</td>
                              <td>
                                <Badge bg="info">{consultation.specialty}</Badge>
                              </td>
                              <td>{consultation.diagnosis}</td>
                              <td>
                                <Button variant="outline-primary" size="sm">
                                  <FontAwesomeIcon icon={faEye} className="me-1" />
                                  Voir
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Card className="border-0 bg-light">
                      <Card.Body className="text-center py-4">
                        <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="text-muted mb-3" />
                        <h6 className="text-muted">Aucune consultation enregistrée</h6>
                        <p className="text-muted mb-3">
                          Votre historique de consultations apparaîtra ici
                        </p>
                        <Button variant="primary" onClick={() => navigate('/patient/rendez-vous')}>
                          <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                          Prendre un rendez-vous
                        </Button>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              )}

              {/* Onglet Analyses */}
              {activeTab === 'analyses' && (
                <div>
                  <h5 className="fw-bold mb-3">
                    <FontAwesomeIcon icon={faFileImage} className="me-2 text-info" />
                    Résultats d'analyses
                  </h5>
                  
                  {editing ? (
                    <Form.Group className="mb-4">
                      <Form.Label>Résultats d'analyses et examens</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        placeholder="Résultats de prises de sang, imageries, examens spécialisés..."
                        value={editData.analysis_results || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          analysis_results: e.target.value
                        })}
                      />
                    </Form.Group>
                  ) : (
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        {medicalRecord.analysis_results ? (
                          <p className="mb-0">{medicalRecord.analysis_results}</p>
                        ) : (
                          <div className="text-center py-4">
                            <FontAwesomeIcon icon={faFileImage} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">Aucun résultat d'analyse</h6>
                            <p className="text-muted mb-3">
                              Les résultats de vos analyses et examens apparaîtront ici
                            </p>
                            <Button variant="info" onClick={() => navigate('/patient/imagerie')}>
                              <FontAwesomeIcon icon={faFileImage} className="me-2" />
                              Voir l'imagerie médicale
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Historique détaillé */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
            Historique médical détaillé
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {consultationHistory.length > 0 ? (
            <div>
              {consultationHistory.map((consultation) => (
                <Card key={consultation.id} className="border mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold">{consultation.doctor_name}</h6>
                      <Badge bg="info">{consultation.specialty}</Badge>
                    </div>
                    <p className="text-muted mb-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      {new Date(consultation.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="mb-2">
                      <strong>Diagnostic :</strong> {consultation.diagnosis}
                    </p>
                    <p className="mb-0">
                      <strong>Notes :</strong> {consultation.notes}
                    </p>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <FontAwesomeIcon icon={faHistory} size="3x" className="text-muted mb-3" />
              <h6 className="text-muted">Aucun historique disponible</h6>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            Imprimer l'historique
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PatientMedicalRecord;