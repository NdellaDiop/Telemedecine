import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table, Modal, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserMd, faCalendarAlt, faPhone, faEnvelope, faMapMarkerAlt,
  faStethoscope, faHistory, faCalendarPlus, faComments, faEye,
  faHeart, faBrain, faBaby, faUser, faSearch
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function PatientDoctors() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myDoctors, setMyDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Attendre que l'utilisateur soit chargé
    if (user && user.id) {
      loadMyDoctors();
      loadAppointments();
    }
  }, [user]); // Dépendance sur user

  const loadMyDoctors = async () => {
    if (!user || !user.id) {
      console.log('🔍 User pas encore chargé, skip loadMyDoctors');
      return;
    }
    
    setLoading(true);
    console.log('🔍 Début chargement mes médecins pour patient:', user.id);
    
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer tous les rendez-vous du patient
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userAppointments = appointmentsResponse.data || [];
      console.log('🔍 RDV du patient:', userAppointments);
      
      // Récupérer la liste complète des médecins
      const doctorsResponse = await axios.get(`${API_BASE_URL}/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allDoctors = doctorsResponse.data.doctors || [];
      console.log('🔍 Tous les médecins:', allDoctors);
      
      // Extraire les IDs des médecins avec qui le patient a pris RDV
      const doctorIds = [];
      
      userAppointments.forEach(apt => {
        console.log('🔍 Structure complète RDV:', JSON.stringify(apt, null, 2));
        
        // Essayer tous les noms de champs possibles
        let doctorId = null;
        if (apt.doctor_id) {
          doctorId = apt.doctor_id;
          console.log('🔍 Trouvé doctor_id:', doctorId);
        } else if (apt.doctorId) {
          doctorId = apt.doctorId;
          console.log('🔍 Trouvé doctorId:', doctorId);
        } else if (apt.doctor && apt.doctor.id) {
          doctorId = apt.doctor.id;
          console.log('🔍 Trouvé doctor.id:', doctorId);
        } else {
          console.log('🔍 Aucun ID médecin trouvé dans:', Object.keys(apt));
        }
        
        if (doctorId && !doctorIds.includes(doctorId)) {
          doctorIds.push(doctorId);
          console.log('🔍 Ajouté doctorId:', doctorId);
        }
      });
      
      console.log('🔍 Liste finale des IDs médecins:', doctorIds);
      
      // Filtrer les médecins avec qui le patient a eu des RDV
      const patientDoctors = allDoctors.filter(doctor => {
        const hasAppointment = doctorIds.includes(doctor.id);
        console.log(`🔍 Médecin ${doctor.name} (ID: ${doctor.id}) - A RDV: ${hasAppointment}`);
        return hasAppointment;
      });
      
      console.log('🔍 Médecins filtrés:', patientDoctors);
      
      // Enrichir avec les statistiques de RDV
      const enrichedDoctors = patientDoctors.map(doctor => {
        const doctorAppointments = userAppointments.filter(apt => 
          (apt.doctor_id || apt.doctorId || apt.doctor?.id) === doctor.id
        );
        
        console.log(`🔍 RDV pour médecin ${doctor.name}:`, doctorAppointments);
        
        const pastAppointments = doctorAppointments.filter(apt => 
          new Date(apt.appointment_date) < new Date()
        );
        
        const futureAppointments = doctorAppointments.filter(apt => 
          new Date(apt.appointment_date) >= new Date()
        );
        
        const lastAppointment = pastAppointments.length > 0 ? 
          pastAppointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))[0] : null;
        
        const nextAppointment = futureAppointments.length > 0 ? 
          futureAppointments.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))[0] : null;
        
        const enrichedDoctor = {
          ...doctor,
          totalAppointments: doctorAppointments.length,
          pastAppointments: pastAppointments.length,
          futureAppointments: futureAppointments.length,
          lastAppointment,
          nextAppointment,
          allAppointments: doctorAppointments
        };
        
        console.log(`🔍 Médecin enrichi ${doctor.name}:`, enrichedDoctor);
        return enrichedDoctor;
      });
      
      console.log('🔍 Médecins finaux:', enrichedDoctors);
      setMyDoctors(enrichedDoctors);
      
    } catch (error) {
      console.error('🔍 Erreur chargement médecins:', error);
      setError('Erreur lors du chargement de vos médecins.');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!user || !user.id) {
      console.log('🔍 User pas encore chargé, skip loadAppointments');
      return;
    }
    
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

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorAppointments(doctor.allAppointments || []);
    setShowDoctorModal(true);
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/patient/rendez-vous?doctor=${doctorId}`);
  };

  const getSpecialtyIcon = (specialty) => {
    const specialtyIcons = {
      'Cardiologie': faHeart,
      'Neurologie': faBrain,
      'Pédiatrie': faBaby,
      'Médecine générale': faStethoscope,
      'Gynécologie': faUser,
      'Dermatologie': faUser,
      'Ophtalmologie': faEye
    };
    return specialtyIcons[specialty] || faStethoscope;
  };

  const getSpecialtyColor = (specialty) => {
    const specialtyColors = {
      'Cardiologie': '#dc3545',
      'Neurologie': '#6f42c1',
      'Pédiatrie': '#20c997',
      'Médecine générale': '#0d6efd',
      'Gynécologie': '#fd7e14',
      'Dermatologie': '#ffc107',
      'Ophtalmologie': '#198754'
    };
    return specialtyColors[specialty] || '#6c757d';
  };

  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement de vos médecins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-doctors">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faUserMd} className="me-2 text-success" />
            Mes médecins
          </h2>
          <p className="text-muted mb-0">
            Retrouvez tous les médecins avec qui vous avez pris rendez-vous
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate('/patient')}>
            Retour au tableau de bord
          </Button>
          <Button variant="primary" onClick={() => navigate('/patient/rendez-vous')}>
            <FontAwesomeIcon icon={faSearch} className="me-2" />
            Trouver un médecin
          </Button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {/* Statistiques rapides */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">
                <FontAwesomeIcon icon={faUserMd} />
              </div>
              <h3 className="fw-bold">{myDoctors.length}</h3>
              <p className="text-muted mb-0">Médecins suivis</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <h3 className="fw-bold">{myDoctors.reduce((acc, doc) => acc + doc.totalAppointments, 0)}</h3>
              <p className="text-muted mb-0">Total consultations</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-warning mb-2">
                <FontAwesomeIcon icon={faCalendarPlus} />
              </div>
              <h3 className="fw-bold">{myDoctors.reduce((acc, doc) => acc + doc.futureAppointments, 0)}</h3>
              <p className="text-muted mb-0">RDV à venir</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">
                <FontAwesomeIcon icon={faHistory} />
              </div>
              <h3 className="fw-bold">{myDoctors.reduce((acc, doc) => acc + doc.pastAppointments, 0)}</h3>
              <p className="text-muted mb-0">Consultations passées</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {myDoctors.length === 0 ? (
        /* État vide */
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FontAwesomeIcon icon={faUserMd} size="3x" className="text-muted mb-4" />
            <h4 className="text-muted mb-3">Aucun médecin suivi</h4>
            <p className="text-muted mb-4">
              Vous n'avez pas encore pris de rendez-vous avec un médecin.
              <br />
              Commencez par chercher un médecin et prendre votre premier rendez-vous.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/patient/rendez-vous')}>
              <FontAwesomeIcon icon={faSearch} className="me-2" />
              Trouver un médecin
            </Button>
          </Card.Body>
        </Card>
      ) : (
        /* Liste des médecins */
        <Row>
          {myDoctors.map((doctor) => (
            <Col lg={6} key={doctor.id} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-start">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: getSpecialtyColor(doctor.speciality),
                        color: 'white'
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={getSpecialtyIcon(doctor.speciality)} 
                        size="2x" 
                      />
                    </div>
                    
                    <div className="flex-grow-1">
                      <h5 className="fw-bold mb-2">Dr. {doctor.name}</h5>
                      
                      <div className="mb-2">
                        <Badge 
                          style={{ 
                            backgroundColor: getSpecialtyColor(doctor.speciality),
                            color: 'white'
                          }}
                        >
                          <FontAwesomeIcon icon={getSpecialtyIcon(doctor.speciality)} className="me-1" />
                          {doctor.speciality}
                        </Badge>
                      </div>
                      
                      <div className="mb-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
                        <small className="text-muted">{doctor.work_location}</small>
                      </div>
                      
                      {/* Statistiques du médecin */}
                      <Row className="mt-3">
                        <Col xs={4} className="text-center">
                          <div className="fw-bold text-primary">{doctor.totalAppointments}</div>
                          <small className="text-muted">Total RDV</small>
                        </Col>
                        <Col xs={4} className="text-center">
                          <div className="fw-bold text-success">{doctor.pastAppointments}</div>
                          <small className="text-muted">Passés</small>
                        </Col>
                        <Col xs={4} className="text-center">
                          <div className="fw-bold text-warning">{doctor.futureAppointments}</div>
                          <small className="text-muted">À venir</small>
                        </Col>
                      </Row>
                      
                      {/* Dernière consultation */}
                      {doctor.lastAppointment && (
                        <div className="mt-3 p-2 bg-light rounded">
                          <small className="text-muted">
                            <FontAwesomeIcon icon={faHistory} className="me-1" />
                            Dernière consultation : {new Date(doctor.lastAppointment.appointment_date).toLocaleDateString('fr-FR')}
                          </small>
                        </div>
                      )}
                      
                      {/* Prochain RDV */}
                      {doctor.nextAppointment && (
                        <div className="mt-2 p-2 border border-success rounded">
                          <small className="text-success">
                            <FontAwesomeIcon icon={faCalendarPlus} className="me-1" />
                            Prochain RDV : {new Date(doctor.nextAppointment.appointment_date).toLocaleDateString('fr-FR')} 
                            à {new Date(doctor.nextAppointment.appointment_date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="d-flex gap-2 mt-3">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleViewDoctor(doctor)}
                    >
                      <FontAwesomeIcon icon={faEye} className="me-1" />
                      Voir détails
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleBookAppointment(doctor.id)}
                    >
                      <FontAwesomeIcon icon={faCalendarPlus} className="me-1" />
                      Nouveau RDV
                    </Button>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                    >
                      <FontAwesomeIcon icon={faComments} className="me-1" />
                      Message
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal détails médecin */}
      <Modal show={showDoctorModal} onHide={() => setShowDoctorModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserMd} className="me-2 text-success" />
            Dr. {selectedDoctor?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <div>
              {/* En-tête du médecin */}
              <Card className="border-0 bg-light mb-4">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: getSpecialtyColor(selectedDoctor.speciality),
                        color: 'white'
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={getSpecialtyIcon(selectedDoctor.speciality)} 
                        size="2x" 
                      />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-2">Dr. {selectedDoctor.name}</h4>
                      <Badge 
                        style={{ 
                          backgroundColor: getSpecialtyColor(selectedDoctor.speciality),
                          color: 'white'
                        }}
                        className="mb-2"
                      >
                        {selectedDoctor.speciality}
                      </Badge>
                      <div>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
                        <span>{selectedDoctor.work_location}</span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Historique des rendez-vous */}
              <h5 className="fw-bold mb-3">
                <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
                Historique des rendez-vous ({doctorAppointments.length})
              </h5>
              
              {doctorAppointments.length > 0 ? (
                <div className="table-responsive">
                  <Table>
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Statut</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorAppointments
                        .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
                        .map((appointment) => (
                          <tr key={appointment.id}>
                            <td>
                              {new Date(appointment.appointment_date).toLocaleDateString('fr-FR')}
                            </td>
                            <td>
                              {new Date(appointment.appointment_date).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td>
                              <Badge bg={new Date(appointment.appointment_date) < new Date() ? 'success' : 'warning'}>
                                {new Date(appointment.appointment_date) < new Date() ? 'Terminé' : 'À venir'}
                              </Badge>
                            </td>
                            <td>
                              <small className="text-muted">
                                {appointment.notes || 'Aucune note'}
                              </small>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted">Aucun rendez-vous trouvé</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDoctorModal(false)}>
            Fermer
          </Button>
          <Button 
            variant="success" 
            onClick={() => {
              handleBookAppointment(selectedDoctor?.id);
              setShowDoctorModal(false);
            }}
          >
            <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
            Prendre un nouveau RDV
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PatientDoctors;