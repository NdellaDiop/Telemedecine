import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, InputGroup, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPills, faPlus, faSearch, faEye, faEdit, faTrash, faPrint, 
  faFileImage, faStethoscope, faCalendarAlt, faCheck, faTimes,
  faUserCircle, faPhone, faEnvelope, faExclamationTriangle,
  faHistory, faSave, faDownload, faShare
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function DoctorPrescriptions() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
  const [activeTab, setActiveTab] = useState('medications');
  
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);

  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    type: 'medication',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ],
    examinations: [
      {
        type: '',
        description: '',
        urgency: 'normal',
        instructions: ''
      }
    ],
    notes: '',
    validUntil: ''
  });

  useEffect(() => {
    loadPrescriptions();
    loadPatients();
  }, []);

  const loadPrescriptions = async () => {
    try {
      // Simulation des données pour la démo
      setPrescriptions([
        {
          id: 1,
          patientId: 1,
          patientName: 'Aminata Diallo',
          patientPhone: '77 123 45 67',
          type: 'medication',
          date: '2025-01-08',
          status: 'active',
          validUntil: '2025-02-08',
          medications: [
            {
              name: 'Amoxicilline 500mg',
              dosage: '500mg',
              frequency: '3 fois par jour',
              duration: '7 jours',
              instructions: 'À prendre avec les repas'
            },
            {
              name: 'Paracétamol 1000mg',
              dosage: '1000mg',
              frequency: 'Si douleur',
              duration: '7 jours',
              instructions: 'Maximum 4 prises par jour'
            }
          ],
          notes: 'Traitement pour infection respiratoire'
        },
        {
          id: 2,
          patientId: 2,
          patientName: 'Mamadou Sow',
          patientPhone: '70 987 65 43',
          type: 'examination',
          date: '2025-01-07',
          status: 'pending',
          validUntil: '2025-01-21',
          examinations: [
            {
              type: 'ECG',
              description: 'Électrocardiogramme de repos',
              urgency: 'urgent',
              instructions: 'À jeun, prévoir 30 minutes'
            },
            {
              type: 'Prise de sang',
              description: 'Bilan lipidique complet',
              urgency: 'normal',
              instructions: 'À jeun depuis 12h'
            }
          ],
          notes: 'Suivi cardiologique - contrôle diabète'
        },
        {
          id: 3,
          patientId: 3,
          patientName: 'Fatou Ndiaye',
          patientPhone: '76 555 44 33',
          type: 'imaging',
          date: '2025-01-05',
          status: 'completed',
          validUntil: '2025-01-19',
          examinations: [
            {
              type: 'Radiographie thoracique',
              description: 'Radio pulmonaire face et profil',
              urgency: 'normal',
              instructions: 'Retirer bijoux et objets métalliques'
            }
          ],
          notes: 'Suspicion pneumonie - contrôle post-traitement'
        },
        {
          id: 4,
          patientId: 4,
          patientName: 'Ibrahima Fall',
          patientPhone: '78 222 11 99',
          type: 'medication',
          date: '2025-01-03',
          status: 'expired',
          validUntil: '2025-01-10',
          medications: [
            {
              name: 'Ibuprofène 400mg',
              dosage: '400mg',
              frequency: '2 fois par jour',
              duration: '5 jours',
              instructions: 'Après les repas'
            }
          ],
          notes: 'Traitement anti-inflammatoire'
        }
      ]);
    } catch (error) {
      console.error('Erreur chargement prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      // Simulation des données pour la démo
      setPatients([
        { id: 1, name: 'Aminata Diallo', phone: '77 123 45 67' },
        { id: 2, name: 'Mamadou Sow', phone: '70 987 65 43' },
        { id: 3, name: 'Fatou Ndiaye', phone: '76 555 44 33' },
        { id: 4, name: 'Ibrahima Fall', phone: '78 222 11 99' }
      ]);
    } catch (error) {
      console.error('Erreur chargement patients:', error);
    }
  };

  // Filtrer les prescriptions
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || prescription.type === filterType;
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setActiveTab(prescription.type === 'medication' ? 'medications' : 'examinations');
    setShowPrescriptionModal(true);
  };

  const handleNewPrescription = () => {
    setNewPrescription({
      patientId: '',
      type: 'medication',
      medications: [
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      ],
      examinations: [
        {
          type: '',
          description: '',
          urgency: 'normal',
          instructions: ''
        }
      ],
      notes: '',
      validUntil: ''
    });
    setShowNewPrescriptionModal(true);
  };

  const handleAddMedication = () => {
    setNewPrescription({
      ...newPrescription,
      medications: [
        ...newPrescription.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      ]
    });
  };

  const handleAddExamination = () => {
    setNewPrescription({
      ...newPrescription,
      examinations: [
        ...newPrescription.examinations,
        {
          type: '',
          description: '',
          urgency: 'normal',
          instructions: ''
        }
      ]
    });
  };

  const handleRemoveMedication = (index) => {
    const medications = newPrescription.medications.filter((_, i) => i !== index);
    setNewPrescription({ ...newPrescription, medications });
  };

  const handleRemoveExamination = (index) => {
    const examinations = newPrescription.examinations.filter((_, i) => i !== index);
    setNewPrescription({ ...newPrescription, examinations });
  };

  const handleMedicationChange = (index, field, value) => {
    const medications = [...newPrescription.medications];
    medications[index] = { ...medications[index], [field]: value };
    setNewPrescription({ ...newPrescription, medications });
  };

  const handleExaminationChange = (index, field, value) => {
    const examinations = [...newPrescription.examinations];
    examinations[index] = { ...examinations[index], [field]: value };
    setNewPrescription({ ...newPrescription, examinations });
  };

  const handleSavePrescription = () => {
    // Ici, vous feriez l'appel API pour sauvegarder la prescription
    console.log('Sauvegarde prescription:', newPrescription);
    setShowNewPrescriptionModal(false);
    loadPrescriptions(); // Recharger les données
  };

  const handlePrintPrescription = (prescriptionId) => {
    // Ici, vous génèreriez le PDF de la prescription
    console.log('Impression prescription:', prescriptionId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'expired': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'expired': return 'Expirée';
      default: return 'Inconnu';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'medication': return faPills;
      case 'examination': return faStethoscope;
      case 'imaging': return faFileImage;
      default: return faStethoscope;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'medication': return 'Médicaments';
      case 'examination': return 'Examens';
      case 'imaging': return 'Imagerie';
      default: return 'Autre';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'danger';
      case 'normal': return 'primary';
      case 'low': return 'secondary';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement des prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-prescriptions">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faPills} className="me-2 text-primary" />
            Mes Prescriptions
          </h2>
          <p className="text-muted mb-0">
            Gérez vos prescriptions médicales et ordonnances d'examens
          </p>
        </div>
        <Button variant="primary" onClick={handleNewPrescription}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nouvelle prescription
        </Button>
      </div>

      {/* Statistiques rapides */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">
                <FontAwesomeIcon icon={faPills} />
              </div>
              <h3 className="fw-bold">{prescriptions.filter(p => p.status === 'active').length}</h3>
              <p className="text-muted mb-0">Prescriptions actives</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-warning mb-2">
                <FontAwesomeIcon icon={faStethoscope} />
              </div>
              <h3 className="fw-bold">{prescriptions.filter(p => p.status === 'pending').length}</h3>
              <p className="text-muted mb-0">En attente</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">
                <FontAwesomeIcon icon={faFileImage} />
              </div>
              <h3 className="fw-bold">{prescriptions.filter(p => p.type === 'imaging').length}</h3>
              <p className="text-muted mb-0">Examens d'imagerie</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-danger mb-2">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <h3 className="fw-bold">{prescriptions.filter(p => p.status === 'expired').length}</h3>
              <p className="text-muted mb-0">Expirées</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres et recherche */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
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
            </Col>
            <Col md={3}>
              <Form.Select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="medication">Médicaments</option>
                <option value="examination">Examens</option>
                <option value="imaging">Imagerie</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="pending">En attente</option>
                <option value="completed">Terminées</option>
                <option value="expired">Expirées</option>
              </Form.Select>
            </Col>
            <Col md={2} className="text-end">
              <div className="text-muted">
                {filteredPrescriptions.length} résultat(s)
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Liste des prescriptions */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">Liste des prescriptions</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredPrescriptions.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Validité</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon 
                            icon={faUserCircle} 
                            size="2x" 
                            className="text-muted me-3"
                          />
                          <div>
                            <div className="fw-medium">{prescription.patientName}</div>
                            <small className="text-muted">{prescription.patientPhone}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon 
                            icon={getTypeIcon(prescription.type)} 
                            className="me-2 text-primary"
                          />
                          {getTypeText(prescription.type)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-info" />
                          {new Date(prescription.date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td>
                        {new Date(prescription.validUntil) > new Date() ? (
                          <Badge bg="success">
                            Jusqu'au {new Date(prescription.validUntil).toLocaleDateString('fr-FR')}
                          </Badge>
                        ) : (
                          <Badge bg="danger">
                            Expirée le {new Date(prescription.validUntil).toLocaleDateString('fr-FR')}
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg={getStatusColor(prescription.status)}>
                          {getStatusText(prescription.status)}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            title="Voir détails"
                            onClick={() => handleViewPrescription(prescription)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            title="Imprimer"
                            onClick={() => handlePrintPrescription(prescription.id)}
                          >
                            <FontAwesomeIcon icon={faPrint} />
                          </Button>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            title="Partager"
                          >
                            <FontAwesomeIcon icon={faShare} />
                          </Button>
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            title="Modifier"
                          >
                            <FontAwesomeIcon icon={faEdit} />
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
              <FontAwesomeIcon icon={faPills} size="3x" className="text-muted mb-3" />
              <h5 className="text-muted">Aucune prescription trouvée</h5>
              <p className="text-muted">
                {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Vous n\'avez pas encore créé de prescriptions'}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal détails prescription */}
      <Modal 
        show={showPrescriptionModal} 
        onHide={() => setShowPrescriptionModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={getTypeIcon(selectedPrescription?.type)} className="me-2 text-primary" />
            Prescription - {selectedPrescription?.patientName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPrescription && (
            <div>
              {/* Informations générales */}
              <Card className="border-0 bg-light mb-3">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-2">
                        <strong>Patient:</strong> {selectedPrescription.patientName}
                      </div>
                      <div className="mb-2">
                        <strong>Téléphone:</strong> {selectedPrescription.patientPhone}
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-2">
                        <strong>Date:</strong> {new Date(selectedPrescription.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="mb-2">
                        <strong>Validité:</strong> {new Date(selectedPrescription.validUntil).toLocaleDateString('fr-FR')}
                      </div>
                    </Col>
                  </Row>
                  {selectedPrescription.notes && (
                    <div className="mt-3">
                      <strong>Notes:</strong>
                      <Alert variant="info" className="mt-2 py-2">
                        {selectedPrescription.notes}
                      </Alert>
                    </div>
                  )}
                </Card.Body>
              </Card>

              <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
                {/* Onglet Médicaments */}
                {selectedPrescription.medications && (
                  <Tab eventKey="medications" title="Médicaments">
                    <div className="table-responsive">
                      <Table>
                        <thead>
                          <tr>
                            <th>Médicament</th>
                            <th>Dosage</th>
                            <th>Fréquence</th>
                            <th>Durée</th>
                            <th>Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPrescription.medications.map((med, index) => (
                            <tr key={index}>
                              <td className="fw-medium">{med.name}</td>
                              <td>{med.dosage}</td>
                              <td>{med.frequency}</td>
                              <td>{med.duration}</td>
                              <td>
                                {med.instructions && (
                                  <small className="text-muted">{med.instructions}</small>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Tab>
                )}

                {/* Onglet Examens */}
                {selectedPrescription.examinations && (
                  <Tab eventKey="examinations" title="Examens">
                    <div className="table-responsive">
                      <Table>
                        <thead>
                          <tr>
                            <th>Type d'examen</th>
                            <th>Description</th>
                            <th>Urgence</th>
                            <th>Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPrescription.examinations.map((exam, index) => (
                            <tr key={index}>
                              <td className="fw-medium">{exam.type}</td>
                              <td>{exam.description}</td>
                              <td>
                                <Badge bg={getUrgencyColor(exam.urgency)}>
                                  {exam.urgency === 'urgent' ? 'Urgent' : exam.urgency === 'normal' ? 'Normal' : 'Faible'}
                                </Badge>
                              </td>
                              <td>
                                {exam.instructions && (
                                  <small className="text-muted">{exam.instructions}</small>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Tab>
                )}
              </Tabs>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrescriptionModal(false)}>
            Fermer
          </Button>
          <Button 
            variant="success" 
            onClick={() => handlePrintPrescription(selectedPrescription?.id)}
          >
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            Imprimer
          </Button>
          <Button variant="primary">
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal nouvelle prescription */}
      <Modal 
        show={showNewPrescriptionModal} 
        onHide={() => setShowNewPrescriptionModal(false)} 
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2 text-success" />
            Nouvelle prescription
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Sélection patient */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Patient *</Form.Label>
                  <Form.Select
                    value={newPrescription.patientId}
                    onChange={(e) => setNewPrescription({...newPrescription, patientId: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.phone}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Type de prescription</Form.Label>
                  <Form.Select
                    value={newPrescription.type}
                    onChange={(e) => setNewPrescription({...newPrescription, type: e.target.value})}
                  >
                    <option value="medication">Médicaments</option>
                    <option value="examination">Examens</option>
                    <option value="imaging">Imagerie</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Valide jusqu'au</Form.Label>
                  <Form.Control
                    type="date"
                    value={newPrescription.validUntil}
                    onChange={(e) => setNewPrescription({...newPrescription, validUntil: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Tabs defaultActiveKey="medications" className="mb-4">
              {/* Onglet Médicaments */}
              <Tab eventKey="medications" title="Médicaments">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Liste des médicaments</h6>
                  <Button variant="outline-primary" size="sm" onClick={handleAddMedication}>
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Ajouter médicament
                  </Button>
                </div>
                
                {newPrescription.medications.map((medication, index) => (
                  <Card key={index} className="border mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nom du médicament *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Ex: Paracétamol 1000mg"
                              value={medication.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Dosage</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Ex: 1000mg"
                              value={medication.dosage}
                              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Fréquence</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Ex: 3 fois par jour"
                              value={medication.frequency}
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Durée</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Ex: 7 jours"
                              value={medication.duration}
                              onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Instructions</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Ex: À prendre avec les repas"
                              value={medication.instructions}
                              onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      {newPrescription.medications.length > 1 && (
                        <div className="text-end">
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveMedication(index)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </Tab>

              {/* Onglet Examens */}
              <Tab eventKey="examinations" title="Examens">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Liste des examens</h6>
                  <Button variant="outline-primary" size="sm" onClick={handleAddExamination}>
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Ajouter examen
                  </Button>
                </div>
                
                {newPrescription.examinations.map((examination, index) => (
                  <Card key={index} className="border mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Type d'examen *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Ex: Prise de sang"
                              value={examination.type}
                              onChange={(e) => handleExaminationChange(index, 'type', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Urgence</Form.Label>
                            <Form.Select
                              value={examination.urgency}
                              onChange={(e) => handleExaminationChange(index, 'urgency', e.target.value)}
                            >
                              <option value="normal">Normal</option>
                              <option value="urgent">Urgent</option>
                              <option value="low">Faible</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end">
                          {newPrescription.examinations.length > 1 && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemoveExamination(index)}
                              className="mb-3"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              placeholder="Description détaillée de l'examen"
                              value={examination.description}
                              onChange={(e) => handleExaminationChange(index, 'description', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Instructions</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              placeholder="Instructions pour le patient"
                              value={examination.instructions}
                              onChange={(e) => handleExaminationChange(index, 'instructions', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </Tab>
            </Tabs>

            {/* Notes générales */}
            <Form.Group className="mb-3">
              <Form.Label>Notes générales</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Notes additionnelles pour cette prescription"
                value={newPrescription.notes}
                onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewPrescriptionModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleSavePrescription}>
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DoctorPrescriptions;