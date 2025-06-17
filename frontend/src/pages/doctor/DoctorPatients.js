import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form, InputGroup, Modal, Tabs, Tab, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faSearch, faPlus, faEye, faEdit, faCalendarPlus, 
  faEnvelope, faPhone, faStethoscope, faFileImage, faHistory,
  faHeartbeat, faWeight, faThermometerHalf, faUserCircle,
  faBirthdayCake, faMapMarkerAlt, faAllergies, faPills
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function DoctorPatients() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (user && user.id) {
    loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/doctor/${user.id}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.patients) {
        // Transformer les données pour correspondre au format attendu par l'interface
        const formattedPatients = response.data.patients.map(patient => ({
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          birthdate: patient.birthdate,
          lastVisit: patient.last_appointment,
          nextAppointment: patient.next_appointment,
          status: patient.next_appointment ? 'active' : 'inactive',
          medicalRecord: {
            allergies: patient.allergies || 'Aucune',
            medicalHistory: patient.medical_history || 'Aucun antécédent',
            lastWeight: 'Non disponible', // À implémenter avec health_metrics
            lastTemperature: 'Non disponible', // À implémenter avec health_metrics
            lastBloodPressure: 'Non disponible' // À implémenter avec health_metrics
          },
          recentExams: [] // À implémenter avec les examens DICOM
        }));
        setPatients(formattedPatients);
      } else {
        setError('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur chargement patients:', error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError('Session expirée. Veuillez vous reconnecter.');
            break;
          case 403:
            setError('Vous n\'êtes pas autorisé à voir ces patients.');
            break;
          default:
            setError('Erreur lors du chargement des patients.');
        }
      } else {
        setError('Erreur de connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('info');
    setShowPatientModal(true);
  };

  const handleScheduleAppointment = (patientId) => {
    navigate(`/doctor/appointments?patient=${patientId}`);
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

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
    <div className="doctor-patients">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
            Mes Patients
          </h2>
          <p className="text-muted mb-0">
            Gérez et suivez vos {patients.length} patients
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/doctor/appointments')}>
          <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
          Programmer un RDV
        </Button>
      </div>

      {/* Statistiques rapides */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3 className="fw-bold">{patients.filter(p => p.status === 'active').length}</h3>
              <p className="text-muted mb-0">Patients actifs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">
                <FontAwesomeIcon icon={faCalendarPlus} />
              </div>
              <h3 className="fw-bold">{patients.filter(p => p.nextAppointment).length}</h3>
              <p className="text-muted mb-0">RDV programmés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-warning mb-2">
                <FontAwesomeIcon icon={faFileImage} />
              </div>
              <h3 className="fw-bold">12</h3>
              <p className="text-muted mb-0">Examens en attente</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">
                <FontAwesomeIcon icon={faStethoscope} />
              </div>
              <h3 className="fw-bold">45</h3>
              <p className="text-muted mb-0">Consultations ce mois</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres et recherche */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher un patient (nom, email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les patients</option>
                <option value="active">Patients actifs</option>
                <option value="inactive">Patients inactifs</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <div className="text-muted">
                {filteredPatients.length} patient(s) trouvé(s)
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Liste des patients */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">Liste des patients</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredPatients.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Contact</th>
                    <th>Âge</th>
                    <th>Dernière visite</th>
                    <th>Prochain RDV</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar me-3">
                            <FontAwesomeIcon 
                              icon={faUserCircle} 
                              size="2x" 
                              className="text-muted"
                            />
                          </div>
                          <div>
                            <div className="fw-medium">{patient.name}</div>
                            <small className="text-muted">{patient.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <FontAwesomeIcon icon={faPhone} className="me-2 text-success" />
                            {patient.phone}
                          </div>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="me-2 text-info" />
                            <small>{patient.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faBirthdayCake} className="me-2 text-warning" />
                          {calculateAge(patient.birthdate)} ans
                        </div>
                      </td>
                      <td>
                        {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        {patient.nextAppointment ? (
                          <Badge bg="success">
                            {new Date(patient.nextAppointment).toLocaleDateString('fr-FR')}
                          </Badge>
                        ) : (
                          <Badge bg="secondary">Aucun</Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg={patient.status === 'active' ? 'success' : 'secondary'}>
                          {patient.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            title="Voir dossier"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            title="Nouveau RDV"
                            onClick={() => handleScheduleAppointment(patient.id)}
                          >
                            <FontAwesomeIcon icon={faCalendarPlus} />
                          </Button>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            title="Voir imagerie"
                          >
                            <FontAwesomeIcon icon={faFileImage} />
                          </Button>
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            title="Contacter"
                          >
                            <FontAwesomeIcon icon={faEnvelope} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted mb-3" />
              <h5 className="text-muted">Aucun patient trouvé</h5>
              <p className="text-muted">
                {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Vous n\'avez pas encore de patients'}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal détails patient */}
      <Modal 
        show={showPatientModal} 
        onHide={() => setShowPatientModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserCircle} className="me-2 text-primary" />
            {selectedPatient?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <Tabs 
              activeKey={activeTab} 
              onSelect={setActiveTab} 
              className="mb-3"
            >
              <Tab eventKey="info" title="Informations">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 bg-light mb-3">
                      <Card.Body>
                        <h6 className="fw-bold mb-3">
                          <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                          Informations personnelles
                        </h6>
                        <div className="mb-2">
                          <strong>Email:</strong> {selectedPatient.email}
                        </div>
                        <div className="mb-2">
                          <strong>Téléphone:</strong> {selectedPatient.phone}
                        </div>
                        <div className="mb-2">
                          <strong>Date de naissance:</strong> {new Date(selectedPatient.birthdate).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="mb-2">
                          <strong>Âge:</strong> {calculateAge(selectedPatient.birthdate)} ans
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-light mb-3">
                      <Card.Body>
                        <h6 className="fw-bold mb-3">
                          <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                          Dernières mesures
                        </h6>
                        <div className="mb-2">
                          <FontAwesomeIcon icon={faWeight} className="me-2 text-info" />
                          <strong>Poids:</strong> {selectedPatient.medicalRecord.lastWeight}
                        </div>
                        <div className="mb-2">
                          <FontAwesomeIcon icon={faThermometerHalf} className="me-2 text-danger" />
                          <strong>Température:</strong> {selectedPatient.medicalRecord.lastTemperature}
                        </div>
                        <div className="mb-2">
                          <FontAwesomeIcon icon={faHeartbeat} className="me-2 text-success" />
                          <strong>Tension:</strong> {selectedPatient.medicalRecord.lastBloodPressure}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                
                <Row>
                  <Col xs={12}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h6 className="fw-bold mb-3">
                          <FontAwesomeIcon icon={faStethoscope} className="me-2" />
                          Antécédents médicaux
                        </h6>
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <FontAwesomeIcon icon={faAllergies} className="me-2 text-warning" />
                            <strong>Allergies:</strong>
                          </div>
                          <Alert variant="warning" className="py-2">
                            {selectedPatient.medicalRecord.allergies}
                          </Alert>
                        </div>
                        <div>
                          <div className="d-flex align-items-center mb-2">
                            <FontAwesomeIcon icon={faHistory} className="me-2 text-info" />
                            <strong>Historique médical:</strong>
                          </div>
                          <Alert variant="info" className="py-2">
                            {selectedPatient.medicalRecord.medicalHistory}
                          </Alert>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="exams" title="Examens récents">
                {selectedPatient.recentExams.length > 0 ? (
                  <div className="table-responsive">
                    <Table>
                      <thead>
                        <tr>
                          <th>Type d'examen</th>
                          <th>Date</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPatient.recentExams.map((exam, index) => (
                          <tr key={index}>
                            <td>
                              <FontAwesomeIcon icon={faFileImage} className="me-2 text-primary" />
                              {exam.type}
                            </td>
                            <td>{new Date(exam.date).toLocaleDateString('fr-FR')}</td>
                            <td>
                              <Badge bg="success">Terminé</Badge>
                            </td>
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
                  <div className="text-center py-4">
                    <FontAwesomeIcon icon={faFileImage} size="3x" className="text-muted mb-3" />
                    <h6 className="text-muted">Aucun examen récent</h6>
                  </div>
                )}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPatientModal(false)}>
            Fermer
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleScheduleAppointment(selectedPatient?.id)}
          >
            <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
            Nouveau RDV
          </Button>
          <Button variant="primary">
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DoctorPatients;