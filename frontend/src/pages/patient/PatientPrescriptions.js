import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table, Modal, Alert, Form, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPills, faFileAlt, faDownload, faPrint, faEye, faCalendarAlt,
  faUserMd, faStethoscope, faFileImage, faExclamationTriangle,
  faCheck, faClock, faHistory, faSearch, faFilter
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function PatientPrescriptions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, filterStatus, filterType]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      // Pour l'instant, on simule les prescriptions du patient
      // Plus tard, on créera un endpoint spécifique pour les prescriptions du patient
      
      const token = localStorage.getItem('token');
      
      // Simuler des prescriptions basées sur les RDV du patient
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userAppointments = appointmentsResponse.data || [];
      
      // Simuler des prescriptions pour les RDV passés
      const simulatedPrescriptions = userAppointments
        .filter(apt => new Date(apt.appointment_date) < new Date())
        .map((apt, index) => ({
          id: index + 1,
          doctorName: apt.doctor_name,
          doctorSpecialty: apt.specialty,
          date: apt.appointment_date,
          type: index % 3 === 0 ? 'examination' : 'medication',
          status: index % 4 === 0 ? 'expired' : index % 3 === 0 ? 'pending' : 'active',
          validUntil: new Date(new Date(apt.appointment_date).getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
          medications: index % 3 !== 0 ? [
            {
              name: index % 2 === 0 ? 'Paracétamol 1000mg' : 'Ibuprofène 400mg',
              dosage: index % 2 === 0 ? '1000mg' : '400mg',
              frequency: index % 2 === 0 ? '3 fois par jour' : '2 fois par jour',
              duration: '7 jours',
              instructions: index % 2 === 0 ? 'Après les repas' : 'À jeun'
            }
          ] : [],
          examinations: index % 3 === 0 ? [
            {
              type: index % 2 === 0 ? 'Prise de sang' : 'Radiographie',
              description: index % 2 === 0 ? 'Bilan sanguin complet' : 'Radio thoracique',
              urgency: 'normal',
              instructions: index % 2 === 0 ? 'À jeun depuis 12h' : 'Retirer bijoux'
            }
          ] : [],
          notes: `Prescription suite à consultation du ${new Date(apt.appointment_date).toLocaleDateString('fr-FR')}`
        }));
      
      console.log('Prescriptions simulées:', simulatedPrescriptions);
      setPrescriptions(simulatedPrescriptions);
      
    } catch (error) {
      console.error('Erreur chargement prescriptions:', error);
      setError('Erreur lors du chargement des prescriptions.');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = prescriptions;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === filterStatus);
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(prescription => prescription.type === filterType);
    }
    
    setFilteredPrescriptions(filtered);
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleDownloadPrescription = (prescriptionId) => {
    // Simulation du téléchargement
    setMessage('🔄 Téléchargement en cours... (fonctionnalité à implémenter)');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePrintPrescription = (prescriptionId) => {
    // Ouvrir la fenêtre d'impression
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'En attente';
      case 'expired': return 'Expirée';
      default: return 'Inconnu';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'medication' ? faPills : faFileImage;
  };

  const getTypeText = (type) => {
    return type === 'medication' ? 'Médicaments' : 'Examens';
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement de vos prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-prescriptions">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faPills} className="me-2 text-primary" />
            Mes ordonnances
          </h2>
          <p className="text-muted mb-0">
            Consultez et gérez vos prescriptions médicales
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate('/patient')}>
            Retour au tableau de bord
          </Button>
          <Button variant="outline-info" onClick={() => navigate('/patient/appointments')}>
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            Prendre RDV
          </Button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant="info" dismissible onClose={() => setMessage('')}>
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
                <FontAwesomeIcon icon={faClock} />
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
              <h3 className="fw-bold">{prescriptions.filter(p => p.type === 'examination').length}</h3>
              <p className="text-muted mb-0">Examens prescrits</p>
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

      {/* Filtres */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actives</option>
                  <option value="pending">En attente</option>
                  <option value="expired">Expirées</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  <option value="medication">Médicaments</option>
                  <option value="examination">Examens</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-end h-100">
                <Button 
                  variant="outline-secondary"
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                >
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  Réinitialiser
                </Button>
              </div>
            </Col>
            <Col md={3} className="text-end">
              <div className="text-muted">
                {filteredPrescriptions.length} prescription(s) trouvée(s)
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {prescriptions.length === 0 ? (
        /* État vide */
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FontAwesomeIcon icon={faPills} size="3x" className="text-muted mb-4" />
            <h4 className="text-muted mb-3">Aucune prescription</h4>
            <p className="text-muted mb-4">
              Vous n'avez pas encore de prescriptions médicales.
              <br />
              Consultez un médecin pour obtenir vos premières ordonnances.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/patient/appointments')}>
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Prendre un rendez-vous
            </Button>
          </Card.Body>
        </Card>
      ) : filteredPrescriptions.length === 0 ? (
        /* Pas de résultats pour les filtres */
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted mb-4" />
            <h5 className="text-muted mb-3">Aucune prescription trouvée</h5>
            <p className="text-muted mb-4">
              Aucune prescription ne correspond à vos critères de recherche.
            </p>
            <Button 
              variant="outline-primary"
              onClick={() => {
                setFilterStatus('all');
                setFilterType('all');
              }}
            >
              Afficher toutes les prescriptions
            </Button>
          </Card.Body>
        </Card>
      ) : (
        /* Liste des prescriptions */
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 py-3">
            <h5 className="fw-bold mb-0">Mes prescriptions</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Médecin</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Validité</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>
                        <div className="fw-medium">
                          {new Date(prescription.date).toLocaleDateString('fr-FR')}
                        </div>
                        <small className="text-muted">
                          {new Date(prescription.date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </td>
                      <td>
                        <div className="fw-medium">Dr. {prescription.doctorName}</div>
                        <small className="text-muted">{prescription.doctorSpecialty}</small>
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
                        <Badge bg={getStatusColor(prescription.status)}>
                          {getStatusText(prescription.status)}
                        </Badge>
                      </td>
                      <td>
                        {isExpired(prescription.validUntil) ? (
                          <span className="text-danger">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                            Expirée
                          </span>
                        ) : (
                          <span className="text-success">
                            Jusqu'au {new Date(prescription.validUntil).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleViewPrescription(prescription)}
                            title="Voir détails"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleDownloadPrescription(prescription.id)}
                            title="Télécharger"
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </Button>
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => handlePrintPrescription(prescription.id)}
                            title="Imprimer"
                          >
                            <FontAwesomeIcon icon={faPrint} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal détails prescription */}
      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={getTypeIcon(selectedPrescription?.type)} className="me-2 text-primary" />
            Prescription du {selectedPrescription && new Date(selectedPrescription.date).toLocaleDateString('fr-FR')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPrescription && (
            <div>
              {/* En-tête de la prescription */}
              <Card className="border-0 bg-light mb-4">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6 className="fw-bold mb-2">
                        <FontAwesomeIcon icon={faUserMd} className="me-2 text-success" />
                        Médecin prescripteur
                      </h6>
                      <div className="mb-1">
                        <strong>Dr. {selectedPrescription.doctorName}</strong>
                      </div>
                      <div className="mb-1">
                        <Badge bg="info">{selectedPrescription.doctorSpecialty}</Badge>
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6 className="fw-bold mb-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                        Informations
                      </h6>
                      <div className="mb-1">
                        <strong>Date :</strong> {new Date(selectedPrescription.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="mb-1">
                        <strong>Statut :</strong> 
                        <Badge bg={getStatusColor(selectedPrescription.status)} className="ms-2">
                          {getStatusText(selectedPrescription.status)}
                        </Badge>
                      </div>
                      <div className="mb-1">
                        <strong>Validité :</strong> 
                        <span className={isExpired(selectedPrescription.validUntil) ? 'text-danger ms-2' : 'text-success ms-2'}>
                          {isExpired(selectedPrescription.validUntil) ? 'Expirée' : 
                            `Jusqu'au ${new Date(selectedPrescription.validUntil).toLocaleDateString('fr-FR')}`
                          }
                        </span>
                      </div>
                    </Col>
                  </Row>
                  
                  {selectedPrescription.notes && (
                    <div className="mt-3">
                      <h6 className="fw-bold mb-2">Notes du médecin</h6>
                      <Alert variant="info" className="py-2">
                        {selectedPrescription.notes}
                      </Alert>
                    </div>
                  )}
                </Card.Body>
              </Card>

              <Tabs defaultActiveKey={selectedPrescription.type === 'medication' ? 'medications' : 'examinations'}>
                {/* Onglet Médicaments */}
                {selectedPrescription.medications && selectedPrescription.medications.length > 0 && (
                  <Tab eventKey="medications" title="Médicaments">
                    <div className="mt-3">
                      <h6 className="fw-bold mb-3">
                        <FontAwesomeIcon icon={faPills} className="me-2 text-primary" />
                        Médicaments prescrits
                      </h6>
                      <div className="table-responsive">
                        <Table>
                          <thead className="table-light">
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
                                  <small className="text-muted">{med.instructions}</small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      
                      <Alert variant="warning" className="mt-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        <strong>Important :</strong> Respectez scrupuleusement les doses et les horaires prescrits. 
                        En cas de doute, consultez votre médecin ou pharmacien.
                      </Alert>
                    </div>
                  </Tab>
                )}

                {/* Onglet Examens */}
                {selectedPrescription.examinations && selectedPrescription.examinations.length > 0 && (
                  <Tab eventKey="examinations" title="Examens">
                    <div className="mt-3">
                      <h6 className="fw-bold mb-3">
                        <FontAwesomeIcon icon={faFileImage} className="me-2 text-info" />
                        Examens prescrits
                      </h6>
                      <div className="table-responsive">
                        <Table>
                          <thead className="table-light">
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
                                  <Badge bg={exam.urgency === 'urgent' ? 'danger' : 'primary'}>
                                    {exam.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                                  </Badge>
                                </td>
                                <td>
                                  <small className="text-muted">{exam.instructions}</small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      
                      <Alert variant="info" className="mt-3">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                        <strong>Conseil :</strong> Prenez rendez-vous rapidement pour effectuer ces examens. 
                        Les résultats aideront votre médecin à ajuster votre traitement.
                      </Alert>
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
            onClick={() => handleDownloadPrescription(selectedPrescription?.id)}
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Télécharger
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handlePrintPrescription(selectedPrescription?.id)}
          >
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            Imprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PatientPrescriptions;